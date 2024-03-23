import express from "express";
import {
  getAllNote,
  updateNote,
  deleteNote,
  getNoteByUserId,
  getNoteById,
  createNoteForLesson,
  getNotesByLessonId,
} from "../../controllers/client/noteCourse";

const router = express.Router();

// Get all notes
router.get("/", getAllNote);

router.get("/:id", getNoteByUserId);

router.get("/noteId/:noteId", getNoteById);

router.get("/lesson/:lessonId", getNotesByLessonId);

// Create a new note
router.post("/createNote/:lessonId", createNoteForLesson);

// Update a note
router.put("/update/:id", updateNote);

// Delete a note
router.delete("/delete/:id", deleteNote);

export default router;
