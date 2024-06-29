import React, { forwardRef, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { autocompletion } from "@codemirror/autocomplete";

const EditorBox = forwardRef(
  ({ language = "javascript", code, setCode }, ref) => {
    const [extensions, setExtensions] = useState([
      javascript({ jsx: true }),
      autocompletion(),
    ]);

    useEffect(() => {
      const getLanguageExtension = (lang) => {
        switch (lang) {
          case "python":
            return python();
          case "java":
            return java();
          case "cpp":
            return cpp();
          default:
            return javascript({ jsx: true });
        }
      };
      setExtensions([getLanguageExtension(language), autocompletion()]);
    }, [language]);

    return (
      <CodeMirror
        value={code}
        className="w-full min-h-full shrink-0"
        minHeight="100%"
        extensions={extensions}
        onChange={(value) => setCode(value)}
        ref={ref}
      />
    );
  }
);

export default EditorBox;
