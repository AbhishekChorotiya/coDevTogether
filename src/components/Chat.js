import { SendHorizontal } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import USER from "../constants/user";

const Chat = ({ socketRef, roomId, messages, setMessages }) => {
  const [text, setText] = useState("");
  const divRef = useRef(null);
  const handleSend = () => {
    if (!text) return;
    setMessages([
      ...messages,
      { message: text, username: "me", type: "message", time: Date.now() },
    ]);
    socketRef.current.emit(USER.MESSAGE, {
      message: text,
      type: "message",
      roomId,
    });
    setText("");
  };

  useEffect(() => {
    if (
      divRef.current.scrollTop + divRef.current.clientHeight + 200 >=
      divRef.current.scrollHeight
    )
      divRef.current.scrollTop = divRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="min-w-[25%] bg-background rounded-md p-2 flex-col-reverse flex relative overflow-hidden pb-16">
      <div
        ref={divRef}
        className="w-full flex flex-col h-fit relative overflow-y-scroll"
      >
        {messages?.map((message, index) => {
          return message.type === "message" ? (
            <ChatBubble
              key={index}
              message={message.message}
              username={message.username}
              time={message.time}
              self={message.username === "me"}
            />
          ) : (
            <span className="text-primary text-xs bg-foreground py-2 px-4 self-center rounded-full mt-2 w-fit">
              {message.message}
            </span>
          );
        })}
      </div>
      <div className="p-2 absolute bottom-0 left-0 w-full flex gap-2">
        <div className="w-full bg-foreground overflow-hidden flex items-center px-2 rounded-full h-10">
          <input
            className="w-full text-sm h-full text-primary bg-transparent px-2 outline-none placeholder:text-secondary"
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSend()}
          />
        </div>
        <div
          onClick={handleSend}
          className="min-h-10 cursor-pointer flex items-center justify-center rounded-full bg-foreground aspect-square"
        >
          <SendHorizontal className="w-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default Chat;

const ChatBubble = ({ message, username, time, self = false }) => {
  function formatTime(time) {
    try {
      const date = new Date(time);
      return date
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();
    } catch {
      return "";
    }
  }
  return (
    <div
      className={`w-full p-2 pb-7 flex flex-col ${
        self ? "items-end" : "items-start"
      }`}
    >
      <span className="text-xs text-primary font-semibold">
        {self ? "Me" : username}
      </span>
      <div
        className={`text-sm relative py-1 px-4 bg-foreground flex min-w-20 w-fit max-w-[90%] ${
          self ? "rounded-tr-none" : "rounded-tl-none"
        } rounded-md`}
      >
        <span
          className={`text-primary ${self ? "text-right" : "text-left"} w-full`}
        >
          {message}
        </span>
        <div
          className={`absolute top-full ${
            self ? "left-1" : "right-1"
          } text-[10px] text-primary`}
        >
          {formatTime(time) || ""}
        </div>
      </div>
    </div>
  );
};
