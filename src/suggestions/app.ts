import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios, { AxiosError } from 'axios';
import { CityService } from './service';
import { verifyToken, createUnauthorizedResponse } from './auth';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // Verify token first
  console.log(JSON.stringify({
    level: 'info',
    message: 'Verifying token'
  }));
  
  const authResult = verifyToken(event);
  if (authResult) {
    console.log(JSON.stringify({
      level: 'warn',
      message: 'Token verification failed',
      result: authResult
    }));
    return authResult;
  }

  console.log(JSON.stringify({
    level: 'info',
    message: 'Token verified successfully'
  }));

  const query = event.queryStringParameters?.query;
  console.log(JSON.stringify({
    level: 'info',
    message: 'Processing query parameter',
    query: query
  }));

  if (!query) {
    console.log(JSON.stringify({
      level: 'warn',
      message: 'Missing query parameter'
    }));
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: "Query parameter is required." })
    };
  }

  try {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Fetching city suggestions',
      query: query
    }));

    const suggestions = await CityService.getCitySuggestions(query);
    
    console.log(JSON.stringify({
      level: 'info',
      message: 'Successfully fetched suggestions',
      suggestions: suggestions
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(suggestions)
    };
  } catch (error: unknown) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Error fetching city suggestions',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }));
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(JSON.stringify({
        level: 'error',
        message: 'Axios error details',
        error: {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: axiosError.config
        }
      }));
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: "Failed to fetch city suggestions." })
    };
  }
}; 