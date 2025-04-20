import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Search, Edit, Trash } from "lucide-react";
import { Skill, SkillApi, SkillCreateDto, SkillUpdateDto } from "@/api";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { toast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export function SkillList() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await SkillApi.getAll();
      setSkills(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((skill) => skill.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSkills();
      return;
    }

    try {
      setLoading(true);
      const data = await SkillApi.search(searchQuery);
      setSkills(data);
    } catch (error) {
      console.error("Error searching skills:", error);
      toast({
        title: "Error",
        description: "Failed to search skills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByCategory = async (category: string) => {
    setCategoryFilter(category);
    
    if (category === "all") {
      fetchSkills();
      return;
    }
  
    try {
      setLoading(true);
      const data = await SkillApi.getByCategory(category);
      setSkills(data);
    } catch (error) {
      console.error("Error filtering skills by category:", error);
      toast({
        title: "Error",
        description: "Failed to filter skills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setSkillName(skill.name);
      setSkillCategory(skill.category || "none");
      setSkillDescription(skill.description || "");
    } else {
      setEditingSkill(null);
      setSkillName("");
      setSkillCategory("none");
      setSkillDescription("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSkill(null);
    setSkillName("");
    setSkillCategory("");
    setSkillDescription("");
    setNewCategory("");
  };

  const handleSubmitSkill = async () => {
    try {
      // Validate form
      if (!skillName.trim()) {
        toast({
          title: "Validation Error",
          description: "Skill name is required",
          variant: "destructive",
        });
        return;
      }

      // Use new category if provided
      const categoryToUse = newCategory.trim() 
        ? newCategory.trim() 
        : skillCategory === "none" ? "" : skillCategory;
      
      if (editingSkill) {
        // Update existing skill
        const updateDto: SkillUpdateDto = {
          name: skillName,
          category: categoryToUse || undefined,
          description: skillDescription || undefined,
        };
        await SkillApi.update(editingSkill.id!, updateDto);
        toast({
          title: "Success",
          description: "Skill updated successfully",
        });
      } else {
        // Create new skill
        const createDto: SkillCreateDto = {
          name: skillName,
          category: categoryToUse || undefined,
          description: skillDescription || undefined,
        };
        await SkillApi.create(createDto);
        toast({
          title: "Success",
          description: "Skill created successfully",
        });
      }
      
      // Refresh skills list
      handleCloseDialog();
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await SkillApi.delete(id);
      setSkills(skills.filter((skill) => skill.id !== id));
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error",
        description: "Failed to delete skill. It may be in use by employees or projects.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Skill>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category || "-",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const skill = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenDialog(skill)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteSkill(skill.id!)}
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
        title="Skills"
        description="Manage skills that can be assigned to employees and projects"
        actions={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={handleFilterByCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-shrink-0 flex gap-2">
          <Button
            variant="outline"
            onClick={handleSearch}
          >
            Search
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("");
              fetchSkills();
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading skills...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={skills} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill 
                ? "Update the skill information below" 
                : "Fill in the details to create a new skill"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                placeholder="E.g., React, Python, Project Management"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="flex gap-2">
                <Select value={skillCategory} onValueChange={setSkillCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="Or add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmitSkill}>
              {editingSkill ? "Save Changes" : "Add Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}