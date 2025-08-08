const axios = require('axios');
const logger = require('../config/logger');

class BaseGeekAIService {
  constructor() {
    this.baseGeekUrl = process.env.BASEGEEK_URL || 'https://basegeek.clintgeek.com';
    this.jwtSecret = process.env.JWT_SECRET;
  }

  async callAI(prompt, config = {}, userToken = null) {
    if (!userToken) {
      throw new Error('User token is required for AI calls');
    }

    try {
      const response = await axios.post(`${this.baseGeekUrl}/api/ai/call`, {
        prompt,
        config: {
          ...config,
          appName: 'fitnessGeek',
          // Specify Claude as preferred provider for food parsing
          provider: 'anthropic',
          // Fallback to Groq if Claude fails
          fallbackOrder: ['anthropic', 'groq', 'gemini', 'together']
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        timeout: 30000
      });

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'AI service call failed');
      }

      return response.data.data.response;
    } catch (error) {
      logger.error('baseGeek AI call failed', {
        error: error.message,
        prompt: prompt.substring(0, 100) + '...',
        statusCode: error.response?.status
      });
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  async parseFoodDescription(description, userContext = {}, userToken = null) {
    const prompt = this.buildFoodParsingPrompt(description, userContext);
    const response = await this.callAI(prompt, {
      maxTokens: 1000,
      temperature: 0.3,
      // Use Claude for food parsing - better at structured output and nutrition knowledge
      provider: 'anthropic'
    }, userToken);
    return this.parseFoodAIResponse(response);
  }

  buildFoodParsingPrompt(description, userContext) {
    return `You are a nutrition expert helping to parse natural language food descriptions into structured data.

User's dietary context: ${JSON.stringify(userContext)}

Please parse this food description: "${description}"

Return ONLY a JSON object with this exact structure:
{
  "food_items": [
    {
      "name": "Food name",
      "servings": number,
      "estimated_serving_size": "1 cup, 1 piece, etc.",
      "nutrition": {
        "calories_per_serving": number,
        "protein_grams": number,
        "carbs_grams": number,
        "fat_grams": number,
        "fiber_grams": number,
        "sugar_grams": number
      }
    }
  ],
  "meal_type": "breakfast|lunch|dinner|snack",
  "estimated_calories": number,
  "confidence": "high|medium|low"
}

Guidelines:
- Estimate reasonable serving sizes and nutrition values
- Use common food names
- Consider user's dietary preferences
- If uncertain about specific values, use reasonable estimates
- Confidence should reflect how certain you are about the parsing`;
  }

  parseFoodAIResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      if (!result.food_items || !Array.isArray(result.food_items)) {
        throw new Error('Invalid food items structure');
      }

      return result;
    } catch (error) {
      logger.error('Failed to parse food AI response', {
        responseText,
        error: error.message
      });
      throw new Error('Invalid AI response format');
    }
  }

  getStatus() {
    return {
      enabled: true,
      baseGeekUrl: this.baseGeekUrl,
      jwtSecretConfigured: !!this.jwtSecret,
      preferredProvider: 'anthropic', // Claude 3.5 Sonnet
      fallbackProvider: 'groq' // Groq Llama 3.1
    };
  }
}

module.exports = new BaseGeekAIService();
