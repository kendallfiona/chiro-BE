import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

interface User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UsersData {
  users: User[];
}

const USERS_FILE = path.join(__dirname, 'users.json');

export class AuthService {
  private static usersData: UsersData = { users: [] };

  static {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      this.usersData = JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      this.usersData = { users: [] };
    }
  }

  private static saveUsers() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.usersData, null, 2));
    } catch (error) {
      console.error('Error saving users file:', error);
      throw new Error('Failed to save user data');
    }
  }

  static async login(username: string, password: string): Promise<User> {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Attempting login',
      username
    }));

    const user = this.usersData.users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      console.log(JSON.stringify({
        level: 'warn',
        message: 'Login failed - invalid credentials',
        username
      }));
      throw new Error('Invalid credentials');
    }

    console.log(JSON.stringify({
      level: 'info',
      message: 'Login successful',
      username: user.username
    }));

    return user;
  }

  static async signup(username: string, password: string, firstName: string, lastName: string): Promise<User> {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Attempting signup',
      username
    }));

    if (this.usersData.users.some(u => u.username === username)) {
      console.log(JSON.stringify({
        level: 'warn',
        message: 'Signup failed - username exists',
        username
      }));
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: Date.now(),
      username,
      password,
      firstName,
      lastName
    };

    this.usersData.users.push(newUser);
    this.saveUsers();

    console.log(JSON.stringify({
      level: 'info',
      message: 'Signup successful',
      username: newUser.username
    }));

    return newUser;
  }

  static generateToken(userId: number, username: string): string {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error(JSON.stringify({
        level: 'error',
        message: 'JWT_SECRET is not defined'
      }));
      throw new Error('Server configuration error');
    }

    return jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
} 