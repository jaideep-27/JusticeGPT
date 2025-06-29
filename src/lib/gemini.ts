import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface LegalAnalysisRequest {
  content: string;
  jurisdiction: string;
  language: string;
  documentType?: string;
  specificQuestions?: string[];
}

export interface LegalAnalysisResponse {
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
  compliance: {
    jurisdiction: string;
    compliant: boolean;
    issues: string[];
  };
  confidence: number;
}

export const analyzeLegalDocument = async (request: LegalAnalysisRequest): Promise<LegalAnalysisResponse> => {
  try {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert legal AI assistant specializing in ${request.jurisdiction} law. 
Analyze the following legal document and provide a comprehensive analysis in ${request.language}.

Document Type: ${request.documentType || 'Unknown'}
Jurisdiction: ${request.jurisdiction}
Language: ${request.language}

Document Content:
${request.content}

${request.specificQuestions ? `Specific Questions: ${request.specificQuestions.join(', ')}` : ''}

Please provide your analysis in the following JSON format:
{
  "summary": "Brief executive summary of the document",
  "keyPoints": ["key legal point 1", "key legal point 2", "..."],
  "risks": ["potential risk 1", "potential risk 2", "..."],
  "recommendations": ["recommendation 1", "recommendation 2", "..."],
  "compliance": {
    "jurisdiction": "${request.jurisdiction}",
    "compliant": true/false,
    "issues": ["compliance issue 1", "compliance issue 2", "..."]
  },
  "confidence": 85
}

IMPORTANT: 
- Always include appropriate legal disclaimers
- Remind users to consult with qualified attorneys for specific legal advice
- Provide jurisdiction-specific analysis for ${request.jurisdiction}
- Respond in ${request.language}
- Return only valid JSON
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Try to parse JSON response
    try {
      // Extract JSON from response if it's wrapped in markdown or other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: content.substring(0, 500) + '...',
        keyPoints: ['Analysis completed - see full response'],
        risks: ['Please review full analysis'],
        recommendations: ['Consult with a qualified attorney'],
        compliance: {
          jurisdiction: request.jurisdiction,
          compliant: false,
          issues: ['Manual review required']
        },
        confidence: 70
      };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze document. Please try again.');
  }
};

export const generateLegalResponse = async (
  message: string,
  jurisdiction: string,
  language: string,
  chatHistory: any[] = []
): Promise<string> => {
  try {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
You are JusticeGPT, an expert AI legal assistant specializing in ${jurisdiction} law.
Provide helpful, accurate legal information in ${language}.

Key Guidelines:
- Always specify that you provide general legal information, not legal advice
- Be jurisdiction-specific to ${jurisdiction}
- Respond in ${language}
- Include relevant legal citations when possible
- Suggest consulting with qualified attorneys for specific cases
- Be empathetic and professional
- If asked about other jurisdictions, acknowledge limitations

Current Jurisdiction: ${jurisdiction}
Response Language: ${language}

Chat History:
${chatHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Question: ${message}

Please provide a helpful, professional response in ${language}:
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text() || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

export const generateLegalDocument = async (
  documentType: string,
  parameters: any,
  jurisdiction: string,
  language: string
): Promise<string> => {
  try {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate a ${documentType} document for ${jurisdiction} jurisdiction in ${language}.

Parameters:
${JSON.stringify(parameters, null, 2)}

Requirements:
- Follow ${jurisdiction} legal standards
- Include all necessary clauses
- Use appropriate legal language
- Include standard disclaimers
- Format professionally
- Add placeholders for signatures and dates

Document Type: ${documentType}
Jurisdiction: ${jurisdiction}
Language: ${language}

Please generate a complete, professional legal document:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || 'Failed to generate document';
  } catch (error) {
    console.error('Document Generation Error:', error);
    throw new Error('Failed to generate document. Please try again.');
  }
};

// Check if Gemini is configured
export const isGeminiConfigured = (): boolean => {
  return !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key';
};