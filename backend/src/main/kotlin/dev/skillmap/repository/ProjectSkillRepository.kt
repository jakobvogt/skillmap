package dev.skillmap.repository

import dev.skillmap.entity.ProjectSkill
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ProjectSkillRepository : JpaRepository<ProjectSkill, Long> {
    fun findByProjectId(projectId: Long): List<ProjectSkill>
    
    fun findBySkillId(skillId: Long): List<ProjectSkill>
    
    fun findByProjectIdAndSkillId(projectId: Long, skillId: Long): ProjectSkill?
    
}