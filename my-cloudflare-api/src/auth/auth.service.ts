import { User, UserCreateInput, UserResponse } from '../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export class AuthService {
  constructor(private db: D1Database) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; user: UserResponse }> {
    const { username, password } = registerDto;

    // Cek apakah username sudah ada
    const existingUser = await this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (existingUser) {
      throw new Error('Username sudah digunakan');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Buat user baru
    const result = await this.db
      .prepare('INSERT INTO users (username, password, created_at, updated_at) VALUES (?, ?, datetime("now"), datetime("now"))')
      .bind(username, hashedPassword)
      .run();

    if (!result.success) {
      throw new Error('Gagal membuat user');
    }

    // Ambil user yang baru dibuat
    const newUser = await this.db
      .prepare('SELECT id, username, created_at, updated_at FROM users WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first() as UserResponse;

    return {
      message: 'User berhasil dibuat',
      user: newUser,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: UserResponse }> {
    const { username, password } = loginDto;

    // Cari user berdasarkan username
    const user = await this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first() as User;

    if (!user) {
      throw new Error('Username atau password salah');
    }

    // Verifikasi password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Username atau password salah');
    }

    // Buat JWT token
    const access_token = await this.generateJWTToken({
      userId: user.id,
      username: user.username,
    });

    // Return tanpa password
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      access_token,
      user: userResponse,
    };
  }

  async getUserById(userId: number): Promise<UserResponse | null> {
    const user = await this.db
      .prepare('SELECT id, username, created_at, updated_at FROM users WHERE id = ?')
      .bind(userId)
      .first() as UserResponse;

    return user || null;
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  private async generateJWTToken(payload: { userId: number; username: string }): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(jwtPayload));
    
    const secret = 'flowly-secret-key'; // Dalam production, gunakan environment variable
    const signature = await this.sign(`${encodedHeader}.${encodedPayload}`, secret);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private async sign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataBuffer = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
    const signatureArray = Array.from(new Uint8Array(signature));
    return btoa(String.fromCharCode(...signatureArray));
  }

  async verifyJWTToken(token: string): Promise<{ userId: number; username: string } | null> {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      if (!encodedHeader || !encodedPayload || !signature) {
        return null;
      }

      const secret = 'flowly-secret-key';
      const expectedSignature = await this.sign(`${encodedHeader}.${encodedPayload}`, secret);
      
      if (signature !== expectedSignature) {
        return null;
      }

      const payload = JSON.parse(atob(encodedPayload));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        return null; // Token expired
      }

      return {
        userId: payload.userId,
        username: payload.username,
      };
    } catch (error) {
      return null;
    }
  }
}
