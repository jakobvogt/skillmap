package dev.skillmap.dto

import java.time.LocalDateTime

data class EmployeeDto(
    val id: Long? = null,
    val firstName: String,
    val lastName: String,
    val email: String,
    val position: String? = null,
    val department: String? = null,
    val workingHoursPerWeek: Int = 40,
    val maxFTE: Double = 1.0,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class EmployeeCreateDto(
    val firstName: String,
    val lastName: String,
    val email: String,
    val position: String? = null,
    val department: String? = null,
    val workingHoursPerWeek: Int = 40
)

data class EmployeeUpdateDto(
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val position: String? = null,
    val department: String? = null,
    val workingHoursPerWeek: Int? = null
)