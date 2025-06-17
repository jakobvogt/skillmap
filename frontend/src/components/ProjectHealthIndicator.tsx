import { cn } from "@/lib/utils";

interface ProjectHealthIndicatorProps {
  health: {
    fteCoveragePercentage: number;
    proficiencyMatchPercentage: number;
    overallHealthScore: number;
  };
  variant?: "compact" | "detailed" | "bar";
  className?: string;
}

export function ProjectHealthIndicator({ 
  health, 
  variant = "compact",
  className 
}: ProjectHealthIndicatorProps) {
  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981"; // green-500
    if (percentage >= 60) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getHealthColorClass = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getHealthLabel = (percentage: number) => {
    if (percentage >= 80) return "Healthy";
    if (percentage >= 60) return "Warning";
    return "Critical";
  };

  if (variant === "bar") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", getHealthColorClass(health.overallHealthScore))}
              style={{ width: `${health.overallHealthScore}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(health.overallHealthScore)}%
          </span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex-1 max-w-[100px]">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", getHealthColorClass(health.overallHealthScore))}
              style={{ width: `${health.overallHealthScore}%` }}
            />
          </div>
        </div>
        <span 
          className="text-xs font-medium"
          style={{ color: getHealthColor(health.overallHealthScore) }}
        >
          {Math.round(health.overallHealthScore)}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Health</span>
          <span 
            className="text-sm font-medium"
            style={{ color: getHealthColor(health.overallHealthScore) }}
          >
            {Math.round(health.overallHealthScore)}% - {getHealthLabel(health.overallHealthScore)}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", getHealthColorClass(health.overallHealthScore))}
            style={{ width: `${health.overallHealthScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">FTE Coverage</span>
            <span className="font-medium">{Math.round(health.fteCoveragePercentage)}%</span>
          </div>
          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", getHealthColorClass(health.fteCoveragePercentage))}
              style={{ width: `${health.fteCoveragePercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Proficiency Match</span>
            <span className="font-medium">{Math.round(health.proficiencyMatchPercentage)}%</span>
          </div>
          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", getHealthColorClass(health.proficiencyMatchPercentage))}
              style={{ width: `${health.proficiencyMatchPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export utility functions for cell coloring
export function getHealthBackgroundColor(percentage: number) {
  if (percentage >= 80) return "bg-green-50";
  if (percentage >= 60) return "bg-yellow-50";
  return "bg-red-50";
}

export function getHealthBorderColor(percentage: number) {
  if (percentage >= 80) return "border-green-200";
  if (percentage >= 60) return "border-yellow-200";
  return "border-red-200";
}