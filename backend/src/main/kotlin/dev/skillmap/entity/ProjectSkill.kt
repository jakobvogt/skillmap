package dev.skillmap.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "project_skills",
       uniqueConstraints = [UniqueConstraint(columnNames = ["project_id", "skill_id"])])
class ProjectSkill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    val project: Project,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    val skill: Skill,
    
    @Column(nullable = false)
    var importance: Int, // 1-5 scale where 5 is critical
    
    @Column
    var minimumProficiencyRequired: Int? = null, // Minimum level required for this skill
    
    @Column
    var numberOfPeopleRequired: Int = 1, // Number of people with this skill needed
    
    @Column(columnDefinition = "TEXT")
    var notes: String? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)