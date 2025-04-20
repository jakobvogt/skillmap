import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Lightbulb, 
  UserCheck
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Briefcase,
  },
  {
    title: "Skills",
    href: "/skills",
    icon: Lightbulb,
  },
  {
    title: "Assignments",
    href: "/assignments",
    icon: UserCheck,
  },
];

export function MainNav() {
  const location = useLocation();

  return (
    <nav className="grid gap-2 p-2">
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
            location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href))
              ? "bg-accent"
              : "transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}