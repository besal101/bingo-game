import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { initSocket } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.IO server
  const io = new SocketIOServer(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // Enable both WebSocket and polling
  });

  // Add debug logging
  io.engine.on("connection_error", (err) => {
    console.log("Connection error:", err);
  });

  io.engine.on("headers", (headers, req) => {
    console.log("Headers:", headers);
  });

  // Initialize socket events
  initSocket(io);

  const port = process.env.PORT || 3000;
  const hostname = "192.168.101.92";

  server.listen(parseInt(port.toString()), hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
