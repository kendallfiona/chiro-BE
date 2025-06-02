import axios from 'axios';
import { TransformedWeatherData, WeatherData } from './types';

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is not set');
}

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherService {
  static async getWeatherByCity(city: string): Promise<TransformedWeatherData> {
    try {
      console.log('Making request to OpenWeather API for city:', city);
      console.log('Using API Key:', API_KEY ? 'Present' : 'Missing');
      
      const response = await axios.get<WeatherData>(`${BASE_URL}/weather`, {
        params: { q: city, appid: API_KEY, units: 'metric' },
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', JSON.stringify(response.data, null, 2));
      
      return WeatherTransformService.transformWeatherData(response.data);
    } catch (error: any) {
      console.error('OpenWeather API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        throw new Error('City not found.');
      }
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
}

export class WeatherTransformService {
  static transformWeatherData(data: WeatherData): TransformedWeatherData {
    console.log('Transforming weather data:', JSON.stringify(data, null, 2));
    return data;
  }
} 