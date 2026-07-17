import { useCallback, useEffect, useRef, useState } from "react";
import { CODE_EVENTS, ROOM_EVENTS, USER_EVENTS } from "../../../shared/protocol/events";
import { createSocket } from "../../../shared/services/socketClient";
import { LANGUAGES, isLanguage } from "../../editor/languages";

const MAX_MESSAGES = 200;

function appendMessage(messages, message) {
  return [...messages, message].slice(-MAX_MESSAGES);
}

export function useRoomSession({ roomId, username }) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState(LANGUAGES.javascript.starter);
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId || !username) return undefined;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError("");
      socket.emit(USER_EVENTS.JOIN, { roomId, username });
    });
    socket.on("disconnect", () => setStatus("reconnecting"));
    socket.on("connect_error", () => {
      setStatus("reconnecting");
      setError("Connection lost. Trying to reconnect…");
    });
    socket.on(ROOM_EVENTS.ERROR, ({ message } = {}) => {
      setError(message || "The room request could not be completed.");
    });
    socket.on(CODE_EVENTS.SYNC, (snapshot = {}) => {
      if (typeof snapshot.code === "string") setCode(snapshot.code);
      if (typeof snapshot.question === "string") setQuestion(snapshot.question);
      if (isLanguage(snapshot.language)) setLanguage(snapshot.language);
    });
    socket.on(CODE_EVENTS.CHANGE, (payload = {}) => {
      if (typeof payload.code === "string") setCode(payload.code);
      if (isLanguage(payload.language)) setLanguage(payload.language);
    });
    socket.on(USER_EVENTS.QUESTION, ({ question: nextQuestion } = {}) => {
      if (typeof nextQuestion === "string") setQuestion(nextQuestion);
    });
    socket.on(USER_EVENTS.PRESENCE, ({ clients } = {}) => {
      if (Array.isArray(clients)) setUsers(clients);
    });
    socket.on(USER_EVENTS.JOINED, ({ clients, username: joinedUser, socketId } = {}) => {
      if (Array.isArray(clients)) setUsers(clients);
      if (joinedUser && socketId !== socket.id) {
        setMessages((previous) =>
          appendMessage(previous, {
            id: `joined-${socketId}-${Date.now()}`,
            message: `${joinedUser} joined the room`,
            type: "system",
            time: Date.now(),
          }),
        );
      }
    });
    socket.on(USER_EVENTS.LEAVE, ({ clients, username: leftUser, socketId } = {}) => {
      if (Array.isArray(clients)) setUsers(clients);
      if (leftUser) {
        setMessages((previous) =>
          appendMessage(previous, {
            id: `left-${socketId}-${Date.now()}`,
            message: `${leftUser} left the room`,
            type: "system",
            time: Date.now(),
          }),
        );
      }
    });
    socket.on(USER_EVENTS.MESSAGE, (message = {}) => {
      if (typeof message.message !== "string") return;
      setMessages((previous) =>
        appendMessage(previous, {
          ...message,
          id: message.id || `remote-${message.time}-${previous.length}`,
        }),
      );
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [roomId, username]);

  useEffect(() => {
    const updateFocus = () => {
      const event = document.hasFocus()
        ? USER_EVENTS.FOCUS_ON
        : USER_EVENTS.FOCUS_OFF;
      socketRef.current?.emit(event);
    };

    window.addEventListener("focus", updateFocus);
    window.addEventListener("blur", updateFocus);
    return () => {
      window.removeEventListener("focus", updateFocus);
      window.removeEventListener("blur", updateFocus);
    };
  }, []);

  const updateCode = useCallback((nextCode) => {
    setCode(nextCode);
    socketRef.current?.emit(CODE_EVENTS.CHANGE, { code: nextCode });
  }, []);

  const updateQuestion = useCallback((nextQuestion) => {
    setQuestion(nextQuestion);
    socketRef.current?.emit(USER_EVENTS.QUESTION, { question: nextQuestion });
  }, []);

  const updateLanguage = useCallback((nextLanguage) => {
    if (!isLanguage(nextLanguage)) return;
    const nextCode = LANGUAGES[nextLanguage].starter;
    setLanguage(nextLanguage);
    setCode(nextCode);
    socketRef.current?.emit(CODE_EVENTS.CHANGE, {
      code: nextCode,
      language: nextLanguage,
    });
  }, []);

  const sendMessage = useCallback(
    (text) => {
      const message = text.trim();
      if (!message || !socketRef.current?.connected) return false;
      const localMessage = {
        id: `local-${crypto.randomUUID()}`,
        message,
        username,
        self: true,
        type: "message",
        time: Date.now(),
      };
      setMessages((previous) => appendMessage(previous, localMessage));
      socketRef.current.emit(USER_EVENTS.MESSAGE, { message });
      return true;
    },
    [username],
  );

  const announceRun = useCallback(() => {
    socketRef.current?.emit(USER_EVENTS.ACTIVITY, { action: "run" });
  }, []);

  return {
    status,
    error,
    users,
    code,
    language,
    question,
    messages,
    updateCode,
    updateLanguage,
    updateQuestion,
    sendMessage,
    announceRun,
  };
}
