package dev.skillmap.service

import dev.skillmap.dto.ProjectAssignmentCreateDto
import dev.skillmap.dto.ProjectAssignmentDto
import dev.skillmap.entity.Employee
import dev.skillmap.entity.ProjectSkill
import dev.skillmap.repository.EmployeeRepository
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectRepository
import dev.skillmap.repository.ProjectSkillRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

interface AutoAssignmentService {
    fun autoAssignEmployeesToProject(projectId: Long): List<ProjectAssignmentDto>
}

@Service
@Transactional
class AutoAssignmentServiceImpl(
    private val projectRepository: ProjectRepository,
    private val projectSkillRepository: ProjectSkillRepository,
    private val employeeRepository: EmployeeRepository,
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val projectAssignmentService: ProjectAssignmentService
) : AutoAssignmentService {

    override fun autoAssignEmployeesToProject(projectId: Long): List<ProjectAssignmentDto> {
        // Verify project exists
        if (!projectRepository.existsById(projectId)) {
            throw EntityNotFoundException("Project not found with id: $projectId")
        }

        // Get project skills that need assignments
        val projectSkills = projectSkillRepository.findByProjectId(projectId)
        
        // Get employees not already assigned to this project
        val availableEmployees = employeeRepository.findEmployeesNotAssignedToProject(projectId).toMutableList()
        
        val assignments = mutableListOf<ProjectAssignmentDto>()
        
        // Sort skills by minimumFTE (highest first) for greedy assignment
        val sortedSkills = projectSkills.sortedByDescending { it.minimumFTE }
        
        for (skill in sortedSkills) {
            val bestEmployee = findBestEmployeeForSkill(skill, availableEmployees)
            
            if (bestEmployee != null) {
                // Calculate allocation percentage based on required FTE
                val allocationPercentage = calculateAllocationPercentage(bestEmployee, skill.minimumFTE)
                
                if (allocationPercentage > 0) {
                    val assignmentDto = ProjectAssignmentCreateDto(
                        projectId = projectId,
                        employeeId = bestEmployee.id!!,
                        role = "Auto-assigned for ${skill.skill.name}",
                        allocationPercentage = allocationPercentage,
                        startDate = null,
                        endDate = null,
                        isAutomaticallyAssigned = true,
                        notes = "Automatically assigned based on skill: ${skill.skill.name} (proficiency: ${getEmployeeProficiency(bestEmployee, skill)})"
                    )
                    
                    val createdAssignment = projectAssignmentService.createAssignment(assignmentDto)
                    assignments.add(createdAssignment)
                    
                    // Remove assigned employee from available list to prevent double assignment
                    availableEmployees.remove(bestEmployee)
                }
            }
        }
        
        return assignments
    }
    
    private fun findBestEmployeeForSkill(projectSkill: ProjectSkill, availableEmployees: MutableList<Employee>): Employee? {
        val eligibleEmployees = availableEmployees.filter { employee ->
            isEmployeeEligible(employee, projectSkill)
        }
        
        if (eligibleEmployees.isEmpty()) {
            return null
        }
        
        // Score employees and return the best one
        return eligibleEmployees.maxByOrNull { employee ->
            calculateEmployeeScore(employee, projectSkill)
        }
    }
    
    private fun isEmployeeEligible(employee: Employee, projectSkill: ProjectSkill): Boolean {
        // Check if employee has the required skill
        val employeeSkill = employee.skills.find { it.skill.id == projectSkill.skill.id }
            ?: return false
        
        // Check minimum proficiency requirement
        if (projectSkill.minimumProficiencyRequired != null && 
            employeeSkill.proficiencyLevel < projectSkill.minimumProficiencyRequired!!) {
            return false
        }
        
        // Check if employee has sufficient available capacity
        val currentAllocation = projectAssignmentRepository.calculateTotalAllocationForEmployee(
            employee.id!!, LocalDate.now()
        )
        val availableCapacity = 100 - currentAllocation
        val requiredCapacity = calculateAllocationPercentage(employee, projectSkill.minimumFTE)
        
        return availableCapacity >= requiredCapacity && requiredCapacity >= (projectSkill.fteThreshold * 100).toInt()
    }
    
    private fun calculateEmployeeScore(employee: Employee, projectSkill: ProjectSkill): Double {
        val employeeSkill = employee.skills.find { it.skill.id == projectSkill.skill.id }
            ?: return 0.0
        
        // Proficiency score (0.0 - 1.0)
        val proficiencyScore = employeeSkill.proficiencyLevel.toDouble() / 5.0
        
        // Availability score (0.0 - 1.0)
        val currentAllocation = projectAssignmentRepository.calculateTotalAllocationForEmployee(
            employee.id!!, LocalDate.now()
        )
        val availableCapacity = 100 - currentAllocation
        val availabilityScore = availableCapacity.toDouble() / 100.0
        
        // Combined score: proficiency * availability
        return proficiencyScore * availabilityScore
    }
    
    private fun calculateAllocationPercentage(employee: Employee, requiredFTE: Double): Int {
        // Convert FTE to percentage allocation
        // Employee's max FTE is based on their working hours
        val maxFTEPercentage = (employee.maxFTE * 100).toInt()
        val requiredPercentage = (requiredFTE * 100).toInt()
        
        // Return the minimum of what's required and what they can provide
        return minOf(requiredPercentage, maxFTEPercentage)
    }
    
    private fun getEmployeeProficiency(employee: Employee, projectSkill: ProjectSkill): Int {
        return employee.skills.find { it.skill.id == projectSkill.skill.id }?.proficiencyLevel ?: 0
    }
}