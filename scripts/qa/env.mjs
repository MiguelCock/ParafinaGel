import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import net from "node:net";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function readConfig() {
  const baseUrl = process.env.QA_BASE_URL
    ? process.env.QA_BASE_URL.replace(/\/+$/, "")
    : null;

  return {
    quick: process.env.QA_QUICK === "1",
    skipBuild: process.env.QA_SKIP_BUILD === "1",
    headless: process.env.QA_HEADLESS !== "0",
    verbose: process.env.QA_VERBOSE === "1",
    baseUrl,
    port: Number(process.env.QA_PORT || 4322),
    outDir: path.resolve(ROOT, process.env.QA_OUT_DIR || "qa"),
    browserPath: process.env.BROWSER_PATH || null,
  };
}

export async function findFreePort(start) {
  for (let port = start; port < start + 40; port += 1) {
    const free = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });
    if (free) return port;
  }

  throw new Error(`No hay un puerto libre desde ${start}. Define QA_PORT.`);
}

export async function runBuild() {
  const { spawn } = await import("node:child_process");
  const child = spawn("npm", ["run", "build"], {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
  });

  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (exitCode, signal) => {
      resolve(signal ? 1 : (exitCode ?? 1));
    });
  });

  if (code !== 0) {
    throw new Error(`build terminó con código ${code}.`);
  }
}

export async function startPreview(port) {
  const distDir = path.join(ROOT, "dist");

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
      const pathname = decodeURIComponent(url.pathname);
      const relative = pathname.replace(/^\/+/, "");
      let filePath = path.resolve(distDir, relative);

      if (
        filePath !== distDir &&
        !filePath.startsWith(`${distDir}${path.sep}`)
      ) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      if (pathname.endsWith("/")) {
        filePath = path.join(filePath, "index.html");
      } else {
        try {
          const info = await stat(filePath);
          if (info.isDirectory()) {
            filePath = path.join(filePath, "index.html");
          }
        } catch {
          // Fall through to the 404 below.
        }
      }

      if (!existsSync(filePath)) {
        const notFound = path.join(distDir, "404.html");
        response.writeHead(404, {
          "content-type": MIME[".html"],
          "cache-control": "no-store",
        });
        if (existsSync(notFound)) {
          createReadStream(notFound).pipe(response);
        } else {
          response.end("Not found");
        }
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "content-type": MIME[extension] ?? "application/octet-stream",
        "cache-control": "no-store",
      });

      if (request.method === "HEAD") {
        response.end();
        return;
      }

      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(500);
      response.end("Internal server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  return {
    server,
    port,
    url: `http://127.0.0.1:${port}`,
    logs: () => "",
  };
}

export async function waitForServer(preview, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  const gameUrl = new URL("/juego/", preview.url);

  while (Date.now() < deadline) {
    try {
      const response = await fetch(gameUrl, {
        signal: AbortSignal.timeout(2500),
      });
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await wait(150);
  }

  throw new Error(`El servidor no respondió en ${timeoutMs} ms.`);
}

export async function stopPreview(preview) {
  if (!preview?.server) return;
  preview.server.closeAllConnections?.();
  await new Promise((resolve) => preview.server.close(resolve));
}

export function ensureDist() {
  const entry = path.join(ROOT, "dist/juego/index.html");
  if (!existsSync(entry)) {
    throw new Error(
      "No existe dist/juego/index.html. Corre npm run build o quita QA_SKIP_BUILD.",
    );
  }
}
