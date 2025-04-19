package dev.skillmap.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "skills")
class Skill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false, unique = true)
    var name: String,
    
    @Column
    var category: String? = null, // e.g., "Frontend", "Backend", "Database", "DevOps"
    
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    
    @OneToMany(mappedBy = "skill")
    val employeeSkills: MutableSet<EmployeeSkill> = mutableSetOf(),
    
    @OneToMany(mappedBy = "skill")
    val projectSkills: MutableSet<ProjectSkill> = mutableSetOf(),
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)