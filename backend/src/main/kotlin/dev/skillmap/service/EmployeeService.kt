package dev.skillmap.service

import dev.skillmap.dto.EmployeeCreateDto
import dev.skillmap.dto.EmployeeDto
import dev.skillmap.dto.EmployeeUpdateDto
import dev.skillmap.entity.Employee
import dev.skillmap.repository.EmployeeRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface EmployeeService {
    fun getAllEmployees(): List<EmployeeDto>
    fun getEmployeeById(id: Long): EmployeeDto
    fun createEmployee(employeeCreateDto: EmployeeCreateDto): EmployeeDto
    fun updateEmployee(id: Long, employeeUpdateDto: EmployeeUpdateDto): EmployeeDto
    fun deleteEmployee(id: Long)
    fun searchEmployees(query: String): List<EmployeeDto>
}

@Service
@Transactional
class EmployeeServiceImpl(
    private val employeeRepository: EmployeeRepository
) : EmployeeService {

    override fun getAllEmployees(): List<EmployeeDto> {
        return employeeRepository.findAll().map { it.toDto() }
    }

    override fun getEmployeeById(id: Long): EmployeeDto {
        return employeeRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Employee not found with id: $id") }
            .toDto()
    }

    override fun createEmployee(employeeCreateDto: EmployeeCreateDto): EmployeeDto {
        val employee = Employee(
            firstName = employeeCreateDto.firstName,
            lastName = employeeCreateDto.lastName,
            email = employeeCreateDto.email,
            position = employeeCreateDto.position,
            department = employeeCreateDto.department,
            workingHoursPerWeek = employeeCreateDto.workingHoursPerWeek
        )
        return employeeRepository.save(employee).toDto()
    }

    override fun updateEmployee(id: Long, employeeUpdateDto: EmployeeUpdateDto): EmployeeDto {
        val employee = employeeRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Employee not found with id: $id") }

        employeeUpdateDto.firstName?.let { employee.firstName = it }
        employeeUpdateDto.lastName?.let { employee.lastName = it }
        employeeUpdateDto.email?.let { employee.email = it }
        employeeUpdateDto.position?.let { employee.position = it }
        employeeUpdateDto.department?.let { employee.department = it }
        employeeUpdateDto.workingHoursPerWeek?.let { employee.workingHoursPerWeek = it }
        employee.updatedAt = LocalDateTime.now()

        return employeeRepository.save(employee).toDto()
    }

    override fun deleteEmployee(id: Long) {
        if (!employeeRepository.existsById(id)) {
            throw EntityNotFoundException("Employee not found with id: $id")
        }
        employeeRepository.deleteById(id)
    }

    override fun searchEmployees(query: String): List<EmployeeDto> {
        return employeeRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(query, query)
            .map { it.toDto() }
    }

    private fun Employee.toDto(): EmployeeDto {
        return EmployeeDto(
            id = this.id,
            firstName = this.firstName,
            lastName = this.lastName,
            email = this.email,
            position = this.position,
            department = this.department,
            workingHoursPerWeek = this.workingHoursPerWeek,
            maxFTE = this.maxFTE,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}