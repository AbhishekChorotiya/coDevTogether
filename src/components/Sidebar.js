import { ChevronRight, ClipboardPlus, User, X } from "lucide-react";
import React from "react";

const Sidebar = () => {
  return (
    <div className="min-w-16 fixed left-0 top-0 h-full justify-between bg-background/50 flex flex-col gap-2 p-2">
      <div className="flex flex-col gap-2">
        <div className="w-full cursor-pointer aspect-square rounded-full bg-foreground flex items-center justify-center">
          <ChevronRight color="#1d3557" />
        </div>
        <span className="w-full h-[1px] bg-foreground" />
        <div className="w-full aspect-square rounded-full bg-foreground flex items-center justify-center overflow-hidden">
          <User className="w-8" color="#1d3557" />
        </div>
        <div className="w-full aspect-square rounded-full bg-foreground flex items-center justify-center overflow-hidden">
          <User className="w-8" color="#1d3557" />
        </div>
        <div className="w-full aspect-square rounded-full bg-foreground flex items-center justify-center overflow-hidden">
          <User className="w-8" color="#1d3557" />
        </div>
        <div className="w-full aspect-square rounded-full bg-foreground flex items-center justify-center overflow-hidden">
          <User className="w-8" color="#1d3557" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="w-full cursor-pointer aspect-square rounded-full bg-foreground flex items-center justify-center">
          <ClipboardPlus color="#1d3557" className="w-5" />
        </div>
        <div className="w-full cursor-pointer aspect-square rounded-full bg-[#EE4B2B] flex items-center justify-center">
          <X color="white" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
