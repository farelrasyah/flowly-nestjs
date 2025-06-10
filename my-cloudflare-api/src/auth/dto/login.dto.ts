export interface LoginDto {
  username: string;
  password: string;
}

export function validateLoginDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('Username is required');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  return { isValid: errors.length === 0, errors };
}
