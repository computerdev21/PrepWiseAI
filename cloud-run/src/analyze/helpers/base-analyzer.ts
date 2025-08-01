import { model } from '../../lib/vertexai';
import { AnalysisRequest } from '../../types/analysis';

export abstract class BaseAnalyzer<T> {
    protected abstract buildPrompt(request: AnalysisRequest): string;
    protected abstract parseResponse(text: string): T;

    async analyze(request: AnalysisRequest): Promise<T> {
        try {
            const prompt = this.buildPrompt(request);
            const result = await model.generateContent(prompt);
            const response = await result.response;

            if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response from AI model');
            }

            return this.parseResponse(response.candidates[0].content.parts[0].text.trim());
        } catch (error) {
            console.error(`Error in ${this.constructor.name}:`, error);
            throw error;
        }
    }
} 