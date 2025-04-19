package dev.skillmap.service

import dev.skillmap.dto.SkillCreateDto
import dev.skillmap.dto.SkillDto
import dev.skillmap.dto.SkillUpdateDto
import dev.skillmap.entity.Skill
import dev.skillmap.repository.SkillRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface SkillService {
    fun getAllSkills(): List<SkillDto>
    fun getSkillById(id: Long): SkillDto
    fun createSkill(skillCreateDto: SkillCreateDto): SkillDto
    fun updateSkill(id: Long, skillUpdateDto: SkillUpdateDto): SkillDto
    fun deleteSkill(id: Long)
    fun getSkillsByCategory(category: String): List<SkillDto>
    fun searchSkills(query: String): List<SkillDto>
}

@Service
@Transactional
class SkillServiceImpl(
    private val skillRepository: SkillRepository
) : SkillService {

    override fun getAllSkills(): List<SkillDto> {
        return skillRepository.findAll().map { it.toDto() }
    }

    override fun getSkillById(id: Long): SkillDto {
        return skillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Skill not found with id: $id") }
            .toDto()
    }

    override fun createSkill(skillCreateDto: SkillCreateDto): SkillDto {
        val skill = Skill(
            name = skillCreateDto.name,
            category = skillCreateDto.category,
            description = skillCreateDto.description
        )
        return skillRepository.save(skill).toDto()
    }

    override fun updateSkill(id: Long, skillUpdateDto: SkillUpdateDto): SkillDto {
        val skill = skillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Skill not found with id: $id") }

        skillUpdateDto.name?.let { skill.name = it }
        skillUpdateDto.category?.let { skill.category = it }
        skillUpdateDto.description?.let { skill.description = it }
        skill.updatedAt = LocalDateTime.now()

        return skillRepository.save(skill).toDto()
    }

    override fun deleteSkill(id: Long) {
        if (!skillRepository.existsById(id)) {
            throw EntityNotFoundException("Skill not found with id: $id")
        }
        skillRepository.deleteById(id)
    }

    override fun getSkillsByCategory(category: String): List<SkillDto> {
        return skillRepository.findByCategory(category).map { it.toDto() }
    }

    override fun searchSkills(query: String): List<SkillDto> {
        return skillRepository.findByNameContainingIgnoreCase(query).map { it.toDto() }
    }

    private fun Skill.toDto(): SkillDto {
        return SkillDto(
            id = this.id,
            name = this.name,
            category = this.category,
            description = this.description,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}