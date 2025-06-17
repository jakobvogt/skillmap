package dev.skillmap.service

import dev.skillmap.entity.ProjectAssignment
import dev.skillmap.entity.ProjectSkill
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectSkillRepository
import dev.skillmap.repository.EmployeeSkillRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import kotlin.math.min

data class ProjectHealthDto(
    val projectId: Long,
    val skillCoveragePercentage: Double,
    val skillCoverages: List<SkillCoverageDto>
)

data class SkillCoverageDto(
    val skillId: Long,
    val skillName: String,
    val coveragePercentage: Double,
    val requiredFTE: Double,
    val actualFTE: Double,
    val fteThreshold: Double,
    val effectiveAssignments: Int,
    val totalAssignments: Int
)

interface ProjectHealthService {
    fun calculateProjectHealth(projectId: Long, date: LocalDate = LocalDate.now()): ProjectHealthDto
    fun calculateSkillCoverage(projectSkill: ProjectSkill, assignments: List<ProjectAssignment>): SkillCoverageDto
}

@Service
class ProjectHealthServiceImpl(
    private val projectSkillRepository: ProjectSkillRepository,
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val employeeSkillRepository: EmployeeSkillRepository
) : ProjectHealthService {

    override fun calculateProjectHealth(projectId: Long, date: LocalDate): ProjectHealthDto {
        val projectSkills = projectSkillRepository.findByProjectId(projectId)
        val assignments = projectAssignmentRepository.findActiveAssignments(date)
            .filter { it.project.id == projectId }
        
        val skillCoverages = projectSkills.map { projectSkill ->
            calculateSkillCoverage(projectSkill, assignments)
        }
        
        val overallCoverage = if (skillCoverages.isEmpty()) {
            100.0
        } else {
            skillCoverages.map { it.coveragePercentage }.average()
        }
        
        return ProjectHealthDto(
            projectId = projectId,
            skillCoveragePercentage = overallCoverage,
            skillCoverages = skillCoverages
        )
    }

    override fun calculateSkillCoverage(projectSkill: ProjectSkill, assignments: List<ProjectAssignment>): SkillCoverageDto {
        val skill = projectSkill.skill
        
        // Find assignments where employee has this skill
        val relevantAssignments = assignments.filter { assignment ->
            hasSkill(assignment.employee.id!!, skill.id!!)
        }
        
        // Filter assignments that meet the FTE threshold
        val effectiveAssignments = relevantAssignments.filter { assignment ->
            val employeeFTE = assignment.allocationPercentage / 100.0
            employeeFTE >= projectSkill.fteThreshold
        }
        
        // Calculate total FTE from effective assignments
        val totalEffectiveFTE = effectiveAssignments.sumOf { assignment ->
            assignment.allocationPercentage / 100.0
        }
        
        // Calculate coverage percentage
        val coveragePercentage = if (projectSkill.minimumFTE > 0) {
            min(100.0, (totalEffectiveFTE / projectSkill.minimumFTE) * 100.0)
        } else {
            100.0 // No requirement means 100% covered
        }
        
        return SkillCoverageDto(
            skillId = skill.id!!,
            skillName = skill.name,
            coveragePercentage = coveragePercentage,
            requiredFTE = projectSkill.minimumFTE,
            actualFTE = totalEffectiveFTE,
            fteThreshold = projectSkill.fteThreshold,
            effectiveAssignments = effectiveAssignments.size,
            totalAssignments = relevantAssignments.size
        )
    }
    
    /**
     * Check if an employee has a specific skill
     */
    private fun hasSkill(employeeId: Long, skillId: Long): Boolean {
        return employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId) != null
    }
}