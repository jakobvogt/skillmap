package dev.skillmap.repository

import dev.skillmap.entity.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ProjectRepository : JpaRepository<Project, Long> {
    fun findByNameContainingIgnoreCase(name: String): List<Project>
    
    fun findByStatus(status: String): List<Project>
    
    // Find projects that have active assignments on the given date
    @Query("""
        SELECT DISTINCT p.id FROM Project p
        JOIN ProjectAssignment pa ON p.id = pa.project.id
        WHERE (
            (pa.startDate IS NULL AND pa.endDate IS NULL) OR
            (pa.startDate <= :date AND (pa.endDate IS NULL OR pa.endDate >= :date))
        )
        AND p.status NOT IN ('COMPLETED', 'CANCELLED')
    """)
    fun findProjectsWithActiveAssignments(@Param("date") date: LocalDate): List<Long>
}