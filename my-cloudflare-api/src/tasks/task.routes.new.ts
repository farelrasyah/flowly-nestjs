import { Hono } from 'hono';
import { TaskService } from '../services/task.service';
import { AuthService } from '../auth/auth.service';
import { validateCreateTaskDto } from './dto/create-task.dto';
import { validateUpdateTaskDto } from './dto/update-task.dto';

export function createTaskRoutes(app: Hono<{ Bindings: { DB: D1Database } }>) {
  // Helper function untuk authentication
  const getAuthenticatedUser = async (c: any) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const authService = new AuthService(c.env.DB);
    
    const decoded = await authService.verifyJWTToken(token);
    return decoded;
  };

  // POST /api/tasks - Buat task baru
  app.post('/api/tasks', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const body = await c.req.json();
      
      const validation = validateCreateTaskDto(body);
      if (!validation.isValid) {
        return c.json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        }, 400);
      }

      const taskService = new TaskService(c.env.DB);
      const result = await taskService.createTask(user.userId, body);

      return c.json({
        success: true,
        ...result,
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }, 500);
    }
  });

  // GET /api/tasks - Ambil semua tasks user
  app.get('/api/tasks', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const kategori = c.req.query('kategori');
      const taskService = new TaskService(c.env.DB);
      const result = await taskService.getUserTasks(user.userId, kategori);

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

  // GET /api/tasks/:id - Ambil task berdasarkan ID
  app.get('/api/tasks/:id', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const taskId = parseInt(c.req.param('id'));
      if (isNaN(taskId)) {
        return c.json({
          success: false,
          message: 'Task ID tidak valid',
        }, 400);
      }

      const taskService = new TaskService(c.env.DB);
      const result = await taskService.getTaskById(user.userId, taskId);

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

  // PUT /api/tasks/:id - Update task
  app.put('/api/tasks/:id', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const taskId = parseInt(c.req.param('id'));
      if (isNaN(taskId)) {
        return c.json({
          success: false,
          message: 'Task ID tidak valid',
        }, 400);
      }

      const body = await c.req.json();
      
      const validation = validateUpdateTaskDto(body);
      if (!validation.isValid) {
        return c.json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        }, 400);
      }

      const taskService = new TaskService(c.env.DB);
      const result = await taskService.updateTask(user.userId, taskId, body);

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

  // PATCH /api/tasks/:id/status - Toggle status task
  app.patch('/api/tasks/:id/status', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const taskId = parseInt(c.req.param('id'));
      if (isNaN(taskId)) {
        return c.json({
          success: false,
          message: 'Task ID tidak valid',
        }, 400);
      }

      const taskService = new TaskService(c.env.DB);
      const result = await taskService.toggleTaskStatus(user.userId, taskId);

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

  // DELETE /api/tasks/:id - Hapus task
  app.delete('/api/tasks/:id', async (c) => {
    try {
      const user = await getAuthenticatedUser(c);
      if (!user) {
        return c.json({
          success: false,
          message: 'Token tidak valid',
        }, 401);
      }

      const taskId = parseInt(c.req.param('id'));
      if (isNaN(taskId)) {
        return c.json({
          success: false,
          message: 'Task ID tidak valid',
        }, 400);
      }

      const taskService = new TaskService(c.env.DB);
      const result = await taskService.deleteTask(user.userId, taskId);

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
}
