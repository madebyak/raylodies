export { resend, EMAIL_FROM } from "./client";
export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  type SendEmailResult,
} from "./send";
export {
  BaseEmail,
  VerificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
} from "./templates";
