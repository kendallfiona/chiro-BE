import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService } from '../service';

export async function handleLogin(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Processing login request'
  }));

  if (!event.body) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Username and password are required' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    
    if (!username || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Username and password are required' })
      };
    }

    const user = await AuthService.login(username, password);
    const token = AuthService.generateToken(user.id, user.username);

    console.log(JSON.stringify({
      level: 'info',
      message: 'Login successful',
      username: user.username
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      })
    };
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Login failed',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : error
    }));

    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Invalid credentials' })
    };
  }
} 