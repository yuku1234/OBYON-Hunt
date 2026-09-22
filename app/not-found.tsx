import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "4rem",
          fontWeight: 800,
          letterSpacing: "-0.05em",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.9375rem",
          maxWidth: 360,
          margin: 0,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/overview" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
        Back to Overview
      </Link>
    </div>
  );
}
