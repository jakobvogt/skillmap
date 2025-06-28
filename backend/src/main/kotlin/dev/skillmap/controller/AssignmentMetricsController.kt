package dev.skillmap.controller

import dev.skillmap.dto.AssignmentMetricsDto
import dev.skillmap.service.AssignmentMetricsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/assignment-metrics")
@CrossOrigin(origins = ["http://localhost:5173"])
class AssignmentMetricsController(
    private val assignmentMetricsService: AssignmentMetricsService
) {
    
    @GetMapping
    fun getAssignmentMetrics(
        @RequestParam(required = false) date: LocalDate?
    ): ResponseEntity<AssignmentMetricsDto> {
        val calculationDate = date ?: LocalDate.now()
        val metrics = assignmentMetricsService.calculateAssignmentMetrics(calculationDate)
        return ResponseEntity.ok(metrics)
    }
}