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
export const createNote = async (req: Request, res: Response) => {
  const { userId, lessonId, content, videoMinute } = req.body;
  try {
    const newNote = new Note({
      userId,
      lessonId,
      content,
      videoMinute,
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      message: "Note created successfully!",
      note: savedNote,
    });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//update note
export const updateNote = async (req: Request, res: Response) => {
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