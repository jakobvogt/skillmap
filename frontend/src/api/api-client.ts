import {
    Employee,
    EmployeeCreateDto,
    EmployeeUpdateDto,
    Skill,
    SkillCreateDto,
    SkillUpdateDto,
    EmployeeSkill,
    EmployeeSkillCreateDto,
    EmployeeSkillUpdateDto,
    Project,
    ProjectCreateDto,
    ProjectUpdateDto,
    ProjectSkill,
    ProjectSkillCreateDto,
    ProjectSkillUpdateDto,
    ProjectAssignment,
    ProjectAssignmentCreateDto,
    ProjectAssignmentUpdateDto,
    ProjectHealthDto,
  } from './types';
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  async function fetchApi<T, B = unknown>(
    endpoint: string,
    method: string = 'GET',
    body?: B
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
  
    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
  
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API error: ${response.status} ${response.statusText}`
      );
    }
  
    if (response.status === 204) {
      return {} as T;
    }
  
    return response.json();
  }
  
  // Employee API
  export const EmployeeApi = {
    getAll: (): Promise<Employee[]> => fetchApi('/employees'),
    getById: (id: number): Promise<Employee> => fetchApi(`/employees/${id}`),
    create: (employee: EmployeeCreateDto): Promise<Employee> =>
      fetchApi('/employees', 'POST', employee),
    update: (id: number, employee: EmployeeUpdateDto): Promise<Employee> =>
      fetchApi(`/employees/${id}`, 'PUT', employee),
    delete: (id: number): Promise<void> => fetchApi(`/employees/${id}`, 'DELETE'),
    search: (query: string): Promise<Employee[]> =>
      fetchApi(`/employees/search?query=${encodeURIComponent(query)}`),
  };
  
  // Skill API
  export const SkillApi = {
    getAll: (): Promise<Skill[]> => fetchApi('/skills'),
    getById: (id: number): Promise<Skill> => fetchApi(`/skills/${id}`),
    create: (skill: SkillCreateDto): Promise<Skill> =>
      fetchApi('/skills', 'POST', skill),
    update: (id: number, skill: SkillUpdateDto): Promise<Skill> =>
      fetchApi(`/skills/${id}`, 'PUT', skill),
    delete: (id: number): Promise<void> => fetchApi(`/skills/${id}`, 'DELETE'),
    getByCategory: (category: string): Promise<Skill[]> =>
      fetchApi(`/skills/category/${encodeURIComponent(category)}`),
    search: (query: string): Promise<Skill[]> =>
      fetchApi(`/skills/search?query=${encodeURIComponent(query)}`),
  };
  
  // Employee Skill API
  export const EmployeeSkillApi = {
    getByEmployeeId: (employeeId: number): Promise<EmployeeSkill[]> =>
      fetchApi(`/employee-skills/employee/${employeeId}`),
    getById: (id: number): Promise<EmployeeSkill> =>
      fetchApi(`/employee-skills/${id}`),
    create: (employeeSkill: EmployeeSkillCreateDto): Promise<EmployeeSkill> =>
      fetchApi('/employee-skills', 'POST', employeeSkill),
    update: (id: number, employeeSkill: EmployeeSkillUpdateDto): Promise<EmployeeSkill> =>
      fetchApi(`/employee-skills/${id}`, 'PUT', employeeSkill),
    delete: (id: number): Promise<void> => fetchApi(`/employee-skills/${id}`, 'DELETE'),
    getTopSkills: (employeeId: number): Promise<EmployeeSkill[]> =>
      fetchApi(`/employee-skills/employee/${employeeId}/top`),
  };
  
  // Project API
  export const ProjectApi = {
    getAll: (): Promise<Project[]> => fetchApi('/projects'),
    getById: (id: number): Promise<Project> => fetchApi(`/projects/${id}`),
    create: (project: ProjectCreateDto): Promise<Project> =>
      fetchApi('/projects', 'POST', project),
    update: (id: number, project: ProjectUpdateDto): Promise<Project> =>
      fetchApi(`/projects/${id}`, 'PUT', project),
    delete: (id: number): Promise<void> => fetchApi(`/projects/${id}`, 'DELETE'),
    getByStatus: (status: string): Promise<Project[]> =>
      fetchApi(`/projects/status/${encodeURIComponent(status)}`),
    search: (query: string): Promise<Project[]> =>
      fetchApi(`/projects/search?query=${encodeURIComponent(query)}`),
    getHealth: (id: number, date?: string): Promise<ProjectHealthDto> =>
      fetchApi(`/projects/${id}/health${date ? `?date=${date}` : ''}`),
  };
  
  // Project Skill API
  export const ProjectSkillApi = {
    getByProjectId: (projectId: number): Promise<ProjectSkill[]> =>
      fetchApi(`/project-skills/project/${projectId}`),
    getById: (id: number): Promise<ProjectSkill> =>
      fetchApi(`/project-skills/${id}`),
    create: (projectSkill: ProjectSkillCreateDto): Promise<ProjectSkill> =>
      fetchApi('/project-skills', 'POST', projectSkill),
    update: (id: number, projectSkill: ProjectSkillUpdateDto): Promise<ProjectSkill> =>
      fetchApi(`/project-skills/${id}`, 'PUT', projectSkill),
    delete: (id: number): Promise<void> => fetchApi(`/project-skills/${id}`, 'DELETE'),
  };
  
  // Project Assignment API
  export const ProjectAssignmentApi = {
    getByProjectId: (projectId: number): Promise<ProjectAssignment[]> =>
      fetchApi(`/project-assignments/project/${projectId}`),
    getByEmployeeId: (employeeId: number): Promise<ProjectAssignment[]> =>
      fetchApi(`/project-assignments/employee/${employeeId}`),
    getById: (id: number): Promise<ProjectAssignment> =>
      fetchApi(`/project-assignments/${id}`),
    create: (
      assignment: ProjectAssignmentCreateDto
    ): Promise<ProjectAssignment> =>
      fetchApi('/project-assignments', 'POST', assignment),
    update: (
      id: number,
      assignment: ProjectAssignmentUpdateDto
    ): Promise<ProjectAssignment> =>
      fetchApi(`/project-assignments/${id}`, 'PUT', assignment),
    delete: (id: number): Promise<void> =>
      fetchApi(`/project-assignments/${id}`, 'DELETE'),
    getCurrentForEmployee: (employeeId: number, date?: string): Promise<ProjectAssignment[]> =>
      fetchApi(`/project-assignments/employee/${employeeId}/current${date ? `?date=${date}` : ''}`),
    getAllocationForEmployee: (employeeId: number, date?: string): Promise<number> =>
      fetchApi(`/project-assignments/employee/${employeeId}/allocation${date ? `?date=${date}` : ''}`),
    getActive: (date?: string): Promise<ProjectAssignment[]> =>
      fetchApi(`/project-assignments/active${date ? `?date=${date}` : ''}`),
  };
