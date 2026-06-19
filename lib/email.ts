import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendVerificationEmail({
  email,
  name,
  token,
  expiresInHours,
}: {
  email: string;
  name: string;
  token: string;
  expiresInHours: number;
}) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationLink = `${domain}/verify-email?token=${token}`;

  const textContent = `Halo ${name},\n\nTerima kasih telah mendaftar di Lapak Jas Merah.\n\nSilakan verifikasi akun Anda dengan mengklik tautan berikut:\n${verificationLink}\n\nTautan ini berlaku selama ${expiresInHours} jam.\n\nSalam,\nTim Lapak Jas Merah`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #91000a; margin-bottom: 20px; font-family: Montserrat, Arial, sans-serif;">Verifikasi Akun Lapak Jas Merah</h2>
      <p style="color: #1a1c1c; font-size: 16px; line-height: 1.5;">Halo <strong>${name}</strong>,</p>
      <p style="color: #1a1c1c; font-size: 16px; line-height: 1.5;">Terima kasih telah mendaftar di Lapak Jas Merah UMM. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${verificationLink}" style="background-color: #91000a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(145, 0, 10, 0.15);">Verifikasi Email</a>
      </div>
      <p style="color: #5b403d; font-size: 14px; line-height: 1.5;">Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
      <p style="word-break: break-all; color: #4c56af; font-size: 14px; background-color: #f3f3f3; padding: 12px; border-radius: 6px;"><a href="${verificationLink}" style="color: #4c56af; text-decoration: none;">${verificationLink}</a></p>
      <hr style="border: none; border-top: 1px solid #e2e2e2; margin: 25px 0;" />
      <p style="font-size: 13px; color: #5b403d;">Tautan verifikasi ini akan kedaluwarsa dalam <strong>${expiresInHours} jam</strong>.</p>
    </div>
  `;

  // Write log file for easy local development testing
  try {
    const logFilePath = path.join(process.cwd(), "email-logs.txt");
    const logMessage = `[${new Date().toLocaleString("id-ID")}] Kepada: ${email}\nSubjek: Verifikasi Email Lapak Jas Merah\nNama: ${name}\nTautan: ${verificationLink}\nMasa Berlaku: ${expiresInHours} jam\n-----------------------------------------------------------------\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
    console.log(`[EMAIL LOG] Tautan verifikasi email ditulis ke email-logs.txt untuk testing: ${verificationLink}`);
  } catch (err) {
    console.error("Gagal menulis email log ke file:", err);
  }

  // Attempt real email transport if SMTP is configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Lapak Jas Merah" <noreply@lapakjasmerah.umm.ac.id>',
        to: email,
        subject: "Verifikasi Email Lapak Jas Merah",
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EMAIL] Email verifikasi berhasil dikirim via SMTP ke: ${email}`);
    } catch (err) {
      console.error("[EMAIL ERROR] Gagal mengirim email via SMTP:", err);
    }
  }
}
