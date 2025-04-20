import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Save, Plus, Trash } from "lucide-react";
import { EmployeeApi, EmployeeCreateDto, EmployeeUpdateDto, Skill, SkillApi, EmployeeSkill, EmployeeSkillApi, EmployeeSkillCreateDto } from "@/api";
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

// Define form schema using zod
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  position: z.string().optional(),
  department: z.string().optional(),
});

export function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewEmployee = id === "new" || id === undefined;
  const [loading, setLoading] = useState(false);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [pendingSkills, setPendingSkills] = useState<{skillId: number, skillName: string, proficiencyLevel: number}[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [proficiencyLevel, setProficiencyLevel] = useState<string>("3");

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      position: "",
      department: "",
    },
  });

  // Fetch skill and employee data when component mounts
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

    async function fetchEmployeeData(employeeId: number) {
      try {
        setLoading(true);
        const employee = await EmployeeApi.getById(employeeId);
        reset({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          position: employee.position || "",
          department: employee.department || "",
        });

        const skills = await EmployeeSkillApi.getByEmployeeId(employeeId);
        setEmployeeSkills(skills);
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive",
        });
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();

    if (id === undefined) {
      return;
    }

    if (!isNewEmployee) {
      fetchEmployeeData(parseInt(id));
    } else {
      // Reset skills for new employee
      setEmployeeSkills([]);
      setPendingSkills([]);
    }
  }, [id, reset, navigate]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof employeeSchema>) => {
    try {
      let employeeId: number;

      if (isNewEmployee) {
        const createDto: EmployeeCreateDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          position: data.position,
          department: data.department,
        };
        const newEmployee = await EmployeeApi.create(createDto);
        employeeId = newEmployee.id!;
        
        // Add all pending skills to the newly created employee
        for (const skill of pendingSkills) {
          const skillToAdd: EmployeeSkillCreateDto = {
            employeeId: employeeId,
            skillId: skill.skillId,
            proficiencyLevel: skill.proficiencyLevel,
          };
          await EmployeeSkillApi.create(skillToAdd);
        }
        
        toast({
          title: "Success",
          description: "Employee created successfully with skills",
        });
      } else {
        employeeId = parseInt(id!);
        const updateDto: EmployeeUpdateDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          position: data.position,
          department: data.department,
        };
        await EmployeeApi.update(employeeId, updateDto);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      }

      navigate("/employees");
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    
    try {
      const skillId = parseInt(selectedSkill);
      
      // For existing employee
      if (!isNewEmployee && id) {
        const employeeId = parseInt(id);
        
        // Check if this skill is already assigned to employee
        if (employeeSkills.some(skill => skill.skillId === skillId)) {
          toast({
            title: "Error",
            description: "This skill is already assigned to this employee",
            variant: "destructive",
          });
          return;
        }

        const skillToAdd: EmployeeSkillCreateDto = {
          employeeId: employeeId,
          skillId: skillId,
          proficiencyLevel: parseInt(proficiencyLevel),
        };

        const newSkill = await EmployeeSkillApi.create(skillToAdd);
        setEmployeeSkills([...employeeSkills, newSkill]);
        
        toast({
          title: "Success",
          description: "Skill added successfully",
        });
      } 
      // For new employee
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
            proficiencyLevel: parseInt(proficiencyLevel)
          }
        ]);
        
        toast({
          title: "Success",
          description: "Skill added to list",
        });
      }
      
      // Reset form fields
      setSelectedSkill("");
      setProficiencyLevel("3");
      
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSkill = async (index: number, isExistingSkill: boolean) => {
    try {
      if (isExistingSkill) {
        // Handle existing skill
        const skillId = employeeSkills[index].id!;
        await EmployeeSkillApi.delete(skillId);
        setEmployeeSkills(employeeSkills.filter(skill => skill.id !== skillId));
      } else {
        // Handle pending skill
        setPendingSkills(pendingSkills.filter((_, i) => i !== index));
      }
      
      toast({
        title: "Success",
        description: "Skill removed successfully",
      });
    } catch (error) {
      console.error("Error removing skill:", error);
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isNewEmployee ? "Add Employee" : "Edit Employee"}
        description={isNewEmployee ? "Create a new employee profile" : "Update employee information"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/employees")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" form="employee-form">
              <Save className="mr-2 h-4 w-4" />
              {isNewEmployee ? "Add Employee" : "Save"}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{isNewEmployee ? "Add Employee Information" : "Edit Employee Information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      aria-invalid={!!errors.firstName}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" {...register("position")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" {...register("department")} />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Employee Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
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
                <div className="w-32 space-y-2">
                  <Label htmlFor="proficiency">Proficiency (1-5)</Label>
                  <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
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
                <div className="flex items-end">
                  <Button onClick={handleAddSkill} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Skill
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Skill</TableHead>
                      <TableHead>Proficiency Level</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isNewEmployee ? (
                      pendingSkills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No skills added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingSkills.map((skill, index) => (
                          <TableRow key={index}>
                            <TableCell>{skill.skillName}</TableCell>
                            <TableCell>{skill.proficiencyLevel}</TableCell>
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
                      employeeSkills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No skills added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        employeeSkills.map((skill, index) => (
                          <TableRow key={skill.id}>
                            <TableCell>{skill.skillName}</TableCell>
                            <TableCell>{skill.proficiencyLevel}</TableCell>
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
