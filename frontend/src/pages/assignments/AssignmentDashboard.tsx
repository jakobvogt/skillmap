import { useState, useEffect } from "react";
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
  EmployeeSkillApi
} from "@/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "@/components/ui/useToast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Plus, Trash, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { Tooltip } from "@/components/ui/Tooltip";
import { ProjectSkillTooltip } from "@/components/ProjectSkillTooltip";
import { EmployeeSkillTooltip } from "@/components/EmployeeSkillTooltip";

export function AssignmentDashboard() {
  // State for data
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for skills
  const [projectSkillsMap, setProjectSkillsMap] = useState<Record<number, ProjectSkill[]>>({});
  const [employeeSkillsMap, setEmployeeSkillsMap] = useState<Record<number, EmployeeSkill[]>>({});
  
  // State for filtering
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchProject, setSearchProject] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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
    // Fetch project skills when projects are loaded
    if (projects.length > 0) {
      fetchAllProjectSkills();
    }
  }, [projects]);

  useEffect(() => {
    // Fetch employee skills when employees are loaded
    if (employees.length > 0) {
      fetchAllEmployeeSkills();
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
      // For simplicity, we'll fetch assignments for all projects
      const data: ProjectAssignment[] = [];
      const projects = await ProjectApi.getAll();
      
      for (const project of projects) {
        if (project.id) {
          const projectAssignments = await ProjectAssignmentApi.getByProjectId(project.id);
          data.push(...projectAssignments);
        }
      }
      
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
      await ProjectAssignmentApi.delete(id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
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
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="mt-6">
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
                        {filteredEmployees.map((employee) => (
                          <th 
                            key={employee.id} 
                            className="py-2 px-4 border bg-muted font-medium text-muted-foreground"
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
                              </div>
                            </Tooltip>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeProjects.map((project) => (
                        <tr key={project.id}>
                          <td 
                            className={`py-2 px-4 border font-medium ${
                              project.status === "IN_PROGRESS" 
                                ? "bg-blue-50" 
                                : project.status === "COMPLETED" 
                                  ? "bg-green-50" 
                                  : project.status === "ON_HOLD" 
                                    ? "bg-amber-50" 
                                    : project.status === "CANCELLED" 
                                      ? "bg-red-50" 
                                      : "bg-slate-50"
                            }`}
                            draggable
                            onDragStart={() => handleProjectDragStart(project)}
                            onDragEnd={handleDragEnd}
                          >
                            <Tooltip
                              content={
                                <ProjectSkillTooltip 
                                  skills={projectSkillsMap[project.id!] || []} 
                                />
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
                                        ? "success" 
                                        : project.status === "ON_HOLD" 
                                          ? "warning" 
                                          : project.status === "CANCELLED" 
                                            ? "destructive" 
                                            : "outline"
                                  }
                                  className="mt-1 self-start"
                                >
                                  {project.status}
                                </Badge>
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
                            
                            return (
                              <td 
                                key={`${project.id}-${employee.id}`} 
                                className={`py-2 px-4 border text-center ${
                                  isHovered ? 'bg-blue-100' : assignment ? 'bg-green-50' : 'bg-white'
                                }`}
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
                                      className="flex flex-col items-center justify-center p-2 bg-white rounded border shadow-sm cursor-pointer"
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
                      ))}
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
      </div>
    </TooltipProvider>
  );
}