import { ProjectSkill } from "@/api/types";

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

// Helper function to render importance level
const renderImportanceLevel = (importance: number) => {
  const labels = {
    1: { text: "Low", color: "bg-gray-100 text-gray-600" },
    2: { text: "Medium", color: "bg-blue-100 text-blue-600" },
    3: { text: "High", color: "bg-orange-100 text-orange-600" },
    4: { text: "Critical", color: "bg-red-100 text-red-600" },
    5: { text: "Mandatory", color: "bg-purple-100 text-purple-600" },
  };

  const label = labels[importance as keyof typeof labels] || labels[1];

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${label.color}`}>
      {label.text}
    </span>
  );
};

interface ProjectSkillTooltipProps {
  skills: ProjectSkill[];
}

export function ProjectSkillTooltip({ skills }: ProjectSkillTooltipProps) {
  // Group skills by category if possible
  const skillsByCategory: Record<string, ProjectSkill[]> = {};
  
  skills.forEach(skill => {
    const category = skill.category || 'Uncategorized';
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skill);
  });

  const hasCategories = Object.keys(skillsByCategory).length > 1;

  return (
    <div className="w-80 p-2">
      <h3 className="text-sm font-medium mb-2">Required Skills</h3>
      
      {skills.length === 0 ? (
        <p className="text-xs text-gray-500">No skills required for this project</p>
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
                      <th className="py-1 px-2 text-center w-16">Min. Level</th>
                      <th className="py-1 px-2 text-center w-16">Importance</th>
                      <th className="py-1 px-2 text-center w-16">People</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySkills.map(skill => (
                      <tr key={skill.id} className="border-t">
                        <td className="py-1 px-2 font-medium">{skill.skillName}</td>
                        <td className="py-1 px-2 text-center">
                          {skill.minimumProficiencyLevel 
                            ? renderProficiencyStars(skill.minimumProficiencyLevel)
                            : <span className="text-gray-400">None</span>
                          }
                        </td>
                        <td className="py-1 px-2 text-center">
                          {renderImportanceLevel(skill.importance)}
                        </td>
                        <td className="py-1 px-2 text-center">
                          {skill.numberOfPeopleRequired || 0}
                        </td>
                      </tr>
                    ))}
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
                <th className="py-1 px-2 text-center w-16">Min. Level</th>
                <th className="py-1 px-2 text-center w-16">Importance</th>
                <th className="py-1 px-2 text-center w-16">People</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.id} className="border-t">
                  <td className="py-1 px-2 font-medium">{skill.skillName}</td>
                  <td className="py-1 px-2 text-center">
                    {skill.minimumProficiencyLevel 
                      ? renderProficiencyStars(skill.minimumProficiencyLevel)
                      : <span className="text-gray-400">None</span>
                    }
                  </td>
                  <td className="py-1 px-2 text-center">
                    {renderImportanceLevel(skill.importance)}
                  </td>
                  <td className="py-1 px-2 text-center">
                    {skill.numberOfPeopleRequired || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {skills.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Total: {skills.length} skill{skills.length !== 1 ? 's' : ''} required</p>
        </div>
      )}
    </div>
  );
}