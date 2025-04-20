import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/Toaster";
import { AppShell } from "@/components/layout/AppShell";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import { EmployeeList } from "@/pages/employees/EmployeeList";
import { EmployeeDetail } from "@/pages/employees/EmployeeDetail";
import { ProjectList } from "@/pages/projects/ProjectList";
import { ProjectDetail } from "@/pages/projects/ProjectDetail";
import { SkillList } from "@/pages/skills/SkillList";
import { AssignmentList } from "@/pages/assignments/AssignmentList";
import { NotFound } from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          
          {/* Employee routes */}
          <Route path="employees">
            <Route index element={<EmployeeList />} />
            <Route path="new" element={<EmployeeDetail />} />
            <Route path=":id" element={<EmployeeDetail />} />
          </Route>
          
          {/* Project routes */}
          <Route path="projects">
            <Route index element={<ProjectList />} />
            <Route path="new" element={<ProjectDetail />} />
            <Route path=":id" element={<ProjectDetail />} />
          </Route>
          
          {/* Skill routes */}
          <Route path="skills">
            <Route index element={<SkillList />} />
          </Route>
          
          {/* Assignment routes */}
          <Route path="assignments">
            <Route index element={<AssignmentList />} />
          </Route>
          
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;