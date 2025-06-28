import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ProjectAssignment, 
  ProjectAssignmentApi, 
  Project,
  ProjectApi, 
  Employee,
  EmployeeApi,
  ProjectAssignmentCreateDto,
  ProjectSkill,
  ProjectSkillApi,
  EmployeeSkill,
  EmployeeSkillApi,
  ProjectHealthDto
} from "@/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "@/components/ui/useToast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Plus, Trash, Table2, Zap, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Tooltip } from "@/components/ui/Tooltip";
import { ProjectSkillTooltip } from "@/components/ProjectSkillTooltip";
import { EmployeeSkillTooltip } from "@/components/EmployeeSkillTooltip";
import { ProjectHealthIndicator, getHealthBackgroundColor, getHealthBorderColor } from "@/components/ProjectHealthIndicator";
import { ProjectHealthTooltip } from "@/components/ProjectHealthTooltip";
import { AssignmentMetrics, AssignmentMetricsRef } from "@/components/AssignmentMetrics";
import { cn } from "@/lib/utils";

export function AssignmentDashboard() {
  // Ref for assignment metrics component
  const assignmentMetricsRef = useRef<AssignmentMetricsRef>(null);
  
  // State for data
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for skills
  const [projectSkillsMap, setProjectSkillsMap] = useState<Record<number, ProjectSkill[]>>({});
  const [employeeSkillsMap, setEmployeeSkillsMap] = useState<Record<number, EmployeeSkill[]>>({});
  
  // State for employee allocations
  const [employeeAllocations, setEmployeeAllocations] = useState<Record<number, number>>({});
  
  // State for project health
  const [projectHealthMap, setProjectHealthMap] = useState<Record<number, ProjectHealthDto>>({});
  
  // State for filtering
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchProject, setSearchProject] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State for assignment dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [allocationPercentage, setAllocationPercentage] = useState<string>("100");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);

  // State for cell operations
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{projectId: number, employeeId: number} | null>(null);

  // State for auto-assignment
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [globalAutoAssignDialogOpen, setGlobalAutoAssignDialogOpen] = useState(false);
  const [selectedAutoAssignProjectId, setSelectedAutoAssignProjectId] = useState<string>("");
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [globalAutoAssigning, setGlobalAutoAssigning] = useState(false);

  useEffect(() => {
    // Fetch all data on component mount
    Promise.all([
      fetchProjects(),
      fetchEmployees(),
      fetchAllAssignments()
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Fetch project skills and health when projects are loaded
    if (projects.length > 0) {
      fetchAllProjectSkills();
      fetchAllProjectHealth();
    }
  }, [projects]);

  useEffect(() => {
    // Fetch employee skills when employees are loaded
    if (employees.length > 0) {
      fetchAllEmployeeSkills();
      fetchAllEmployeeAllocations();
    }
  }, [employees]);

  useEffect(() => {
    // Filter projects based on search and status
    if (projects.length > 0) {
      let filtered = [...projects];
      
      if (searchProject) {
        filtered = filtered.filter(project => 
          project.name.toLowerCase().includes(searchProject.toLowerCase())
        );
      }
      
      if (filterStatus !== "all") {
        filtered = filtered.filter(project => project.status === filterStatus);
      }
      
      setActiveProjects(filtered);
    }
  }, [projects, searchProject, filterStatus]);

  useEffect(() => {
    // Filter employees based on search
    if (employees.length > 0) {
      let filtered = [...employees];
      
      if (searchEmployee) {
        filtered = filtered.filter(employee => 
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchEmployee.toLowerCase()) ||
          employee.position?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
          employee.department?.toLowerCase().includes(searchEmployee.toLowerCase())
        );
      }
      
      setFilteredEmployees(filtered);
    }
  }, [employees, searchEmployee]);

  useEffect(() => {
    // Refetch assignments, allocations, and project health when date changes
    if (employees.length > 0) {
      fetchAllAssignments();
      fetchAllEmployeeAllocations();
    }
    if (projects.length > 0) {
      fetchAllProjectHealth();
    }
  }, [selectedDate, employees, projects]);

  const fetchProjects = async () => {
    try {
      const data = await ProjectApi.getAll();
      setProjects(data);
      setActiveProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await EmployeeApi.getAll();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    }
  };

  const fetchAllAssignments = async () => {
    try {
      // Use the new endpoint to get active assignments for the selected date
      const data = await ProjectAssignmentApi.getActive(selectedDate);
      setAssignments(data);
      return data;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchAllProjectSkills = async () => {
    try {
      const skillsMap: Record<number, ProjectSkill[]> = {};
      
      for (const project of projects) {
        if (project.id) {
          const skills = await ProjectSkillApi.getByProjectId(project.id);
          skillsMap[project.id] = skills;
        }
      }
      
      setProjectSkillsMap(skillsMap);
    } catch (error) {
      console.error("Error fetching project skills:", error);
      toast({
        title: "Error",
        description: "Failed to load project skills",
        variant: "destructive",
      });
    }
  };

  const fetchAllEmployeeSkills = async () => {
    try {
      const skillsMap: Record<number, EmployeeSkill[]> = {};
      
      for (const employee of employees) {
        if (employee.id) {
          const skills = await EmployeeSkillApi.getByEmployeeId(employee.id);
          skillsMap[employee.id] = skills;
        }
      }
      
      setEmployeeSkillsMap(skillsMap);
    } catch (error) {
      console.error("Error fetching employee skills:", error);
      toast({
        title: "Error",
        description: "Failed to load employee skills",
        variant: "destructive",
      });
    }
  };

  const fetchAllEmployeeAllocations = async () => {
    try {
      const allocationsMap: Record<number, number> = {};
      
      for (const employee of employees) {
        if (employee.id) {
          const allocation = await ProjectAssignmentApi.getAllocationForEmployee(employee.id, selectedDate);
          allocationsMap[employee.id] = allocation;
        }
      }
      
      setEmployeeAllocations(allocationsMap);
    } catch (error) {
      console.error("Error fetching employee allocations:", error);
      toast({
        title: "Error",
        description: "Failed to load employee allocations",
        variant: "destructive",
      });
    }
  };

  const fetchAllProjectHealth = async () => {
    try {
      const healthMap: Record<number, ProjectHealthDto> = {};
      
      for (const project of projects) {
        if (project.id) {
          const health = await ProjectApi.getHealth(project.id, selectedDate);
          healthMap[project.id] = health;
        }
      }
      
      setProjectHealthMap(healthMap);
    } catch (error) {
      console.error("Error fetching project health:", error);
      toast({
        title: "Error",
        description: "Failed to load project health data",
        variant: "destructive",
      });
    }
  };

  const handleCreateAssignment = async (projectId: number, employeeId: number) => {
    // Check if assignment already exists
    const existingAssignment = getAssignment(projectId, employeeId);
    
    if (existingAssignment) {
      // If assignment exists, open in edit mode
      setIsEditing(true);
      setCurrentAssignmentId(existingAssignment.id!);
      setSelectedProjectId(projectId.toString());
      setSelectedEmployeeId(employeeId.toString());
      setRole(existingAssignment.role || "");
      setAllocationPercentage(existingAssignment.allocationPercentage.toString());
      setStartDate(existingAssignment.startDate || "");
      setEndDate(existingAssignment.endDate || "");
      setNotes(existingAssignment.notes || "");
    } else {
      // Otherwise, open in create mode
      setIsEditing(false);
      setCurrentAssignmentId(null);
      setSelectedProjectId(projectId.toString());
      setSelectedEmployeeId(employeeId.toString());
      setRole("");
      setAllocationPercentage("100");
      setStartDate("");
      setEndDate("");
      setNotes("");
    }
    
    setDialogOpen(true);
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      // Find the assignment to get the employee ID
      const assignment = assignments.find(a => a.id === id);
      const employeeId = assignment?.employeeId;
      
      await ProjectAssignmentApi.delete(id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
      
      // Update the employee's total allocation if we have the employee ID
      if (employeeId) {
        const newAllocation = await ProjectAssignmentApi.getAllocationForEmployee(employeeId, selectedDate);
        setEmployeeAllocations(prev => ({
          ...prev,
          [employeeId]: newAllocation
        }));
      }
      
      // Refresh assignment metrics
      assignmentMetricsRef.current?.refresh();
      
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedProjectId("");
    setSelectedEmployeeId("");
    setRole("");
    setAllocationPercentage("100");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setIsEditing(false);
    setCurrentAssignmentId(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleSubmitAssignment = async () => {
    try {
      // Validate form
      if (!selectedProjectId || !selectedEmployeeId) {
        toast({
          title: "Validation Error",
          description: "Project and employee are required",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentAssignmentId) {
        // Update existing assignment
        const assignmentUpdateData = {
          role: role || undefined,
          allocationPercentage: parseInt(allocationPercentage) || 100,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          isAutomaticallyAssigned: false,
          notes: notes || undefined,
        };

        const updatedAssignment = await ProjectAssignmentApi.update(
          currentAssignmentId, 
          assignmentUpdateData
        );
        
        // Update assignments array
        setAssignments(
          assignments.map(assignment => 
            assignment.id === currentAssignmentId ? updatedAssignment : assignment
          )
        );
        
        // Update the employee's total allocation
        const newAllocation = await ProjectAssignmentApi.getAllocationForEmployee(parseInt(selectedEmployeeId), selectedDate);
        setEmployeeAllocations(prev => ({
          ...prev,
          [parseInt(selectedEmployeeId)]: newAllocation
        }));
        
        // Refresh assignment metrics
        assignmentMetricsRef.current?.refresh();
        
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Check if employee is already assigned to this project
        const existingAssignment = assignments.find(
          (a) => a.projectId === parseInt(selectedProjectId) && a.employeeId === parseInt(selectedEmployeeId)
        );

        if (existingAssignment) {
          toast({
            title: "Validation Error",
            description: "This employee is already assigned to this project",
            variant: "destructive",
          });
          return;
        }

        // Create new assignment
        const assignmentData: ProjectAssignmentCreateDto = {
          projectId: parseInt(selectedProjectId),
          employeeId: parseInt(selectedEmployeeId),
          role: role || undefined,
          allocationPercentage: parseInt(allocationPercentage) || 100,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          isAutomaticallyAssigned: false,
          notes: notes || undefined,
        };

        const newAssignment = await ProjectAssignmentApi.create(assignmentData);
        
        // Update assignments
        setAssignments([...assignments, newAssignment]);
        
        // Update the employee's total allocation
        const newAllocation = await ProjectAssignmentApi.getAllocationForEmployee(parseInt(selectedEmployeeId), selectedDate);
        setEmployeeAllocations(prev => ({
          ...prev,
          [parseInt(selectedEmployeeId)]: newAllocation
        }));
        
        // Refresh assignment metrics
        assignmentMetricsRef.current?.refresh();
        
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error with assignment:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} assignment`,
        variant: "destructive",
      });
    }
  };

  // Function to get assignment between employee and project, if it exists
  const getAssignment = (projectId: number, employeeId: number) => {
    return assignments.find(
      (assignment) => assignment.projectId === projectId && assignment.employeeId === employeeId
    );
  };

  // Handle drag start for employee
  const handleEmployeeDragStart = (employee: Employee) => {
    setDraggedEmployee(employee);
  };

  // Handle drag start for project
  const handleProjectDragStart = (project: Project) => {
    setDraggedProject(project);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedEmployee(null);
    setDraggedProject(null);
    setHoveredCell(null);
  };

  // Handle drag over
  const handleCellDragOver = (project: Project, employee: Employee, e: React.DragEvent) => {
    e.preventDefault();
    setHoveredCell({ projectId: project.id!, employeeId: employee.id! });
  };

  // Handle drop to create assignment
  const handleCellDrop = (project: Project, employee: Employee) => {
    if ((draggedEmployee && draggedEmployee.id === employee.id) || 
        (draggedProject && draggedProject.id === project.id)) {
      // Open dialog to configure the assignment
      handleCreateAssignment(project.id!, employee.id!);
    }
    setDraggedEmployee(null);
    setDraggedProject(null);
    setHoveredCell(null);
  };
  
  // Also refresh allocations and project health when assignments change
  useEffect(() => {
    if (assignments.length > 0 && employees.length > 0) {
      fetchAllEmployeeAllocations();
    }
    if (assignments.length > 0 && projects.length > 0) {
      fetchAllProjectHealth();
    }
  }, [assignments, employees, projects]);

  // Helper function to get allocation background color
  const getAllocationBackgroundColor = (allocation: number) => {
    if (allocation > 100) return "bg-red-50"; // Over-allocated (bad)
    if (allocation >= 80) return "bg-green-50"; // Well allocated (good)
    if (allocation >= 40) return "bg-yellow-50"; // Partially allocated (warning)
    return "bg-red-50"; // Under-allocated (bad)
  };

  const getAllocationBorderColor = (allocation: number) => {
    if (allocation > 100) return "border-red-200"; // Over-allocated (bad)
    if (allocation >= 80) return "border-green-200"; // Well allocated (good)
    if (allocation >= 40) return "border-yellow-200"; // Partially allocated (warning)
    return "border-red-200"; // Under-allocated (bad)
  };

  // Helper function to check if employee has any matching skills for a project
  const hasMatchingSkills = (employeeId: number, projectId: number): boolean => {
    const employeeSkills = employeeSkillsMap[employeeId] || [];
    const projectSkills = projectSkillsMap[projectId] || [];
    
    if (employeeSkills.length === 0 || projectSkills.length === 0) {
      return false;
    }
    
    const employeeSkillIds = new Set(employeeSkills.map(skill => skill.skillId));
    return projectSkills.some(projectSkill => 
      projectSkill.skillId && employeeSkillIds.has(projectSkill.skillId)
    );
  };

  // Helper function to check if assignment is truly effective (meets both skill match AND FTE threshold)
  const isEffectiveAssignment = (employeeId: number, projectId: number, assignment: ProjectAssignment): boolean => {
    // First check if there's any skill match
    if (!hasMatchingSkills(employeeId, projectId)) {
      return false;
    }
    
    const employeeSkills = employeeSkillsMap[employeeId] || [];
    const projectSkills = projectSkillsMap[projectId] || [];
    const employeeFTE = assignment.allocationPercentage / 100.0;
    
    // Check if employee meets FTE threshold AND proficiency requirements for any skill
    const employeeSkillMap = new Map(employeeSkills.map(skill => [skill.skillId, skill]));
    
    return projectSkills.some(projectSkill => {
      if (!projectSkill.skillId) return false;
      
      const employeeSkill = employeeSkillMap.get(projectSkill.skillId);
      if (!employeeSkill) return false;
      
      // Check FTE threshold
      if (employeeFTE < projectSkill.fteThreshold) return false;
      
      // Check proficiency requirement (if any)
      if (projectSkill.minimumProficiencyRequired && 
          employeeSkill.proficiencyLevel < projectSkill.minimumProficiencyRequired) {
        return false;
      }
      
      return true;
    });
  };

  // Refresh all data after auto-assignment
  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchAllAssignments(),
        fetchAllEmployeeAllocations(),
        fetchAllProjectHealth()
      ]);
      // Refresh assignment metrics
      assignmentMetricsRef.current?.refresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedAutoAssignProjectId) {
      toast({
        title: "Validation Error",
        description: "Please select a project for auto-assignment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setAutoAssigning(true);
      const assignments = await ProjectAssignmentApi.autoAssign(parseInt(selectedAutoAssignProjectId));
      
      if (assignments.length === 0) {
        toast({
          title: "No Assignments",
          description: "No eligible employees found for auto-assignment to this project",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully created ${assignments.length} automatic assignment${assignments.length > 1 ? 's' : ''}`,
        });
        
        // Refresh all data
        await refreshAllData();
      }
      
      setAutoAssignDialogOpen(false);
      setSelectedAutoAssignProjectId("");
    } catch (error) {
      console.error("Error in auto-assignment:", error);
      toast({
        title: "Error",
        description: "Failed to run auto-assignment. Please ensure the project has skill requirements defined.",
        variant: "destructive",
      });
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleGlobalAutoAssign = async () => {
    try {
      setGlobalAutoAssigning(true);
      const assignments = await ProjectAssignmentApi.globalAutoAssign();
      
      if (assignments.length === 0) {
        toast({
          title: "No Assignments",
          description: "No optimal employee-project matches found for global auto-assignment",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully created ${assignments.length} optimal assignment${assignments.length > 1 ? 's' : ''} across all projects`,
        });
        
        // Refresh all data
        await refreshAllData();
      }
      
      setGlobalAutoAssignDialogOpen(false);
    } catch (error) {
      console.error("Error in global auto-assignment:", error);
      toast({
        title: "Error",
        description: "Failed to run global auto-assignment. Please ensure projects have skill requirements defined.",
        variant: "destructive",
      });
    } finally {
      setGlobalAutoAssigning(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto">
        <PageHeader
          title="Assignment Dashboard"
          description="View and manage assignments between employees and projects"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/assignments">
                  <Table2 className="mr-2 h-4 w-4" />
                  List View
                </Link>
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
              <Button 
                onClick={() => setGlobalAutoAssignDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Globe className="mr-2 h-4 w-4" />
                Auto Assign All
              </Button>
              <Button 
                onClick={() => setAutoAssignDialogOpen(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto Assign Project
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="mt-6">
            {/* Assignment Metrics */}
            <AssignmentMetrics ref={assignmentMetricsRef} date={selectedDate} className="mb-6" />

            {/* Date Filter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Date Filter</CardTitle>
                <CardDescription>
                  Select a date to view assignments and allocations for that specific date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-sm">
                  <Label htmlFor="selectedDate">View Date</Label>
                  <Input
                    id="selectedDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Project filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectSearch">Search Projects</Label>
                      <Input
                        id="projectSearch"
                        placeholder="Search by name..."
                        value={searchProject}
                        onChange={(e) => setSearchProject(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="statusFilter">Filter by Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="employeeSearch">Search Employees</Label>
                    <Input
                      id="employeeSearch"
                      placeholder="Search by name, position, or department..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignment Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Matrix</CardTitle>
                <CardDescription>
                  Drag employees to projects or projects to employees to create assignments.
                  Click on an assignment cell to view details.
                  Hover over a project or employee to see skill details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border bg-muted font-medium text-muted-foreground">
                          Projects / Employees
                        </th>
                        {filteredEmployees.map((employee) => {
                          const allocation = employeeAllocations[employee.id!] || 0;
                          return (
                            <th 
                              key={employee.id} 
                              className={cn(
                                "py-2 px-4 border font-medium",
                                getAllocationBackgroundColor(allocation),
                                getAllocationBorderColor(allocation)
                              )}
                              draggable
                              onDragStart={() => handleEmployeeDragStart(employee)}
                              onDragEnd={handleDragEnd}
                            >
                            <Tooltip
                              content={
                                <EmployeeSkillTooltip 
                                  skills={employeeSkillsMap[employee.id!] || []} 
                                />
                              }
                              side="top"
                              delayDuration={300}
                            >
                              <div className="flex flex-col items-center">
                                <Link 
                                  to={`/employees/${employee.id}`}
                                  className="hover:underline hover:text-blue-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {employee.firstName} {employee.lastName}
                                </Link>
                                <span className="text-xs text-muted-foreground">{employee.position}</span>
                                <Badge 
                                  variant={allocation > 100 ? "destructive" : 
                                          allocation >= 80 ? "outline" : 
                                          "secondary"}
                                  className="mt-1 text-xs"
                                >
                                  {allocation}% allocated
                                </Badge>
                              </div>
                            </Tooltip>
                          </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {activeProjects.map((project) => {
                        const health = projectHealthMap[project.id!];
                        const healthScore = health?.overallHealthScore ?? 0;
                        
                        return (
                          <tr key={project.id}>
                            <td 
                              className={cn(
                                "py-2 px-4 border font-medium",
                                health ? getHealthBackgroundColor(healthScore) : "bg-slate-50",
                                health ? getHealthBorderColor(healthScore) : "border-gray-200"
                              )}
                              draggable
                              onDragStart={() => handleProjectDragStart(project)}
                              onDragEnd={handleDragEnd}
                            >
                            <Tooltip
                              content={
                                health ? (
                                  <ProjectHealthTooltip health={health} />
                                ) : (
                                  <ProjectSkillTooltip 
                                    skills={projectSkillsMap[project.id!] || []} 
                                  />
                                )
                              }
                              side="left"
                              delayDuration={300}
                            >
                              <div className="flex flex-col">
                                <Link 
                                  to={`/projects/${project.id}`}
                                  className="hover:underline hover:text-blue-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.name}
                                </Link>
                                <Badge 
                                  variant={
                                    project.status === "IN_PROGRESS" 
                                      ? "default" 
                                      : project.status === "COMPLETED" 
                                        ? "secondary" 
                                        : project.status === "ON_HOLD" 
                                          ? "outline" 
                                          : project.status === "CANCELLED" 
                                            ? "destructive" 
                                            : "outline"
                                  }
                                  className="mt-1 self-start"
                                >
                                  {project.status}
                                </Badge>
                                {health && (
                                  <div className="mt-2">
                                    <ProjectHealthIndicator 
                                      health={health} 
                                      variant="bar"
                                    />
                                  </div>
                                )}
                              </div>
                            </Tooltip>
                          </td>
                          {filteredEmployees.map((employee) => {
                            const assignment = getAssignment(project.id!, employee.id!);
                            const isHovered = hoveredCell && 
                                             hoveredCell.projectId === project.id &&
                                             hoveredCell.employeeId === employee.id;
                            
                            // Get the project skills and employee skills for the tooltip
                            const projectSkills = projectSkillsMap[project.id!] || [];
                            const employeeSkills = employeeSkillsMap[employee.id!] || [];
                            const hasSkillMatch = hasMatchingSkills(employee.id!, project.id!);
                            const isEffective = assignment ? isEffectiveAssignment(employee.id!, project.id!, assignment) : false;
                            
                            // Determine cell background color
                            let cellBgColor = 'bg-white';
                            if (isHovered) {
                              cellBgColor = 'bg-blue-100';
                            } else if (assignment) {
                              // Assignment exists - check if it's truly effective
                              cellBgColor = isEffective ? 'bg-green-50' : 'bg-red-50';
                            }
                            
                            return (
                              <td 
                                key={`${project.id}-${employee.id}`} 
                                className={`py-2 px-4 border text-center ${cellBgColor}`}
                                onDragOver={(e) => handleCellDragOver(project, employee, e)}
                                onDrop={() => handleCellDrop(project, employee)}
                              >
                                {assignment ? (
                                  <Tooltip
                                    content={
                                      <EmployeeSkillTooltip 
                                        skills={employeeSkills} 
                                        projectSkills={projectSkills}
                                      />
                                    }
                                    side="right"
                                    delayDuration={300}
                                  >
                                    <div 
                                      className={cn(
                                        "flex flex-col items-center justify-center p-2 bg-white rounded border shadow-sm cursor-pointer",
                                        !isEffective && "border-red-300"
                                      )}
                                      onClick={() => {
                                        setSelectedProjectId(project.id!.toString());
                                        setSelectedEmployeeId(employee.id!.toString());
                                        setRole(assignment.role || "");
                                        setAllocationPercentage(assignment.allocationPercentage.toString());
                                        setStartDate(assignment.startDate || "");
                                        setEndDate(assignment.endDate || "");
                                        setNotes(assignment.notes || "");
                                        // Explicitly call with editing mode
                                        setIsEditing(true);
                                        setCurrentAssignmentId(assignment.id!);
                                        setDialogOpen(true);
                                      }}
                                    >
                                      <div className="font-medium">{assignment.role || "No role"}</div>
                                      <Badge className="mt-1">{assignment.allocationPercentage}%</Badge>
                                      {!isEffective && (
                                        <div className="text-xs text-red-600 mt-1 font-medium">
                                          {!hasSkillMatch ? "No skill match" : "Below threshold"}
                                        </div>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-1 p-0 h-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteAssignment(assignment.id!);
                                        }}
                                      >
                                        <Trash className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </Tooltip>
                                ) : (
                                  <div 
                                    className="w-full h-full min-h-[80px] flex items-center justify-center text-muted-foreground"
                                    onClick={() => handleCreateAssignment(project.id!, employee.id!)}
                                  >
                                    <Plus className="h-5 w-5 opacity-30" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assignment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit" : "Create"} Assignment</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the assignment details for this employee and project." 
                  : "Configure the assignment details for this employee and project."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id!.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id!.toString()}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="E.g., Developer, Team Lead, Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allocation">Allocation (%)</Label>
                  <Input
                    id="allocation"
                    type="number"
                    min="1"
                    max="100"
                    value={allocationPercentage}
                    onChange={(e) => setAllocationPercentage(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes about this assignment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAssignment}>
                {isEditing ? "Update" : "Create"} Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Single Project Auto Assignment Dialog */}
        <Dialog open={autoAssignDialogOpen} onOpenChange={setAutoAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto-Assign to Project</DialogTitle>
              <DialogDescription>
                Select a project to automatically assign employees based on skill requirements and availability.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="autoAssignProject">Select Project</Label>
                  <Select value={selectedAutoAssignProjectId} onValueChange={setSelectedAutoAssignProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project to auto-assign..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects
                        .filter(p => p.status === "PLANNED" || p.status === "IN_PROGRESS")
                        .map((project) => (
                          <SelectItem key={project.id} value={project.id!.toString()}>
                            {project.name} ({project.status})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>The algorithm will:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Analyze project skill requirements</li>
                    <li>Match employees based on proficiency levels</li>
                    <li>Consider employee availability and capacity</li>
                    <li>Create optimal assignments automatically</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAutoAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAutoAssign} 
                disabled={autoAssigning || !selectedAutoAssignProjectId}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                {autoAssigning ? "Auto Assigning..." : "Run Auto-Assignment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Auto Assignment Dialog */}
        <Dialog open={globalAutoAssignDialogOpen} onOpenChange={setGlobalAutoAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Global Auto-Assignment</DialogTitle>
              <DialogDescription>
                Optimize employee assignments across ALL active projects simultaneously using advanced compatibility scoring.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Enhanced Algorithm Features:</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span><strong>Skill Coverage:</strong> How many required skills the employee has</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span><strong>Skill Quality:</strong> Employee proficiency vs. requirements</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span><strong>Skill Utilization:</strong> How many of their skills are used</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span><strong>Global Optimization:</strong> Best overall project-employee matches</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Note:</strong> This will only assign employees to projects where they are not already assigned and will respect capacity limits.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGlobalAutoAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGlobalAutoAssign} 
                disabled={globalAutoAssigning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Globe className="mr-2 h-4 w-4" />
                {globalAutoAssigning ? "Optimizing..." : "Run Global Auto-Assignment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}