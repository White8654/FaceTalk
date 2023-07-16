const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");
const User = require("./models/userModel");

dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
//   );
// } else {
app.get("/", (req, res) => {
  res.send("API is running..");
});
//}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

//var usp = io.of("/user-namespace");
const relation = new Map();

io.on("connection", (socket) => {
  // console.log(socket);
  // console.log("Connected to socket.io");

  socket.on("setup", async (userData) => {
    try {
      socket.join(userData._id);
      relation.set(socket.id, userData._id);
      socket.emit("connected");
      // console.log(12);
      await User.findByIdAndUpdate(
        { _id: userData._id },
        { $set: { isOnline: "true" } }
      );
      console.log(socket.id);

      socket.on("disconnect", async () => {
        console.log("USER DISCONNECTED");
        console.log(userData._id);
        socket.leave(userData._id);

        socket.disconnect(0);
        await User.findByIdAndUpdate(
          { _id: userData._id },
          { $set: { isOnline: "false" } }
        );
      });
      //console.log(relation.get(socket.id));
    } catch (error) {
      console.error("Error in setup event:", error);
    }
  });
  // console.log(relation.get(socket.id));

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("calling", async ({ roomId, userId, userData }) => {
    socket.join(roomId);
    console.log(`userId:${userId}`);
    console.log(roomId);
    try {
      const user = await User.findById(userId);

      if (!user) {
        return console.log("User not found");
      }

      if (!user.isOnline) {
        socket.emit("userNotOnline");
        console.log("User offline");
      } else {
        console.log(roomId);
        console.log(userId);
        socket
          .in(roomId)
          .emit("receivecall", { roomId: roomId, callingUser: userData });
        console.log(" calling");
      }
    } catch (error) {
      console.log("Error occurred:", error);
    }
  });

  socket.on("voice calling", async ({ voiceId, userId, userData }) => {
    socket.join(voiceId);
    console.log(`userId:${userId}`);
    console.log(voiceId);
    try {
      const user = await User.findById(userId);

      if (!user) {
        return console.log("User not found");
      }

      if (!user.isOnline) {
        socket.emit("voice userNotOnline");
        console.log("User offline");
      } else {
        console.log(voiceId);
        console.log(userId);
        socket.in(voiceId).emit("voice receivecall", {
          voiceId: voiceId,
          callingUser: userData,
        });
        console.log("voice calling");
      }
    } catch (error) {
      console.log("Error occurred:", error);
    }
  });

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("decline call", ({ roomId }) => socket.in(roomId).emit("cut call"));

  socket.on("voice decline call", ({ voiceId }) =>
    socket.in(voiceId).emit("voice cut call")
  );
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    console.log(newMessageRecieved.content);

    if (!chat.users) return console.log("chat.users not defined1");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("answer call", async ({ roomId, userId }) => {
    console.log(`userId:${userId}`);
    console.log(roomId);
    try {
      const user = await User.findById(userId);

      if (!user) {
        return console.log("User not found");
      }

      if (!user.isOnline) {
        socket.emit("userNotOnline");
        socket.leave(roomId);
        console.log("User offline");
      } else {
        console.log(roomId);
        console.log(userId);
        socket.in(roomId).emit("answered call", roomId);
        socket.leave(roomId);
        console.log(" calling");
      }
    } catch (error) {
      console.log("Error occurred:", error);
    }
  });

  socket.on("voice answer call", async ({ voiceId, userId }) => {
    console.log(`userId:${userId}`);
    console.log(voiceId);
    try {
      const user = await User.findById(userId);

      if (!user) {
        return console.log("User not found");
      }

      if (!user.isOnline) {
        socket.emit("voice userNotOnline");
        socket.leave(voiceId);
        console.log("User offline");
      } else {
        console.log(voiceId);
        console.log(userId);
        socket.in(voiceId).emit("voice answered call", voiceId);
        socket.leave(voiceId);
        console.log(" calling");
      }
    } catch (error) {
      console.log("Error occurred:", error);
    }
  });

  socket.on("logout", async (userData) => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);

    socket.disconnect(0);
    await User.findByIdAndUpdate(
      { _id: userData._id },
      { $set: { isOnline: "false" } }
    );
  });
});
