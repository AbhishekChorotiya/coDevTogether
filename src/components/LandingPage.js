import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateRandomId } from "../utils/helper";
import { Home, User } from "lucide-react";
import Dropdown from "./Dropdown";
import Wrapper from "./Wrapper";

const LandingPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState(false);
  const [themeColor, setThemeColor] = useState(
    localStorage?.getItem("theme") || "blue"
  );
  const query = new URLSearchParams(window.location.search);
  const roomId = query.get("roomId");

  const handleJoin = () => {
    if (username && id) {
      navigate(`/${id}`, {
        state: {
          username,
        },
      });
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleJoin();
    });

    return () => {
      window.removeEventListener("keydown", (e) => {
        if (e.key === "Enter") handleJoin();
      });
    };
  }, [username, id]);

  useEffect(() => setId(roomId), [roomId]);

  return (
    <Wrapper>
      <div
        className={`${themeColor} transition-all duration-200 flex flex-col min-w-screen h-screen bg-foreground`}
      >
        <div className="w-full flex px-10 md:px-20 py-4 justify-between bg-background">
          <h1 className="text-2xl font-semibold text-primary">
            {"<CoDevTogether/>"}
          </h1>
          <Dropdown
            selected={themeColor}
            setSelected={(theme) => {
              setThemeColor(theme);
              localStorage.setItem("theme", theme);
            }}
          />
        </div>
        <div className="w-full h-full  flex items-center justify-center">
          <div className="w-96 rounded-md p-8 flex flex-col gap-5 bg-background">
            <h1
              className={`text-primary font-semibold ${
                error && "text-red-500"
              }`}
            >
              {error ? "Enter Missing Details" : "Enter Details"}
            </h1>
            <div
              className={`w-full h-12  border-b-2 border-primary flex ${
                !username && error && "border-red-500"
              }`}
            >
              <div className="h-full aspect-square flex items-center justify-center">
                <User
                  className={`w-6 h-6 text-primary ${
                    !username && error && "text-red-500"
                  }`}
                />
              </div>
              <input
                className="w-full h-full px-2 bg-transparent text-primary outline-none border-none ring-0"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div
              className={`w-full h-12 border-b-2 border-primary flex ${
                !id && error && "border-red-500"
              }`}
            >
              <div className="h-full aspect-square flex items-center justify-center">
                <Home
                  className={`w-6 h-6 text-primary ${
                    !id && error && "text-red-500"
                  }`}
                />
              </div>
              <input
                className="w-full h-full px-2 bg-transparent text-primary outline-none border-none ring-0"
                placeholder="Enter Room ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <h2
              onClick={() => setId(generateRandomId())}
              className="text-sm underline self-end px-5 text-primary cursor-pointer"
            >
              Generate Room ID
            </h2>
            <button
              onClick={handleJoin}
              className={`bg-secondary font-semibold w-full h-12 rounded-sm ${
                themeColor === "dark" ? "text-background" : "text-white"
              }`}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default LandingPage;
