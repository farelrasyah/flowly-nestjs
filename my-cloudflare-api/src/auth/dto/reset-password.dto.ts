export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export function validateResetPasswordDto(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Format email tidak valid');
  }

  if (!data.otp || typeof data.otp !== 'string') {
    errors.push('OTP is required');
  } else if (data.otp.length !== 6) {
    errors.push('OTP harus 6 digit');
  }

  if (!data.newPassword || typeof data.newPassword !== 'string') {
    errors.push('Password baru is required');
  } else if (data.newPassword.length < 6) {
    errors.push('Password baru minimal 6 karakter');
  }

  return { isValid: errors.length === 0, errors };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
