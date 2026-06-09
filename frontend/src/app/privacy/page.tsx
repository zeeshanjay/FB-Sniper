"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Interdisplay, Arial, sans-serif" }}>
      {/* Left Panel — Dark / Brand */}
      <div
        style={{
          width: "50%",
          backgroundColor: "#1d1d1d",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(64,106,228,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div>
          <Link href="/">
            <Image src="/logo-new-white.png" alt="Astraventa" width={160} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
          </Link>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "6.25rem",
              padding: "0.375rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span style={{ color: "#dde5ed", fontSize: "0.875rem", fontWeight: 500 }}>
              FB Sniper — Your Data Matters
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 600,
              fontSize: "3rem",
              lineHeight: "1.2em",
              letterSpacing: "-1px",
              color: "#ffffff",
              margin: "0 0 1.25rem 0",
            }}
          >
            Privacy Policy
          </h1>

          <p
            style={{
              color: "#bababa",
              fontSize: "1.125rem",
              lineHeight: "1.6em",
              fontWeight: 500,
              margin: 0,
              maxWidth: "420px",
            }}
          >
            We are committed to protecting your privacy and handling your data with transparency.
          </p>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "2rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {[
            { number: "Encrypted", label: "Data Storage" },
            { number: "Zero", label: "Third-party Sharing" },
            { number: "GDPR", label: "Compliant" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#ffffff",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.number}
              </div>
              <div style={{ color: "#4d585f", fontSize: "0.875rem", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "3rem 2rem",
          backgroundColor: "#ffffff",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
          {/* Mobile logo */}
          <div
            className="flex lg:hidden"
            style={{ alignItems: "center", marginBottom: "2.5rem" }}
          >
            <Link href="/">
              <Image
                src="/logo-new.png"
                alt="Astraventa"
                width={140}
                height={36}
                style={{ objectFit: "contain", objectPosition: "left" }}
              />
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "2rem",
                lineHeight: "1.2em",
                letterSpacing: "-1px",
                color: "#1d1d1d",
                margin: "0 0 0.625rem 0",
              }}
            >
              Privacy Policy
            </h2>
            <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
              Last updated: January 2026
            </p>
          </div>

          {/* Privacy Content */}
          <div style={{ color: "#4d585f", fontSize: "0.9375rem", lineHeight: "1.7em" }}>
            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                1. Information We Collect
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                When you use FB Sniper, we collect certain information to provide and improve our Service. This includes:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}><strong>Account Information:</strong> Your email address and name provided during registration.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Facebook Data:</strong> When you connect your Facebook account, we receive your public profile information, page access tokens, and group memberships as authorized by you through Facebook&apos;s OAuth flow.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Usage Data:</strong> Information about how you use the Service, including campaign history, scheduling preferences, and interaction logs.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Device Information:</strong> Browser type, IP address, and device identifiers for security and authentication purposes.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                2. How We Use Your Information
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We use the information we collect to:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>Provide, operate, and maintain the FB Sniper platform.</li>
                <li style={{ marginBottom: "0.5rem" }}>Execute scheduled campaigns, automated posts, and engagement actions on your behalf.</li>
                <li style={{ marginBottom: "0.5rem" }}>Authenticate your identity and protect your account security.</li>
                <li style={{ marginBottom: "0.5rem" }}>Send you important service notifications and updates.</li>
                <li style={{ marginBottom: "0.5rem" }}>Analyze usage patterns to improve the Service.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                3. Facebook Data Usage
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We access Facebook data solely to perform the automation actions you configure within the Service. This includes posting content to your pages and groups, managing comments, and retrieving engagement analytics. We do not sell, share, or transfer your Facebook data to any third parties. Your Facebook access tokens are stored securely and encrypted at rest.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                4. Data Storage and Security
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                Your data is stored on secure, encrypted servers powered by Supabase infrastructure. We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and role-based access controls. We regularly review our security practices to ensure the safety of your information.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                5. Data Sharing
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We do not sell, rent, or trade your personal information. We may share your data only in the following circumstances:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}><strong>With Facebook/Meta:</strong> To execute the automation actions you have configured (e.g., posting to your pages).</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Service Providers:</strong> With trusted infrastructure providers (e.g., hosting, email delivery) who process data on our behalf under strict confidentiality agreements.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                6. Your Rights
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                You have the right to:
              </p>
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Deletion:</strong> Request deletion of your account and associated data. You can delete your account from the Settings page in your dashboard.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong>Revoke Access:</strong> Disconnect your Facebook account at any time from the dashboard, which immediately revokes our access to your Facebook data.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                7. Cookies and Tracking
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We use essential cookies and local storage to maintain your authentication session and user preferences (such as theme selection). We do not use third-party tracking cookies or advertising pixels.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                8. Data Retention
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We retain your data for as long as your account is active. Upon account deletion, we will delete your personal data within 30 days, except where retention is required by law. Campaign logs and analytics data are retained for up to 90 days after account deletion for audit purposes, after which they are permanently removed.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                9. Children&apos;s Privacy
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                FB Sniper is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                10. Changes to This Policy
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page. Your continued use of the Service after any changes constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                11. Contact Us
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at{" "}
                <a href="mailto:contact@astraventa.com" style={{ color: "#3b82f6", textDecoration: "none" }}>contact@astraventa.com</a>.
              </p>
            </section>
          </div>

          {/* Back to sign in */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #dde5ed" }}>
            <Link
              href="/signin"
              style={{
                display: "inline-block",
                color: "#3b82f6",
                fontSize: "0.9375rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
