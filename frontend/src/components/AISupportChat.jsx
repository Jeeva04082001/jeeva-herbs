
import { useState } from "react";
import { sendSupportMessage } from "../services/api";

export default function AISupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hi! Welcome to Jeeva Herbs. How can I help you today?",
        },
    ]);
    const [loading, setLoading] = useState(false);

    async function handleSend(event) {
        event.preventDefault();

        const userQuestion = question.trim();
        if (!userQuestion || loading) return;

        setMessages((previous) => [
            ...previous,
            { role: "user", text: userQuestion },
        ]);
        setQuestion("");
        setLoading(true);

        try {
            const result = await sendSupportMessage(userQuestion, conversationId);

            if (result.conversation_id) {
                setConversationId(result.conversation_id);
            }

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: result.answer || "Please contact our support team for help.",
                    sources: result.sources || [],
                },
            ]);
        } catch (error) {
            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    text: error.message || "Sorry, something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const styles = {
        wrapper: {
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 99999,
            fontFamily: "Arial, sans-serif",
        },
        panel: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "350px",
            maxWidth: "calc(100vw - 32px)",
            height: "min(480px, calc(100vh - 150px))",
            marginBottom: "12px",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            backgroundColor: "#14532d",
            color: "#ffffff",
            flexShrink: 0,
        },
        messages: {
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "12px",
            backgroundColor: "#f9fafb",
        },
        form: {
            display: "flex",
            gap: "8px",
            padding: "12px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            flexShrink: 0,
        },
        input: {
            flex: 1,
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            color: "#111827",
            backgroundColor: "#ffffff",
            fontSize: "14px",
            outline: "none",
        },
        send: {
            padding: "10px 14px",
            border: "none",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            flexShrink: 0,
            backgroundColor: loading || !question.trim() ? "#9ca3af" : "#166534",
            cursor: loading || !question.trim() ? "not-allowed" : "pointer",
        },
        launcher: {
            position: "fixed",
            right: "24px",
            bottom: "90px",
            zIndex: 99999,
            padding: "14px 22px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#166534",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.wrapper}>
            {isOpen && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <div>
                            <div style={{ fontSize: "16px", fontWeight: 700 }}>
                                Jeeva Herbs Support
                            </div>
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#dcfce7" }}>
                                AI Customer Assistant
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#ffffff",
                                fontSize: "26px",
                                cursor: "pointer",
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div style={styles.messages} aria-live="polite">
                        {messages.map((message, index) => (
                            <div
                                key={`${index}-${message.role}`}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        message.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "88%",
                                        padding: "10px 12px",
                                        borderRadius: "12px",
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        color: message.role === "user" ? "#ffffff" : "#1f2937",
                                        backgroundColor:
                                            message.role === "user" ? "#166534" : "#ffffff",
                                        border:
                                            message.role === "user" ? "none" : "1px solid #e5e7eb",
                                    }}
                                >
                                    {message.text}

                                    {/* {message.sources?.length > 0 && (
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                paddingTop: "6px",
                                                borderTop: "1px solid #e5e7eb",
                                                fontSize: "11px",
                                                color: "#6b7280",
                                            }}
                                        >
                                            Sources: {message.sources.join(", ")}
                                        </div>
                                    )} */}


                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                Jeeva Herbs is typing...
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} style={styles.form}>
                        <input
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Ask about our products..."
                            maxLength={1000}
                            aria-label="Your question"
                            style={styles.input}
                        />

                        <button
                            type="submit"
                            disabled={loading || !question.trim()}
                            style={styles.send}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                style={styles.launcher}
            >
                {isOpen ? "Close Chat" : "Ask Jeeva Herbs"}
            </button>
        </div>
    );
}
