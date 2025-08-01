const axios = require('axios');
const foodQualityService = require('./foodQualityService');

class FoodApiService {
  constructor() {
    this.usdaApiKey = process.env.USDA_API_KEY;
    this.nutritionixAppId = process.env.NUTRITIONIX_APP_ID;
    this.nutritionixApiKey = process.env.NUTRITIONIX_API_KEY;
    this.openFoodFactsBaseUrl = 'https://world.openfoodfacts.org';
  }

    /**
   * Search for food items across multiple APIs
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of food items
   */
  async searchFoods(query, limit = 25) {
    try {


      // Search across multiple APIs in parallel
      const [usdaResults, nutritionixResults, openFoodFactsResults] = await Promise.allSettled([
        this.searchUSDA(query, Math.ceil(limit / 3)),
        this.searchNutritionix(query, Math.ceil(limit / 3)),
        this.searchOpenFoodFacts(query, Math.ceil(limit / 3))
      ]);

      // Combine results from all APIs
      let allResults = [];

      if (usdaResults.status === 'fulfilled') {
        allResults = allResults.concat(usdaResults.value);
      }

      if (nutritionixResults.status === 'fulfilled') {
        allResults = allResults.concat(nutritionixResults.value);
      }

      if (openFoodFactsResults.status === 'fulfilled') {
        allResults = allResults.concat(openFoodFactsResults.value);
      }

      // Process results using quality service
      const processedResults = foodQualityService.processResults(allResults, query);

      return processedResults.slice(0, limit);

    } catch (error) {
      console.error('Food search error:', error.message);
      return [];
    }
  }

  /**
   * Search USDA Food Database
   */
  async searchUSDA(query, limit = 10) {
    if (!this.usdaApiKey) {
      return [];
    }

    try {
      const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
        params: {
          api_key: this.usdaApiKey,
          query: query,
          pageSize: limit,
          dataType: 'Foundation,SR Legacy,Survey (FNDDS)'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.foods) {
        return [];
      }

      return response.data.foods
        .filter(food => food.description && food.foodNutrients)
        .map(food => this.transformUSDAFood(food));

    } catch (error) {
      console.error('USDA search error:', error.message);
      return [];
    }
  }

  /**
   * Search Nutritionix API
   */
  async searchNutritionix(query, limit = 10) {
    if (!this.nutritionixAppId || !this.nutritionixApiKey) {
      return [];
    }

    try {
      const response = await axios.post('https://trackapi.nutritionix.com/v2/search/instant', {
        query: query,
        branded: true,
        common: true
      }, {
        headers: {
          'x-app-id': this.nutritionixAppId,
          'x-app-key': this.nutritionixApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!response.data) {
        return [];
      }

      const results = [];

      // Process branded foods
      if (response.data.branded) {
        results.push(...response.data.branded.slice(0, Math.ceil(limit / 2)));
      }

      // Process common foods
      if (response.data.common) {
        results.push(...response.data.common.slice(0, Math.ceil(limit / 2)));
      }

      return results.map(food => this.transformNutritionixFood(food));

    } catch (error) {
      console.error('Nutritionix search error:', error.message);
      return [];
    }
  }

  /**
   * Search OpenFoodFacts API
   */
  async searchOpenFoodFacts(query, limit = 10) {
    try {
      const response = await axios.get(`${this.openFoodFactsBaseUrl}/cgi/search.pl`, {
        params: {
          search_terms: query,
          page_size: limit,
          json: 1
        },
        timeout: 10000
      });

      if (!response.data || !response.data.products) {
        return [];
      }

      return response.data.products
        .filter(product => product.product_name && product.nutriments)
        .map(product => this.transformOpenFoodFactsProduct(product));

    } catch (error) {
      console.error('OpenFoodFacts search error:', error.message);
      return [];
    }
  }

  /**
   * Get food item by barcode
   */
  async getFoodByBarcode(barcode) {
    try {
      // Try OpenFoodFacts first (best for barcodes)
      const openFoodFactsResult = await this.getOpenFoodFactsByBarcode(barcode);
      if (openFoodFactsResult) {
        return openFoodFactsResult;
      }

      // Try Nutritionix if OpenFoodFacts fails
      const nutritionixResult = await this.getNutritionixByBarcode(barcode);
      if (nutritionixResult) {
        return nutritionixResult;
      }

      return null;

    } catch (error) {
      console.error('Barcode lookup error:', error.message);
      return null;
    }
  }

  /**
   * Get food by barcode from OpenFoodFacts
   */
  async getOpenFoodFactsByBarcode(barcode) {
    try {
      const response = await axios.get(`${this.openFoodFactsBaseUrl}/api/v0/product/${barcode}`, {
        params: { json: 1 },
        timeout: 10000
      });

      if (!response.data || response.data.status === 0) {
        return null;
      }

      return this.transformOpenFoodFactsProduct(response.data.product);

    } catch (error) {
      console.error('OpenFoodFacts barcode lookup error:', error.message);
      return null;
    }
  }

  /**
   * Get food by barcode from Nutritionix
   */
  async getNutritionixByBarcode(barcode) {
    if (!this.nutritionixAppId || !this.nutritionixApiKey) {
      return null;
    }

    try {
      const response = await axios.post('https://trackapi.nutritionix.com/v2/search/item', {
        upc: barcode
      }, {
        headers: {
          'x-app-id': this.nutritionixAppId,
          'x-app-key': this.nutritionixApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.foods || response.data.foods.length === 0) {
        return null;
      }

      return this.transformNutritionixFood(response.data.foods[0]);

    } catch (error) {
      console.error('Nutritionix barcode lookup error:', error.message);
      return null;
    }
  }

  /**
   * Transform USDA food to our format
   */
  transformUSDAFood(food) {
    const nutrients = {};
    if (food.foodNutrients) {
      food.foodNutrients.forEach(nutrient => {
        if (nutrient.nutrientName && nutrient.value) {
          nutrients[nutrient.nutrientName.toLowerCase()] = nutrient.value;
        }
      });
    }

    // Get serving size (default to 100g if not specified)
    const servingSize = food.servingSize || food.serving_size || 100;
    const servingUnit = food.servingUnit || food.serving_unit || 'g';

    // Calculate nutrition per actual serving (not per 100g)
    const servingRatio = servingSize / 100;

    return {
      id: `usda_${food.fdcId}`,
      name: food.description || 'Unknown Product',
      brand: food.brandOwner || food.brandName || '',
      barcode: food.gtinUpc || '',
      nutrition: {
        calories_per_serving: Math.round((nutrients['energy'] || nutrients['calories'] || 0) * servingRatio),
        protein_grams: Math.round((nutrients['protein'] || 0) * servingRatio * 10) / 10,
        carbs_grams: Math.round((nutrients['carbohydrate, by difference'] || nutrients['carbohydrates'] || 0) * servingRatio * 10) / 10,
        fat_grams: Math.round((nutrients['total lipid (fat)'] || nutrients['fat'] || 0) * servingRatio * 10) / 10,
        fiber_grams: Math.round((nutrients['fiber, total dietary'] || nutrients['fiber'] || 0) * servingRatio * 10) / 10,
        sugar_grams: Math.round((nutrients['sugars, total including nlea'] || nutrients['sugar'] || 0) * servingRatio * 10) / 10,
        sodium_mg: Math.round((nutrients['sodium, na'] || nutrients['sodium'] || 0) * servingRatio * 10) / 10
      },
      serving: {
        size: servingSize,
        unit: servingUnit
      },
      source: 'usda',
      source_id: food.fdcId.toString(),
      dataType: food.dataType,
      publishedDate: food.publishedDate
    };
  }

  /**
   * Transform Nutritionix food to our format
   */
  transformNutritionixFood(food) {
    return {
      id: `nutritionix_${food.nix_item_id || food.food_name}`,
      name: food.food_name || food.foodName || 'Unknown Product',
      brand: food.brand_name || food.brandName || '',
      barcode: food.upc || '',
      nutrition: {
        calories_per_serving: Math.round(food.nf_calories || food.calories || 0),
        protein_grams: Math.round((food.nf_protein || food.protein || 0) * 10) / 10,
        carbs_grams: Math.round((food.nf_total_carbohydrate || food.carbs || 0) * 10) / 10,
        fat_grams: Math.round((food.nf_total_fat || food.fat || 0) * 10) / 10,
        fiber_grams: Math.round((food.nf_dietary_fiber || food.fiber || 0) * 10) / 10,
        sugar_grams: Math.round((food.nf_sugars || food.sugar || 0) * 10) / 10,
        sodium_mg: Math.round((food.nf_sodium || food.sodium || 0) * 10) / 10
      },
      serving: {
        size: food.serving_qty || 100,
        unit: food.serving_unit || 'g'
      },
      source: 'nutritionix',
      source_id: food.nix_item_id || food.food_name,
      photo: food.photo?.thumb || food.photo?.highres,
      servingWeight: food.serving_weight_grams
    };
  }

    /**
   * Transform OpenFoodFacts product to our format
   */
  transformOpenFoodFactsProduct(product) {
    const nutriments = product.nutriments || {};

    // Log the product to see what serving data is available
    console.log('OpenFoodFacts product serving data:', {
      serving_size: product.serving_size,
      quantity: product.quantity,
      serving_unit: product.serving_unit,
      unit: product.unit,
      nutriments: nutriments
    });

    // Parse serving size from various formats
    const parseServingSize = (size) => {
      if (typeof size === 'number') {
        return size;
      }

      if (typeof size !== 'string') {
        return 100; // default fallback
      }

      // Try to extract number from strings like "1 pouch (49 g) (49 g)" or "100g" or "1 cup"
      const numberMatch = size.match(/(\d+(?:\.\d+)?)/);
      if (numberMatch) {
        return parseFloat(numberMatch[1]);
      }

      return 100; // default fallback
    };

    // Get serving size (default to 100g if not specified)
    const servingSize = parseServingSize(product.serving_size || product.quantity);
    const servingUnit = product.serving_unit || product.unit || 'g';

    // Calculate nutrition per actual serving (not per 100g)
    const servingRatio = servingSize / 100;

    return {
      id: `openfoodfacts_${product.code || product._id}`,
      name: product.product_name || product.generic_name || 'Unknown Product',
      brand: product.brands || product.brand_owner || '',
      barcode: product.code,
      nutrition: {
        calories_per_serving: Math.round((nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || nutriments['energy_100g'] / 4.184 || 0)),
        protein_grams: Math.round((nutriments.proteins_serving || nutriments.proteins_100g || 0) * 10) / 10,
        carbs_grams: Math.round((nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat_grams: Math.round((nutriments.fat_serving || nutriments.fat_100g || 0) * 10) / 10,
        fiber_grams: Math.round((nutriments.fiber_serving || nutriments.fiber_100g || 0) * 10) / 10,
        sugar_grams: Math.round((nutriments.sugars_serving || nutriments.sugars_100g || 0) * 10) / 10,
        sodium_mg: Math.round((nutriments.sodium_serving || nutriments.sodium_100g || 0) * 10) / 10
      },
      serving: {
        size: servingSize,
        unit: servingUnit
      },
      source: 'openfoodfacts',
      source_id: product.code,
      image_url: product.image_front_url || product.image_url,
      ingredients: product.ingredients_text,
      allergens: product.allergens_tags,
      nutrition_grade: product.nutrition_grade_fr || product.nutrition_grade,
      nova_group: product.nova_group,
      ecoscore_grade: product.ecoscore_grade
    };
  }


}

module.exports = new FoodApiService();