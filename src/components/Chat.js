import { SendHorizontal } from "lucide-react";
import React from "react";

const Chat = () => {
  return (
    <div className="min-w-[25%] bg-background/50 rounded-md p-2 flex-col flex relative overflow-hidden">
      <div className="p-2 absolute bottom-0 left-0 w-full flex gap-2">
        <div className="w-full bg-foreground overflow-hidden p-2 rounded-full h-12">
          <input
            className="w-full text-sm h-full text-primary bg-transparent px-2 outline-none placeholder:text-secondary"
            placeholder="Type your massage here..."
          />
        </div>
        <div className="w-14 cursor-pointer flex items-center justify-center rounded-full bg-foreground aspect-square">
          <SendHorizontal color="#1d3557" className="w-5" />
        </div>
      </div>
    </div>
  );
};

export default Chat;
