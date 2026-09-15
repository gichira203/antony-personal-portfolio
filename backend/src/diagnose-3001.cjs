#!/usr/bin/env node
// diagnose-3001.js — find and inspect whatever is listening on 3001
const { execSync } = require("child_process");

console.log("=== 1. What's on port 3001 ===");
let out;
try {
  out = execSync("netstat -ano | findstr ':3001'", { encoding: "utf8", timeout: 5000 });
} catch (e) {
  out = "";
}
console.log(out.trim() || "Nothing on 3001");
const pid = (out.match(/LISTENING\s+(\d+)/) || out.match(/:3001\s+\S+\s+(\d+)/))?.[1] || null;
console.log("PID on 3001:", pid);

if (pid) {
  console.log("\n=== 2. Process info for PID", pid, "===");
  try {
    console.log(execSync(`tasklist //FI "PID eq ${pid}" //FO LIST`, { encoding: "utf8", timeout: 5000 }));
  } catch (e) {
    console.log("tasklist failed:", e.message);
  }

  console.log("\n=== 3. Command line ===");
  try {
    console.log(execSync(`wmic process where "ProcessId=${pid}" get CommandLine /format:list`, { encoding: "utf8", timeout: 5000 }));
  } catch (e) {
    console.log("wmic failed:", e.message);
  }

  console.log("\n=== 4. Executable path ===");
  try {
    console.log(execSync(`wmic process where "ProcessId=${pid}" get ExecutablePath,Name /format:list`, { encoding: "utf8", timeout: 5000 }));
  } catch (e) {
    console.log("wmic failed:", e.message);
  }

  console.log("\n=== 5. Module/loaded files via powershell ===");
  try {
    console.log(execSync(`powershell -Command "Get-Process -Id ${pid} | Select-Object Path,Company,ProductName | Format-List"`, { encoding: "utf8", timeout: 5000 }));
  } catch (e) {
    console.log("powershell failed:", e.message);
  }
}

console.log("\n=== 6. All node.exe processes ===");
try {
  console.log(execSync("tasklist //FI \"IMAGENAME eq node.exe\" //FO TABLE", { encoding: "utf8", timeout: 5000 }));
} catch (e) {
  console.log("tasklist node failed:", e.message);
}
