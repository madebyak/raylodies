import { resend, EMAIL_FROM } from "./client";
import { VerificationEmail } from "./templates/VerificationEmail";
import { PasswordResetEmail } from "./templates/PasswordResetEmail";
import { WelcomeEmail } from "./templates/WelcomeEmail";

export interface SendEmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Send verification email to new user
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  userName?: string,
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email address - Raylodies",
      react: VerificationEmail({ userName, verificationUrl }),
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Error sending verification email:", err);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string,
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Reset your password - Raylodies",
      react: PasswordResetEmail({ userName, resetUrl }),
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Error sending password reset email:", err);
    return { success: false, error: "Failed to send password reset email" };
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  email: string,
  userName?: string,
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to Raylodies! 🎉",
      react: WelcomeEmail({ userName }),
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Error sending welcome email:", err);
    return { success: false, error: "Failed to send welcome email" };
  }
}
