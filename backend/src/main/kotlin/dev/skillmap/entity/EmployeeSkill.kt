package dev.skillmap.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "employee_skills", 
       uniqueConstraints = [UniqueConstraint(columnNames = ["employee_id", "skill_id"])])
class EmployeeSkill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    val employee: Employee,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    val skill: Skill,
    
    @Column(nullable = false)
    var proficiencyLevel: Int, // 1-5 scale where 5 is expert
    
    @Column(columnDefinition = "TEXT")
    var notes: String? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)