import { Request, Response } from "express";
import mongoose, { ClientSession } from "mongoose";
import { AuthorAuthRequest } from "../../middleware/is-auth";
import Note from "../../models/Note";
import { coreHelper } from "../../utils/coreHelper";
import { enumData } from "../../config/enumData";
import ActionLog from "../../models/ActionLog";

// Get all note
export const getAllNote = async (req: AuthorAuthRequest, res: Response) => {
  try {
    const notes = await Note.find()
      .populate("userId", "name avatar")
      .populate("lessonId", "name")
      .populate("courseId", "name");
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

//Get Note by id user
export const getNoteByUserId = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.params.id }).populate("userId", "name avatar"); // Populate user details
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// CreateNote
export const createNoteForLesson = async (req: AuthorAuthRequest, res: Response) => {
  const { adminId, lessonId, content, videoMinute } = req.body;

  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  if (!adminId) {
    return res.status(400).json({ error: "adminId is missing from the request." });
  }

  try {
    const noteCourseCode = await coreHelper.getCodeDefault("NOTE", Note);

    const newNote = new Note({
      userId: adminId,
      lessonId,
      content,
      videoMinute,
      code: noteCourseCode,
      createdBy: adminId,
    });

    const historyItem = new ActionLog({
      referenceId: newNote._id,
      type: enumData.ActionLogEnType.Create.code,
      createdBy: new mongoose.Types.ObjectId(req.userId),
      functionType: "NOTE",
      description: `NOTE [${name}] has [${enumData.ActionLogEnType.Create.name}] action by user [${req.userId}]`,
    });

    await ActionLog.collection.insertOne(historyItem.toObject(), { session });
    await session.commitTransaction();
    session.endSession();

    const savedNote = await newNote.save();

    res.status(201).json({
      message: "Note created successfully for the lesson!",
      note: savedNote,
    });
  } catch (error) {
    console.error(error);
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
    const notes = await Note.find({ lessonId: lessonId }).populate("userId", "name avatar"); // Populate user details
    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found for this lesson" });
    }
    res.status(200).json({ notes });
  } catch (error: unknown) {
    res.status(500).json({ error: (error as Error).message });
  }
};
