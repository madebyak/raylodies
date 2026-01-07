import { Button, Text, Section } from "@react-email/components";
import * as React from "react";
import { BaseEmail } from "./BaseEmail";

interface WelcomeEmailProps {
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.raylodies.com";

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <BaseEmail preview="Welcome to Raylodies - Your Creative Journey Begins">
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
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="#6d15f9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Section>

      {/* Heading */}
      <Text style={heading}>Welcome to Raylodies</Text>

      {/* Greeting */}
      <Text style={paragraph}>Hi{userName ? ` ${userName}` : ""},</Text>

      {/* Body */}
      <Text style={paragraph}>
        Your account has been successfully verified. Welcome to Raylodies —
        where AI meets creative direction.
      </Text>

      <Text style={paragraph}>Here's what you can do now:</Text>

      {/* Features List */}
      <Section style={featureList}>
        <Text style={featureItem}>
          <span style={featureIcon}>✨</span> Browse our exclusive digital
          products
        </Text>
        <Text style={featureItem}>
          <span style={featureIcon}>🎨</span> Explore our creative portfolio
        </Text>
        <Text style={featureItem}>
          <span style={featureIcon}>💼</span> Start a custom project with us
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={buttonSection}>
        <Button style={button} href={`${baseUrl}/store`}>
          Explore Our Store
        </Button>
      </Section>

      {/* Secondary CTA */}
      <Text style={secondaryCta}>
        Or{" "}
        <a href={`${baseUrl}/work`} style={link}>
          view our latest work
        </a>
      </Text>

      {/* Footer Note */}
      <Text style={footerNote}>
        We're thrilled to have you. If you have any questions, just reply to
        this email — we're here to help.
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

const featureList = {
  margin: "24px 0",
  padding: "0 16px",
};

const featureItem = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  lineHeight: "28px",
  margin: "0",
};

const featureIcon = {
  marginRight: "8px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0 16px",
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

const secondaryCta = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const link = {
  color: "#6d15f9",
  textDecoration: "none",
};

const footerNote = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
};

export default WelcomeEmail;
