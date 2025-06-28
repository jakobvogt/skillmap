package dev.skillmap.service

import dev.skillmap.dto.ProjectAssignmentCreateDto
import dev.skillmap.dto.ProjectAssignmentDto
import dev.skillmap.dto.ProjectAssignmentUpdateDto
import dev.skillmap.entity.ProjectAssignment
import dev.skillmap.repository.EmployeeRepository
import dev.skillmap.repository.ProjectAssignmentRepository
import dev.skillmap.repository.ProjectRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

interface ProjectAssignmentService {
    fun getAssignmentsByProjectId(projectId: Long): List<ProjectAssignmentDto>
    fun getAssignmentsByEmployeeId(employeeId: Long): List<ProjectAssignmentDto>
    fun getAssignmentById(id: Long): ProjectAssignmentDto
    fun createAssignment(assignmentCreateDto: ProjectAssignmentCreateDto): ProjectAssignmentDto
    fun updateAssignment(id: Long, assignmentUpdateDto: ProjectAssignmentUpdateDto): ProjectAssignmentDto
    fun deleteAssignment(id: Long)
    fun deleteAllAssignments()
    fun getCurrentAssignmentsForEmployee(employeeId: Long, date: LocalDate = LocalDate.now()): List<ProjectAssignmentDto>
    fun getTotalAllocationForEmployee(employeeId: Long, date: LocalDate = LocalDate.now()): Int
    fun getActiveAssignments(date: LocalDate = LocalDate.now()): List<ProjectAssignmentDto>
}

@Service
@Transactional
class ProjectAssignmentServiceImpl(
    private val projectAssignmentRepository: ProjectAssignmentRepository,
    private val projectRepository: ProjectRepository,
    private val employeeRepository: EmployeeRepository
) : ProjectAssignmentService {

    override fun getAssignmentsByProjectId(projectId: Long): List<ProjectAssignmentDto> {
        if (!projectRepository.existsById(projectId)) {
            throw EntityNotFoundException("Project not found with id: $projectId")
        }
        return projectAssignmentRepository.findByProjectId(projectId).map { it.toDto() }
    }

    override fun getAssignmentsByEmployeeId(employeeId: Long): List<ProjectAssignmentDto> {
        if (!employeeRepository.existsById(employeeId)) {
            throw EntityNotFoundException("Employee not found with id: $employeeId")
        }
        return projectAssignmentRepository.findByEmployeeId(employeeId).map { it.toDto() }
    }

    override fun getAssignmentById(id: Long): ProjectAssignmentDto {
        return projectAssignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Assignment not found with id: $id") }
            .toDto()
    }

    override fun createAssignment(assignmentCreateDto: ProjectAssignmentCreateDto): ProjectAssignmentDto {
        val project = projectRepository.findById(assignmentCreateDto.projectId)
            .orElseThrow { EntityNotFoundException("Project not found with id: ${assignmentCreateDto.projectId}") }
        
        val employee = employeeRepository.findById(assignmentCreateDto.employeeId)
            .orElseThrow { EntityNotFoundException("Employee not found with id: ${assignmentCreateDto.employeeId}") }
        
        // Check if this project-employee combination already exists
        projectAssignmentRepository.findByProjectIdAndEmployeeId(project.id!!, employee.id!!)?.let {
            throw IllegalStateException("Employee is already assigned to this project")
        }
        
        val assignment = ProjectAssignment(
            project = project,
            employee = employee,
            role = assignmentCreateDto.role,
            allocationPercentage = assignmentCreateDto.allocationPercentage,
            startDate = assignmentCreateDto.startDate,
            endDate = assignmentCreateDto.endDate,
            isAutomaticallyAssigned = assignmentCreateDto.isAutomaticallyAssigned,
            notes = assignmentCreateDto.notes
        )
        
        return projectAssignmentRepository.save(assignment).toDto()
    }

    override fun updateAssignment(id: Long, assignmentUpdateDto: ProjectAssignmentUpdateDto): ProjectAssignmentDto {
        val assignment = projectAssignmentRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Assignment not found with id: $id") }

        assignmentUpdateDto.role?.let { assignment.role = it }
        assignmentUpdateDto.allocationPercentage?.let { assignment.allocationPercentage = it }
        assignmentUpdateDto.startDate?.let { assignment.startDate = it }
        assignmentUpdateDto.endDate?.let { assignment.endDate = it }
        assignmentUpdateDto.isAutomaticallyAssigned?.let { assignment.isAutomaticallyAssigned = it }
        assignmentUpdateDto.notes?.let { assignment.notes = it }
        assignment.updatedAt = LocalDateTime.now()

        return projectAssignmentRepository.save(assignment).toDto()
    }

    override fun deleteAssignment(id: Long) {
        if (!projectAssignmentRepository.existsById(id)) {
            throw EntityNotFoundException("Assignment not found with id: $id")
        }
        projectAssignmentRepository.deleteById(id)
    }

    override fun deleteAllAssignments() {
        projectAssignmentRepository.deleteAll()
    }

    override fun getCurrentAssignmentsForEmployee(employeeId: Long, date: LocalDate): List<ProjectAssignmentDto> {
        if (!employeeRepository.existsById(employeeId)) {
            throw EntityNotFoundException("Employee not found with id: $employeeId")
        }
        return projectAssignmentRepository.findCurrentAssignmentsForEmployee(employeeId, date).map { it.toDto() }
    }

    override fun getTotalAllocationForEmployee(employeeId: Long, date: LocalDate): Int {
        if (!employeeRepository.existsById(employeeId)) {
            throw EntityNotFoundException("Employee not found with id: $employeeId")
        }
        return projectAssignmentRepository.calculateTotalAllocationForEmployee(employeeId, date)
    }

    override fun getActiveAssignments(date: LocalDate): List<ProjectAssignmentDto> {
        return projectAssignmentRepository.findActiveAssignments(date).map { it.toDto() }
    }

    private fun ProjectAssignment.toDto(): ProjectAssignmentDto {
        return ProjectAssignmentDto(
            id = this.id,
            projectId = this.project.id!!,
            employeeId = this.employee.id!!,
            projectName = this.project.name,
            employeeName = "${this.employee.firstName} ${this.employee.lastName}",
            role = this.role,
            allocationPercentage = this.allocationPercentage,
            startDate = this.startDate,
            endDate = this.endDate,
            isAutomaticallyAssigned = this.isAutomaticallyAssigned,
            notes = this.notes,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}