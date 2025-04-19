package dev.skillmap.controller

import dev.skillmap.dto.ProjectCreateDto
import dev.skillmap.dto.ProjectDto
import dev.skillmap.dto.ProjectUpdateDto
import dev.skillmap.service.ProjectService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = ["http://localhost:3000"])
class ProjectController(private val projectService: ProjectService) {

    @GetMapping
    fun getAllProjects(): ResponseEntity<List<ProjectDto>> {
        return ResponseEntity.ok(projectService.getAllProjects())
    }

    @GetMapping("/{id}")
    fun getProjectById(@PathVariable id: Long): ResponseEntity<ProjectDto> {
        return ResponseEntity.ok(projectService.getProjectById(id))
    }

    @PostMapping
    fun createProject(@RequestBody projectCreateDto: ProjectCreateDto): ResponseEntity<ProjectDto> {
        val createdProject = projectService.createProject(projectCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProject)
    }

    @PutMapping("/{id}")
    fun updateProject(
        @PathVariable id: Long,
        @RequestBody projectUpdateDto: ProjectUpdateDto
    ): ResponseEntity<ProjectDto> {
        return ResponseEntity.ok(projectService.updateProject(id, projectUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteProject(@PathVariable id: Long): ResponseEntity<Void> {
        projectService.deleteProject(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/status/{status}")
    fun getProjectsByStatus(@PathVariable status: String): ResponseEntity<List<ProjectDto>> {
        return ResponseEntity.ok(projectService.getProjectsByStatus(status))
    }

    @GetMapping("/search")
    fun searchProjects(@RequestParam query: String): ResponseEntity<List<ProjectDto>> {
        return ResponseEntity.ok(projectService.searchProjects(query))
    }
}