import { BaseAnalyzer } from './base-analyzer';
import { AnalysisRequest, TechnicalSkillsAnalysis } from '../../types/analysis';

export class TechnicalSkillsAnalyzer extends BaseAnalyzer<TechnicalSkillsAnalysis> {
  protected buildPrompt(request: AnalysisRequest): string {
    return `You are a technical skills analysis AI. Your task is to analyze the resume text and return ONLY a JSON object with no additional text, markdown formatting, or explanation.

Resume Text:
${request.resumeText}

IMPORTANT FORMATTING RULES:
1. Return ONLY complete, valid JSON - no partial entries
2. Limit to maximum 20 skills, 5 projects, 3 certifications, and 3 recommendations
3. Each skill entry must be complete - if you can't complete an entry, omit it
4. Keep context arrays to maximum 3 items per skill
5. Keep all text fields under 250 characters
6. Ensure all JSON strings are properly escaped and terminated
7. Do not use any markdown formatting

Return a JSON object with exactly this structure:
{
  "technicalSkills": [
    {
      "name": "skill name",
      "category": "programming/database/cloud/tool/methodology/monitoring/framework",
      "level": "beginner/intermediate/advanced/expert",
      "yearsOfExperience": 2,
      "lastUsed": 2024,
      "context": ["brief examples of how this skill was used"]
    }
  ],
  "technicalProjects": [
    {
      "name": "project name",
      "description": "brief description",
      "technologies": ["tech1", "tech2"],
      "role": "role in project",
      "impact": ["measurable outcomes"]
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "year": 2024,
      "relevance": "high/medium/low"
    }
  ],
  "recommendations": [
    {
      "skillGap": "identified skill gap",
      "suggestion": "specific suggestion to address the gap",
      "priority": "high/medium/low",
      "rationale": "why this is important"
    }
  ]
}

CATEGORY GUIDELINES:
- "programming": Programming languages (JavaScript, Python, Java, C++, etc.)
- "database": Database technologies (MySQL, PostgreSQL, MongoDB, Redis, etc.)
- "cloud": Cloud platforms and services (AWS, Azure, GCP, Docker, Kubernetes, etc.)
- "tool": Development tools and utilities (Git, VS Code, Jira, Jenkins, etc.)
- "methodology": Development methodologies and practices (Agile, Scrum, DevOps, CI/CD, etc.)
- "monitoring": Monitoring and logging tools (Prometheus, Grafana, ELK Stack, etc.)
- "framework": Frameworks and libraries (React, Angular, Django, Spring, etc.)

CRITICAL: Ensure the response is complete, valid JSON. Do not include any text outside the JSON object.`;
  }

  protected parseResponse(text: string): TechnicalSkillsAnalysis {
    // Remove any markdown formatting if present
    const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
    let parsed: TechnicalSkillsAnalysis;

    console.log('Parsed response:', cleanText);
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.log('Initial parse failed, attempting cleanup...', parseError);

      // More aggressive cleanup for common JSON issues
      let fixedText = cleanText
        // Remove any text before the first {
        .replace(/^[^{]*/, '')
        // Remove any text after the last }
        .replace(/}[^}]*$/, '}')
        // Fix escaped newlines
        .replace(/\\n/g, ' ')
        // Fix actual newlines in strings
        .replace(/(["])([^"]*)\n([^"]*)(["])/g, '$1$2 $3$4')
        // Fix missing quotes around string values
        .replace(/:\s*([^",\{\[\]\}\s][^,\{\[\]\}]*[^",\{\[\]\}\s])(\s*[,\}\]])/g, ':"$1"$2')
        // Remove trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix missing commas between objects
        .replace(/}(\s*{)/g, '},$1')
        .trim();

      // Balance brackets and braces from the start
      const stack = [];
      const chars = fixedText.split('');
      let balanced = '';

      for (const char of chars) {
        if (char === '{' || char === '[') {
          stack.push(char);
          balanced += char;
        } else if (char === '}') {
          if (stack[stack.length - 1] === '{') {
            stack.pop();
            balanced += char;
          }
        } else if (char === ']') {
          if (stack[stack.length - 1] === '[') {
            stack.pop();
            balanced += char;
          }
        } else {
          balanced += char;
        }
      }

      // Close any remaining open structures
      while (stack.length > 0) {
        const last = stack.pop();
        balanced += last === '{' ? '}' : ']';
      }

      console.log('Cleaned JSON:', balanced);

      try {
        parsed = JSON.parse(balanced);
      } catch (secondError) {
        console.error('Failed to parse even after cleanup:', secondError);
        parsed = {
          technicalSkills: [],
          technicalProjects: [],
          certifications: [],
          recommendations: []
        };
      }
    }

    // Ensure all arrays exist and are valid
    parsed.technicalSkills = Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [];
    parsed.technicalProjects = Array.isArray(parsed.technicalProjects) ? parsed.technicalProjects : [];
    parsed.certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];
    parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

    // Validate and clean each technical skill
    parsed.technicalSkills = parsed.technicalSkills
      .filter(skill => skill && typeof skill === 'object')
      .map(skill => ({
        name: String(skill.name || ''),
        category: this.validateCategory(String(skill.category || 'other')),
        level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)
          ? skill.level
          : 'intermediate',
        yearsOfExperience: Number(skill.yearsOfExperience) || 0,
        lastUsed: Number(skill.lastUsed) || new Date().getFullYear(),
        context: Array.isArray(skill.context) ? skill.context.map(String) : []
      }));

    return parsed;
  }

  private validateCategory(category: string): 'programming' | 'database' | 'cloud' | 'tool' | 'methodology' | 'monitoring' | 'framework' {
    const validCategories = [
      'programming', 'database', 'cloud', 'tool', 'methodology', 'monitoring', 'framework'
    ] as const;

    // Normalize the category
    const normalizedCategory = category.toLowerCase().trim();

    // Check if it's a valid category
    if (validCategories.includes(normalizedCategory as any)) {
      return normalizedCategory as 'programming' | 'database' | 'cloud' | 'tool' | 'methodology' | 'monitoring' | 'framework';
    }

    // Map common variations to valid categories
    const categoryMapping: { [key: string]: 'programming' | 'database' | 'cloud' | 'tool' | 'methodology' | 'monitoring' | 'framework' } = {
      'language': 'programming',
      'lang': 'programming',
      'db': 'database',
      'databases': 'database',
      'aws': 'cloud',
      'azure': 'cloud',
      'gcp': 'cloud',
      'docker': 'cloud',
      'kubernetes': 'cloud',
      'k8s': 'cloud',
      'devops': 'methodology',
      'agile': 'methodology',
      'scrum': 'methodology',
      'ci/cd': 'methodology',
      'cicd': 'methodology',
      'git': 'tool',
      'jira': 'tool',
      'jenkins': 'tool',
      'prometheus': 'monitoring',
      'grafana': 'monitoring',
      'elk': 'monitoring',
      'react': 'framework',
      'angular': 'framework',
      'vue': 'framework',
      'django': 'framework',
      'spring': 'framework',
      'express': 'framework',
      'node': 'framework',
      'other': 'tool'
    };

    return categoryMapping[normalizedCategory] || 'tool';
  }
} 