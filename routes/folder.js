const express = require("express");

const router = express.Router();

// controllers
const {
  createFolder,
  getAllFolders,
  deleteFolder,
} = require("../controllers/folder");

router.post("/create-folder", createFolder);
router.get("/folders", getAllFolders);
router.delete("/folder/:folderId", deleteFolder);

module.exports = router;
