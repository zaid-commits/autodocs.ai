// app/components/DocumentGenerator.tsx
"use client";
import { useState } from "react";

export default function DocumentGenerator() {
    const [repoUrl, setRepoUrl] = useState("");
    const [documentationType, setDocumentationType] = useState("summary");
    const [generatedDocs, setGeneratedDocs] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        setGeneratedDocs("");

        try {
            const response = await fetch("/api/generate-docs-from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl, documentationType }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || "Failed to generate documentation.");
            } else {
                const data = await response.json();
                setGeneratedDocs(data.documentation);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center" }}>Generate Repository Documentation from URL</h2>
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    GitHub Repository URL:
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="e.g., https://github.com/facebook/react"
                        style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginTop: "0.25rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    />
                </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Documentation Type:
                    <select
                        value={documentationType}
                        onChange={(e) => setDocumentationType(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginTop: "0.25rem",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                        }}
                    >
                        <option value="summary">Summary</option>
                        <option value="explanation">Detailed Explanation</option>
                        <option value="api documentation">API Documentation</option>
                    </select>
                </label>
            </div>
            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: loading ? "#ccc" : "#007BFF",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "Generating..." : "Generate Documentation"}
            </button>

            {error && (
                <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>
                    Error: {error}
                </p>
            )}
            {generatedDocs && (
                <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
                    <h3>Generated Documentation:</h3>
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{generatedDocs}</pre>
                </div>
            )}
        </div>
    );
}