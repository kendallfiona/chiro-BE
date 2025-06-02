import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { WeatherService } from './weather.service';
import { WeatherError } from './types';
import { verifyToken } from './auth';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // Verify token first
  const authResult = verifyToken(event);
  if (authResult) {
    return authResult;
  }

  const city = event.queryStringParameters?.city;
  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'City parameter is required.' } as WeatherError),
    };
  }

  try {
    console.log('Fetching weather for city:', city);
    console.log('API Key available:', !!process.env.OPENWEATHER_API_KEY);
    
    const weatherData = await WeatherService.getWeatherByCity(city);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(weatherData),
    };
  } catch (error: any) {
    console.error('Error fetching weather:', error);
    if (error.message === 'City not found.') {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: error.message } as WeatherError),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to fetch weather data.' } as WeatherError),
    };
  }
}; 