import React, { useState, useRef, useEffect } from "react";
import "./ChatBox.css";

const ChatBox = () => {
  const [messages, setMessages] = useState([]); // lưu toàn bộ chat
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const msgEndRef = useRef(null);

  // Scroll xuống cuối mỗi khi có tin nhắn
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMsg = { role: "user", content: input };
  setMessages((prev) => [...prev, userMsg]);

  const msgToSend = input;
  setInput("");
  setLoading(true);

  // Thêm bot message trống trước để typing effect
  setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

  try {
    const res = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msgToSend }),
    });

    const data = await res.json();
    const botReply = data.reply || "";

    // Typing effect
    let typed = "";
    for (let i = 0; i < botReply.length; i++) {
      typed += botReply[i];
      setMessages((prev) => {
        const newMessages = [...prev];
        // Cập nhật message bot cuối cùng
        newMessages[newMessages.length - 1] = { role: "assistant", content: typed };
        return newMessages;
      });
      await new Promise((r) => setTimeout(r, 15));
    }

    // Đảm bảo bot reply cuối cùng đúng
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = { role: "assistant", content: botReply };
      return newMessages;
    });
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Lỗi kết nối server." },
    ]);
  }

  setLoading(false);
};


  return (
    <>
      {!isOpen && (
        <div className="chatbox-avatar" onClick={() => setIsOpen(true)}>
          🤖
        </div>
      )}

      {isOpen && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <h2>AI Chat Support</h2>
            <button className="minimize-btn" onClick={() => setIsOpen(false)}>
              –
            </button>
          </div>

          <div className="chatbox-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && <p className="loading">AI đang trả lời...</p>}
            <div ref={msgEndRef} />
          </div>

          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button disabled={loading} onClick={sendMessage}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
