package dev.skillmap.service

import dev.skillmap.dto.AssignmentMetricsDto
import dev.skillmap.dto.ResourceUtilizationDto
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectRepository
import dev.skillmap.repository.EmployeeRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class AssignmentMetricsService(
    private val projectRepository: ProjectRepository,
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val employeeRepository: EmployeeRepository,
    private val projectHealthService: ProjectHealthService
) {
    
    fun calculateAssignmentMetrics(date: LocalDate = LocalDate.now()): AssignmentMetricsDto {
        val inProgressProjects = projectRepository.findByStatus("IN_PROGRESS").map { it.id!! }
        val organizationHealthScore = calculateOrganizationHealthScore(inProgressProjects, date)
        val resourceUtilization = calculateResourceUtilization(date)
        
        return AssignmentMetricsDto(
            calculationDate = date,
            organizationHealthScore = organizationHealthScore,
            totalActiveProjects = inProgressProjects.size,
            resourceUtilization = resourceUtilization
        )
    }
    
    private fun calculateOrganizationHealthScore(inProgressProjects: List<Long>, date: LocalDate): Double? {
        if (inProgressProjects.isEmpty()) return null
        
        val healthScores = inProgressProjects.mapNotNull { projectId ->
            try {
                projectHealthService.calculateProjectHealth(projectId, date).overallHealthScore
            } catch (e: Exception) {
                // For projects without assignments, return 0% health instead of null
                0.0
            }
        }
        
        return if (healthScores.isNotEmpty()) {
            healthScores.average()
        } else {
            null
        }
    }
    
    private fun calculateResourceUtilization(date: LocalDate): ResourceUtilizationDto {
        // Get all employees
        val allEmployees = employeeRepository.findAll().map { it.id!! }
        
        // Get utilizations for employees with assignments
        val employeeUtilizationResults = projectAssignmentRepository.calculateEmployeeUtilizations(date)
        val employeeUtilizationsWithAssignments = employeeUtilizationResults.associate { result ->
            val employeeId = result[0] as Long
            val totalAllocation = (result[1] as Number).toDouble()
            employeeId to totalAllocation
        }
        
        // Create full utilization map including employees with 0% allocation
        val allEmployeeUtilizations = allEmployees.associateWith { employeeId ->
            employeeUtilizationsWithAssignments[employeeId] ?: 0.0
        }
        
        val totalEmployees = allEmployeeUtilizations.size
        val averageUtilization = if (totalEmployees > 0) {
            allEmployeeUtilizations.values.average()
        } else {
            0.0
        }
        
        val overAllocatedCount = allEmployeeUtilizations.values.count { it > 100.0 }
        val underUtilizedCount = allEmployeeUtilizations.values.count { it < 40.0 }
        val fullyUtilizedCount = allEmployeeUtilizations.values.count { it in 80.0..100.0 }
        
        return ResourceUtilizationDto(
            averageUtilization = averageUtilization,
            totalEmployees = totalEmployees,
            overAllocatedCount = overAllocatedCount,
            underUtilizedCount = underUtilizedCount,
            fullyUtilizedCount = fullyUtilizedCount
        )
    }
}