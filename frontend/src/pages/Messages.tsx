import React from "react";

export default function Messages({ messages }: { messages: string[] }) {
  return (
    <div>
      {messages.map((message, index) => (
        <div style={{ color: "white" }} key={index}>
          {message}
        </div>
      ))}
    </div>
  );
}
