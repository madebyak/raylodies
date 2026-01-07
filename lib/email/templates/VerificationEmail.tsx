import { Button, Text, Section } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./BaseEmail";

interface VerificationEmailProps {
  userName?: string;
  verificationUrl: string;
}

export function VerificationEmail({
  userName,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <BaseEmail preview="Verify your email address for Raylodies">
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
              d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
              stroke="#6d15f9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Section>

      {/* Heading */}
      <Text style={heading}>Verify Your Email</Text>

      {/* Greeting */}
      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      {/* Body */}
      <Text style={paragraph}>
        Welcome to Raylodies! We're excited to have you on board. Please verify
        your email address by clicking the button below.
      </Text>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>

      {/* Alternative Link */}
      <Text style={smallText}>
        Or copy and paste this URL into your browser:
      </Text>
      <Text style={linkText}>{verificationUrl}</Text>

      {/* Expiry Notice */}
      <Text style={expiryText}>This link will expire in 24 hours.</Text>

      {/* Footer Note */}
      <Text style={footerNote}>
        If you didn't create an account with Raylodies, you can safely ignore
        this email.
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
  margin: "0 0 16px",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const footerNote = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
};

export default VerificationEmail;
