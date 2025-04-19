package dev.skillmap.dto

import java.time.LocalDate
import java.time.LocalDateTime

data class ProjectAssignmentDto(
    val id: Long? = null,
    val projectId: Long,
    val employeeId: Long,
    val role: String? = null,
    val allocationPercentage: Int = 100,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val isAutomaticallyAssigned: Boolean = false,
    val notes: String? = null,
    val employeeName: String? = null, // Additional field for convenience
    val projectName: String? = null, // Additional field for convenience
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class ProjectAssignmentCreateDto(
    val projectId: Long,
    val employeeId: Long,
    val role: String? = null,
    val allocationPercentage: Int = 100,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val isAutomaticallyAssigned: Boolean = false,
    val notes: String? = null
)

data class ProjectAssignmentUpdateDto(
    val role: String? = null,
    val allocationPercentage: Int? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val isAutomaticallyAssigned: Boolean? = null,
    val notes: String? = null
)