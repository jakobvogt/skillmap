package dev.skillmap.controller

import dev.skillmap.dto.SkillCreateDto
import dev.skillmap.dto.SkillDto
import dev.skillmap.dto.SkillUpdateDto
import dev.skillmap.service.SkillService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = ["http://localhost:3000"])
class SkillController(private val skillService: SkillService) {

    @GetMapping
    fun getAllSkills(): ResponseEntity<List<SkillDto>> {
        return ResponseEntity.ok(skillService.getAllSkills())
    }

    @GetMapping("/{id}")
    fun getSkillById(@PathVariable id: Long): ResponseEntity<SkillDto> {
        return ResponseEntity.ok(skillService.getSkillById(id))
    }

    @PostMapping
    fun createSkill(@RequestBody skillCreateDto: SkillCreateDto): ResponseEntity<SkillDto> {
        val createdSkill = skillService.createSkill(skillCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSkill)
    }

    @PutMapping("/{id}")
    fun updateSkill(
        @PathVariable id: Long,
        @RequestBody skillUpdateDto: SkillUpdateDto
    ): ResponseEntity<SkillDto> {
        return ResponseEntity.ok(skillService.updateSkill(id, skillUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteSkill(@PathVariable id: Long): ResponseEntity<Void> {
        skillService.deleteSkill(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/category/{category}")
    fun getSkillsByCategory(@PathVariable category: String): ResponseEntity<List<SkillDto>> {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category))
    }

    @GetMapping("/search")
    fun searchSkills(@RequestParam query: String): ResponseEntity<List<SkillDto>> {
        return ResponseEntity.ok(skillService.searchSkills(query))
    }
}