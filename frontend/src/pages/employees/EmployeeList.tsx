import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Employee, EmployeeApi, ProjectAssignmentApi } from "@/api";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { toast } from "@/components/ui/useToast";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeAllocations, setEmployeeAllocations] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchEmployeeAllocations();
    }
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await EmployeeApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAllocations = async () => {
    try {
      const allocationsMap: Record<number, number> = {};
      
      for (const employee of employees) {
        if (employee.id) {
          const allocation = await ProjectAssignmentApi.getAllocationForEmployee(employee.id);
          allocationsMap[employee.id] = allocation;
        }
      }
      
      setEmployeeAllocations(allocationsMap);
    } catch (error) {
      console.error("Error fetching employee allocations:", error);
      // Don't show toast for allocation errors as it's secondary information
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEmployees();
      return;
    }

    try {
      setLoading(true);
      const data = await EmployeeApi.search(searchQuery);
      setEmployees(data);
    } catch (error) {
      console.error("Error searching employees:", error);
      toast({
        title: "Error",
        description: "Failed to search employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await EmployeeApi.delete(id);
      setEmployees(employees.filter((employee) => employee.id !== id));
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      id: "allocation",
      header: "Current Allocation",
      cell: ({ row }) => {
        const employee = row.original;
        const allocation = employeeAllocations[employee.id!] || 0;
        return (
          <Badge 
            variant={allocation > 100 ? "destructive" : 
                    allocation >= 80 ? "default" : 
                    allocation >= 40 ? "outline" : 
                    "destructive"}
            className={allocation > 100 || allocation < 40 ? "text-white" : ""}
          >
            {allocation}%
          </Badge>
        );
      },
      size: 150,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/employees/${employee.id}`)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(employee.id!)}
              >
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
        title="Employees"
        description="Manage your organization's employees and their skills"
        actions={
          <Button asChild>
            <Link to="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        }
      />

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSearch}
          className="ml-2"
        >
          Search
        </Button>
        <Button
          variant="ghost"
          onClick={fetchEmployees}
          className="ml-2"
        >
          Reset
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading employees...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={employees} />
      )}
    </div>
  );
}