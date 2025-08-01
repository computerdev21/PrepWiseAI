import { BaseAnalyzer } from './base-analyzer';
import { model } from '../../lib/vertexai';
import { AnalysisRequest, AhaAnalysis } from '../../types/analysis';

export class AhaMomentsAnalyzer extends BaseAnalyzer<AhaAnalysis> {
  protected buildPrompt(request: AnalysisRequest): string {
    return `You are an AI specialized in identifying hidden talents and their international equivalents.
Analyze the following resume and identify skills or experiences that might have different names
or higher value in the Canadian market. Focus on:
1. Project management methodologies
2. Leadership roles and responsibilities
3. Technical implementations
4. Industry-specific processes
5. Regional expertise or specializations

Resume text:
${request.resumeText}

Return a JSON object with exactly this structure:
{
  "hiddenSkills": [
    {
      "originalSkill": {
        "name": "skill name",
        "context": "how it was demonstrated",
        "location": "where it was used"
      },
      "equivalentSkill": {
        "name": "Canadian equivalent name",
        "market": "Canadian market",
        "confidence": 0.95,
        "description": "why this is equivalent"
      },
      "potentialRoles": ["role1", "role2"],
      "marketValue": {
        "salary": {
          "min": 75000,
          "max": 120000,
          "currency": "CAD"
        },
        "demandLevel": "high"
      }
    }
  ],
  "insightSummary": "encouraging summary of the findings"
}

IMPORTANT:
1. Return ONLY the JSON object
2. Ensure all values are properly typed
3. Keep descriptions under 200 characters
4. Include only high-confidence matches
5. Focus on Canadian market equivalents`;
  }

  protected parseResponse(text: string): AhaAnalysis {
    try {
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

      // Try to parse the JSON
      let parsed: AhaAnalysis;
      try {
        parsed = JSON.parse(cleanText);
      } catch (parseError) {
        // If parsing fails, try to clean up common issues
        const fixedText = cleanText
          // Fix unterminated strings by adding missing quotes
          .replace(/([^"])(")([^"]*$)/g, '$1$2$3"')
          // Remove any trailing commas in arrays and objects
          .replace(/,(\s*[}\]])/g, '$1')
          // Ensure arrays and objects are properly closed
          .replace(/([^}\]])\s*$/g, '$1}')
          .trim();
        parsed = JSON.parse(fixedText);
      }

      // Validate the structure and return
      return {
        hiddenSkills: Array.isArray(parsed?.hiddenSkills)
          ? parsed.hiddenSkills.map((skill: any) => ({
            originalSkill: {
              name: String(skill.originalSkill?.name || ''),
              context: String(skill.originalSkill?.context || ''),
              location: String(skill.originalSkill?.location || '')
            },
            equivalentSkill: {
              name: String(skill.equivalentSkill?.name || ''),
              market: String(skill.equivalentSkill?.market || 'Canadian'),
              confidence: Number(skill.equivalentSkill?.confidence || 0),
              description: String(skill.equivalentSkill?.description || '').slice(0, 200)
            },
            potentialRoles: Array.isArray(skill.potentialRoles)
              ? skill.potentialRoles.map(String)
              : [],
            marketValue: {
              salary: {
                min: Number(skill.marketValue?.salary?.min || 0),
                max: Number(skill.marketValue?.salary?.max || 0),
                currency: String(skill.marketValue?.salary?.currency || 'CAD')
              },
              demandLevel: ['high', 'medium', 'low'].includes(skill.marketValue?.demandLevel)
                ? skill.marketValue.demandLevel as 'high' | 'medium' | 'low'
                : 'medium'
            }
          }))
          : [],
        insightSummary: String(parsed?.insightSummary || '')
      };
    } catch (error) {
      console.error('Error parsing AHA moments analysis:', error);
      return {
        hiddenSkills: [],
        insightSummary: 'Failed to analyze hidden talents.'
      };
    }
  }
} 