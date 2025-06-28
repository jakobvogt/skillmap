import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { AssignmentMetricsDto, AssignmentMetricsApi } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, TrendingDown, Users, Building2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentMetricsProps {
  date?: string;
  className?: string;
}

export interface AssignmentMetricsRef {
  refresh: () => void;
}

export const AssignmentMetrics = forwardRef<AssignmentMetricsRef, AssignmentMetricsProps>(
  ({ date, className }, ref) => {
  const [metrics, setMetrics] = useState<AssignmentMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AssignmentMetricsApi.getMetrics(date);
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching assignment metrics:", err);
      setError("Failed to load assignment metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [date]);

  useImperativeHandle(ref, () => ({
    refresh: fetchMetrics,
  }));

  const getHealthColor = (score?: number) => {
    if (!score && score !== 0) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-white"; // White text for red background (destructive variant)
  };

  const getHealthBadgeVariant = (score?: number) => {
    if (!score && score !== 0) return "secondary";
    if (score >= 80) return "outline";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80 && utilization <= 100) return "text-green-600";
    if (utilization >= 60 || (utilization > 100 && utilization <= 110)) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Assignment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Assignment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive">{error || "No data available"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { organizationHealthScore, totalActiveProjects, resourceUtilization } = metrics;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Assignment Metrics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Organization-wide assignment health and resource utilization
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Organization Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Organization Health Score
            </h4>
            {organizationHealthScore !== null && organizationHealthScore !== undefined ? (
              <Badge 
                variant={getHealthBadgeVariant(organizationHealthScore)}
                className={cn("font-mono", getHealthColor(organizationHealthScore))}
              >
                {organizationHealthScore.toFixed(1)}%
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                No data
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Average project health across {totalActiveProjects} active projects
          </p>
          {organizationHealthScore !== null && organizationHealthScore !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  organizationHealthScore >= 80 ? "bg-green-500" :
                  organizationHealthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(organizationHealthScore, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200" />

        {/* Resource Utilization */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Resource Utilization
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Average Utilization</p>
              <p className={cn("text-2xl font-bold", getUtilizationColor(resourceUtilization.averageUtilization))}>
                {resourceUtilization.averageUtilization.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {resourceUtilization.totalEmployees}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">Fully Utilized</span>
              </div>
              <p className="text-lg font-semibold text-green-600">
                {resourceUtilization.fullyUtilizedCount}
              </p>
              <p className="text-xs text-muted-foreground">80-100% allocated</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm font-medium">Under-utilized</span>
              </div>
              <p className="text-lg font-semibold text-red-600">
                {resourceUtilization.underUtilizedCount}
              </p>
              <p className="text-xs text-muted-foreground">&lt;40% allocated</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <span className="text-sm font-medium">Over-allocated</span>
              </div>
              <p className="text-lg font-semibold text-orange-600">
                {resourceUtilization.overAllocatedCount}
              </p>
              <p className="text-xs text-muted-foreground">&gt;100% allocated</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                getUtilizationColor(resourceUtilization.averageUtilization) === "text-green-600" ? "bg-green-500" :
                getUtilizationColor(resourceUtilization.averageUtilization) === "text-yellow-600" ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(resourceUtilization.averageUtilization, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});