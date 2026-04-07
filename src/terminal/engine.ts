// ─── Fake Terminal Command Engine ───

export interface FileSystem {
  currentDir: string;
  dirs: string[];
  files: Record<string, string>;
  gitState: {
    initialized: boolean;
    branch: string;
    staged: string[];
    committed: string[];
    branches: string[];
    commits: { hash: string; message: string; date: string }[];
  };
  dockerState: {
    containers: { id: string; image: string; port: string; name: string; status: string }[];
    images: string[];
  };
  mlflowState: {
    running: boolean;
    experiments: { id: number; name: string }[];
    runs: { id: string; experiment: string; metrics: Record<string, number> }[];
  };
  pythonMode: boolean;
}

export interface TerminalLine {
  type: "command" | "output" | "error" | "success" | "warning" | "info";
  text: string;
}

export function createInitialFS(): FileSystem {
  return {
    currentDir: "/home/student/devops-lab",
    dirs: [
      "/home", "/home/student", "/home/student/devops-lab",
      "/home/student/devops-lab/.git",
      "/home/student/devops-lab/.github",
      "/home/student/devops-lab/.github/workflows",
    ],
    files: {
      "/home/student/devops-lab/README.md": "# DevOps Lab\nProjet de démonstration LearnOps Journey",
      "/home/student/devops-lab/Dockerfile": "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ['node', 'index.js']",
      "/home/student/devops-lab/docker-compose.yml": "version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'",
      "/home/student/devops-lab/.github/workflows/ci.yml": "name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm test",
    },
    gitState: { initialized: false, branch: "main", staged: [], committed: [], branches: ["main"], commits: [] },
    dockerState: {
      containers: [],
      images: ["nginx:latest", "node:18-alpine", "python:3.10"],
    },
    mlflowState: { running: false, experiments: [], runs: [] },
    pythonMode: false,
  };
}

function shortDir(dir: string): string {
  if (dir === "/home/student") return "~";
  if (dir.startsWith("/home/student/")) return "~/" + dir.slice("/home/student/".length);
  return dir;
}

export function getPrompt(fs: FileSystem): string {
  if (fs.pythonMode) return ">>> ";
  const d = shortDir(fs.currentDir);
  return `[student@learnops ${d.split("/").pop() || d}]$ `;
}

function randHash(len = 7): string {
  return Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

function formatDate(): string {
  return new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", year: "numeric" });
}

function resolvePath(fs: FileSystem, p: string): string {
  if (p.startsWith("/")) return p;
  if (p.startsWith("~/")) return "/home/student/" + p.slice(2);
  const parts = fs.currentDir.split("/").filter(Boolean);
  for (const seg of p.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg !== ".") parts.push(seg);
  }
  return "/" + parts.join("/");
}

function lsFiles(fs: FileSystem, dir: string, long: boolean): string {
  const entries: { name: string; isDir: boolean }[] = [];
  const dirNorm = dir.endsWith("/") ? dir : dir + "/";

  for (const d of fs.dirs) {
    if (d === dir) continue;
    const rel = d.startsWith(dirNorm) ? d.slice(dirNorm.length) : null;
    if (rel && !rel.includes("/")) entries.push({ name: rel, isDir: true });
  }
  for (const f of Object.keys(fs.files)) {
    const parentDir = f.substring(0, f.lastIndexOf("/"));
    if (parentDir === dir) {
      entries.push({ name: f.split("/").pop()!, isDir: false });
    }
  }

  if (entries.length === 0) return "";

  if (!long) return entries.map(e => e.isDir ? `\x1b[34m${e.name}/\x1b[0m` : e.name).join("  ");

  return entries.map(e => {
    const perm = e.isDir ? "drwxr-xr-x" : "-rw-r--r--";
    const size = e.isDir ? "4096" : String((fs.files[dirNorm + e.name] || "").length).padStart(4);
    return `${perm}  1 student student ${size} Jun 10 14:23 ${e.name}${e.isDir ? "/" : ""}`;
  }).join("\n");
}

export type CommandResult = {
  lines: TerminalLine[];
  delayed?: { lines: TerminalLine[]; delayMs: number }[];
};

export function executeCommand(input: string, fs: FileSystem): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  // Python mode
  if (fs.pythonMode) {
    if (trimmed === "exit()" || trimmed === "quit()") {
      fs.pythonMode = false;
      return { lines: [{ type: "output", text: ">>>" }] };
    }
    if (trimmed.startsWith("print(")) {
      const inner = trimmed.slice(6, -1).replace(/^['"]|['"]$/g, "");
      return { lines: [{ type: "output", text: inner }] };
    }
    try {
      // basic math
      const result = Function(`"use strict"; return (${trimmed})`)();
      return { lines: [{ type: "output", text: String(result) }] };
    } catch {
      return { lines: [{ type: "error", text: `NameError: name '${trimmed.split(/[^a-zA-Z]/)[0]}' is not defined` }] };
    }
  }

  const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [trimmed];
  const cmd = parts[0];
  const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ""));

  // Easter eggs
  if (cmd === "matrix") {
    return { lines: [{ type: "success", text: "🟢 Entering the Matrix..." }] };
  }
  if (cmd === "learnops") {
    return {
      lines: [{
        type: "info", text:
          "╦  ╔═╗╔═╗╦═╗╔╗╔╔═╗╔═╗╔═╗\n║  ║╣ ╠═╣╠╦╝║║║║ ║╠═╝╚═╗\n╩═╝╚═╝╩ ╩╩╚═╝╚╝╚═╝╩  ╚═╝\n  Journey — DevOps Learning Platform\n  v2.0.0 | Made with ❤️ in Tunisia"
      }]
    };
  }

  switch (cmd) {
    case "clear":
      return { lines: [{ type: "output", text: "__CLEAR__" }] };

    case "pwd":
      return { lines: [{ type: "output", text: fs.currentDir }] };

    case "whoami":
      return { lines: [{ type: "output", text: "student" }] };

    case "date":
      return { lines: [{ type: "output", text: formatDate() }] };

    case "help": {
      return {
        lines: [{
          type: "info", text:
            "📋 Commandes disponibles:\n\n" +
            "  Système:  pwd, ls, cd, mkdir, touch, cat, echo, clear, whoami, date, history, help\n" +
            "  Git:      git init/add/commit/status/log/branch/checkout/merge/push/clone\n" +
            "  Docker:   docker images/pull/run/ps/stop/build, docker-compose up/down\n" +
            "  MLflow:   mlflow ui/experiments/run\n" +
            "  Python:   python3 (interactive REPL)\n\n" +
            "  Easter eggs: matrix, learnops"
        }]
      };
    }

    case "history":
      return { lines: [{ type: "output", text: "  (use Up/Down arrows to navigate history)" }] };

    case "exit":
      return { lines: [{ type: "warning", text: "Type 'clear' to reset or continue typing commands." }] };

    case "ls": {
      const hasL = args.some(a => a.startsWith("-") && a.includes("l"));
      const dir = args.find(a => !a.startsWith("-"));
      const target = dir ? resolvePath(fs, dir) : fs.currentDir;
      if (!fs.dirs.includes(target)) return { lines: [{ type: "error", text: `ls: cannot access '${dir}': No such file or directory` }] };
      const out = lsFiles(fs, target, hasL);
      return { lines: out ? [{ type: "output", text: out }] : [] };
    }

    case "cd": {
      if (!args[0] || args[0] === "~") { fs.currentDir = "/home/student"; return { lines: [] }; }
      const target = resolvePath(fs, args[0]);
      if (fs.dirs.includes(target)) { fs.currentDir = target; return { lines: [] }; }
      return { lines: [{ type: "error", text: `bash: cd: ${args[0]}: No such file or directory` }] };
    }

    case "mkdir": {
      const p = args.find(a => !a.startsWith("-")) || "";
      if (!p) return { lines: [{ type: "error", text: "mkdir: missing operand" }] };
      const recursive = args.includes("-p");
      const full = resolvePath(fs, p);
      if (recursive) {
        let acc = "";
        for (const seg of full.split("/").filter(Boolean)) {
          acc += "/" + seg;
          if (!fs.dirs.includes(acc)) fs.dirs.push(acc);
        }
      } else {
        const parent = full.substring(0, full.lastIndexOf("/"));
        if (!fs.dirs.includes(parent)) return { lines: [{ type: "error", text: `mkdir: cannot create directory '${p}': No such file or directory` }] };
        if (!fs.dirs.includes(full)) fs.dirs.push(full);
      }
      return { lines: [] };
    }

    case "touch": {
      if (!args[0]) return { lines: [{ type: "error", text: "touch: missing file operand" }] };
      const fp = resolvePath(fs, args[0]);
      if (!fs.files[fp]) fs.files[fp] = "";
      return { lines: [] };
    }

    case "cat": {
      if (!args[0]) return { lines: [{ type: "error", text: "cat: missing file operand" }] };
      const fp = resolvePath(fs, args[0]);
      if (fs.files[fp] !== undefined) return { lines: [{ type: "output", text: fs.files[fp] }] };
      return { lines: [{ type: "error", text: `cat: ${args[0]}: No such file or directory` }] };
    }

    case "echo": {
      const text = args.join(" ");
      const writeIdx = args.indexOf(">");
      if (writeIdx !== -1) {
        const content = args.slice(0, writeIdx).join(" ");
        const file = args[writeIdx + 1];
        if (file) {
          const fp = resolvePath(fs, file);
          fs.files[fp] = content;
        }
        return { lines: [] };
      }
      return { lines: [{ type: "output", text }] };
    }

    case "sudo":
      return { lines: [{ type: "error", text: "student is not in the sudoers file. This incident will be reported." }] };

    case "rm":
      if (args.join(" ").includes("-rf /")) return { lines: [{ type: "error", text: "Permission denied. Nice try! 😄" }] };
      return { lines: [{ type: "output", text: "" }] };

    case "python":
    case "python3":
      fs.pythonMode = true;
      return { lines: [{ type: "output", text: "Python 3.10.12 (main, Jun 10 2025, 14:23:41)\nType \"exit()\" to quit.\n>>>" }] };

    case "vim":
    case "nano":
      return { lines: [{ type: "warning", text: "Terminal editors not supported in LearnOps Terminal. Use the built-in editor instead." }] };

    // ── GIT ──
    case "git":
      return handleGit(args, fs);

    // ── DOCKER ──
    case "docker":
      return handleDocker(args, fs);

    case "docker-compose":
      return handleDockerCompose(args, fs);

    // ── MLFLOW ──
    case "mlflow":
      return handleMlflow(args, fs);

    default:
      return { lines: [{ type: "error", text: `bash: ${cmd}: command not found` }] };
  }
}

function handleGit(args: string[], fs: FileSystem): CommandResult {
  const sub = args[0];

  switch (sub) {
    case "init":
      fs.gitState.initialized = true;
      return { lines: [{ type: "output", text: `Initialized empty Git repository in ${fs.currentDir}/.git/` }] };

    case "status":
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository (or any parent directory): .git" }] };
      if (fs.gitState.staged.length === 0) return { lines: [{ type: "output", text: `On branch ${fs.gitState.branch}\nNothing to commit, working tree clean` }] };
      return { lines: [{ type: "output", text: `On branch ${fs.gitState.branch}\nChanges to be committed:\n${fs.gitState.staged.map(f => `  new file:   ${f}`).join("\n")}` }] };

    case "add": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      const file = args[1];
      if (file === ".") {
        const dirPrefix = fs.currentDir + "/";
        Object.keys(fs.files).forEach(f => {
          if (f.startsWith(dirPrefix)) {
            const rel = f.slice(dirPrefix.length);
            if (!fs.gitState.staged.includes(rel)) fs.gitState.staged.push(rel);
          }
        });
      } else if (file) {
        if (!fs.gitState.staged.includes(file)) fs.gitState.staged.push(file);
      }
      return { lines: [] };
    }

    case "commit": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      const msgIdx = args.indexOf("-m");
      const msg = msgIdx !== -1 ? args[msgIdx + 1] || "commit" : "commit";
      const hash = randHash();
      const count = fs.gitState.staged.length || 1;
      fs.gitState.commits.push({ hash, message: msg, date: new Date().toISOString() });
      fs.gitState.committed.push(...fs.gitState.staged);
      fs.gitState.staged = [];
      return { lines: [{ type: "output", text: `[${fs.gitState.branch} ${hash}] ${msg}\n ${count} file${count > 1 ? "s" : ""} changed, ${count} insertion${count > 1 ? "s" : ""}(+)` }] };
    }

    case "log": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      const logs = (fs.gitState.commits.length ? fs.gitState.commits : [
        { hash: "a3f2c1d", message: "Initial commit", date: new Date().toISOString() },
      ]).slice(-5).reverse();
      const out = logs.map(c =>
        `commit ${c.hash}${"0".repeat(33)}\nAuthor: student <student@learnops.tn>\nDate:   ${new Date(c.date).toLocaleString()}\n\n    ${c.message}`
      ).join("\n\n");
      return { lines: [{ type: "output", text: out }] };
    }

    case "branch": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      if (args[1]) {
        fs.gitState.branches.push(args[1]);
        return { lines: [] };
      }
      return { lines: [{ type: "output", text: fs.gitState.branches.map(b => b === fs.gitState.branch ? `* ${b}` : `  ${b}`).join("\n") }] };
    }

    case "checkout": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      if (args[1] === "-b" && args[2]) {
        fs.gitState.branches.push(args[2]);
        fs.gitState.branch = args[2];
        return { lines: [{ type: "output", text: `Switched to a new branch '${args[2]}'` }] };
      }
      if (args[1]) {
        if (fs.gitState.branches.includes(args[1])) {
          fs.gitState.branch = args[1];
          return { lines: [{ type: "output", text: `Switched to branch '${args[1]}'` }] };
        }
        return { lines: [{ type: "error", text: `error: pathspec '${args[1]}' did not match any` }] };
      }
      return { lines: [] };
    }

    case "merge": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      if (!args[1]) return { lines: [{ type: "error", text: "merge: missing branch name" }] };
      return { lines: [{ type: "output", text: `Merge made by the 'recursive' strategy.\n README.md | 1 +\n 1 file changed, 1 insertion(+)` }] };
    }

    case "push": {
      if (!fs.gitState.initialized) return { lines: [{ type: "error", text: "fatal: not a git repository" }] };
      return {
        lines: [],
        delayed: [
          { lines: [{ type: "output", text: "Enumerating objects: 3, done." }], delayMs: 300 },
          { lines: [{ type: "output", text: "Counting objects: 100% (3/3), done." }], delayMs: 600 },
          { lines: [{ type: "output", text: "Writing objects: 100% (3/3), 234 bytes | 234.00 KiB/s, done." }], delayMs: 900 },
          { lines: [{ type: "output", text: `To github.com:student/devops-lab.git\n * [new branch]      ${fs.gitState.branch} -> ${fs.gitState.branch}` }], delayMs: 1200 },
        ],
      };
    }

    case "clone":
      return {
        lines: [],
        delayed: [
          { lines: [{ type: "output", text: "Cloning into 'repo'..." }], delayMs: 200 },
          { lines: [{ type: "output", text: "remote: Enumerating objects: 42, done." }], delayMs: 500 },
          { lines: [{ type: "output", text: "remote: Total 42 (delta 0)" }], delayMs: 700 },
          { lines: [{ type: "output", text: "Receiving objects: 100% (42/42), 18.5 KiB | 2.3 MiB/s, done." }], delayMs: 1000 },
        ],
      };

    default:
      return { lines: [{ type: "error", text: `git: '${sub}' is not a git command.` }] };
  }
}

function handleDocker(args: string[], fs: FileSystem): CommandResult {
  const sub = args[0];

  switch (sub) {
    case "--version":
    case "version":
      return { lines: [{ type: "output", text: "Docker version 24.0.5, build ced0996" }] };

    case "images":
    case "image":
      if (args[1] === "ls" || sub === "images") {
        const header = "REPOSITORY          TAG       IMAGE ID       CREATED        SIZE";
        const rows = fs.dockerState.images.map(img => {
          const [repo, tag] = img.includes(":") ? img.split(":") : [img, "latest"];
          const id = randHash(12);
          const sizes: Record<string, string> = { nginx: "187MB", node: "172MB", python: "920MB" };
          const size = sizes[repo] || "256MB";
          return `${repo.padEnd(20)}${tag.padEnd(10)}${id}   2 weeks ago    ${size}`;
        });
        return { lines: [{ type: "output", text: [header, ...rows].join("\n") }] };
      }
      return { lines: [] };

    case "pull": {
      const image = args[1] || "latest";
      return {
        lines: [],
        delayed: [
          { lines: [{ type: "output", text: `latest: Pulling from library/${image}` }], delayMs: 300 },
          { lines: [{ type: "output", text: `a2abf6c4d29d: Pull complete` }], delayMs: 600 },
          { lines: [{ type: "output", text: `Digest: sha256:4c0b86${randHash(20)}` }], delayMs: 900 },
          { lines: [{ type: "output", text: `Status: Downloaded newer image for ${image}:latest` }], delayMs: 1200 },
        ],
      };
    }

    case "run": {
      const image = args[args.length - 1];
      const portIdx = args.indexOf("-p");
      const port = portIdx !== -1 ? args[portIdx + 1] : "80:80";
      const id = randHash(12);
      const name = image.split(":")[0] + "_" + randHash(4);
      fs.dockerState.containers.push({ id, image, port, name, status: "Up 2 seconds" });
      return { lines: [{ type: "output", text: id }] };
    }

    case "ps": {
      const header = "CONTAINER ID   IMAGE            COMMAND       CREATED         STATUS          PORTS                  NAMES";
      if (fs.dockerState.containers.length === 0) return { lines: [{ type: "output", text: header }] };
      const rows = fs.dockerState.containers.map(c =>
        `${c.id.slice(0, 12)}   ${c.image.padEnd(17)}\"nginx -g...\"   3 seconds ago   ${c.status.padEnd(16)}0.0.0.0:${c.port}   ${c.name}`
      );
      return { lines: [{ type: "output", text: [header, ...rows].join("\n") }] };
    }

    case "stop": {
      if (args.includes("$(docker") || args[1]) {
        const stopped = fs.dockerState.containers.map(c => c.id.slice(0, 12));
        fs.dockerState.containers = [];
        return { lines: [{ type: "output", text: stopped.join("\n") || "No containers running" }] };
      }
      return { lines: [] };
    }

    case "kill": {
      const stopped = fs.dockerState.containers.map(c => c.id.slice(0, 12));
      fs.dockerState.containers = [];
      return { lines: [{ type: "output", text: stopped.join("\n") || "No containers running" }] };
    }

    case "build": {
      const nameIdx = args.indexOf("-t");
      const name = nameIdx !== -1 ? args[nameIdx + 1] : "app";
      const builtId = randHash(12);
      if (!fs.dockerState.images.includes(name + ":latest")) fs.dockerState.images.push(name + ":latest");
      return {
        lines: [],
        delayed: [
          { lines: [{ type: "output", text: `Step 1/5 : FROM node:18-alpine\n ---> 3a6f9b78c9e1` }], delayMs: 200 },
          { lines: [{ type: "output", text: `Step 2/5 : WORKDIR /app\n ---> Running in 4f3e2d1c0b9a` }], delayMs: 400 },
          { lines: [{ type: "output", text: `Step 3/5 : COPY . .` }], delayMs: 600 },
          { lines: [{ type: "output", text: `Step 4/5 : RUN npm install\nadded 847 packages in 12s` }], delayMs: 900 },
          { lines: [{ type: "output", text: `Step 5/5 : CMD ['node','index.js']` }], delayMs: 1100 },
          { lines: [{ type: "success", text: `Successfully built ${builtId}\nSuccessfully tagged ${name}:latest` }], delayMs: 1400 },
        ],
      };
    }

    default:
      return { lines: [{ type: "error", text: `docker: '${sub}' is not a docker command.` }] };
  }
}

function handleDockerCompose(args: string[], fs: FileSystem): CommandResult {
  const sub = args[0];
  if (sub === "up") {
    const id = randHash(12);
    fs.dockerState.containers.push({ id, image: "app:latest", port: "3000:3000", name: "devops-lab_app_1", status: "Up 1 second" });
    return {
      lines: [],
      delayed: [
        { lines: [{ type: "output", text: "Creating network 'devops-lab_default' with the default driver" }], delayMs: 300 },
        { lines: [{ type: "output", text: "Creating devops-lab_app_1 ... done" }], delayMs: 800 },
      ],
    };
  }
  if (sub === "down") {
    fs.dockerState.containers = fs.dockerState.containers.filter(c => !c.name.startsWith("devops-lab"));
    return {
      lines: [],
      delayed: [
        { lines: [{ type: "output", text: "Stopping devops-lab_app_1 ... done" }], delayMs: 300 },
        { lines: [{ type: "output", text: "Removing devops-lab_app_1 ... done" }], delayMs: 600 },
        { lines: [{ type: "output", text: "Removing network devops-lab_default" }], delayMs: 900 },
      ],
    };
  }
  return { lines: [{ type: "error", text: `Unknown docker-compose command: ${sub}` }] };
}

function handleMlflow(args: string[], fs: FileSystem): CommandResult {
  const sub = args[0];

  if (sub === "ui") {
    fs.mlflowState.running = true;
    return {
      lines: [],
      delayed: [
        { lines: [{ type: "output", text: "[2025-06-10 14:23:41 +0100] [1234] [INFO] Starting gunicorn 20.1.0" }], delayMs: 400 },
        { lines: [{ type: "success", text: "[INFO] Listening at: http://127.0.0.1:5000" }], delayMs: 800 },
      ],
    };
  }

  if (sub === "experiments") {
    if (args[1] === "create") {
      const nameIdx = args.indexOf("-n");
      const name = nameIdx !== -1 ? args[nameIdx + 1] : "experiment";
      const id = fs.mlflowState.experiments.length + 1;
      fs.mlflowState.experiments.push({ id, name });
      return { lines: [{ type: "output", text: `Created experiment '${name}' with id ${id}` }] };
    }
    if (args[1] === "list") {
      if (fs.mlflowState.experiments.length === 0) return { lines: [{ type: "output", text: "No experiments found." }] };
      const header = "Experiment Id  Name                 Artifact Location";
      const rows = fs.mlflowState.experiments.map(e => `${String(e.id).padEnd(15)}${e.name.padEnd(21)}mlruns/${e.id}`);
      return { lines: [{ type: "output", text: [header, ...rows].join("\n") }] };
    }
    return { lines: [{ type: "error", text: "Usage: mlflow experiments [create|list]" }] };
  }

  if (sub === "run") {
    return {
      lines: [],
      delayed: [
        { lines: [{ type: "output", text: "2025/06/10 14:23:41 INFO mlflow.projects: === Running command 'python train.py' ===" }], delayMs: 300 },
        { lines: [{ type: "output", text: "Epoch 1/10: loss=0.8432, accuracy=0.6234" }], delayMs: 800 },
        { lines: [{ type: "output", text: "Epoch 5/10: loss=0.3211, accuracy=0.8756" }], delayMs: 1300 },
        { lines: [{ type: "output", text: "Epoch 10/10: loss=0.1243, accuracy=0.9412" }], delayMs: 1800 },
        { lines: [{ type: "success", text: "2025/06/10 14:23:53 INFO mlflow.projects: === Run succeeded ===" }], delayMs: 2300 },
      ],
    };
  }

  return { lines: [{ type: "error", text: `mlflow: '${sub}' is not a command.` }] };
}

// ── Autocomplete helper ──
export function getCompletions(input: string, fs: FileSystem): string[] {
  const parts = input.split(" ");
  const last = parts[parts.length - 1] || "";

  if (parts.length === 1) {
    const cmds = ["ls", "cd", "pwd", "mkdir", "touch", "cat", "echo", "clear", "whoami", "date", "history", "help", "git", "docker", "docker-compose", "mlflow", "python3", "exit"];
    return cmds.filter(c => c.startsWith(last));
  }

  // File/dir completion
  const dirPrefix = fs.currentDir.endsWith("/") ? fs.currentDir : fs.currentDir + "/";
  const names: string[] = [];
  for (const d of fs.dirs) {
    if (d.startsWith(dirPrefix) && d !== fs.currentDir) {
      const rel = d.slice(dirPrefix.length);
      if (!rel.includes("/")) names.push(rel + "/");
    }
  }
  for (const f of Object.keys(fs.files)) {
    if (f.startsWith(dirPrefix)) {
      const rel = f.slice(dirPrefix.length);
      if (!rel.includes("/")) names.push(rel);
    }
  }

  // Git subcommand completion
  if (parts[0] === "git" && parts.length === 2) {
    const subs = ["init", "add", "commit", "status", "log", "branch", "checkout", "merge", "push", "clone"];
    return subs.filter(s => s.startsWith(last));
  }
  if (parts[0] === "docker" && parts.length === 2) {
    const subs = ["images", "pull", "run", "ps", "stop", "build", "kill", "--version"];
    return subs.filter(s => s.startsWith(last));
  }

  return names.filter(n => n.startsWith(last));
}

// ── Lab step validation ──
export function checkLabStep(command: string, expectedCommands: string[]): boolean {
  const trimmed = command.trim().toLowerCase();
  return expectedCommands.some(ec => trimmed.startsWith(ec.toLowerCase()));
}
