package dev.skillmap.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "employees")
class Employee(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    var firstName: String,
    
    @Column(nullable = false)
    var lastName: String,
    
    @Column(nullable = false, unique = true)
    var email: String,
    
    var position: String? = null,
    
    var department: String? = null,
    
    @OneToMany(mappedBy = "employee", cascade = [CascadeType.ALL], orphanRemoval = true)
    val skills: MutableSet<EmployeeSkill> = mutableSetOf(),
    
    @OneToMany(mappedBy = "employee")
    val projectAssignments: MutableSet<ProjectAssignment> = mutableSetOf(),
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)