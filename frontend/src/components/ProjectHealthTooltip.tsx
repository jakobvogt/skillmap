import { ProjectHealthDto, SkillCoverageDto } from "@/api/types";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectHealthTooltipProps {
  health: ProjectHealthDto;
  className?: string;
}

export function ProjectHealthTooltip({ health, className }: ProjectHealthTooltipProps) {
  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (percentage >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getHealthLabel = (percentage: number) => {
    if (percentage >= 80) return "Healthy";
    if (percentage >= 60) return "Warning";
    return "Critical";
  };

  const renderProgressBar = (percentage: number, className?: string) => {
    const colorClass = percentage >= 80 ? "bg-green-500" : 
                      percentage >= 60 ? "bg-yellow-500" : "bg-red-500";
    
    return (
      <div className={cn("h-1.5 bg-gray-200 rounded-full overflow-hidden", className)}>
        <div
          className={cn("h-full transition-all duration-300", colorClass)}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    );
  };

  return (
    <div className={cn("w-96 max-h-[80vh] overflow-y-auto p-3", className)}>
      {/* Overall Health Header */}
      <div className="border-b pb-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Project Health</h3>
          <div className="flex items-center gap-2">
            {getHealthIcon(health.overallHealthScore)}
            <span className={cn("text-sm font-medium", getHealthColor(health.overallHealthScore))}>
              {Math.round(health.overallHealthScore)}% - {getHealthLabel(health.overallHealthScore)}
            </span>
          </div>
        </div>
        {renderProgressBar(health.overallHealthScore)}
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">FTE Coverage</span>
              <span className={getHealthColor(health.fteCoveragePercentage)}>
                {Math.round(health.fteCoveragePercentage)}%
              </span>
            </div>
            {renderProgressBar(health.fteCoveragePercentage, "mt-1")}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Proficiency Match</span>
              <span className={getHealthColor(health.proficiencyMatchPercentage)}>
                {Math.round(health.proficiencyMatchPercentage)}%
              </span>
            </div>
            {renderProgressBar(health.proficiencyMatchPercentage, "mt-1")}
          </div>
        </div>
      </div>

      {/* Individual Skills */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Skill Coverage Details</h4>
        
        {health.skillCoverages.map((skill: SkillCoverageDto) => (
          <div key={skill.skillId} className="border rounded-md p-2 bg-gray-50">
            {/* Skill Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getHealthIcon(skill.combinedScore)}
                <span className="font-medium text-sm">{skill.skillName}</span>
              </div>
              <span className={cn("text-sm font-medium", getHealthColor(skill.combinedScore))}>
                {Math.round(skill.combinedScore)}%
              </span>
            </div>

            {/* FTE Details */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">FTE Coverage</span>
                  <span className={getHealthColor(skill.fteCoveragePercentage)}>
                    {skill.actualFTE.toFixed(1)} / {skill.requiredFTE.toFixed(1)} FTE
                    ({Math.round(skill.fteCoveragePercentage)}%)
                  </span>
                </div>
                {renderProgressBar(skill.fteCoveragePercentage, "mt-1")}
                <div className="text-xs text-muted-foreground mt-1">
                  Min per person: {skill.fteThreshold} FTE to be effective
                </div>
              </div>

              {/* Proficiency Details */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proficiency Match</span>
                  <div className="flex items-center gap-1">
                    {skill.requiredProficiency ? (
                      <>
                        <span className="text-muted-foreground">
                          Req: {skill.requiredProficiency}/5
                        </span>
                        {skill.bestTeamProficiency && (
                          <span className={getHealthColor(skill.proficiencyMatchPercentage)}>
                            Best: {skill.bestTeamProficiency}/5
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-green-600">No requirement</span>
                    )}
                  </div>
                </div>
                {renderProgressBar(skill.proficiencyMatchPercentage, "mt-1")}
              </div>

              {/* Assignment Stats */}
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-muted-foreground">Assignments</span>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">{skill.effectiveAssignments}</span>
                    <span className="text-muted-foreground">effective</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{skill.totalAssignments}</span>
                    <span className="text-muted-foreground">total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="space-y-1">
          <p><strong>Effective assignments:</strong> Meet both FTE threshold (≥{health.skillCoverages[0]?.fteThreshold || 0.4}) and proficiency requirements</p>
          <p><strong>Health Score:</strong> 60% FTE coverage + 40% proficiency match</p>
        </div>
      </div>
    </div>
  );
}