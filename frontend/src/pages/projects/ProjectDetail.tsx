import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Save, Plus, Trash } from "lucide-react";
import { ProjectApi, ProjectCreateDto, ProjectUpdateDto, Skill, SkillApi, ProjectSkill, ProjectSkillApi, ProjectSkillCreateDto } from "@/api";
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
  const isNewProject = id === "new";
  const [loading, setLoading] = useState(!isNewProject);
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [importance, setImportance] = useState<string>("3");
  const [minProficiency, setMinProficiency] = useState<string>("2");
  const [peopleRequired, setPeopleRequired] = useState<string>("1");

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
        toast({
          title: "Success",
          description: "Project created successfully",
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

      navigate(`/projects/${projectId}`);
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
    if (!selectedSkill || !id || id === "new") return;

    try {
      const skillId = parseInt(selectedSkill);
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
        numberOfPeopleRequired: parseInt(peopleRequired),
      };

      const newSkill = await ProjectSkillApi.create(skillToAdd);
      setProjectSkills([...projectSkills, newSkill]);
      
      // Reset form fields
      setSelectedSkill("");
      setImportance("3");
      setMinProficiency("2");
      setPeopleRequired("1");
      
      toast({
        title: "Success",
        description: "Skill requirement added successfully",
      });
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill requirement",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await ProjectSkillApi.delete(skillId);
      setProjectSkills(projectSkills.filter(skill => skill.id !== skillId));
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
          {!isNewProject && <TabsTrigger value="skills">Required Skills</TabsTrigger>}
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
        
        {!isNewProject && (
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
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
                    <Label htmlFor="minLevel">Min. Proficiency (1-5)</Label>
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
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="peopleRequired">Number of People Required</Label>
                    <Input
                      id="peopleRequired"
                      type="number"
                      min="1"
                      value={peopleRequired}
                      onChange={(e) => setPeopleRequired(e.target.value)}
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
                        <TableHead>Min. Proficiency</TableHead>
                        <TableHead>People Required</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectSkills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No skill requirements added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        projectSkills.map((skill) => (
                          <TableRow key={skill.id}>
                            <TableCell>{skill.skillName}</TableCell>
                            <TableCell>{skill.importance}</TableCell>
                            <TableCell>{skill.minimumProficiencyLevel || "-"}</TableCell>
                            <TableCell>{skill.numberOfPeopleRequired}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSkill(skill.id!)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}