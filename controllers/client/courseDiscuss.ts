import { Request, Response } from "express";
import CourseDiscuss from "../../models/CourseDisscuss";
import { coreHelper } from "../../utils/coreHelper";

export const getAllDiscussCourse = async (req: Request, res: Response) => {
  try {
    const discuss = await CourseDiscuss.find()
      .populate("userId", "name")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscussById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discuss = await CourseDiscuss.findById(id)
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    if (!discuss) {
      return res.status(404).json({ error: "Discuss not found" });
    }

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscussByLessonId = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const discuss = await CourseDiscuss.find({ lessonId: lessonId })
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const getDiscussBySectionId = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const discuss = await CourseDiscuss.find({ sectionId: sectionId })
      .populate("userId", "name avatar")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name avatar" },
      });

    res.json({ discuss });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addDiscussCourse = async (req: Request, res: Response) => {
  try {
    const { comments, userId, parentDiscussId, lessonId, courseId } = req.body;
    const addDiscussCourseCode = await coreHelper.getCodeDefault("DISCUSS", CourseDiscuss);

    const newComment = new CourseDiscuss({
      code: addDiscussCourseCode,
      courseId,
      lessonId,
      comments,
      userId,
      parentDiscussId: parentDiscussId || null,
    });
    const savedComment = await newComment.save();

    res.status(201).json(savedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const updateDiscussCourse = async (req: Request, res: Response) => {
  try {
    const { discussId } = req.params;
    const { comments } = req.body;

    const updatedComment = await CourseDiscuss.findByIdAndUpdate(
      discussId,
      { comments },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteDiscuss = async (req: Request, res: Response) => {
  try {
    const { discussId } = req.params;

    const deletedComment = await CourseDiscuss.findByIdAndDelete(discussId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

export const addRelyToDisCuss = async (req: Request, res: Response) => {
  const { comments, userId, parentDiscussId, discussId } = req.body;
  const addDiscussCourseReplyCode = await coreHelper.getCodeDefault("DISCUSSREPLY", CourseDiscuss);
  try {
    const parentComment = await CourseDiscuss.findById(parentDiscussId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found." });
    }

    // Create a new comment as a reply
    const newReply = new CourseDiscuss({
      code: addDiscussCourseReplyCode,
      discussId,
      comments,
      userId,
      parentDiscussId,
    });

    // Save the new reply
    const savedReply = await newReply.save();

    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    await savedReply.populate("userId", "name avatar");

    res.status(201).json(savedReply);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
