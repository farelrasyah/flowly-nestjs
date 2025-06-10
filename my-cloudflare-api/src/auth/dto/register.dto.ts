export interface RegisterDto {
  username: string;
  password: string;
}

export function validateRegisterDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('Username is required');
  } else if (data.username.length < 3) {
    errors.push('Username minimal 3 karakter');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  return { isValid: errors.length === 0, errors };
}
