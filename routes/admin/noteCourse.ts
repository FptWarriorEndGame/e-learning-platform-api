import express from "express";
import isAuth from "../../middleware/is-auth";

import {
  getAllNote,
  updateNote,
  deleteNote,
  getNoteByUserId,
  getNoteById,
  createNoteForLesson,
} from "../../controllers/admin/noteCourse";
import { getNotesByLessonId } from "../../controllers/client/noteCourse";

const router = express.Router();

// Get all notes
router.get("/",isAuth, getAllNote);

router.get("/user/:id",isAuth, getNoteByUserId);

router.get("/noteId/:noteId",isAuth, getNoteById);

router.get("/lesson/:lessonId", isAuth, getNotesByLessonId);

// Create a new note
router.post("/createNote",isAuth, createNoteForLesson);

// Update a note
router.put("/update/:id",isAuth, updateNote);

// Delete a note
router.delete("/delete/:id",isAuth, deleteNote);

export default router;
