package dev.skillmap.dto

import java.time.LocalDateTime

data class EmployeeSkillDto(
    val id: Long? = null,
    val employeeId: Long,
    val skillId: Long,
    val proficiencyLevel: Int,
    val notes: String? = null,
    val skillName: String? = null, // Additional field for convenience
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class EmployeeSkillCreateDto(
    val employeeId: Long,
    val skillId: Long,
    val proficiencyLevel: Int,
    val notes: String? = null
)

data class EmployeeSkillUpdateDto(
    val proficiencyLevel: Int? = null,
    val notes: String? = null
)