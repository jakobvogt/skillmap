import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Trash, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { 
  ProjectAssignment, 
  ProjectAssignmentApi, 
  ProjectAssignmentCreateDto,
  Project,
  ProjectApi, 
  Employee,
  EmployeeApi
} from "@/api";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/useToast";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function AssignmentList() {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [allocationPercentage, setAllocationPercentage] = useState<string>("100");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Auto-matching state
  const [autoMatchDialogOpen, setAutoMatchDialogOpen] = useState(false);
  const [autoMatchProjectId, setAutoMatchProjectId] = useState<string>("");
  
  const projectId = searchParams.get("projectId") || "";

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    
    if (projectId) {
      setSelectedProjectId(projectId);
      fetchAssignmentsByProject(projectId);
    } else {
      fetchAllAssignments();
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const data = await ProjectApi.getAll();
      setProjects(data);
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
      setLoading(true);
      // For simplicity, we'll fetch assignments for all projects
      // In a real app, you might want to implement pagination
      const data: ProjectAssignment[] = [];
      const projects = await ProjectApi.getAll();
      
      for (const project of projects) {
        if (project.id) {
          const projectAssignments = await ProjectAssignmentApi.getByProjectId(project.id);
          data.push(...projectAssignments);
        }
      }
      
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsByProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await ProjectAssignmentApi.getByProjectId(parseInt(projectId));
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching project assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load project assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const handleOpenDialog = () => {
    setDialogOpen(true);
    // Pre-select project if in project-specific view
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    if (!projectId) {
      setSelectedProjectId("");
    }
    setSelectedEmployeeId("");
    setRole("");
    setAllocationPercentage("100");
    setStartDate("");
    setEndDate("");
    setNotes("");
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

      // Create assignment
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
      
      // Update the assignments list
      if (projectId) {
        // If we're viewing a specific project, just add the new assignment
        setAssignments([...assignments, newAssignment]);
      } else {
        // Otherwise, refresh all assignments
        fetchAllAssignments();
      }
      
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleAutoMatch = () => {
    setAutoMatchDialogOpen(true);
    // Pre-select project if in project-specific view
    if (projectId) {
      setAutoMatchProjectId(projectId);
    }
  };

  const handleRunAutoMatch = async () => {
    // This is a placeholder for the auto-matching algorithm
    // In a real implementation, this would call a backend endpoint that handles the matching logic
    
    try {
      toast({
        title: "Info",
        description: "Auto-matching is not implemented in this version. This would use an algorithm to match employees to projects based on skills.",
      });
      
      setAutoMatchDialogOpen(false);
    } catch (error) {
      console.error("Error in auto-matching:", error);
      toast({
        title: "Error",
        description: "Failed to run auto-matching",
        variant: "destructive",
      });
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown";
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown";
  };

  const columns: ColumnDef<ProjectAssignment>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    ...(projectId
      ? []
      : [
          {
            accessorKey: "projectName",
            header: "Project",
            cell: ({ row }: { row: { original: ProjectAssignment } }) => getProjectName(row.original.projectId),
          },
        ]),
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }) => getEmployeeName(row.original.employeeId),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role || "-",
    },
    {
      accessorKey: "allocationPercentage",
      header: "Allocation %",
      cell: ({ row }) => `${row.original.allocationPercentage}%`,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.original.startDate;
        return date ? format(new Date(date), "MMM d, yyyy") : "-";
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.original.endDate;
        return date ? format(new Date(date), "MMM d, yyyy") : "-";
      },
    },
    {
      accessorKey: "isAutomaticallyAssigned",
      header: "Auto Assigned",
      cell: ({ row }) => (row.original.isAutomaticallyAssigned ? "Yes" : "No"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const assignment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteAssignment(assignment.id!)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={projectId ? `Project Assignments: ${getProjectName(parseInt(projectId))}` : "Project Assignments"}
        description="Manage employee assignments to projects"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAutoMatch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Auto Match
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Assignment
            </Button>
          </div>
        }
      />

      {projectId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project: {getProjectName(parseInt(projectId))}</CardTitle>
            <CardDescription>
              Manage team assignments for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  searchParams.delete("projectId");
                  setSearchParams(searchParams);
                }}
              >
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading assignments...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={assignments} />
      )}

      {/* Add/Edit Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Assignment</DialogTitle>
            <DialogDescription>
              Assign an employee to a project with specific role and allocation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!projectId && (
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
            )}
            
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
              Add Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Match Dialog */}
      <Dialog open={autoMatchDialogOpen} onOpenChange={setAutoMatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Automatic Skill Matching</DialogTitle>
            <DialogDescription>
              Let the system automatically match employees to this project based on required skills and employee proficiencies.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!projectId && (
              <div className="space-y-2">
                <Label htmlFor="projectAutoMatch">Project</Label>
                <Select value={autoMatchProjectId} onValueChange={setAutoMatchProjectId}>
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
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This will analyze the project's required skills and find the best matches among available employees
                based on their skill proficiencies.
              </p>
              <p>
                The matching algorithm will consider:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Required skills and their importance</li>
                <li>Employee skill proficiency levels</li>
                <li>Minimum proficiency requirements</li>
                <li>Current employee workload and availability</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoMatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRunAutoMatch}>
              Run Auto-Matching
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}