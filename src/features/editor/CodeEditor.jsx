import { useMemo } from "react";
import { autocompletion } from "@codemirror/autocomplete";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";

function languageExtension(language) {
  if (language === "python") return python();
  if (language === "java") return java();
  if (language === "cpp") return cpp();
  return javascript({ jsx: true });
}

export function CodeEditor({ language, code, onChange }) {
  const extensions = useMemo(
    () => [languageExtension(language), autocompletion()],
    [language],
  );

  return (
    <CodeMirror
      value={code}
      aria-label="Collaborative code editor"
      className="code-editor h-full min-h-0 w-full"
      height="100%"
      extensions={extensions}
      onChange={onChange}
    />
  );
}
