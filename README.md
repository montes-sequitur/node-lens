# 🔍 ping — Node.js Environment Diagnostic Lens

**ping** is a lightweight, zero-overhead diagnostic tool designed to act as an inspection lens for any Node.js runtime environment. It verifies system resources, subsystem health, cryptographic performance, network connectivity, environment variables, and installed global packages—delivering results instantly via CLI or a crisp web dashboard.

---

## ✨ Key Features

- **🚀 Ultra-Fast Subsystem Benchmarks**: Parallel latency tests for File System (`fs`), Cryptography (`crypto`), Event Loop microtasks (`async`), and Network connectivity (`DNS` + `HTTPS`).
- **💻 Detailed System Metrics**: Displays Node.js runtime versions (V8, OpenSSL, Libuv), CPU cores, RAM usage, process RSS, and OS details.
- **🌍 Environment & Global Packages Inspection**: Inspects `NODE_ENV`, `.env` file presence, total environment variables, and lists globally installed `npm` packages.
- **🖥️ Dual Lens Modes**:
  - **CLI Terminal**: Instant ANSI-colored diagnostic output.
  - **Web Dashboard**: Built-in HTTP server rendering a clean developer dashboard using *Inter* & *JetBrains Mono* typography.
- **📦 Automation-Ready**: Supports `--json` for machine-readable output and `--output <file>` for saving reports directly to disk.
- **🛡️ Strictly Typed & Linted**: Written in 100% strict TypeScript, verified with ESLint v9 Flat Config and Node.js native test runner.

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/your-username/ping.git
cd ping
npm install
```

### Usage

#### 1. Run Diagnostics Check (CLI)
```bash
npm run check
```

#### 2. Start HTTP Diagnostic Server
```bash
npm start
# Server available at http://localhost:3000
```

---

## 🛠️ CLI Options

| Flag | Short | Description | Example |
| :--- | :--- | :--- | :--- |
| `--check` | `-c` | Runs instant diagnostic check and exits | `npm run check` |
| `--json` | `-j` | Outputs raw JSON diagnostic report to stdout | `npx tsx src/index.ts --json` |
| `--output <file>` | `-o <file>` | Saves JSON diagnostic report directly to disk | `npx tsx src/index.ts --check -o report.json` |
| `--port <number>` | `-p <number>` | Custom port for the HTTP server | `npx tsx src/index.ts -p 8080` |

---

## 📁 Project Structure

```text
ping/
├── src/
│   ├── diagnostics.ts   # Parallel subsystem tests & metric collection
│   ├── cli.ts           # ANSI terminal report formatter (picocolors)
│   ├── html.ts          # Functional HTML dashboard renderer (vhtml)
│   ├── server.ts        # Light HTTP server (native http module)
│   ├── types.ts         # TypeScript interfaces & Utility Types
│   ├── index.ts         # CLI entrypoint & Commander options setup
│   └── vhtml.d.ts       # TypeScript type declarations for vhtml
├── public/
│   └── style.css        # Modern CSS stylesheet (Inter & JetBrains Mono)
├── test/
│   └── verify.test.ts   # Node.js native test runner test suite
├── eslint.config.mjs    # ESLint v9 Flat Config (TypeScript rules & max-len)
├── tsconfig.json        # Strict TypeScript compiler options
└── package.json         # Scripts & dependencies
```

---

## 🧪 Testing & Code Quality

```bash
# Run unit tests
npm test

# Run linter & auto-formatter
npm run lint:fix

# Build TypeScript to dist/
npm run build
```

---

## 📄 License

ISC License
