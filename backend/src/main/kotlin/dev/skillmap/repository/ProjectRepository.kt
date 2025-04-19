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
    
}