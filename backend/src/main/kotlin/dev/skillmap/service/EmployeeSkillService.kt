package dev.skillmap.service

import dev.skillmap.dto.EmployeeSkillCreateDto
import dev.skillmap.dto.EmployeeSkillDto
import dev.skillmap.dto.EmployeeSkillUpdateDto
import dev.skillmap.entity.EmployeeSkill
import dev.skillmap.repository.EmployeeRepository
import dev.skillmap.repository.EmployeeSkillRepository
import dev.skillmap.repository.SkillRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

interface EmployeeSkillService {
    fun getSkillsByEmployeeId(employeeId: Long): List<EmployeeSkillDto>
    fun getEmployeeSkillById(id: Long): EmployeeSkillDto
    fun addSkillToEmployee(employeeSkillCreateDto: EmployeeSkillCreateDto): EmployeeSkillDto
    fun updateEmployeeSkill(id: Long, employeeSkillUpdateDto: EmployeeSkillUpdateDto): EmployeeSkillDto
    fun deleteEmployeeSkill(id: Long)
    fun getTopSkillsForEmployee(employeeId: Long): List<EmployeeSkillDto>
}

@Service
@Transactional
class EmployeeSkillServiceImpl(
    private val employeeSkillRepository: EmployeeSkillRepository,
    private val employeeRepository: EmployeeRepository,
    private val skillRepository: SkillRepository
) : EmployeeSkillService {

    override fun getSkillsByEmployeeId(employeeId: Long): List<EmployeeSkillDto> {
        if (!employeeRepository.existsById(employeeId)) {
            throw EntityNotFoundException("Employee not found with id: $employeeId")
        }
        return employeeSkillRepository.findByEmployeeId(employeeId).map { it.toDto() }
    }

    override fun getEmployeeSkillById(id: Long): EmployeeSkillDto {
        return employeeSkillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Employee skill not found with id: $id") }
            .toDto()
    }

    override fun addSkillToEmployee(employeeSkillCreateDto: EmployeeSkillCreateDto): EmployeeSkillDto {
        val employee = employeeRepository.findById(employeeSkillCreateDto.employeeId)
            .orElseThrow { EntityNotFoundException("Employee not found with id: ${employeeSkillCreateDto.employeeId}") }
        
        val skill = skillRepository.findById(employeeSkillCreateDto.skillId)
            .orElseThrow { EntityNotFoundException("Skill not found with id: ${employeeSkillCreateDto.skillId}") }
        
        // Check if this employee-skill combination already exists
        employeeSkillRepository.findByEmployeeIdAndSkillId(employee.id!!, skill.id!!)?.let {
            throw IllegalStateException("Employee already has this skill registered")
        }
        
        val employeeSkill = EmployeeSkill(
            employee = employee,
            skill = skill,
            proficiencyLevel = employeeSkillCreateDto.proficiencyLevel,
            notes = employeeSkillCreateDto.notes
        )
        
        return employeeSkillRepository.save(employeeSkill).toDto()
    }

    override fun updateEmployeeSkill(id: Long, employeeSkillUpdateDto: EmployeeSkillUpdateDto): EmployeeSkillDto {
        val employeeSkill = employeeSkillRepository.findById(id)
            .orElseThrow { EntityNotFoundException("Employee skill not found with id: $id") }

        employeeSkillUpdateDto.proficiencyLevel?.let { employeeSkill.proficiencyLevel = it }
        employeeSkillUpdateDto.notes?.let { employeeSkill.notes = it }
        employeeSkill.updatedAt = LocalDateTime.now()

        return employeeSkillRepository.save(employeeSkill).toDto()
    }

    override fun deleteEmployeeSkill(id: Long) {
        if (!employeeSkillRepository.existsById(id)) {
            throw EntityNotFoundException("Employee skill not found with id: $id")
        }
        employeeSkillRepository.deleteById(id)
    }

    override fun getTopSkillsForEmployee(employeeId: Long): List<EmployeeSkillDto> {
        if (!employeeRepository.existsById(employeeId)) {
            throw EntityNotFoundException("Employee not found with id: $employeeId")
        }
        return employeeSkillRepository.findTopSkillsForEmployee(employeeId).map { it.toDto() }
    }

    private fun EmployeeSkill.toDto(): EmployeeSkillDto {
        return EmployeeSkillDto(
            id = this.id,
            employeeId = this.employee.id!!,
            skillId = this.skill.id!!,
            proficiencyLevel = this.proficiencyLevel,
            skillName = this.skill.name,
            notes = this.notes,
            createdAt = this.createdAt,
            updatedAt = this.updatedAt
        )
    }
}