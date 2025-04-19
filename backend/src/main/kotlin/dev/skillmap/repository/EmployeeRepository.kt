package dev.skillmap.repository

import dev.skillmap.entity.Employee
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface EmployeeRepository : JpaRepository<Employee, Long> {
    fun findByEmail(email: String): Employee?
    
    fun findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        firstName: String, 
        lastName: String
    ): List<Employee>
    
    @Query("""
        SELECT e FROM Employee e
        JOIN e.skills es
        WHERE es.skill.id = :skillId
        AND es.proficiencyLevel >= :minimumLevel
    """)
    fun findBySkillWithMinimumLevel(
        @Param("skillId") skillId: Long,
        @Param("minimumLevel") minimumLevel: Int
    ): List<Employee>
    
    @Query("""
        SELECT e FROM Employee e
        WHERE e.id NOT IN (
            SELECT pa.employee.id FROM ProjectAssignment pa
            WHERE pa.project.id = :projectId
        )
    """)
    fun findEmployeesNotAssignedToProject(@Param("projectId") projectId: Long): List<Employee>
}