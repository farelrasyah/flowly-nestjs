export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export function validateLoginDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.usernameOrEmail || typeof data.usernameOrEmail !== 'string') {
    errors.push('Username atau email is required');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  }

  return { isValid: errors.length === 0, errors };
}
