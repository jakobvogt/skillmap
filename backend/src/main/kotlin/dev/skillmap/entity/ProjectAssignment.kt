package dev.skillmap.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "project_assignments",
       uniqueConstraints = [UniqueConstraint(columnNames = ["project_id", "employee_id"])])
class ProjectAssignment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    val project: Project,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    val employee: Employee,
    
    @Column
    var role: String? = null, // e.g. "Developer", "Team Lead", "Architect"
    
    @Column
    var allocationPercentage: Int = 100, // 0-100, representing time allocation percentage
    
    @Column
    var startDate: LocalDate? = null,
    
    @Column
    var endDate: LocalDate? = null,
    
    @Column
    var isAutomaticallyAssigned: Boolean = false, // Indicates if assigned by algorithm or manually
    
    @Column(columnDefinition = "TEXT")
    var notes: String? = null,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)