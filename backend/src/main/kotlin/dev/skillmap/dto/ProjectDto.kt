package dev.skillmap.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ProjectDto(
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val budget: BigDecimal? = null,
    val status: String = "PLANNED",
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class ProjectCreateDto(
    val name: String,
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val budget: BigDecimal? = null,
    val status: String = "PLANNED"
)

data class ProjectUpdateDto(
    val name: String? = null,
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val budget: BigDecimal? = null,
    val status: String? = null
)