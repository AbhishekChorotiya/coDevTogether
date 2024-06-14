import React, { forwardRef, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

const EditorBox = forwardRef(
  ({ language = "javascript", code, setCode }, ref) => {
    return (
      <CodeMirror
        value={code}
        className="w-full min-h-full shrink-0"
        minHeight="100%"
        extensions={[javascript({ jsx: true })]}
        onChange={(e) => setCode(e)}
        ref={ref}
      />
    );
  }
);

export default EditorBox;
