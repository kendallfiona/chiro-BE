import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[JWT] JWT_SECRET is not defined in environment variables');
  throw new Error('JWT_SECRET not configured');
}

export const verifyToken = (event: APIGatewayProxyEvent): APIGatewayProxyResult | null => {
  
  const token = event.headers.Authorization?.split(' ')[1];

  if (!token) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'No token provided' })
    };
  }

  try {
    // First decode without verification to see the payload
    const decodedWithoutVerify = jwt.decode(token);
    console.log('[JWT] Decoded token (without verification):', JSON.stringify(decodedWithoutVerify, null, 2));
    console.log('[JWT] JWT_SECRET length:', JWT_SECRET.length);
    console.log('[JWT] JWT_SECRET first 10 chars:', JWT_SECRET.substring(0, 10));
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[JWT] Token verified successfully');
    console.log('[JWT] Decoded token:', JSON.stringify(decoded, null, 2));
    return null;
  } catch (error) {
    console.error('[JWT] Token verification failed:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[JWT] JWT Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Invalid token' })
    };
  }
};

export const createUnauthorizedResponse = (): APIGatewayProxyResult => {
  console.log('[JWT] Creating unauthorized response');
  return {
    statusCode: 401,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ message: 'Invalid token' })
  };
}; 