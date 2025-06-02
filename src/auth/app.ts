import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleLogin } from './handlers/login';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: ''
    };
  }

  try {
    if (method === 'POST') {
      if (path === '/auth/login') {
        return await handleLogin(event);
      }
    }

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Not Found' })
    };
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Error in auth handler',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }));

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 