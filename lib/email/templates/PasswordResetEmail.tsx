import { Button, Text, Section } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./BaseEmail";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <BaseEmail preview="Reset your Raylodies password">
      {/* Icon */}
      <Section style={iconSection}>
        <div style={iconWrapper}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 7C15 5.93913 14.5786 4.92172 13.8284 4.17157C13.0783 3.42143 12.0609 3 11 3C9.93913 3 8.92172 3.42143 8.17157 4.17157C7.42143 4.92172 7 5.93913 7 7M7 7C5.93913 7 4.92172 7.42143 4.17157 8.17157C3.42143 8.92172 3 9.93913 3 11V17C3 18.0609 3.42143 19.0783 4.17157 19.8284C4.92172 20.5786 5.93913 21 7 21H17C18.0609 21 19.0783 20.5786 19.8284 19.8284C20.5786 19.0783 21 18.0609 21 17V11C21 9.93913 20.5786 8.92172 19.8284 8.17157C19.0783 7.42143 18.0609 7 17 7H7ZM12 14V16"
              stroke="#6d15f9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Section>

      {/* Heading */}
      <Text style={heading}>Reset Your Password</Text>

      {/* Greeting */}
      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      {/* Body */}
      <Text style={paragraph}>
        We received a request to reset your password for your Raylodies account.
        Click the button below to create a new password.
      </Text>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      {/* Alternative Link */}
      <Text style={smallText}>
        Or copy and paste this URL into your browser:
      </Text>
      <Text style={linkText}>{resetUrl}</Text>

      {/* Expiry Notice */}
      <Text style={expiryText}>
        This link will expire in 1 hour for security reasons.
      </Text>

      {/* Security Note */}
      <Section style={securitySection}>
        <Text style={securityHeading}>🔒 Security Tip</Text>
        <Text style={securityText}>
          If you didn't request a password reset, please ignore this email. Your
          password will remain unchanged, and no action is required.
        </Text>
      </Section>

      {/* Footer Note */}
      <Text style={footerNote}>
        For your security, never share this link with anyone.
      </Text>
    </BaseEmail>
  );
}

// Styles
const iconSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const iconWrapper = {
  display: "inline-block",
  backgroundColor: "rgba(109, 21, 249, 0.1)",
  borderRadius: "50%",
  padding: "16px",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "300",
  textAlign: "center" as const,
  margin: "0 0 24px",
  letterSpacing: "-0.5px",
};

const paragraph = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
  fontWeight: "300",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#6d15f9",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 32px",
  display: "inline-block",
};

const smallText = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const linkText = {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "0 0 24px",
  textAlign: "center" as const,
  wordBreak: "break-all" as const,
};

const expiryText = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 24px",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const securitySection = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
};

const securityHeading = {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0 0 8px",
};

const securityText = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const footerNote = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  textAlign: "center" as const,
};

export default PasswordResetEmail;
