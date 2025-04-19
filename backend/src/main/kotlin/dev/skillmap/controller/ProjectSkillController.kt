package dev.skillmap.controller

import dev.skillmap.dto.ProjectSkillCreateDto
import dev.skillmap.dto.ProjectSkillDto
import dev.skillmap.dto.ProjectSkillUpdateDto
import dev.skillmap.service.ProjectSkillService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/project-skills")
@CrossOrigin(origins = ["http://localhost:3000"])
class ProjectSkillController(private val projectSkillService: ProjectSkillService) {

    @GetMapping("/project/{projectId}")
    fun getSkillsByProjectId(@PathVariable projectId: Long): ResponseEntity<List<ProjectSkillDto>> {
        return ResponseEntity.ok(projectSkillService.getSkillsByProjectId(projectId))
    }

    @GetMapping("/{id}")
    fun getProjectSkillById(@PathVariable id: Long): ResponseEntity<ProjectSkillDto> {
        return ResponseEntity.ok(projectSkillService.getProjectSkillById(id))
    }

    @PostMapping
    fun addSkillToProject(@RequestBody projectSkillCreateDto: ProjectSkillCreateDto): ResponseEntity<ProjectSkillDto> {
        val createdProjectSkill = projectSkillService.addSkillToProject(projectSkillCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProjectSkill)
    }

    @PutMapping("/{id}")
    fun updateProjectSkill(
        @PathVariable id: Long,
        @RequestBody projectSkillUpdateDto: ProjectSkillUpdateDto
    ): ResponseEntity<ProjectSkillDto> {
        return ResponseEntity.ok(projectSkillService.updateProjectSkill(id, projectSkillUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteProjectSkill(@PathVariable id: Long): ResponseEntity<Void> {
        projectSkillService.deleteProjectSkill(id)
        return ResponseEntity.noContent().build()
    }
}