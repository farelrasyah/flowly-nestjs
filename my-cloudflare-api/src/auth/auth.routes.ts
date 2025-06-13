import { Hono } from 'hono';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { validateRegisterDto } from './dto/register.dto';
import { validateLoginDto } from './dto/login.dto';
import { validateForgotPasswordDto } from './dto/forgot-password.dto';
import { validateVerifyOtpDto } from './dto/verify-otp.dto';
import { validateResetPasswordDto } from './dto/reset-password.dto';
import { Env } from '../index';

export function createAuthRoutes(app: Hono<{ Bindings: Env }>) {
// Test endpoint untuk mengecek apakah auth routes berfungsi
app.get('/auth/test', async (c) => {
  return c.json({
    success: true,
    message: 'Auth routes berfungsi dengan baik!',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login', 
      profile: 'GET /auth/profile'
    }
  }, 200);
});

// Register endpoint
app.post('/auth/register', async (c) => {
  try {
    let body;
    
    // Tambahkan error handling untuk JSON parsing
    try {
      body = await c.req.json();
    } catch (jsonError) {
      return c.json({
        success: false,
        message: 'Invalid JSON format. Please check your request body.',
      }, 400);
    }
    
    // Validasi input
    const validation = validateRegisterDto(body);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      }, 400);
    }    const authService = new AuthService(
      c.env.DB, 
      c.env.RESEND_API_KEY, 
      c.env.SMTP_FROM_EMAIL
    );
    const result = await authService.register(body);

    return c.json({
      success: true,
      ...result,
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, error instanceof Error && error.message === 'Username sudah digunakan' ? 409 : 500);
  }
});

// Login endpoint
app.post('/auth/login', async (c) => {
  try {
    let body;
    
    // Tambahkan error handling untuk JSON parsing
    try {
      body = await c.req.json();
    } catch (jsonError) {
      return c.json({
        success: false,
        message: 'Invalid JSON format. Please check your request body.',
      }, 400);
    }
    
    // Validasi input
    const validation = validateLoginDto(body);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,      }, 400);
    }

    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    const result = await authService.login(body);

    return c.json({
      success: true,
      ...result,
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 500);
  }
});

// Profile endpoint (protected)
app.get('/auth/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        message: 'Token tidak ditemukan',
      }, 401);
    }    const token = authHeader.substring(7);
    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    
    const decoded = await authService.verifyJWTToken(token);
    if (!decoded) {
      return c.json({
        success: false,
        message: 'Token tidak valid',
      }, 401);
    }

    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      return c.json({
        success: false,
        message: 'User tidak ditemukan',
      }, 404);
    }    return c.json({
      success: true,
      message: 'Profile berhasil diambil',
      user,
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Internal server error',
    }, 500);
  }
});

// Email verification endpoint
app.get('/auth/verify-email/:token', async (c) => {  try {
    const token = c.req.param('token');
    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    
    const result = await authService.verifyEmail(token);
    
    return c.json({
      success: true,
      ...result,
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 400);
  }
});

// Forgot password endpoint
app.post('/auth/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateForgotPasswordDto(body);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,      }, 400);
    }

    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    const result = await authService.forgotPassword(body.email);

    return c.json({
      success: true,
      ...result,
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 500);
  }
});

// Verify OTP endpoint
app.post('/auth/verify-otp', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateVerifyOtpDto(body);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      }, 400);
    }    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    const result = await authService.verifyOtp({ email: body.email, otp: body.otp });

    return c.json({
      success: true,
      ...result,
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 400);
  }
});

// Reset password endpoint
app.post('/auth/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateResetPasswordDto(body);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      }, 400);
    }    const authService = new AuthService(
      c.env.DB,
      c.env.RESEND_API_KEY,
      c.env.SMTP_FROM_EMAIL
    );
    const result = await authService.resetPassword({ email: body.email, otp: body.otp, newPassword: body.newPassword });

    return c.json({
      success: true,
      ...result,
    }, 200);  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 400);
  }
});

// Google OAuth endpoints
app.get('/auth/google', async (c) => {
  try {
    const googleAuthService = new GoogleAuthService(
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      c.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = googleAuthService.getAuthUrl();
    
    return c.json({
      success: true,
      auth_url: authUrl,
      message: 'Redirect user to this URL for Google authentication'
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 500);
  }
});

app.get('/auth/google/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const error = c.req.query('error');

    if (error) {
      return c.json({
        success: false,
        message: 'Google authentication was cancelled or failed',
        error: error
      }, 400);
    }

    if (!code) {
      return c.json({
        success: false,
        message: 'Authorization code is required'
      }, 400);
    }

    const googleAuthService = new GoogleAuthService(
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      c.env.GOOGLE_REDIRECT_URI
    );

    const authService = new AuthService(
      c.env.DB, 
      c.env.RESEND_API_KEY, 
      c.env.SMTP_FROM_EMAIL
    );

    // Exchange code for tokens
    const tokens = await googleAuthService.getAccessToken(code);
    
    // Get user info from Google
    const googleUser = await googleAuthService.getUserInfo(tokens.access_token);
    
    // Register or login user
    const result = await authService.googleAuth(googleUser);
    
    return c.json({
      success: true,
      message: result.isNewUser ? 'Account created successfully' : 'Login successful',
      access_token: result.access_token,
      user: result.user,
      is_new_user: result.isNewUser
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 500);
  }
});

app.post('/auth/google/mobile', async (c) => {
  try {
    let body;
    
    try {
      body = await c.req.json();
    } catch (jsonError) {
      return c.json({
        success: false,
        message: 'Invalid JSON format. Please check your request body.',
      }, 400);
    }

    const { access_token } = body;

    if (!access_token) {
      return c.json({
        success: false,
        message: 'Google access token is required'
      }, 400);
    }

    const googleAuthService = new GoogleAuthService(
      c.env.GOOGLE_CLIENT_ID,
      c.env.GOOGLE_CLIENT_SECRET,
      c.env.GOOGLE_REDIRECT_URI
    );

    const authService = new AuthService(
      c.env.DB, 
      c.env.RESEND_API_KEY, 
      c.env.SMTP_FROM_EMAIL
    );

    // Get user info from Google using the access token
    const googleUser = await googleAuthService.getUserInfo(access_token);
    
    // Register or login user
    const result = await authService.googleAuth(googleUser);
    
    return c.json({
      success: true,
      message: result.isNewUser ? 'Account created successfully' : 'Login successful',
      access_token: result.access_token,
      user: result.user,
      is_new_user: result.isNewUser
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    }, 500);
  }
});
}
