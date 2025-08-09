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
          // Prefer Gemini 1.5 Flash
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          // Fallback order keeps others available
          fallbackOrder: ['gemini', 'anthropic', 'groq', 'together']
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
      temperature: 0.2,
      // Use Gemini 1.5 Flash
      provider: 'gemini',
      model: 'gemini-1.5-flash'
    }, userToken);
    return this.parseFoodAIResponse(response);
  }

  buildFoodParsingPrompt(description, userContext) {
    return `You are a nutrition expert helping to parse natural language food descriptions into structured JSON data.

    User's dietary context: ${JSON.stringify(userContext)}

    Please parse this food description: "${description}"

    Return ONLY a valid JSON object following this EXACT structure (no explanations or extra text):

    {
      "food_items": [
        {
          "name": "Food name",
          "servings": number,
          "estimated_serving_size": "1 cup, 1 piece, 100 grams, etc.",
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
    - Nutrition values correspond to one serving.
    - Round nutrition values to whole numbers (use one decimal for values under 1g).
    - Use common food names.
    - Use standard serving units.
    - Respect user's dietary restrictions strictly.
    - If uncertain about meal_type, default to "snack".
    - Confidence should reflect parsing certainty.

    Example output:
    {
      "food_items": [
        {
          "name": "Grilled chicken breast",
          "servings": 1,
          "estimated_serving_size": "4 oz",
          "nutrition": {
            "calories_per_serving": 180,
            "protein_grams": 35,
            "carbs_grams": 0,
            "fat_grams": 4,
            "fiber_grams": 0,
            "sugar_grams": 0
          }
        }
      ],
      "meal_type": "lunch",
      "estimated_calories": 180,
      "confidence": "high"
    }`;
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
      preferredProvider: 'gemini', // Gemini 1.5 Flash
      fallbackProvider: 'anthropic'
    };
  }
}

module.exports = new BaseGeekAIService();
