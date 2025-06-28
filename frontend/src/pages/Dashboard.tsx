import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProjectApi, EmployeeApi, SkillApi } from "@/api";
import { Calendar, Users, Briefcase, Lightbulb } from "lucide-react";
import { AssignmentDashboard } from "@/pages/assignments/AssignmentDashboard";

export function Dashboard() {
  const [stats, setStats] = useState({
    employeesCount: 0,
    projectsCount: 0,
    activeProjectsCount: 0,
    skillsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [employees, projects, skills] = await Promise.all([
          EmployeeApi.getAll(),
          ProjectApi.getAll(),
          SkillApi.getAll(),
        ]);

        setStats({
          employeesCount: employees.length,
          projectsCount: projects.length,
          activeProjectsCount: projects.filter(p => p.status === "IN_PROGRESS").length,
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


  return (
    <div className="space-y-8">
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
