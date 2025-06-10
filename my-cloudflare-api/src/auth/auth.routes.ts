import { Hono } from 'hono';
import { AuthService } from './auth.service';
import { validateRegisterDto } from './dto/register.dto';
import { validateLoginDto } from './dto/login.dto';

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
    }

    const authService = new AuthService(c.env.DB);
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
        errors: validation.errors,
      }, 400);
    }

    const authService = new AuthService(c.env.DB);
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
    }

    const token = authHeader.substring(7);
    const authService = new AuthService(c.env.DB);
    
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
    }

    return c.json({
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
}
