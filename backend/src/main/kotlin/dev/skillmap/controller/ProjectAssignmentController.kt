package dev.skillmap.controller

import dev.skillmap.dto.ProjectAssignmentCreateDto
import dev.skillmap.dto.ProjectAssignmentDto
import dev.skillmap.dto.ProjectAssignmentUpdateDto
import dev.skillmap.service.AutoAssignmentService
import dev.skillmap.service.ProjectAssignmentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/project-assignments")
@CrossOrigin(origins = ["http://localhost:3000"])
class ProjectAssignmentController(
    private val projectAssignmentService: ProjectAssignmentService,
    private val autoAssignmentService: AutoAssignmentService
) {

    @GetMapping("/project/{projectId}")
    fun getAssignmentsByProjectId(@PathVariable projectId: Long): ResponseEntity<List<ProjectAssignmentDto>> {
        return ResponseEntity.ok(projectAssignmentService.getAssignmentsByProjectId(projectId))
    }

    @GetMapping("/employee/{employeeId}")
    fun getAssignmentsByEmployeeId(@PathVariable employeeId: Long): ResponseEntity<List<ProjectAssignmentDto>> {
        return ResponseEntity.ok(projectAssignmentService.getAssignmentsByEmployeeId(employeeId))
    }

    @GetMapping("/active")
    fun getActiveAssignments(@RequestParam(required = false) date: LocalDate?): ResponseEntity<List<ProjectAssignmentDto>> {
        val targetDate = date ?: LocalDate.now()
        return ResponseEntity.ok(projectAssignmentService.getActiveAssignments(targetDate))
    }

    @GetMapping("/{id}")
    fun getAssignmentById(@PathVariable id: Long): ResponseEntity<ProjectAssignmentDto> {
        return ResponseEntity.ok(projectAssignmentService.getAssignmentById(id))
    }

    @PostMapping
    fun createAssignment(@RequestBody assignmentCreateDto: ProjectAssignmentCreateDto): ResponseEntity<ProjectAssignmentDto> {
        val createdAssignment = projectAssignmentService.createAssignment(assignmentCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment)
    }

    @PutMapping("/{id}")
    fun updateAssignment(
        @PathVariable id: Long,
        @RequestBody assignmentUpdateDto: ProjectAssignmentUpdateDto
    ): ResponseEntity<ProjectAssignmentDto> {
        return ResponseEntity.ok(projectAssignmentService.updateAssignment(id, assignmentUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteAssignment(@PathVariable id: Long): ResponseEntity<Void> {
        projectAssignmentService.deleteAssignment(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/employee/{employeeId}/current")
    fun getCurrentAssignmentsForEmployee(
        @PathVariable employeeId: Long,
        @RequestParam(required = false) date: LocalDate?
    ): ResponseEntity<List<ProjectAssignmentDto>> {
        val targetDate = date ?: LocalDate.now()
        return ResponseEntity.ok(projectAssignmentService.getCurrentAssignmentsForEmployee(employeeId, targetDate))
    }

    @GetMapping("/employee/{employeeId}/allocation")
    fun getTotalAllocationForEmployee(
        @PathVariable employeeId: Long,
        @RequestParam(required = false) date: LocalDate?
    ): ResponseEntity<Int> {
        val targetDate = date ?: LocalDate.now()
        return ResponseEntity.ok(projectAssignmentService.getTotalAllocationForEmployee(employeeId, targetDate))
    }

    @PostMapping("/auto-assign/project/{projectId}")
    fun autoAssignEmployeesToProject(@PathVariable projectId: Long): ResponseEntity<List<ProjectAssignmentDto>> {
        val assignments = autoAssignmentService.autoAssignEmployeesToProject(projectId)
        return ResponseEntity.status(HttpStatus.CREATED).body(assignments)
    }
}