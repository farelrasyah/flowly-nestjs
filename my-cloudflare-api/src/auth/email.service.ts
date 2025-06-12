export class EmailService {
  private resendApiKey: string;
  private fromEmail: string;

  constructor(resendApiKey: string, fromEmail: string) {
    this.resendApiKey = resendApiKey;
    this.fromEmail = fromEmail;
  }

  async sendVerificationEmail(to: string, username: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `https://my-cloudflare-api.farelrasyah87.workers.dev/auth/verify-email?token=${verificationToken}`;
    
    const subject = 'Verifikasi Email - Flowly App';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifikasi Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Selamat Datang di Flowly!</h1>
          </div>
          <div class="content">
            <h2>Halo ${username}!</h2>
            <p>Terima kasih telah mendaftar di Flowly App. Untuk melengkapi proses registrasi, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Verifikasi Email</a>
            </div>
            
            <p>Atau salin dan tempel tautan berikut ke browser Anda:</p>
            <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
            
            <p><strong>Catatan:</strong> Tautan verifikasi ini akan kedaluwarsa dalam 24 jam.</p>
            
            <p>Jika Anda tidak mendaftar di Flowly App, silakan abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>© 2025 Flowly App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetOTP(to: string, username: string, otp: string): Promise<boolean> {
    const subject = 'Reset Password - Flowly App';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { background: #fff; border: 2px dashed #FF9800; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #FF9800; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
          </div>
          <div class="content">
            <h2>Halo ${username}!</h2>
            <p>Kami menerima permintaan untuk reset password akun Flowly Anda. Gunakan kode OTP berikut untuk melanjutkan proses reset password:</p>
            
            <div class="otp-code">
              <p style="margin: 0; font-size: 14px; color: #666;">Kode OTP Anda:</p>
              <div class="otp-number">${otp}</div>
            </div>
            
            <p><strong>Penting:</strong></p>
            <ul>
              <li>Kode OTP ini hanya berlaku selama <strong>1 jam</strong></li>
              <li>Jangan bagikan kode ini kepada siapa pun</li>
              <li>Masukkan kode ini di aplikasi Flowly untuk melanjutkan reset password</li>
            </ul>
            
            <p>Jika Anda tidak meminta reset password, silakan abaikan email ini dan pastikan akun Anda aman.</p>
          </div>
          <div class="footer">
            <p>© 2025 Flowly App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(to, subject, html);
  }
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // Menggunakan Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resend API Error:', response.status, errorData);
        return false;
      }      const data = await response.json() as { id: string };
      console.log('Email sent successfully via Resend:', data.id);
      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }
}
