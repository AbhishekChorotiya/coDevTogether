export function OutputPanel({ output }) {
  const hasError = Boolean(output.stderr);
  const content = hasError ? output.stderr : output.stdout;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded bg-foreground p-3" aria-label="Compiler output">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-primary">Output</h2>
        {content && (
          <span className={`text-xs font-medium ${hasError ? "text-red-500" : "text-green-600"}`}>
            {hasError ? "Error" : "Success"}
          </span>
        )}
      </div>
      <pre
        className="h-full overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-primary"
        aria-live="polite"
      >
        {content || "Run your code to see its output here."}
      </pre>
    </section>
  );
}
