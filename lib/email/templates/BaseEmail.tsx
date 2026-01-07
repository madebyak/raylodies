import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.raylodies.com";

export function BaseEmail({ preview, children }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/white-logo.svg`}
              width="140"
              height="40"
              alt="Raylodies"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Raylodies. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>
                Terms of Service
              </Link>
            </Text>
            <Text style={footerAddress}>Raylodies • AI Creative Director</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const header = {
  textAlign: "center" as const,
  padding: "20px 0 40px",
};

const logo = {
  margin: "0 auto",
};

const content = {
  backgroundColor: "#0a0a0a",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "40px",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.1)",
  margin: "40px 0 20px",
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const footerText = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 10px",
};

const footerLinks = {
  color: "rgba(255, 255, 255, 0.4)",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 10px",
};

const footerLink = {
  color: "rgba(255, 255, 255, 0.6)",
  textDecoration: "none",
};

const footerAddress = {
  color: "rgba(255, 255, 255, 0.3)",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "0",
};

export default BaseEmail;
