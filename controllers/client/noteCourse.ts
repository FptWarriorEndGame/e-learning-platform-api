import mongoose from "mongoose";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import Note from "../../models/Note";
import { Request, Response } from "express";

// Get all note
export const getAllNote = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find();
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//Get Note by id user
export const getNoteByUserId = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.params.id });
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// CreateNote
export const createNoteForLesson = async (req: AuthorAuthRequest, res: Response) => {
  const { lessonId } = req.params;
  const { userId, content, videoMinute, courseId } = req.body;

  try {
    const newNote = new Note({
      courseId,
      userId,
      lessonId,
      content,
      videoMinute,
      createdBy: req.userId,
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      message: "Note created successfully for the lesson!",
      note: savedNote,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//update note
export const updateNote = async (req: AuthorAuthRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const existingNote = await Note.findById(id);
    if (!existingNote) {
      return res.status(404).json({ message: "No note found with this id!" });
    }
    const note = await Note.findByIdAndUpdate(id, { content }, { new: true });

    if (!note) {
      return res.status(404).json({ message: "No note found with this id!" });
    }

    note.updatedAt = new Date();
    note.updatedBy = new mongoose.Types.ObjectId(req.userId) as any;

    res.json({ message: "Note updated successfully!", note });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
};

//delete note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Note deleted successfully!",
    });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a note by noteId
export const getNoteById = async (req: Request, res: Response) => {
  const { noteId } = req.params;
  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }
    res.status(200).json(note);
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getNotesByLessonId = async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  try {
    const notes = await Note.find({ lessonId: lessonId });
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};
