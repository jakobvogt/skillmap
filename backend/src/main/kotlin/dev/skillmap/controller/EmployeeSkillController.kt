package dev.skillmap.controller

import dev.skillmap.dto.EmployeeSkillCreateDto
import dev.skillmap.dto.EmployeeSkillDto
import dev.skillmap.dto.EmployeeSkillUpdateDto
import dev.skillmap.service.EmployeeSkillService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/employee-skills")
@CrossOrigin(origins = ["http://localhost:3000"])
class EmployeeSkillController(private val employeeSkillService: EmployeeSkillService) {

    @GetMapping("/employee/{employeeId}")
    fun getSkillsByEmployeeId(@PathVariable employeeId: Long): ResponseEntity<List<EmployeeSkillDto>> {
        return ResponseEntity.ok(employeeSkillService.getSkillsByEmployeeId(employeeId))
    }

    @GetMapping("/{id}")
    fun getEmployeeSkillById(@PathVariable id: Long): ResponseEntity<EmployeeSkillDto> {
        return ResponseEntity.ok(employeeSkillService.getEmployeeSkillById(id))
    }

    @PostMapping
    fun addSkillToEmployee(@RequestBody employeeSkillCreateDto: EmployeeSkillCreateDto): ResponseEntity<EmployeeSkillDto> {
        val createdEmployeeSkill = employeeSkillService.addSkillToEmployee(employeeSkillCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployeeSkill)
    }

    @PutMapping("/{id}")
    fun updateEmployeeSkill(
        @PathVariable id: Long,
        @RequestBody employeeSkillUpdateDto: EmployeeSkillUpdateDto
    ): ResponseEntity<EmployeeSkillDto> {
        return ResponseEntity.ok(employeeSkillService.updateEmployeeSkill(id, employeeSkillUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteEmployeeSkill(@PathVariable id: Long): ResponseEntity<Void> {
        employeeSkillService.deleteEmployeeSkill(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/employee/{employeeId}/top")
    fun getTopSkillsForEmployee(@PathVariable employeeId: Long): ResponseEntity<List<EmployeeSkillDto>> {
        return ResponseEntity.ok(employeeSkillService.getTopSkillsForEmployee(employeeId))
    }
}