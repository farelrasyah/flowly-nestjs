export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export function validateVerifyOtpDto(data: any): { isValid: boolean; errors: string[] } {
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

  return { isValid: errors.length === 0, errors };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
