import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { ProjectApi, EmployeeApi, SkillApi, ProjectAssignmentApi, Project } from "@/api";
import { toast } from "@/components/ui/useToast";
import { Calendar, Users, Briefcase, Lightbulb, Zap, Globe } from "lucide-react";
import { AssignmentDashboard } from "@/pages/assignments/AssignmentDashboard";

export function Dashboard() {
  const [stats, setStats] = useState({
    employeesCount: 0,
    projectsCount: 0,
    activeProjectsCount: 0,
    skillsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Auto-assignment state
  const [projects, setProjects] = useState<Project[]>([]);
  const [autoAssignDialogOpen, setAutoAssignDialogOpen] = useState(false);
  const [globalAutoAssignDialogOpen, setGlobalAutoAssignDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [globalAutoAssigning, setGlobalAutoAssigning] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [employees, projectsData, skills] = await Promise.all([
          EmployeeApi.getAll(),
          ProjectApi.getAll(),
          SkillApi.getAll(),
        ]);

        setProjects(projectsData);
        setStats({
          employeesCount: employees.length,
          projectsCount: projectsData.length,
          activeProjectsCount: projectsData.filter(p => p.status === "IN_PROGRESS").length,
          skillsCount: skills.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAutoAssign = async () => {
    if (!selectedProjectId) {
      toast({
        title: "Validation Error",
        description: "Please select a project for auto-assignment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setAutoAssigning(true);
      const assignments = await ProjectAssignmentApi.autoAssign(parseInt(selectedProjectId));
      
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
      }
      
      setAutoAssignDialogOpen(false);
      setSelectedProjectId("");
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
    <div className="space-y-8">
      {/* Auto-assignment quick action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Auto-Assignment
          </CardTitle>
          <CardDescription>
            Automatically assign employees to a project based on skills and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Single project auto-assignment */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
              <Button 
                onClick={() => setAutoAssignDialogOpen(true)} 
                disabled={!selectedProjectId}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto Assign
              </Button>
            </div>

            {/* Global auto-assignment */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h4 className="font-semibold text-blue-900">Global Auto-Assignment</h4>
                <p className="text-sm text-blue-700">Optimize assignments across all projects simultaneously</p>
              </div>
              <Button 
                onClick={() => setGlobalAutoAssignDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Globe className="mr-2 h-4 w-4" />
                Auto Assign All Projects
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main assignment dashboard */}
      <AssignmentDashboard />

      {/* Basic statistics section at the bottom */}
      <div>
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading organization statistics...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Employees"
                value={stats.employeesCount}
                description="Total registered employees"
                icon={<Users className="h-5 w-5" />}
                href="/employees"
              />
              <StatsCard
                title="Projects"
                value={stats.projectsCount}
                description="Total projects"
                icon={<Briefcase className="h-5 w-5" />}
                href="/projects"
              />
              <StatsCard
                title="Active Projects"
                value={stats.activeProjectsCount}
                description="Currently in-progress"
                icon={<Calendar className="h-5 w-5" />}
                href="/projects?status=IN_PROGRESS"
              />
              <StatsCard
                title="Skills"
                value={stats.skillsCount}
                description="Tracked skills"
                icon={<Lightbulb className="h-5 w-5" />}
                href="/skills"
              />
            </div>
          )}
        </div>
      </div>

      {/* Single Project Auto Assignment Dialog */}
      <Dialog open={autoAssignDialogOpen} onOpenChange={setAutoAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Auto-Assignment</DialogTitle>
            <DialogDescription>
              This will automatically assign employees to "{projects.find(p => p.id?.toString() === selectedProjectId)?.name}" based on skill requirements and availability.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAutoAssign} 
              disabled={autoAssigning}
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
            <DialogTitle>Confirm Global Auto-Assignment</DialogTitle>
            <DialogDescription>
              This will optimize employee assignments across ALL active projects simultaneously using advanced compatibility scoring.
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
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function StatsCard({ title, value, description, icon, href }: StatsCardProps) {
  return (
    <Link to={href} className="block">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
