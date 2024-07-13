import { ChevronRight, ClipboardPlus, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import USER from "../utils/constants/user";
import toast from "react-hot-toast";

const Sidebar = ({ users, socketRef, roomId }) => {
  const [toggle, setToggle] = useState(true);

  return (
    <>
      <div
        className={`fixed left-0 z-50 transition-all duration-300 top-0 h-full justify-between  flex flex-col gap-2 p-2 ${
          toggle ? "min-w-16 bg-background" : "min-w-80 bg-background"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div
            onClick={() => setToggle(!toggle)}
            className={`w-full transition-all duration-300 max-w-12 ${
              toggle ? "" : "-rotate-180"
            } cursor-pointer aspect-square rounded-full bg-foreground flex items-center justify-center`}
          >
            <ChevronRight className="text-primary" />
          </div>
          <span className="w-full h-[1px] bg-secondary" />
          {users?.map((user, i) => (
            <UserProfile
              key={i}
              user={user}
              toggle={toggle}
              socketRef={socketRef}
              roomId={roomId}
            />
          ))}
        </div>
        <div
          className={`flex w-full justify-center gap-2 ${
            !toggle ? "flex-row-reverse" : "flex-col"
          }`}
        >
          <div
            onClick={() => {
              navigator?.clipboard?.writeText(window?.location?.href).then(() =>
                toast.success("Invite link copied to clipboard", {
                  id: "invite-link",
                })
              );
            }}
            className="w-full shrink-0 max-w-12 cursor-pointer aspect-square rounded-full bg-foreground flex items-center justify-center"
          >
            <ClipboardPlus className="w-5 text-primary" />
          </div>
          <div
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full shrink-0 max-w-12 cursor-pointer aspect-square rounded-full bg-[#EE4B2B] flex items-center justify-center"
          >
            <X color="white" />
          </div>
        </div>
      </div>
      <div
        onClick={() => setToggle(!toggle)}
        className={`w-screen h-screen bg-black/50 transition-all duration-300 opacity-100 animate-fade-in fixed left-0 top-0 z-40 ${
          toggle ? "hidden" : ""
        }`}
      ></div>
    </>
  );
};

export default Sidebar;

const UserProfile = ({ user, toggle, socketRef, roomId }) => {
  useEffect(() => {
    const handleFocus = () => {
      document.title = "On Screen";
      socketRef.current.emit(USER.FOCUS_ON, {
        roomId,
      });
    };
    const handleBlur = () => {
      document.title = "Focus Lost";
      socketRef.current.emit(USER.FOCUS_OFF, {
        roomId,
      });
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="flex w-full gap-2 items-center relative">
      <div className="w-full max-w-12 relative aspect-square rounded-full bg-foreground flex items-center justify-center">
        <User className="w-8 text-primary" />
        {user?.focus ? (
          <span className="w-3 h-3 absolute top-0 right-0 bg-green-600 rounded-full" />
        ) : (
          <span className="w-3 h-3 absolute top-0 right-0 bg-red-500 rounded-full" />
        )}
      </div>
      {!toggle && (
        <span className="text-primary font-semibold text-lg w-3/5 truncate animate-fade-in absolute left-14 self-center">
          {user?.username}
        </span>
      )}
    </div>
  );
};
