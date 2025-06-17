package dev.skillmap.repository

import dev.skillmap.entity.ProjectAssignment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ProjectAssignmentRepository : JpaRepository<ProjectAssignment, Long> {
    fun findByProjectId(projectId: Long): List<ProjectAssignment>

    fun findByEmployeeId(employeeId: Long): List<ProjectAssignment>

    fun findByProjectIdAndEmployeeId(projectId: Long, employeeId: Long): ProjectAssignment?

    // Find current assignments for an employee
    @Query("""
        SELECT pa FROM ProjectAssignment pa
        WHERE pa.employee.id = :employeeId
        AND (
            (pa.startDate IS NULL AND pa.endDate IS NULL) OR
            (pa.startDate <= :today AND (pa.endDate IS NULL OR pa.endDate >= :today))
        )
        AND pa.project.status NOT IN ('COMPLETED', 'CANCELLED')
    """)
    fun findCurrentAssignmentsForEmployee(
        @Param("employeeId") employeeId: Long,
        @Param("today") today: LocalDate
    ): List<ProjectAssignment>

    // Calculate total allocation percentage for an employee
    @Query("""
        SELECT COALESCE(SUM(pa.allocationPercentage), 0)
        FROM ProjectAssignment pa
        WHERE pa.employee.id = :employeeId
        AND (
            (pa.startDate IS NULL AND pa.endDate IS NULL) OR
            (pa.startDate <= :today AND (pa.endDate IS NULL OR pa.endDate >= :today))
        )
        AND pa.project.status NOT IN ('COMPLETED', 'CANCELLED')
    """)
    fun calculateTotalAllocationForEmployee(
        @Param("employeeId") employeeId: Long,
        @Param("today") today: LocalDate
    ): Int

    // Find assignments made by the automatic algorithm
    fun findByIsAutomaticallyAssignedTrue(): List<ProjectAssignment>

    // Find all active assignments for a specific date
    @Query("""
        SELECT pa FROM ProjectAssignment pa
        WHERE (
            (pa.startDate IS NULL AND pa.endDate IS NULL) OR
            (pa.startDate <= :date AND (pa.endDate IS NULL OR pa.endDate >= :date))
        )
        AND pa.project.status NOT IN ('COMPLETED', 'CANCELLED')
    """)
    fun findActiveAssignments(@Param("date") date: LocalDate): List<ProjectAssignment>
}