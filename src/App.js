import {
  ChevronDown,
  ChevronRight,
  ClipboardPlus,
  Play,
  SendHorizontal,
  Share2,
  User,
  X,
} from "lucide-react";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Editor from "./components/Editor";
import { compileCode } from "./apis/compiler";

function App() {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");

  const handleRun = () => {
    compileCode(code);
  };

  useEffect(() => {
    if (editorRef.current) {
      console.log(editorRef.current);
    }
  }, [editorRef]);

  return (
    <div className="pl-[72px] flex relative w-screen h-screen bg-foreground p-2 gap-2">
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
      <div className="w-full bg-background/50 rounded-md p-2 flex flex-col gap-2">
        <div className="w-full bg-foreground rounded-[4px] overflow-hidden h-28">
          <textarea
            className="w-full text-sm min-h-full resize-none p-2 outline-none text-primary bg-transparent font-semibold placeholder:text-secondary placeholder:font-normal"
            placeholder="Type or Paste Your Question Here..."
          />
        </div>
        <div className="w-full bg-[#1E1E1E] rounded-[4px] flex h-full relative overflow-y-scroll">
          <Editor ref={editorRef} code={code} setCode={setCode} />
        </div>
      </div>
      <div className="bg-background/50 rounded-md p-2 flex gap-2 flex-col">
        <div className="w-full items-center justify-center min-h-24 bg-foreground rounded-[4px] flex  overflow-hidden">
          <h1 className="text-primary font-semibold text-xl">
            {"<CodeDevTogether/>"}
          </h1>
        </div>
        <div className="w-full justify-between bg-foreground rounded-[4px] px-2 gap-2 flex items-center min-h-12">
          <div
            onClick={handleRun}
            className="bg-secondary w-fit pl-2 pr-3 gap-2 h-9 cursor-pointer right-2 top-2 rounded-[4px] flex items-center justify-center"
          >
            <Play color="#f1faee" className="w-3" />
            <span className="text-background text-xs">Run</span>
          </div>
          <Dropdown
            options={["JavaScript", "Python", "Java", "C++"]}
            placeholder="JavaScript"
          />
          <Dropdown />
        </div>

        <div className="w-full bg-foreground rounded-[4px] h-full"></div>
      </div>

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
    </div>
  );
}

export default App;

const Dropdown = ({
  options = ["Blue", "Red", "Dark", "Light", "Green"],
  placeholder = "Blue",
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const divRef = useRef(null);
  const dropdownRef = useRef(null);
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOpen(false);
      return;
    }
    if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
      setOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="border w-28 bg-background/50 cursor-pointer border-foreground px-3 py-1 rounded-[4px] relative">
      <div
        className="flex items-center gap-2 z-0 justify-between"
        ref={dropdownRef}
      >
        <span
          className={`${selected ? "text-primary" : "text-secondary"} text-xs`}
        >
          {selected ? selected : placeholder}
        </span>
        <ChevronDown color="#457b9d" className="w-5" />
      </div>
      {open && (
        <div
          ref={divRef}
          className="w-full left-0 z-[1000] overflow-hidden rounded-[10px] border border-secondary bg-background/50 absolute top-[calc(100%+5px)] flex flex-col"
        >
          {options.map((option) => (
            <div
              className="flex items-center hover:bg-background p-4 justify-between"
              onClick={() => {
                setSelected(option);
                setOpen(false);
              }}
            >
              <span className="text-primary text-sm">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
