import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import asyncHandler from "express-async-handler";

export const createChat = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const chat = await Chat.create({
    participants: [req.user._id, participantId],
  });
  res.status(201).json(chat);
});

export const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id }).populate(
    "participants",
    "name"
  );
  res.json(chats);
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId }).populate(
    "sender",
    "name"
  );
  res.json(messages);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user._id,
    content,
  });

  await Chat.findByIdAndUpdate(req.params.chatId, {
    $push: { messages: message._id },
  });
  res.status(201).json(message);
});
