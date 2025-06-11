import { Task, TaskCreateInput, TaskUpdateInput, TaskResponse } from '../models/task.model';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';

export class TaskService {
  constructor(private db: D1Database) {}

  async createTask(userId: number, createTaskDto: CreateTaskDto): Promise<{ message: string; task: TaskResponse }> {
    const { judul, deskripsi, kategori, tenggat_waktu } = createTaskDto;

    const result = await this.db
      .prepare(`
        INSERT INTO tasks (user_id, judul, deskripsi, kategori, tenggat_waktu, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, 'belum_selesai', datetime("now"), datetime("now"))
      `)
      .bind(userId, judul, deskripsi || null, kategori || null, tenggat_waktu || null)
      .run();

    if (!result.success) {
      throw new Error('Gagal membuat task');
    }

    const newTask = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first() as Task;

    const taskResponse: TaskResponse = {
      id: newTask.id,
      judul: newTask.judul,
      deskripsi: newTask.deskripsi,
      kategori: newTask.kategori,
      status: newTask.status,
      tenggat_waktu: newTask.tenggat_waktu,
      created_at: newTask.created_at,
      updated_at: newTask.updated_at,
    };

    return {
      message: 'Task berhasil dibuat',
      task: taskResponse,
    };
  }

  async getUserTasks(userId: number, kategori?: string): Promise<{ message: string; tasks: TaskResponse[] }> {
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params: any[] = [userId];

    if (kategori) {
      query += ' AND kategori = ?';
      params.push(kategori);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await this.db
      .prepare(query)
      .bind(...params)
      .all() as { results: Task[] };

    const tasks: TaskResponse[] = results.map(task => ({
      id: task.id,
      judul: task.judul,
      deskripsi: task.deskripsi,
      kategori: task.kategori,
      status: task.status,
      tenggat_waktu: task.tenggat_waktu,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    return {
      message: 'Tasks berhasil diambil',
      tasks,
    };
  }

  async getTaskById(taskId: number, userId: number): Promise<TaskResponse | null> {
    const task = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .first() as Task;

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      judul: task.judul,
      deskripsi: task.deskripsi,
      kategori: task.kategori,
      status: task.status,
      tenggat_waktu: task.tenggat_waktu,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }

  async updateTask(taskId: number, userId: number, updateTaskDto: UpdateTaskDto): Promise<{ message: string; task: TaskResponse }> {
    // Cek apakah task exists dan milik user
    const existingTask = await this.getTaskById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task tidak ditemukan');
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    if (updateTaskDto.judul !== undefined) {
      updateFields.push('judul = ?');
      params.push(updateTaskDto.judul);
    }

    if (updateTaskDto.deskripsi !== undefined) {
      updateFields.push('deskripsi = ?');
      params.push(updateTaskDto.deskripsi);
    }

    if (updateTaskDto.kategori !== undefined) {
      updateFields.push('kategori = ?');
      params.push(updateTaskDto.kategori);
    }

    if (updateTaskDto.status !== undefined) {
      updateFields.push('status = ?');
      params.push(updateTaskDto.status);
    }

    if (updateTaskDto.tenggat_waktu !== undefined) {
      updateFields.push('tenggat_waktu = ?');
      params.push(updateTaskDto.tenggat_waktu);
    }

    if (updateFields.length === 0) {
      throw new Error('Tidak ada field yang diupdate');
    }

    updateFields.push('updated_at = datetime("now")');
    params.push(taskId, userId);

    const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .run();

    if (!result.success) {
      throw new Error('Gagal mengupdate task');
    }

    const updatedTask = await this.getTaskById(taskId, userId);
    
    return {
      message: 'Task berhasil diupdate',
      task: updatedTask!,
    };
  }

  async deleteTask(taskId: number, userId: number): Promise<{ message: string }> {
    // Cek apakah task exists dan milik user
    const existingTask = await this.getTaskById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task tidak ditemukan');
    }

    const result = await this.db
      .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .run();

    if (!result.success) {
      throw new Error('Gagal menghapus task');
    }

    return {
      message: 'Task berhasil dihapus',
    };
  }

  async getTasksByStatus(userId: number, status: 'selesai' | 'belum_selesai'): Promise<{ message: string; tasks: TaskResponse[] }> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC')
      .bind(userId, status)
      .all() as { results: Task[] };

    const tasks: TaskResponse[] = results.map(task => ({
      id: task.id,
      judul: task.judul,
      deskripsi: task.deskripsi,
      kategori: task.kategori,
      status: task.status,
      tenggat_waktu: task.tenggat_waktu,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    return {
      message: `Tasks dengan status ${status} berhasil diambil`,
      tasks,
    };
  }

  async getTasksByDeadline(userId: number, sortOrder: 'asc' | 'desc' = 'asc'): Promise<{ message: string; tasks: TaskResponse[] }> {
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const { results } = await this.db
      .prepare(`SELECT * FROM tasks WHERE user_id = ? AND tenggat_waktu IS NOT NULL ORDER BY tenggat_waktu ${order}`)
      .bind(userId)
      .all() as { results: Task[] };

    const tasks: TaskResponse[] = results.map(task => ({
      id: task.id,
      judul: task.judul,
      deskripsi: task.deskripsi,
      kategori: task.kategori,
      status: task.status,
      tenggat_waktu: task.tenggat_waktu,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));    return {
      message: 'Tasks berdasarkan tenggat waktu berhasil diambil',
      tasks,
    };
  }

  async toggleTaskStatus(userId: number, taskId: number): Promise<{ message: string; task: TaskResponse }> {
    // Cek apakah task ada dan milik user yang benar
    const existingTask = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .first() as Task;

    if (!existingTask) {
      throw new Error('Task tidak ditemukan');
    }

    // Toggle status
    const newStatus = existingTask.status === 'selesai' ? 'belum_selesai' : 'selesai';

    // Update task dengan status baru
    const result = await this.db
      .prepare('UPDATE tasks SET status = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?')
      .bind(newStatus, taskId, userId)
      .run();

    if (!result.success) {
      throw new Error('Gagal mengupdate status task');
    }

    // Ambil task yang sudah diupdate
    const updatedTask = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .first() as Task;

    const taskResponse: TaskResponse = {
      id: updatedTask.id,
      judul: updatedTask.judul,
      deskripsi: updatedTask.deskripsi,
      kategori: updatedTask.kategori,
      status: updatedTask.status,
      tenggat_waktu: updatedTask.tenggat_waktu,
      created_at: updatedTask.created_at,
      updated_at: updatedTask.updated_at,
    };

    return {
      message: `Status task berhasil diubah menjadi ${newStatus}`,
      task: taskResponse,
    };
  }
}