package dev.skillmap.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "projects")
class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    var name: String,
    
    @Column(columnDefinition = "TEXT")
    var description: String? = null,
    
    var startDate: LocalDate? = null,
    
    var endDate: LocalDate? = null,
    
    var budget: BigDecimal? = null,
    
    var status: String = "PLANNED", // PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
    
    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    val requiredSkills: MutableSet<ProjectSkill> = mutableSetOf(),
    
    @OneToMany(mappedBy = "project", cascade = [CascadeType.ALL], orphanRemoval = true)
    val assignments: MutableSet<ProjectAssignment> = mutableSetOf(),
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)