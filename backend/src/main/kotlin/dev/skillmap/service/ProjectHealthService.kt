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
    val fteCoveragePercentage: Double,
    val proficiencyMatchPercentage: Double,
    val overallHealthScore: Double,
    val skillCoverages: List<SkillCoverageDto>
)

data class SkillCoverageDto(
    val skillId: Long,
    val skillName: String,
    val fteCoveragePercentage: Double,
    val proficiencyMatchPercentage: Double,
    val combinedScore: Double,
    val requiredFTE: Double,
    val actualFTE: Double,
    val fteThreshold: Double,
    val requiredProficiency: Int?,
    val bestTeamProficiency: Int?,
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
        
        val overallFteCoverage = if (skillCoverages.isEmpty()) {
            100.0
        } else {
            skillCoverages.map { it.fteCoveragePercentage }.average()
        }
        
        val overallProficiencyMatch = if (skillCoverages.isEmpty()) {
            100.0
        } else {
            skillCoverages.map { it.proficiencyMatchPercentage }.average()
        }
        
        // Combined health score: 60% FTE coverage + 40% proficiency match
        val overallHealthScore = (0.6 * overallFteCoverage) + (0.4 * overallProficiencyMatch)
        
        return ProjectHealthDto(
            projectId = projectId,
            fteCoveragePercentage = overallFteCoverage,
            proficiencyMatchPercentage = overallProficiencyMatch,
            overallHealthScore = overallHealthScore,
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
        val fteEligibleAssignments = relevantAssignments.filter { assignment ->
            val employeeFTE = assignment.allocationPercentage / 100.0
            employeeFTE >= projectSkill.fteThreshold
        }
        
        // Filter assignments that ALSO meet the proficiency threshold
        val requiredProficiency = projectSkill.minimumProficiencyRequired
        val trulyEffectiveAssignments = if (requiredProficiency != null) {
            fteEligibleAssignments.filter { assignment ->
                val employeeProficiency = getEmployeeProficiency(assignment.employee.id!!, skill.id!!)
                employeeProficiency != null && employeeProficiency >= requiredProficiency
            }
        } else {
            fteEligibleAssignments // No proficiency requirement, so all FTE-eligible assignments are effective
        }
        
        // Calculate total FTE from truly effective assignments (meet both FTE and proficiency thresholds)
        val totalEffectiveFTE = trulyEffectiveAssignments.sumOf { assignment ->
            assignment.allocationPercentage / 100.0
        }
        
        // Calculate FTE coverage percentage based on truly effective assignments
        val fteCoveragePercentage = if (projectSkill.minimumFTE > 0) {
            min(100.0, (totalEffectiveFTE / projectSkill.minimumFTE) * 100.0)
        } else {
            100.0 // No requirement means 100% covered
        }
        
        // Calculate proficiency match: what % of FTE-eligible assignments meet proficiency requirements
        val proficiencyMatchPercentage = when {
            requiredProficiency == null -> 100.0 // No proficiency requirement
            fteEligibleAssignments.isEmpty() -> 0.0 // No FTE-eligible assignments
            else -> {
                val proficientCount = trulyEffectiveAssignments.size
                val fteEligibleCount = fteEligibleAssignments.size
                (proficientCount.toDouble() / fteEligibleCount.toDouble()) * 100.0
            }
        }
        
        // Combined score: 60% FTE coverage + 40% proficiency match
        val combinedScore = (0.6 * fteCoveragePercentage) + (0.4 * proficiencyMatchPercentage)
        
        return SkillCoverageDto(
            skillId = skill.id!!,
            skillName = skill.name,
            fteCoveragePercentage = fteCoveragePercentage,
            proficiencyMatchPercentage = proficiencyMatchPercentage,
            combinedScore = combinedScore,
            requiredFTE = projectSkill.minimumFTE,
            actualFTE = totalEffectiveFTE,
            fteThreshold = projectSkill.fteThreshold,
            requiredProficiency = requiredProficiency,
            bestTeamProficiency = if (trulyEffectiveAssignments.isNotEmpty()) {
                trulyEffectiveAssignments.mapNotNull { assignment ->
                    getEmployeeProficiency(assignment.employee.id!!, skill.id!!)
                }.maxOrNull()
            } else null,
            effectiveAssignments = trulyEffectiveAssignments.size,
            totalAssignments = relevantAssignments.size
        )
    }
    
    /**
     * Check if an employee has a specific skill
     */
    private fun hasSkill(employeeId: Long, skillId: Long): Boolean {
        return employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId) != null
    }
    
    /**
     * Get the proficiency level of an employee for a specific skill
     */
    private fun getEmployeeProficiency(employeeId: Long, skillId: Long): Int? {
        return employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)?.proficiencyLevel
    }
}