package dev.skillmap.service

import dev.skillmap.dto.ProjectAssignmentCreateDto
import dev.skillmap.dto.ProjectAssignmentDto
import dev.skillmap.entity.Employee
import dev.skillmap.entity.Project
import dev.skillmap.entity.ProjectSkill
import dev.skillmap.repository.EmployeeRepository
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectRepository
import dev.skillmap.repository.ProjectSkillRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import kotlin.math.min

interface GlobalAutoAssignmentService {
    fun globalAutoAssignEmployees(): List<ProjectAssignmentDto>
}

@Service
@Transactional
class GlobalAutoAssignmentServiceImpl(
    private val projectRepository: ProjectRepository,
    private val projectSkillRepository: ProjectSkillRepository,
    private val employeeRepository: EmployeeRepository,
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val projectAssignmentService: ProjectAssignmentService
) : GlobalAutoAssignmentService {

    override fun globalAutoAssignEmployees(): List<ProjectAssignmentDto> {
        // Get all active projects that need assignments (only PLANNED and IN_PROGRESS)
        val activeProjects = projectRepository.findAll()
            .filter { it.status == "PLANNED" || it.status == "IN_PROGRESS" }
        
        println("Global auto-assignment: Found ${activeProjects.size} active projects (PLANNED/IN_PROGRESS)")
        activeProjects.forEach { project ->
            println("- Project: ${project.name} (${project.status})")
        }
        
        // Get all employees
        val allEmployees = employeeRepository.findAll()
        println("Global auto-assignment: Found ${allEmployees.size} employees")
        
        // Calculate compatibility matrix
        val compatibilityMatrix = calculateCompatibilityMatrix(activeProjects, allEmployees)
        println("Global auto-assignment: Calculated ${compatibilityMatrix.size} compatibility scores")
        
        // Find optimal assignments using greedy approach based on compatibility
        val assignments = findOptimalAssignments(compatibilityMatrix, activeProjects, allEmployees)
        println("Global auto-assignment: Created ${assignments.size} assignments")
        
        return assignments
    }
    
    private fun calculateCompatibilityMatrix(
        projects: List<Project>, 
        employees: List<Employee>
    ): Map<Pair<Long, Long>, CompatibilityScore> {
        val matrix = mutableMapOf<Pair<Long, Long>, CompatibilityScore>()
        
        for (project in projects) {
            val projectSkills = projectSkillRepository.findByProjectId(project.id!!)
            
            for (employee in employees) {
                // Skip if employee is already assigned to this project
                val existingAssignment = projectAssignmentRepository
                    .findByProjectIdAndEmployeeId(project.id!!, employee.id!!)
                if (existingAssignment != null) continue
                
                val compatibility = calculateCompatibility(employee, project, projectSkills)
                matrix[Pair(project.id!!, employee.id!!)] = compatibility
            }
        }
        
        return matrix
    }
    
    private fun calculateCompatibility(
        employee: Employee, 
        project: Project, 
        projectSkills: List<ProjectSkill>
    ): CompatibilityScore {
        if (projectSkills.isEmpty()) {
            return CompatibilityScore(0.0, 0.0, 0.0, 0.0)
        }
        
        val employeeSkillsMap = employee.skills.associateBy { it.skill.id }
        
        // 1. Skill Coverage Score: How many required skills does employee have?
        val matchingSkills = projectSkills.filter { employeeSkillsMap.containsKey(it.skill.id) }
        val coverage = matchingSkills.size.toDouble() / projectSkills.size.toDouble()
        
        // 2. Skill Quality Score: How good is the employee at the required skills?
        val quality = if (matchingSkills.isNotEmpty()) {
            matchingSkills.map { projectSkill ->
                val employeeSkill = employeeSkillsMap[projectSkill.skill.id]!!
                val proficiencyScore = employeeSkill.proficiencyLevel.toDouble() / 5.0
                
                // Check minimum proficiency requirement
                val meetsMinimum = projectSkill.minimumProficiencyRequired?.let { min ->
                    employeeSkill.proficiencyLevel >= min
                } ?: true
                
                if (meetsMinimum) proficiencyScore else 0.0
            }.average()
        } else {
            0.0
        }
        
        // 3. Skill Utilization Score: How many of employee's skills can be used?
        val utilization = if (employee.skills.isNotEmpty()) {
            matchingSkills.size.toDouble() / employee.skills.size.toDouble()
        } else {
            0.0
        }
        
        // 4. Capacity Availability Score: How much capacity does employee have?
        val currentAllocation = projectAssignmentRepository.calculateTotalAllocationForEmployee(
            employee.id!!, LocalDate.now()
        )
        val availableCapacity = (100 - currentAllocation).toDouble() / 100.0
        
        return CompatibilityScore(coverage, quality, utilization, availableCapacity)
    }
    
    private fun findOptimalAssignments(
        compatibilityMatrix: Map<Pair<Long, Long>, CompatibilityScore>,
        projects: List<Project>,
        employees: List<Employee>
    ): List<ProjectAssignmentDto> {
        val assignments = mutableListOf<ProjectAssignmentDto>()
        val employeeAllocations = employees.associate { employee ->
            employee.id!! to projectAssignmentRepository.calculateTotalAllocationForEmployee(
                employee.id!!, LocalDate.now()
            )
        }.toMutableMap()
        
        // Sort all possible assignments by compatibility score (highest first)
        val sortedAssignments = compatibilityMatrix
            .filter { (_, compatibility) -> compatibility.totalScore > 0.1 } // Only consider viable assignments
            .toList()
            .sortedByDescending { (_, compatibility) -> compatibility.totalScore }
        
        // Greedily assign based on compatibility, respecting capacity constraints
        for ((projectEmployeePair, compatibility) in sortedAssignments) {
            val (projectId, employeeId) = projectEmployeePair
            val project = projects.find { it.id == projectId } ?: continue
            val employee = employees.find { it.id == employeeId } ?: continue
            
            // Check if employee already assigned to this project
            if (assignments.any { it.projectId == projectId && it.employeeId == employeeId }) {
                continue
            }
            
            // Calculate required FTE for this assignment
            val projectSkills = projectSkillRepository.findByProjectId(projectId)
            val employeeSkillsMap = employee.skills.associateBy { it.skill.id }
            
            // Find the skill this employee would be assigned for (best matching skill)
            val bestSkillMatch = projectSkills
                .filter { employeeSkillsMap.containsKey(it.skill.id) }
                .maxByOrNull { projectSkill ->
                    val employeeSkill = employeeSkillsMap[projectSkill.skill.id]!!
                    employeeSkill.proficiencyLevel.toDouble() / 5.0
                }
            
            if (bestSkillMatch != null) {
                val requiredFTE = bestSkillMatch.minimumFTE
                val requiredPercentage = (requiredFTE * 100).toInt()
                val currentAllocation = employeeAllocations[employeeId] ?: 0
                
                // Check if employee has enough capacity
                if (currentAllocation + requiredPercentage <= 100) {
                    // Check FTE threshold
                    val fteThreshold = (bestSkillMatch.fteThreshold * 100).toInt()
                    if (requiredPercentage >= fteThreshold) {
                        // Create assignment
                        val assignmentDto = ProjectAssignmentCreateDto(
                            projectId = projectId,
                            employeeId = employeeId,
                            role = "Auto-assigned for ${bestSkillMatch.skill.name}",
                            allocationPercentage = requiredPercentage,
                            startDate = null,
                            endDate = null,
                            isAutomaticallyAssigned = true,
                            notes = "Globally auto-assigned based on compatibility score: ${String.format("%.2f", compatibility.totalScore)} (${bestSkillMatch.skill.name})"
                        )
                        
                        try {
                            val createdAssignment = projectAssignmentService.createAssignment(assignmentDto)
                            assignments.add(createdAssignment)
                            
                            // Update employee allocation tracking
                            employeeAllocations[employeeId] = currentAllocation + requiredPercentage
                        } catch (e: Exception) {
                            // Skip this assignment if it fails (e.g., duplicate assignment)
                            continue
                        }
                    }
                }
            }
        }
        
        return assignments
    }
}

data class CompatibilityScore(
    val coverage: Double,      // 0.0 - 1.0: How many required skills employee has
    val quality: Double,       // 0.0 - 1.0: How good employee is at those skills  
    val utilization: Double,   // 0.0 - 1.0: How many of employee's skills are used
    val availability: Double   // 0.0 - 1.0: How much capacity employee has available
) {
    // Combined compatibility score with weights
    val totalScore: Double = (0.4 * coverage) + (0.4 * quality) + (0.1 * utilization) + (0.1 * availability)
}