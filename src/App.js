import { ChevronDown, Play } from "lucide-react";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Editor from "./components/Editor";
import { compileCode } from "./apis/compiler";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";

function App() {
  const editorRef = useRef(null);
  const [code, setCode] = useState(
    "// <CodeDevTogether/> \n// Developed by: Abhishek Chorotiya \n\n function helloWorld() {\n\n  //write your logic here... \n\n  console.log('Hello World!')\n\n  return;\n } \n\n\n helloWorld()"
  );

  const [output, setOutput] = useState("");

  const handleRun = async () => {
    const res = await compileCode(code);
    if (res) {
      setOutput(res);
    }
  };

  return (
    <div className="pl-[72px] flex relative w-screen h-screen bg-foreground p-2 gap-2">
      <Sidebar />
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

        <div className="w-full bg-foreground rounded-[4px] h-full p-2">
          <h1 className="text-primary font-semibold text-xl mb-4">Output</h1>
          <div className="w-full flex text-sm flex-col overflow-y-scroll h-full">
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

      <Chat />
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
