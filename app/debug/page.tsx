"use client";

export default function FirebaseDebug() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h2>Firebase Config Debug</h2>
      {Object.entries(config).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 8 }}>
          <strong>{key}:</strong>{" "}
          <span style={{ color: value ? "green" : "red" }}>
            {value ? `✅ ${value.slice(0, 10)}...` : "❌ UNDEFINED"}
          </span>
        </div>
      ))}
    </div>
  );
}