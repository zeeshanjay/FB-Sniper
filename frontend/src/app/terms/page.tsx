"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
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
              FB Sniper — Elite Automation
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
            Terms of Service
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
            Please read these terms carefully before using FB Sniper.
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
            { number: "Secure", label: "Platform" },
            { number: "Trusted", label: "by Elite" },
            { number: "24/7", label: "Support" },
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
              Terms of Service
            </h2>
            <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
              Last updated: January 2026
            </p>
          </div>

          {/* Terms Content */}
          <div style={{ color: "#4d585f", fontSize: "0.9375rem", lineHeight: "1.7em" }}>
            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                1. Acceptance of Terms
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                By accessing and using FB Sniper ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                2. Description of Service
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                FB Sniper is an automation platform that allows users to manage Facebook pages and groups through scheduled posts, automated comments, and engagement tools. The Service is provided "as is" without warranties of any kind.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                3. User Responsibilities
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                4. Facebook/Meta API Usage
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                The Service integrates with Facebook's Graph API. You must comply with Facebook's Terms of Service and Platform Policies when using our Service. We are not responsible for any actions taken by Facebook against your account due to violations of their policies.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                5. Prohibited Activities
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                You may not use the Service to: (a) send spam or unsolicited messages, (b) harass or abuse other users, (c) violate any applicable laws or regulations, (d) infringe on intellectual property rights, or (e) attempt to circumvent security measures.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                6. Data and Privacy
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                Your use of the Service is also governed by our Privacy Policy. We collect and process data as described in our Privacy Policy. You retain ownership of your content, but grant us a license to use it solely to provide the Service.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                7. Termination
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                8. Limitation of Liability
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                To the fullest extent permitted by law, FB Sniper shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                9. Changes to Terms
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page. Your continued use of the Service after such modifications constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1d1d1d", marginBottom: "0.75rem" }}>
                10. Contact Information
              </h3>
              <p style={{ marginBottom: "1rem" }}>
                If you have any questions about these Terms, please contact us at <a href="mailto:contact@astraventa.com" style={{ color: "#3b82f6", textDecoration: "none" }}>contact@astraventa.com</a>.
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
