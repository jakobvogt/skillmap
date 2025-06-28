import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Save, Plus, Trash, Users } from "lucide-react";
import { ProjectApi, ProjectCreateDto, ProjectUpdateDto, Skill, SkillApi, ProjectSkill, ProjectSkillApi, ProjectSkillCreateDto, ProjectAssignmentApi } from "@/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "@/components/ui/useToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

// Define form schema using zod
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
  status: z.string(),
});

const statusOptions = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewProject = id === "new" || id === undefined;
  const [loading, setLoading] = useState(!isNewProject);
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([]);
  const [pendingSkills, setPendingSkills] = useState<{skillId: number, skillName: string, importance: number, minimumProficiencyRequired: number, minimumFTE: number, fteThreshold: number}[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [importance, setImportance] = useState<string>("3");
  const [minProficiency, setMinProficiency] = useState<string>("2");
  const [minimumFTE, setMinimumFTE] = useState<string>("1.0");
  const [fteThreshold, setFteThreshold] = useState<string>("0.4");
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      status: "PLANNED",
    },
  });

  // Fetch project data when component mounts
  useEffect(() => {
    async function fetchSkills() {
      try {
        const skills = await SkillApi.getAll();
        setAvailableSkills(skills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        toast({
          title: "Error",
          description: "Failed to load skills",
          variant: "destructive",
        });
      }
    }

    async function fetchProjectData() {
      try {
        setLoading(true);
        const project = await ProjectApi.getById(parseInt(id!));
        reset({
          name: project.name,
          description: project.description || "",
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
          budget: project.budget ? project.budget.toString() : "",
          status: project.status,
        });

        // Fetch project skills
        const skills = await ProjectSkillApi.getByProjectId(parseInt(id!));
        setProjectSkills(skills);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
    if (!isNewProject) {
      fetchProjectData();
    } else {
      // Reset skills for new project
      setProjectSkills([]);
      setPendingSkills([]);
    }
  }, [id, isNewProject, reset, navigate]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    try {
      let projectId: number;

      const projectData = {
        name: data.name,
        description: data.description,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        budget: data.budget ? parseFloat(data.budget) : undefined,
        status: data.status,
      };

      if (isNewProject) {
        const createDto: ProjectCreateDto = projectData;
        const newProject = await ProjectApi.create(createDto);
        projectId = newProject.id!;
        
        // Add all pending skills to the newly created project
        for (const skill of pendingSkills) {
          const skillToAdd: ProjectSkillCreateDto = {
            projectId: projectId,
            skillId: skill.skillId,
            importance: skill.importance,
            minimumProficiencyRequired: skill.minimumProficiencyRequired,
            minimumFTE: skill.minimumFTE,
            fteThreshold: skill.fteThreshold,
          };
          await ProjectSkillApi.create(skillToAdd);
        }
        
        toast({
          title: "Success",
          description: "Project created successfully with skill requirements",
        });
      } else {
        projectId = parseInt(id!);
        const updateDto: ProjectUpdateDto = projectData;
        await ProjectApi.update(projectId, updateDto);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      }

      // Navigate back to project list
      navigate("/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;

    try {
      const skillId = parseInt(selectedSkill);
      
      // For existing project
      if (!isNewProject && id) {
        const projectId = parseInt(id);
        
        // Check if this skill is already assigned to project
        if (projectSkills.some(skill => skill.skillId === skillId)) {
          toast({
            title: "Error",
            description: "This skill is already assigned to this project",
            variant: "destructive",
          });
          return;
        }

        const skillToAdd: ProjectSkillCreateDto = {
          projectId: projectId,
          skillId: skillId,
          importance: parseInt(importance),
          minimumProficiencyRequired: parseInt(minProficiency),
          minimumFTE: parseFloat(minimumFTE),
          fteThreshold: parseFloat(fteThreshold),
        };

        const newSkill = await ProjectSkillApi.create(skillToAdd);
        setProjectSkills([...projectSkills, newSkill]);
        
        toast({
          title: "Success",
          description: "Skill requirement added successfully",
        });
      } 
      // For new project
      else {
        // Check if skill is already in pending list
        if (pendingSkills.some(skill => skill.skillId === skillId)) {
          toast({
            title: "Error",
            description: "This skill is already in the list",
            variant: "destructive",
          });
          return;
        }
        
        // Find skill name from availableSkills
        const skillName = availableSkills.find(s => s.id === skillId)?.name || "Unknown Skill";
        
        // Add to pending skills
        setPendingSkills([
          ...pendingSkills, 
          {
            skillId,
            skillName,
            importance: parseInt(importance),
            minimumProficiencyRequired: parseInt(minProficiency),
            minimumFTE: parseFloat(minimumFTE),
            fteThreshold: parseFloat(fteThreshold)
          }
        ]);
        
        toast({
          title: "Success",
          description: "Skill requirement added to list",
        });
      }
      
      // Reset form fields
      setSelectedSkill("");
      setImportance("3");
      setMinProficiency("2");
      setMinimumFTE("1.0");
      setFteThreshold("0.4");
      
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill requirement",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSkill = async (index: number, isExistingSkill: boolean) => {
    try {
      if (isExistingSkill) {
        // Handle existing skill
        const skillId = projectSkills[index].id!;
        await ProjectSkillApi.delete(skillId);
        setProjectSkills(projectSkills.filter(skill => skill.id !== skillId));
      } else {
        // Handle pending skill
        setPendingSkills(pendingSkills.filter((_, i) => i !== index));
      }
      
      toast({
        title: "Success",
        description: "Skill requirement removed successfully",
      });
    } catch (error) {
      console.error("Error removing skill:", error);
      toast({
        title: "Error",
        description: "Failed to remove skill requirement",
        variant: "destructive",
      });
    }
  };

  const handleAutoAssign = async () => {
    if (isNewProject || !id) {
      toast({
        title: "Error",
        description: "Please save the project first before auto-assigning employees",
        variant: "destructive",
      });
      return;
    }

    try {
      setAutoAssigning(true);
      const assignments = await ProjectAssignmentApi.autoAssign(parseInt(id));
      
      if (assignments.length === 0) {
        toast({
          title: "No Assignments",
          description: "No eligible employees found for auto-assignment",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully created ${assignments.length} automatic assignment${assignments.length > 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      console.error("Error auto-assigning employees:", error);
      toast({
        title: "Error",
        description: "Failed to auto-assign employees",
        variant: "destructive",
      });
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading project data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isNewProject ? "Add Project" : "Edit Project"}
        description={isNewProject ? "Create a new project" : "Update project details"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/projects")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" form="project-form">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="skills">Required Skills</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      {...register("budget")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue="PLANNED"
                      onValueChange={(value) => setValue("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Required Skills</CardTitle>
                {!isNewProject && (
                  <Button 
                    onClick={handleAutoAssign} 
                    disabled={autoAssigning || projectSkills.length === 0}
                    variant="outline"
                    size="sm"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {autoAssigning ? "Auto Assigning..." : "Auto Assign"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="skill">Skill</Label>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id!.toString()}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importance">Importance (1-5)</Label>
                  <Select value={importance} onValueChange={setImportance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Nice to have</SelectItem>
                      <SelectItem value="2">2 - Helpful</SelectItem>
                      <SelectItem value="3">3 - Important</SelectItem>
                      <SelectItem value="4">4 - Very important</SelectItem>
                      <SelectItem value="5">5 - Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLevel">Min Proficiency Threshold (1-5)</Label>
                  <Select value={minProficiency} onValueChange={setMinProficiency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Beginner</SelectItem>
                      <SelectItem value="2">2 - Basic</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumFTE">Minimum FTE Required</Label>
                  <Input
                    id="minimumFTE"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={minimumFTE}
                    onChange={(e) => setMinimumFTE(e.target.value)}
                    placeholder="e.g. 1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fteThreshold">FTE Threshold</Label>
                  <Input
                    id="fteThreshold"
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={fteThreshold}
                    onChange={(e) => setFteThreshold(e.target.value)}
                    placeholder="e.g. 0.4"
                  />
                </div>
                <div className="flex items-end md:col-span-2">
                  <Button onClick={handleAddSkill} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skill Requirement
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Importance</TableHead>
                      <TableHead>Min Proficiency Threshold</TableHead>
                      <TableHead>Min FTE</TableHead>
                      <TableHead>FTE Threshold</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isNewProject ? (
                      pendingSkills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No skill requirements added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingSkills.map((skill, index) => (
                          <TableRow key={index}>
                            <TableCell>{skill.skillName}</TableCell>
                            <TableCell>{skill.importance}</TableCell>
                            <TableCell>{skill.minimumProficiencyRequired}</TableCell>
                            <TableCell>{skill.minimumFTE}</TableCell>
                            <TableCell>{skill.fteThreshold}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSkill(index, false)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : (
                      projectSkills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No skill requirements added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        projectSkills.map((skill, index) => (
                          <TableRow key={skill.id}>
                            <TableCell>{skill.skillName}</TableCell>
                            <TableCell>{skill.importance}</TableCell>
                            <TableCell>{skill.minimumProficiencyRequired || "-"}</TableCell>
                            <TableCell>{skill.minimumFTE}</TableCell>
                            <TableCell>{skill.fteThreshold}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSkill(index, true)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}