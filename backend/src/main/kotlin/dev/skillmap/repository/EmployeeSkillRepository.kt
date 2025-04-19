package dev.skillmap.repository

import dev.skillmap.entity.EmployeeSkill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface EmployeeSkillRepository : JpaRepository<EmployeeSkill, Long> {
    fun findByEmployeeId(employeeId: Long): List<EmployeeSkill>
    
    fun findBySkillId(skillId: Long): List<EmployeeSkill>
    
    fun findByEmployeeIdAndSkillId(employeeId: Long, skillId: Long): EmployeeSkill?
    
    // Find employees with a minimum proficiency level for a skill
    @Query("""
        SELECT es FROM EmployeeSkill es
        WHERE es.skill.id = :skillId
        AND es.proficiencyLevel >= :minLevel
        ORDER BY es.proficiencyLevel DESC
    """)
    fun findEmployeesWithMinimumProficiency(
        @Param("skillId") skillId: Long,
        @Param("minLevel") minLevel: Int
    ): List<EmployeeSkill>
    
    // Find top skills for an employee
    @Query("""
        SELECT es FROM EmployeeSkill es
        WHERE es.employee.id = :employeeId
        ORDER BY es.proficiencyLevel DESC
    """)
    fun findTopSkillsForEmployee(@Param("employeeId") employeeId: Long): List<EmployeeSkill>
}