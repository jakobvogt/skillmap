package dev.skillmap.dto

import java.time.LocalDateTime

data class SkillDto(
    val id: Long? = null,
    val name: String,
    val category: String? = null,
    val description: String? = null,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class SkillCreateDto(
    val name: String,
    val category: String? = null,
    val description: String? = null
)

data class SkillUpdateDto(
    val name: String? = null,
    val category: String? = null,
    val description: String? = null
)