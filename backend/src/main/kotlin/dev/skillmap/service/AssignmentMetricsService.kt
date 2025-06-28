package dev.skillmap.service

import dev.skillmap.dto.AssignmentMetricsDto
import dev.skillmap.dto.ResourceUtilizationDto
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class AssignmentMetricsService(
    private val projectRepository: ProjectRepository,
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val projectHealthService: ProjectHealthService
) {
    
    fun calculateAssignmentMetrics(date: LocalDate = LocalDate.now()): AssignmentMetricsDto {
        val activeProjects = projectRepository.findProjectsWithActiveAssignments(date)
        val organizationHealthScore = calculateOrganizationHealthScore(activeProjects, date)
        val resourceUtilization = calculateResourceUtilization(date)
        
        return AssignmentMetricsDto(
            calculationDate = date,
            organizationHealthScore = organizationHealthScore,
            totalActiveProjects = activeProjects.size,
            resourceUtilization = resourceUtilization
        )
    }
    
    private fun calculateOrganizationHealthScore(activeProjects: List<Long>, date: LocalDate): Double? {
        if (activeProjects.isEmpty()) return null
        
        val healthScores = activeProjects.mapNotNull { projectId ->
            try {
                projectHealthService.calculateProjectHealth(projectId, date).overallHealthScore
            } catch (e: Exception) {
                null // Skip projects that can't calculate health
            }
        }
        
        return if (healthScores.isNotEmpty()) {
            healthScores.average()
        } else {
            null
        }
    }
    
    private fun calculateResourceUtilization(date: LocalDate): ResourceUtilizationDto {
        val employeeUtilizationResults = projectAssignmentRepository.calculateEmployeeUtilizations(date)
        
        val employeeUtilizations = employeeUtilizationResults.associate { result ->
            val employeeId = result[0] as Long
            val totalAllocation = (result[1] as Number).toDouble()
            employeeId to totalAllocation
        }
        
        val totalEmployees = employeeUtilizations.size
        val averageUtilization = if (totalEmployees > 0) {
            employeeUtilizations.values.average()
        } else {
            0.0
        }
        
        val overAllocatedCount = employeeUtilizations.values.count { it > 100.0 }
        val underUtilizedCount = employeeUtilizations.values.count { it < 40.0 }
        val fullyUtilizedCount = employeeUtilizations.values.count { it in 80.0..100.0 }
        
        return ResourceUtilizationDto(
            averageUtilization = averageUtilization,
            totalEmployees = totalEmployees,
            overAllocatedCount = overAllocatedCount,
            underUtilizedCount = underUtilizedCount,
            fullyUtilizedCount = fullyUtilizedCount
        )
    }
}