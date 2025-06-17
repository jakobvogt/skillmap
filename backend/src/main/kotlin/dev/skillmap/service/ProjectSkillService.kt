package dev.skillmap.service

import dev.skillmap.dto.ProjectSkillCreateDto
import dev.skillmap.dto.ProjectSkillDto
import dev.skillmap.dto.ProjectSkillUpdateDto
import dev.skillmap.entity.ProjectSkill
import dev.skillmap.repository.ProjectRepository
import dev.skillmap.repository.ProjectSkillRepository
import dev.skillmap.repository.SkillRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface ProjectSkillService {
    fun getSkillsByProjectId(projectId: Long): List<ProjectSkillDto>
    fun getProjectSkillById(id: Long): ProjectSkillDto
    fun addSkillToProject(projectSkillCreateDto: ProjectSkillCreateDto): ProjectSkillDto
    fun updateProjectSkill(id: Long, projectSkillUpdateDto: ProjectSkillUpdateDto): ProjectSkillDto
    fun deleteProjectSkill(id: Long)
}

@Service
@Transactional
class ProjectSkillServiceImpl(
    private val projectSkillRepository: ProjectSkillRepository,
    private val projectRepository: ProjectRepository,
    private val skillRepository: SkillRepository
) : ProjectSkillService {

    override fun getSkillsByProjectId(projectId: Long): List<ProjectSkillDto> {
        if (!projectRepository.existsById(projectId)) {
            throw EntityNotFoundException("Project not found with id: $projectId")
        }
        return projectSkillRepository.findByProjectId(projectId).map { it.toDto() }
    }

    override fun getProjectSkillById(id: Long): ProjectSkillDto {
        return projectSkillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Project skill not found with id: $id") }
            .toDto()
    }

    override fun addSkillToProject(projectSkillCreateDto: ProjectSkillCreateDto): ProjectSkillDto {
        val project = projectRepository.findById(projectSkillCreateDto.projectId)
            .orElseThrow { EntityNotFoundException("Project not found with id: ${projectSkillCreateDto.projectId}") }
        
        val skill = skillRepository.findById(projectSkillCreateDto.skillId)
            .orElseThrow { EntityNotFoundException("Skill not found with id: ${projectSkillCreateDto.skillId}") }
        
        // Check if this project-skill combination already exists
        projectSkillRepository.findByProjectIdAndSkillId(project.id!!, skill.id!!)?.let {
            throw IllegalStateException("Project already has this skill registered")
        }
        
        val projectSkill = ProjectSkill(
            project = project,
            skill = skill,
            importance = projectSkillCreateDto.importance,
            minimumProficiencyRequired = projectSkillCreateDto.minimumProficiencyRequired,
            minimumFTE = projectSkillCreateDto.minimumFTE,
            fteThreshold = projectSkillCreateDto.fteThreshold,
            notes = projectSkillCreateDto.notes
        )
        
        return projectSkillRepository.save(projectSkill).toDto()
    }

    override fun updateProjectSkill(id: Long, projectSkillUpdateDto: ProjectSkillUpdateDto): ProjectSkillDto {
        val projectSkill = projectSkillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Project skill not found with id: $id") }

        projectSkillUpdateDto.importance?.let { projectSkill.importance = it }
        projectSkillUpdateDto.minimumProficiencyRequired?.let { projectSkill.minimumProficiencyRequired = it }
        projectSkillUpdateDto.minimumFTE?.let { projectSkill.minimumFTE = it }
        projectSkillUpdateDto.fteThreshold?.let { projectSkill.fteThreshold = it }
        projectSkillUpdateDto.notes?.let { projectSkill.notes = it }
        projectSkill.updatedAt = LocalDateTime.now()

        return projectSkillRepository.save(projectSkill).toDto()
    }

    override fun deleteProjectSkill(id: Long) {
        if (!projectSkillRepository.existsById(id)) {
            throw EntityNotFoundException("Project skill not found with id: $id")
        }
        projectSkillRepository.deleteById(id)
    }

    private fun ProjectSkill.toDto(): ProjectSkillDto {
        return ProjectSkillDto(
            id = this.id,
            projectId = this.project.id!!,
            skillId = this.skill.id!!,
            importance = this.importance,
            minimumProficiencyRequired = this.minimumProficiencyRequired,
            minimumFTE = this.minimumFTE,
            fteThreshold = this.fteThreshold,
            skillName = this.skill.name,
            notes = this.notes,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}