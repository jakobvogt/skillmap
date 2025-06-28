package dev.skillmap.dto

import java.time.LocalDate

data class AssignmentMetricsDto(
    val calculationDate: LocalDate,
    val organizationHealthScore: Double?,
    val totalActiveProjects: Int,
    val resourceUtilization: ResourceUtilizationDto
)

data class ResourceUtilizationDto(
    val averageUtilization: Double,
    val totalEmployees: Int,
    val overAllocatedCount: Int,
    val underUtilizedCount: Int,
    val fullyUtilizedCount: Int
)