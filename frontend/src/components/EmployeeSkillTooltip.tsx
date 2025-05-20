import { EmployeeSkill, ProjectSkill } from "@/api/types";

// Helper function to render proficiency level as stars
const renderProficiencyStars = (level: number, max: number = 5) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: max }).map((_, i) => (
        <span 
          key={i} 
          className={`text-xs ${i < level ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

interface EmployeeSkillTooltipProps {
  skills: EmployeeSkill[];
  projectSkills?: ProjectSkill[]; // Optional project skills for comparison
}

export function EmployeeSkillTooltip({ skills, projectSkills }: EmployeeSkillTooltipProps) {
  // Group skills by category if possible
  const skillsByCategory: Record<string, EmployeeSkill[]> = {};
  
  skills.forEach(skill => {
    const category = skill.category || 'Uncategorized';
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skill);
  });

  const hasCategories = Object.keys(skillsByCategory).length > 1;

  // Create a map of project skill requirements for comparison
  const projectSkillMap: Record<number, ProjectSkill> = {};
  if (projectSkills) {
    projectSkills.forEach(skill => {
      if (skill.skillId) {
        projectSkillMap[skill.skillId] = skill;
      }
    });
  }

  // Function to check if employee meets project requirements for a skill
  const checkSkillMatch = (employeeSkill: EmployeeSkill) => {
    if (!projectSkills || !employeeSkill.skillId) return null;
    
    const projectSkill = projectSkillMap[employeeSkill.skillId];
    if (!projectSkill) return null;
    
    const meetsRequirement = !projectSkill.minimumProficiencyLevel || 
      employeeSkill.proficiencyLevel >= projectSkill.minimumProficiencyLevel;
    
    return {
      meetsRequirement,
      projectSkill
    };
  };

  return (
    <div className="w-80 p-2">
      <h3 className="text-sm font-medium mb-2">Employee Skills</h3>
      
      {skills.length === 0 ? (
        <p className="text-xs text-gray-500">This employee has no recorded skills</p>
      ) : hasCategories ? (
        // Render skills grouped by category
        <div className="space-y-3">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category}>
              <h4 className="text-xs font-medium mb-1 text-gray-500">{category}</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-1 px-2 text-left">Skill</th>
                      <th className="py-1 px-2 text-center">Proficiency</th>
                      {projectSkills && <th className="py-1 px-2 text-center w-16">Match</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {categorySkills.map(skill => {
                      const skillMatch = checkSkillMatch(skill);
                      
                      return (
                        <tr key={skill.id} className="border-t">
                          <td className="py-1 px-2 font-medium">{skill.skillName}</td>
                          <td className="py-1 px-2 text-center">
                            {renderProficiencyStars(skill.proficiencyLevel)}
                          </td>
                          {projectSkills && (
                            <td className="py-1 px-2 text-center">
                              {skillMatch ? (
                                <span className={skillMatch.meetsRequirement 
                                  ? "text-green-500" 
                                  : "text-red-500"
                                }>
                                  {skillMatch.meetsRequirement ? "✓" : "✗"}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Render all skills in a single table
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-1 px-2 text-left">Skill</th>
                <th className="py-1 px-2 text-center">Proficiency</th>
                {projectSkills && <th className="py-1 px-2 text-center w-16">Match</th>}
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => {
                const skillMatch = checkSkillMatch(skill);
                
                return (
                  <tr key={skill.id} className="border-t">
                    <td className="py-1 px-2 font-medium">{skill.skillName}</td>
                    <td className="py-1 px-2 text-center">
                      {renderProficiencyStars(skill.proficiencyLevel)}
                    </td>
                    {projectSkills && (
                      <td className="py-1 px-2 text-center">
                        {skillMatch ? (
                          <span className={skillMatch.meetsRequirement 
                            ? "text-green-500" 
                            : "text-red-500"
                          }>
                            {skillMatch.meetsRequirement ? "✓" : "✗"}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {projectSkills && skills.length > 0 && (
        <div className="mt-2 text-xs">
          <p className="font-medium">Project Skills Coverage</p>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ 
                  width: `${calculateSkillCoverage(skills, projectSkills)}%` 
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-500">
              {calculateSkillCoverage(skills, projectSkills)}%
            </span>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Total: {skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

// Calculate percentage of project skills covered by employee
function calculateSkillCoverage(employeeSkills: EmployeeSkill[], projectSkills: ProjectSkill[]): number {
  if (!projectSkills || projectSkills.length === 0) return 0;
  
  const projectSkillIds = new Set(projectSkills.map(s => s.skillId));
  const employeeSkillIds = new Set(employeeSkills.map(s => s.skillId));
  
  // Check how many project skills the employee has
  let matchedSkills = 0;
  let requiredSkills = 0;
  
  projectSkills.forEach(ps => {
    if (ps.skillId) {
      requiredSkills++;
      if (employeeSkillIds.has(ps.skillId)) {
        const empSkill = employeeSkills.find(es => es.skillId === ps.skillId);
        if (empSkill && (!ps.minimumProficiencyLevel || empSkill.proficiencyLevel >= ps.minimumProficiencyLevel)) {
          matchedSkills++;
        }
      }
    }
  });
  
  return requiredSkills === 0 ? 0 : Math.round((matchedSkills / requiredSkills) * 100);
}