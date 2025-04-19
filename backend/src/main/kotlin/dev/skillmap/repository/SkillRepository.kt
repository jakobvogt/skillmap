package dev.skillmap.repository

import dev.skillmap.entity.Skill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface SkillRepository : JpaRepository<Skill, Long> {
    fun findByNameContainingIgnoreCase(name: String): List<Skill>
    
    fun findByCategory(category: String): List<Skill>
    
}