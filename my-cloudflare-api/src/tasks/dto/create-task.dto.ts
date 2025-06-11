export interface CreateTaskDto {
  judul: string;
  deskripsi?: string;
  kategori?: string;
  tenggat_waktu?: string; // ISO string format
}

export function validateCreateTaskDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.judul || typeof data.judul !== 'string') {
    errors.push('Judul is required');
  } else if (data.judul.trim().length === 0) {
    errors.push('Judul tidak boleh kosong');
  }

  if (data.deskripsi && typeof data.deskripsi !== 'string') {
    errors.push('Deskripsi harus berupa string');
  }

  if (data.kategori && typeof data.kategori !== 'string') {
    errors.push('Kategori harus berupa string');
  }

  if (data.tenggat_waktu) {
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
