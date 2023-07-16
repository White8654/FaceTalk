const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessages,
  searchMessages,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/del").post(protect, deleteMessages);
router.route("/").get(protect, searchMessages);

module.exports = router;
