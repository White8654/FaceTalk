const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          chat: mongoose.Types.ObjectId(req.params.chatId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "isDeleted",
          foreignField: "_id",
          as: "deletedUsers",
        },
      },
      {
        $match: {
          deletedUsers: {
            $not: {
              $elemMatch: { _id: mongoose.Types.ObjectId(req.user._id) },
            },
          },
        },
      },
      {
        $unset: "deletedUsers",
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "chats",
          localField: "chat",
          foreignField: "_id",
          as: "chat",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $unwind: "$chat",
      },
    ]);

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email isOnline",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessages = asyncHandler(async (req, res) => {
  const chatId = req.body.chatId;

  try {
    // Delete messages with the specified chatId
    await Message.deleteMany({ chat: chatId });

    // Delete the chat from chat model
    await Chat.findByIdAndDelete(chatId);

    res.json({ message: "Chat and messages deleted successfully." });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const searchMessages = asyncHandler(async (req, res) => {});

module.exports = { allMessages, sendMessage, deleteMessages, searchMessages };
