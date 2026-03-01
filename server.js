import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);
  const roomsStudents = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-room", ({ code, role }) => {
      socket.join(code);
      console.log(`Socket ${socket.id} joined room ${code} as ${role}`);

      if (role === "student") {
        if (!roomsStudents.has(code)) {
            roomsStudents.set(code, new Set());
        }
        roomsStudents.get(code).add(socket.id);
        
        io.to(code).emit("students-count-changed", roomsStudents.get(code).size);
      }
    });

    socket.on("submit-answer", (payload) => {
      console.log(`Answer received for ${payload.code}:`, payload.value);
      io.to(payload.code).emit("new-answer", payload);
    });

    socket.on("show-results", (code) => {
      console.log(`Professor triggered show-results for ${code}`);
      io.to(code).emit("results-revealed");
    });

    socket.on("end-session", (code) => {
      console.log(`Professor ended session for ${code}`);
      io.to(code).emit("session-ended");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [code, studentSet] of roomsStudents.entries()) {
        if (studentSet.has(socket.id)) {
            studentSet.delete(socket.id);
            io.to(code).emit("students-count-changed", studentSet.size);
            break;
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
