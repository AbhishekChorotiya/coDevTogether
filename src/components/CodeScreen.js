import { ChevronDown, Play } from "lucide-react";
import "../App.css";
import { useEffect, useRef, useState } from "react";
import Editor from "./Editor";
import { compileCode } from "../apis/compiler";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import { initSocket } from "../utils/socket";
import USER from "../utils/constants/user";
import CODE from "../utils/constants/code";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Dropdown from "./Dropdown";

function CodeScreen() {
  const socketRef = useRef(null);
  // const roomId = `roomId-${Math.ceil(Math.random() * 100000)}`;
  //   const roomId = `roomId-1`;
  //   const userName = `Abhishek_${Math.floor(Math.random() * 100000)}`;
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState(
    "// <CodeDevTogether/> \n// Developed by: Abhishek Chorotiya \n\n function helloWorld() {\n\n  //write your logic here... \n\n  console.log('Hello World!')\n\n  return;\n } \n\n\n helloWorld()"
  );
  // const [code, setCode] = useState("");

  const { roomId } = useParams();
  const location = useLocation();
  const { username: userName } = location.state || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!userName) navigate(`/?roomId=${roomId}`);
  }, []);

  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [themeColor, setThemeColor] = useState(
    localStorage?.getItem("theme") || "blue"
  );
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    if (language === "javascript") {
      setCode(
        `// <CodeDevTogether/> \n// Developed by: Abhishek Chorotiya \n\n function helloWorld() {\n\n  //write your logic here... \n\n  console.log('Hello World!')\n\n  return;\n } \n\n\n helloWorld()`
      );
    }
    if (language === "python") {
      setCode(
        `# <CodeDevTogether/> \n# Developed by: Abhishek Chorotiya \n\nprint("Hello World!")`
      );
    }
    if (language === "cpp") {
      setCode(
        `// <CodeDevTogether/> \n// Developed by: Abhishek Chorotiya \n\n#include <iostream>\n\nusing namespace std;\n\nint main() {\n\n  cout << "Hello, World!";\n  return 0;\n\n};\n`
      );
    }
    if (language === "java") {
      setCode(
        `// <CodeDevTogether/> \n// Developed by: Abhishek Chorotiya \n\npublic class HelloWorld {\n\n  public static void main(String[] args) {\n\n    System.out.println("Hello World!");\n\n  }\n\n}`
      );
    }
  }, [language]);

  const handleRun = async () => {
    const res = await compileCode(code, language);
    if (res) {
      setOutput(res);
      socketRef.current.emit(USER.MESSAGE, {
        message: `${userName} ran the code`,
        type: "alert",
        roomId,
      });
    }
  };
  const handleCode = (code) => {
    socketRef.current.emit(CODE.CHANGE, {
      code,
      roomId,
    });
    setCode(code);
  };

  const handleQuestion = (e) => {
    socketRef.current.emit(USER.QUESTON, {
      question: e.target.value,
      roomId,
    });
    setQuestion(e.target.value);
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(USER.JOINED, ({ clients, username, socketId }) => {
        if (userName !== username) {
          socketRef.current.emit(CODE.SYNC, {
            code,
            question,
            socketId,
            language,
          });
        }
      });
    }
  }, [question, code]);

  const handleLanguage = (lang) => {
    setLanguage(lang);
    if (socketRef.current) {
      socketRef.current.emit("LANGUAGE", {
        lang,
        roomId,
      });
      socketRef.current.emit(USER.MESSAGE, {
        message: `${userName} changed language to ${lang}`,
        type: "alert",
        roomId,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
      }

      if (userName)
        socketRef.current.emit(USER.JOIN, {
          roomId,
          username: userName,
        });

      socketRef.current.on(CODE.CHANGE, ({ code, language }) => {
        setCode(code);
        setLanguage(language);
      });

      socketRef.current.on(
        USER.MESSAGE,
        ({ message, username, time, type }) => {
          setMessages((prev) => [...prev, { message, username, time, type }]);
        }
      );
      socketRef.current.on(USER.QUESTON, ({ question }) => {
        console.log("question", question);
        setQuestion(question);
      });

      socketRef.current.on(USER.JOINED, ({ clients, username, socketId }) => {
        console.log("clients", clients);

        if (username !== userName) {
          toast.success(`${username} joined`);
          socketRef.current.emit("FOCUS", {
            id: socketRef.current.id,
            focus:
              users?.find((user) => user.socketId === socketId)?.focus || false,
            roomId,
          });
        }
        setUsers(clients);
      });

      socketRef.current.on("LANGUAGE", ({ lang }) => {
        setLanguage(lang);
      });

      socketRef.current.on("FOCUS", ({ id, focus }) => {
        console.log("Focus-->", id, focus);

        setUsers((prev) => {
          return prev?.map((user) => {
            if (user.socketId === id) {
              return {
                ...user,
                focus,
              };
            }
            return user;
          });
        });
      });

      socketRef.current.on(USER.FOCUS_OFF, ({ socketId }) => {
        console.log("focus off", socketId);

        setUsers((prev) => {
          return prev?.map((user) => {
            if (user.socketId === socketId) {
              return {
                ...user,
                focus: false,
              };
            }
            return user;
          });
        });
      });
      socketRef.current.on(USER.FOCUS_ON, ({ socketId }) => {
        console.log("focus on", socketId);

        setUsers((prev) => {
          return prev?.map((user) => {
            if (user.socketId === socketId) {
              return {
                ...user,
                focus: true,
              };
            }
            return user;
          });
        });
      });

      socketRef.current.on(USER.LEAVE, ({ socketId, username }) => {
        setUsers((prev) => {
          console.log(username, "left");
          return prev.filter((user) => user.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      if (!socketRef.current) return;
      socketRef.current.disconnect();
      socketRef.current.off(USER.JOINED);
      socketRef.current.off(USER.LEAVE);
      socketRef.current.off(CODE.CHANGE);
      socketRef.current.off(USER.JOINED);
      socketRef.current.off(CODE.SYNC);
      socketRef.current.off("FOCUS");
      socketRef.current.off(USER.QUESTON);
      socketRef.current.off(USER.MESSAGE);
      socketRef.current.off(USER.FOCUS_ON);
      socketRef.current.off(USER.FOCUS_OFF);
    };
  }, []);

  return (
    <div
      className={`pl-[72px] flex relative w-screen h-dvh bg-foreground p-2 gap-2 ${themeColor} transition-colors duration-300`}
    >
      <Sidebar socketRef={socketRef} users={users} roomId={roomId} />
      <div className="w-full bg-background rounded-md p-2 flex flex-col gap-2">
        <div className="w-full bg-foreground rounded-[4px] overflow-hidden h-28">
          <textarea
            className="w-full text-sm min-h-full resize-none p-2 outline-none text-primary bg-transparent font-semibold placeholder:text-secondary placeholder:font-normal"
            placeholder="Type or Paste Your Question Here..."
            value={question}
            onChange={handleQuestion}
          />
        </div>
        <div className="w-full bg-[#1E1E1E] rounded-[4px] flex h-full relative overflow-y-scroll">
          <Editor
            code={code}
            setCode={handleCode}
            roomId={roomId}
            language={language}
          />
        </div>
      </div>
      <div className="bg-background rounded-md p-2 max-h-full flex gap-2 flex-col">
        <div className="w-full items-center justify-center h-24 shrink-0 bg-foreground rounded-[4px] flex  overflow-hidden">
          <h1 className="text-primary font-semibold text-xl">
            {"<CoDevTogether/>"}
          </h1>
        </div>
        <div className="w-full justify-between bg-foreground rounded-[4px] px-2 gap-2 flex items-center min-h-12">
          <div
            onClick={handleRun}
            className="bg-secondary w-fit pl-2 pr-3 gap-2 h-9 cursor-pointer right-2 top-2 rounded-[4px] flex items-center justify-center"
          >
            <Play className="w-3 text-background" />
            <span className="text-background text-xs">Run</span>
          </div>
          <Dropdown
            options={["javascript", "python", "java", "cpp"]}
            placeholder="JavaScript"
            selected={language}
            setSelected={handleLanguage}
          />
          <Dropdown
            selected={themeColor}
            setSelected={(theme) => {
              setThemeColor(theme);
              localStorage.setItem("theme", theme);
            }}
          />
        </div>

        <div className="w-full bg-foreground flex flex-col overflow-hidden rounded-[4px] h-full p-2">
          <h1 className="text-primary font-semibold text-xl mb-4">Output</h1>
          <div className="w-full flex text-sm flex-col overflow-y-scroll h-full">
            <div className="w-full flex flex-col">
              {output.stderr
                ? output?.stderr?.split("\n")?.map((item, i) => (
                    <span className="text-primary" key={i}>
                      {item}
                    </span>
                  ))
                : output?.stdout?.split("\n")?.map((item, i) => (
                    <span className="text-primary" key={i}>
                      {item}
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </div>
      <Chat
        socketRef={socketRef}
        roomId={roomId}
        messages={messages}
        setMessages={setMessages}
      />
      <Toaster />
    </div>
  );
}

export default CodeScreen;
