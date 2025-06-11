export interface Task {
  id: number;
  user_id: number;
  judul: string;
  deskripsi?: string;
  kategori?: string;
  status: 'selesai' | 'belum_selesai';
  tenggat_waktu?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  judul: string;
  deskripsi?: string;
  kategori?: string;
  tenggat_waktu?: string;
}

export interface TaskUpdateInput {
  judul?: string;
  deskripsi?: string;
  kategori?: string;
  status?: 'selesai' | 'belum_selesai';
  tenggat_waktu?: string;
}

export interface TaskResponse {
  id: number;
  judul: string;
  deskripsi?: string;
  kategori?: string;
  status: 'selesai' | 'belum_selesai';
  tenggat_waktu?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFilterQuery {
  kategori?: string;
  status?: 'selesai' | 'belum_selesai';
  sortBy?: 'created_at' | 'updated_at' | 'tenggat_waktu' | 'judul';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}