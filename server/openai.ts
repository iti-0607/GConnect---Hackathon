import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  message: string;
  schemes?: Array<{
    name: string;
    description: string;
    eligibility: string;
  }>;
  language: string;
}

export async function processChat(message: string, userProfile?: any): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are GConnect Assistant, a helpful AI chatbot for the Indian government scheme discovery platform. You help users find and understand government schemes in both Hindi and English.

Key responsibilities:
1. Answer questions about government schemes in India
2. Help users understand eligibility criteria
3. Provide application guidance
4. Support both Hindi and English (Hinglish) communication
5. Be culturally sensitive and use appropriate Indian context

User Profile Context: ${userProfile ? JSON.stringify(userProfile) : "No profile available"}

Always respond in a friendly, helpful manner. If the user asks in Hindi/Hinglish, respond in Hindi. If they ask in English, respond in English. Provide practical, actionable information.

Format your response as JSON with the following structure:
{
  "message": "Your helpful response",
  "schemes": [optional array of relevant schemes if applicable],
  "language": "detected language (en/hi/hinglish)"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "I'm sorry, I couldn't process your request. Please try again.",
      schemes: result.schemes || [],
      language: result.language || "en"
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response
    const isHindi = /[\u0900-\u097F]/.test(message);
    return {
      message: isHindi 
        ? "माफ करें, मैं अभी आपकी मदद नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।"
        : "I'm sorry, I'm currently unable to help. Please try again later.",
      schemes: [],
      language: isHindi ? "hi" : "en"
    };
  }
}

export async function generateSchemeRecommendations(userProfile: any): Promise<string[]> {
  try {
    const prompt = `Based on this user profile, suggest 5 most relevant Indian government schemes:
    
Profile: ${JSON.stringify(userProfile)}

Respond with a JSON array of scheme names that would be most beneficial for this user.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.schemes || [];
  } catch (error) {
    console.error("Error generating scheme recommendations:", error);
    return [];
  }
}
