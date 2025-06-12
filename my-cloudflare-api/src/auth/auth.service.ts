import { User, UserCreateInput, UserResponse } from '../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from './email.service';

export class AuthService {
  private emailService: EmailService;

  constructor(private db: D1Database, resendApiKey?: string, fromEmail?: string) {
    const apiKey = resendApiKey || 'demo-key';
    const email = fromEmail || 'onboarding@resend.dev';
    this.emailService = new EmailService(apiKey, email);
  }

  async register(registerDto: RegisterDto): Promise<{ message: string; user: UserResponse }> {
    const { username, email, password } = registerDto;

    // Cek apakah username sudah ada
    const existingUsername = await this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (existingUsername) {
      throw new Error('Username sudah digunakan');
    }

    // Cek apakah email sudah ada
    const existingEmail = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingEmail) {
      throw new Error('Email sudah digunakan');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate verification token
    const verificationToken = await this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Buat user baru
    const result = await this.db
      .prepare(`
        INSERT INTO users (username, email, password, email_verified, verification_token, verification_token_expires, created_at, updated_at) 
        VALUES (?, ?, ?, FALSE, ?, ?, datetime("now"), datetime("now"))
      `)
      .bind(username, email, hashedPassword, verificationToken, verificationExpires)
      .run();

    if (!result.success) {
      throw new Error('Gagal membuat user');
    }

    // Kirim email verifikasi
    await this.emailService.sendVerificationEmail(email, username, verificationToken);

    // Ambil user yang baru dibuat
    const newUser = await this.db
      .prepare('SELECT id, username, email, email_verified, created_at, updated_at FROM users WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first() as UserResponse;

    return {
      message: 'User berhasil dibuat. Silakan cek email untuk verifikasi.',
      user: newUser,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.db
      .prepare('SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > datetime("now")')
      .bind(token)
      .first() as User;

    if (!user) {
      throw new Error('Token verifikasi tidak valid atau sudah kedaluwarsa');
    }

    // Update user sebagai verified
    await this.db
      .prepare('UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL, updated_at = datetime("now") WHERE id = ?')
      .bind(user.id)
      .run();

    return {
      message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: UserResponse }> {
    const { usernameOrEmail, password } = loginDto;

    // Cari user berdasarkan username atau email
    const user = await this.db
      .prepare('SELECT * FROM users WHERE username = ? OR email = ?')
      .bind(usernameOrEmail, usernameOrEmail)
      .first() as User;

    if (!user) {
      throw new Error('Username/email atau password salah');
    }

    // Cek apakah email sudah diverifikasi
    if (!user.email_verified) {
      throw new Error('Email belum diverifikasi. Silakan cek email Anda.');
    }

    // Verifikasi password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Username/email atau password salah');
    }

    // Buat JWT token
    const access_token = await this.generateJWTToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    // Return tanpa password
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      email_verified: user.email_verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      access_token,
      user: userResponse,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Cari user berdasarkan email
    const user = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first() as User;

    if (!user) {
      // Untuk keamanan, jangan kasih tahu kalau email tidak ditemukan
      return {
        message: 'Jika email terdaftar, kode OTP telah dikirim.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Simpan OTP ke database
    await this.db
      .prepare('UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(otp, otpExpires, user.id)
      .run();

    // Kirim email OTP
    await this.emailService.sendPasswordResetOTP(email, user.username, otp);

    return {
      message: 'Jika email terdaftar, kode OTP telah dikirim.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; valid: boolean }> {
    const { email, otp } = verifyOtpDto;

    // Cari user dengan email dan OTP yang valid
    const user = await this.db
      .prepare('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > datetime("now")')
      .bind(email, otp)
      .first() as User;

    if (!user) {
      return {
        message: 'OTP tidak valid atau sudah kedaluwarsa',
        valid: false,
      };
    }

    return {
      message: 'OTP valid. Silakan masukkan password baru.',
      valid: true,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verifikasi OTP terlebih dahulu
    const otpVerification = await this.verifyOtp({ email, otp });
    if (!otpVerification.valid) {
      throw new Error('OTP tidak valid atau sudah kedaluwarsa');
    }

    // Hash password baru
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password dan hapus OTP
    await this.db
      .prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = datetime("now") WHERE email = ?')
      .bind(hashedPassword, email)
      .run();

    return {
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    };
  }

  async getUserById(userId: number): Promise<UserResponse | null> {
    const user = await this.db
      .prepare('SELECT id, username, email, email_verified, created_at, updated_at FROM users WHERE id = ?')
      .bind(userId)
      .first() as UserResponse;

    return user || null;
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.db
      .prepare('SELECT * FROM users WHERE email = ? AND email_verified = FALSE')
      .bind(email)
      .first() as User;

    if (!user) {
      throw new Error('Email tidak ditemukan atau sudah diverifikasi');
    }

    // Generate verification token baru
    const verificationToken = await this.generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Update token verifikasi
    await this.db
      .prepare('UPDATE users SET verification_token = ?, verification_token_expires = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(verificationToken, verificationExpires, user.id)
      .run();

    // Kirim email verifikasi
    await this.emailService.sendVerificationEmail(email, user.username, verificationToken);

    return {
      message: 'Email verifikasi telah dikirim ulang.',
    };
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

  private async generateToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async generateJWTToken(payload: { userId: number; username: string; email: string }): Promise<string> {
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

  async verifyJWTToken(token: string): Promise<{ userId: number; username: string; email: string } | null> {
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
        email: payload.email,
      };
    } catch (error) {
      return null;
    }
  }
}
