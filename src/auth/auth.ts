import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Request body is required' })
      };
    }

    const parsedBody = JSON.parse(event.body);
    const userFilePath = path.join(__dirname, 'users.json');
    let users: User[] = JSON.parse(fs.readFileSync(userFilePath, 'utf-8'));

    // Handle Login request
    if (event.path === '/auth/login') {
      const { username, password } = parsedBody;

      // Find user by username and password
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      // Get JWT secret from environment variables
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username 
        },
        jwtSecret,
        { expiresIn: '1h' }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Authentication successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
          }
        })
      };

    } else if (event.path === '/auth/signup') {
      const { username, password, firstName, lastName } = parsedBody;

      // Validate input
      if (!username || !password || !firstName || !lastName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'All fields are required' })
        };
      }

      // Check if username already exists
      if (users.find(u => u.username === username)) {
        return {
          statusCode: 409,
          body: JSON.stringify({ message: 'Username already exists' })
        };
      }

      // Generate a simple unique ID (you might want a more robust method in production)
      const newUser = {
        id: Date.now().toString(), // Simple timestamp as ID
        username,
        password, // In a real app, you should hash the password
        firstName,
        lastName,
      };

      users.push(newUser);

      // Save updated users to users.json
      fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf-8');

      // Get JWT secret from environment variables
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        // This error should ideally be caught during application startup, but handled here as a fallback.
        console.error('JWT_SECRET environment variable is not set.');
        return {
           statusCode: 500,
           body: JSON.stringify({ message: 'Server configuration error.' })
        };
      }

      // Generate JWT token for the new user
      const token = jwt.sign(
        { 
          userId: newUser.id,
          username: newUser.username 
        },
        jwtSecret,
        { expiresIn: '1h' }
      );

      return {
        statusCode: 201, // Created
        body: JSON.stringify({
          message: 'User created successfully',
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          }
        })
      };

    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
}; 