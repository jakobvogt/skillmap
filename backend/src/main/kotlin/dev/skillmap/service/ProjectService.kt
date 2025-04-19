package dev.skillmap.service

import dev.skillmap.dto.ProjectCreateDto
import dev.skillmap.dto.ProjectDto
import dev.skillmap.dto.ProjectUpdateDto
import dev.skillmap.entity.Project
import dev.skillmap.repository.ProjectRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface ProjectService {
    fun getAllProjects(): List<ProjectDto>
    fun getProjectById(id: Long): ProjectDto
    fun createProject(projectCreateDto: ProjectCreateDto): ProjectDto
    fun updateProject(id: Long, projectUpdateDto: ProjectUpdateDto): ProjectDto
    fun deleteProject(id: Long)
    fun getProjectsByStatus(status: String): List<ProjectDto>
    fun searchProjects(query: String): List<ProjectDto>
}

@Service
@Transactional
class ProjectServiceImpl(
    private val projectRepository: ProjectRepository
) : ProjectService {

    override fun getAllProjects(): List<ProjectDto> {
        return projectRepository.findAll().map { it.toDto() }
    }

    override fun getProjectById(id: Long): ProjectDto {
        return projectRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Project not found with id: $id") }
            .toDto()
    }

    override fun createProject(projectCreateDto: ProjectCreateDto): ProjectDto {
        val project = Project(
            name = projectCreateDto.name,
            description = projectCreateDto.description,
            startDate = projectCreateDto.startDate,
            endDate = projectCreateDto.endDate,
            budget = projectCreateDto.budget,
            status = projectCreateDto.status
        )
        return projectRepository.save(project).toDto()
    }

    override fun updateProject(id: Long, projectUpdateDto: ProjectUpdateDto): ProjectDto {
        val project = projectRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Project not found with id: $id") }

        projectUpdateDto.name?.let { project.name = it }
        projectUpdateDto.description?.let { project.description = it }
        projectUpdateDto.startDate?.let { project.startDate = it }
        projectUpdateDto.endDate?.let { project.endDate = it }
        projectUpdateDto.budget?.let { project.budget = it }
        projectUpdateDto.status?.let { project.status = it }
        project.updatedAt = LocalDateTime.now()

        return projectRepository.save(project).toDto()
    }

    override fun deleteProject(id: Long) {
        if (!projectRepository.existsById(id)) {
            throw EntityNotFoundException("Project not found with id: $id")
        }
        projectRepository.deleteById(id)
    }

    override fun getProjectsByStatus(status: String): List<ProjectDto> {
        return projectRepository.findByStatus(status).map { it.toDto() }
    }

    override fun searchProjects(query: String): List<ProjectDto> {
        return projectRepository.findByNameContainingIgnoreCase(query).map { it.toDto() }
    }

    private fun Project.toDto(): ProjectDto {
        return ProjectDto(
            id = this.id,
            name = this.name,
            description = this.description,
            startDate = this.startDate,
            endDate = this.endDate,
            budget = this.budget,
            status = this.status,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}