package dev.skillmap.dto

import java.time.LocalDateTime

data class EmployeeDto(
    val id: Long? = null,
    val firstName: String,
    val lastName: String,
    val email: String,
    val position: String? = null,
    val department: String? = null,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class EmployeeCreateDto(
    val firstName: String,
    val lastName: String,
    val email: String,
    val position: String? = null,
    val department: String? = null
)

data class EmployeeUpdateDto(
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val position: String? = null,
    val department: String? = null
)