export interface Employee {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    position?: string;
    department?: string;
    workingHoursPerWeek: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeCreateDto {
    firstName: string;
    lastName: string;
    email: string;
    position?: string;
    department?: string;
    workingHoursPerWeek?: number;
}

export interface EmployeeUpdateDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    position?: string;
    department?: string;
    workingHoursPerWeek?: number;
}

export interface Skill {
    id?: number;
    name: string;
    category?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SkillCreateDto {
    name: string;
    category?: string;
    description?: string;
}

export interface SkillUpdateDto {
    name?: string;
    category?: string;
    description?: string;
}

export interface EmployeeSkill {
    id?: number;
    employeeId: number;
    skillId: number;
    proficiencyLevel: number;
    notes?: string;
    skillName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeSkillCreateDto {
    employeeId: number;
    skillId: number;
    proficiencyLevel: number;
    notes?: string;
}

export interface EmployeeSkillUpdateDto {
    proficiencyLevel?: number;
    notes?: string;
}

export interface Project {
    id?: number;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProjectCreateDto {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    status: string;
}

export interface ProjectUpdateDto {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    status?: string;
}

export interface ProjectSkill {
    id?: number;
    projectId: number;
    skillId: number;
    importance: number;
    minimumProficiencyRequired?: number;
    minimumFTE: number;
    fteThreshold: number;
    notes?: string;
    skillName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProjectSkillCreateDto {
    projectId: number;
    skillId: number;
    importance: number;
    minimumProficiencyRequired?: number;
    minimumFTE: number;
    fteThreshold: number;
    notes?: string;
}

export interface ProjectSkillUpdateDto {
    importance?: number;
    minimumProficiencyRequired?: number;
    minimumFTE?: number;
    fteThreshold?: number;
    notes?: string;
}

export interface ProjectAssignment {
    id?: number;
    projectId: number;
    employeeId: number;
    role?: string;
    allocationPercentage: number;
    startDate?: string;
    endDate?: string;
    isAutomaticallyAssigned: boolean;
    notes?: string;
    employeeName?: string;
    projectName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProjectAssignmentCreateDto {
    projectId: number;
    employeeId: number;
    role?: string;
    allocationPercentage: number;
    startDate?: string;
    endDate?: string;
    isAutomaticallyAssigned: boolean;
    notes?: string;
}

export interface ProjectAssignmentUpdateDto {
    role?: string;
    allocationPercentage?: number;
    startDate?: string;
    endDate?: string;
    isAutomaticallyAssigned?: boolean;
    notes?: string;
}

export interface ProjectHealthDto {
    projectId: number;
    fteCoveragePercentage: number;
    proficiencyMatchPercentage: number;
    overallHealthScore: number;
    skillCoverages: SkillCoverageDto[];
}

export interface SkillCoverageDto {
    skillId: number;
    skillName: string;
    fteCoveragePercentage: number;
    proficiencyMatchPercentage: number;
    combinedScore: number;
    requiredFTE: number;
    actualFTE: number;
    fteThreshold: number;
    requiredProficiency?: number;
    bestTeamProficiency?: number;
    effectiveAssignments: number;
    totalAssignments: number;
}