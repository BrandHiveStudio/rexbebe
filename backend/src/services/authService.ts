import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment';

export class AuthService {
  async generateToken(payload: { id: string; email: string; role: string }) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
