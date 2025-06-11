export interface UpdateTaskDto {
  judul?: string;
  deskripsi?: string;
  kategori?: string;
  status?: 'selesai' | 'belum_selesai';
  tenggat_waktu?: string; // ISO string format
}

export function validateUpdateTaskDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.judul !== undefined) {
    if (typeof data.judul !== 'string') {
      errors.push('Judul harus berupa string');
    } else if (data.judul.trim().length === 0) {
      errors.push('Judul tidak boleh kosong');
    }
  }

  if (data.deskripsi !== undefined && typeof data.deskripsi !== 'string') {
    errors.push('Deskripsi harus berupa string');
  }

  if (data.kategori !== undefined && typeof data.kategori !== 'string') {
    errors.push('Kategori harus berupa string');
  }

  if (data.status !== undefined) {
    if (typeof data.status !== 'string' || !['selesai', 'belum_selesai'].includes(data.status)) {
      errors.push('Status harus berupa "selesai" atau "belum_selesai"');
    }
  }

  if (data.tenggat_waktu !== undefined) {
    if (typeof data.tenggat_waktu !== 'string') {
      errors.push('Tenggat waktu harus berupa string');
    } else {
      const date = new Date(data.tenggat_waktu);
      if (isNaN(date.getTime())) {
        errors.push('Format tenggat waktu tidak valid');
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}
