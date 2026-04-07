import { useState, useRef, useEffect, useCallback } from "react";
import { createInitialFS, executeCommand, getPrompt, getCompletions, type FileSystem, type TerminalLine } from "@/terminal/engine";

interface TerminalProps {
  height?: string;
  onCommand?: (cmd: string) => void;
  welcomeMessage?: string;
  className?: string;
}

const Terminal = ({ height = "70vh", onCommand, welcomeMessage, className = "" }: TerminalProps) => {
  const [fs, setFs] = useState<FileSystem>(() => createInitialFS());
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    const welcome = welcomeMessage || "Welcome to LearnOps Terminal v2.0\nType 'help' for available commands.\n";
    return [{ type: "info", text: welcome }];
  });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [matrixMode, setMatrixMode] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [lines, scrollToBottom]);

  const focusInput = () => inputRef.current?.focus();

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines(prev => [...prev, ...newLines]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;
    const cmd = input.trim();
    const prompt = getPrompt(fs);

    // Add command line
    if (!fs.pythonMode) {
      addLines([{ type: "command", text: `${prompt}${cmd}` }]);
    } else {
      addLines([{ type: "command", text: `>>> ${cmd}` }]);
    }

    if (cmd) {
      setHistory(prev => [...prev.slice(-49), cmd]);
      setHistoryIdx(-1);
    }

    setInput("");

    if (!cmd) return;

    // Matrix easter egg
    if (cmd === "matrix") {
      setMatrixMode(true);
      setTimeout(() => setMatrixMode(false), 3000);
      addLines([{ type: "success", text: "🟢 Entering the Matrix..." }]);
      onCommand?.(cmd);
      return;
    }

    const result = executeCommand(cmd, fs);

    if (result.lines.some(l => l.text === "__CLEAR__")) {
      setLines([]);
      setFs(prev => ({ ...prev }));
      onCommand?.(cmd);
      return;
    }

    addLines(result.lines);

    // Handle delayed output
    if (result.delayed && result.delayed.length > 0) {
      setIsProcessing(true);
      for (const d of result.delayed) {
        await new Promise(r => setTimeout(r, d.delayMs));
        addLines(d.lines);
      }
      setIsProcessing(false);
    }

    setFs({ ...fs });
    onCommand?.(cmd);
  }, [input, fs, isProcessing, addLines, onCommand]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const idx = historyIdx + 1;
      if (idx >= history.length) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(idx); setInput(history[idx]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completions = getCompletions(input, fs);
      if (completions.length === 1) {
        const parts = input.split(" ");
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(" "));
      } else if (completions.length > 1) {
        addLines([{ type: "output", text: completions.join("  ") }]);
      }
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      addLines([{ type: "command", text: `${getPrompt(fs)}${input}^C` }]);
      setInput("");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const getLineColor = (type: TerminalLine["type"]): string => {
    switch (type) {
      case "command": return "text-white";
      case "output": return "text-[#22c55e]";
      case "error": return "text-[#ef4444]";
      case "success": return "text-[#22c55e] font-bold";
      case "warning": return "text-[#f59e0b]";
      case "info": return "text-[#22d3ee]";
      default: return "text-[#22c55e]";
    }
  };

  const prompt = getPrompt(fs);

  return (
    <div className={`rounded-xl border border-[#30363d] overflow-hidden shadow-2xl ${className}`} onClick={focusInput}>
      {/* Title bar */}
      <div className="flex items-center px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[#8b949e] text-xs font-mono flex-1 text-center">
          student@learnops: {fs.currentDir.replace("/home/student", "~")}
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="bg-[#0d1117] p-4 font-mono text-sm overflow-y-auto relative"
        style={{ height }}
      >
        {/* Matrix overlay */}
        {matrixMode && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-[#22c55e] text-xs opacity-70 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </div>
            ))}
          </div>
        )}

        {/* Output lines */}
        {lines.map((line, i) => (
          <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap break-all leading-relaxed`}>
            {line.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center">
          <span className="text-[#22d3ee] whitespace-pre">{prompt}</span>
          <span className="text-white whitespace-pre">{input}</span>
          <span className="inline-block w-2 h-4 bg-[#22c55e] ml-0.5 animate-pulse" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 w-0 h-0"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
