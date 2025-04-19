package dev.skillmap.controller

import dev.skillmap.dto.EmployeeCreateDto
import dev.skillmap.dto.EmployeeDto
import dev.skillmap.dto.EmployeeUpdateDto
import dev.skillmap.service.EmployeeService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = ["http://localhost:3000"])
class EmployeeController(private val employeeService: EmployeeService) {

    @GetMapping
    fun getAllEmployees(): ResponseEntity<List<EmployeeDto>> {
        return ResponseEntity.ok(employeeService.getAllEmployees())
    }

    @GetMapping("/{id}")
    fun getEmployeeById(@PathVariable id: Long): ResponseEntity<EmployeeDto> {
        return ResponseEntity.ok(employeeService.getEmployeeById(id))
    }

    @PostMapping
    fun createEmployee(@RequestBody employeeCreateDto: EmployeeCreateDto): ResponseEntity<EmployeeDto> {
        val createdEmployee = employeeService.createEmployee(employeeCreateDto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee)
    }

    @PutMapping("/{id}")
    fun updateEmployee(
        @PathVariable id: Long,
        @RequestBody employeeUpdateDto: EmployeeUpdateDto
    ): ResponseEntity<EmployeeDto> {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeUpdateDto))
    }

    @DeleteMapping("/{id}")
    fun deleteEmployee(@PathVariable id: Long): ResponseEntity<Void> {
        employeeService.deleteEmployee(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/search")
    fun searchEmployees(@RequestParam query: String): ResponseEntity<List<EmployeeDto>> {
        return ResponseEntity.ok(employeeService.searchEmployees(query))
    }
}