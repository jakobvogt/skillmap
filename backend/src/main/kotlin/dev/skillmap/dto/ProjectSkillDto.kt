package dev.skillmap.dto

import java.time.LocalDateTime

data class ProjectSkillDto(
    val id: Long? = null,
    val projectId: Long,
    val skillId: Long,
    val importance: Int,
    val minimumProficiencyRequired: Int? = null,
    val numberOfPeopleRequired: Int = 1,
    val notes: String? = null,
    val skillName: String? = null, // Additional field for convenience
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class ProjectSkillCreateDto(
    val projectId: Long,
    val skillId: Long,
    val importance: Int,
    val minimumProficiencyRequired: Int? = null,
    val numberOfPeopleRequired: Int = 1,
    val notes: String? = null
)

data class ProjectSkillUpdateDto(
    val importance: Int? = null,
    val minimumProficiencyRequired: Int? = null,
    val numberOfPeopleRequired: Int? = null,
    val notes: String? = null
)