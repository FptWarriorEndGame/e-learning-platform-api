import { Request, Response } from "express";
import Subscribe from "../../models/Subscribe";
import { ISubscribe } from "../../types/subscribe.type";
import { coreHelper } from "../../utils/coreHelper";
import mongoose, { ClientSession } from "mongoose";
import { AuthorAuthRequest } from "../../middleware/is-auth";

export const getAllSubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscribe: ISubscribe[] = await Subscribe.find()
      .populate("createdBy", "name")
      .populate("updatedBy", "name");
    const response = { subscribe: subscribe };
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getSubscriceById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const subscribe = await Subscribe.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name");
    if (!subscribe) {
      res.status(404).json({ message: "Subscribe not found" });
      return;
    }
    const response = { subscribe: subscribe };
    res.json(response);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const postSubscribe = async (req: AuthorAuthRequest, res: Response) => {
  let session: ClientSession | null = null;
  session = await mongoose.startSession();
  session.startTransaction();

  const subscribeCode = await coreHelper.getCodeDefault("SUBSCRIBE", Subscribe);
  try {
    const { email } = req.body;
    const newSubscribe = new Subscribe({
      email,
      code: subscribeCode,
      createdBy: req.userId,
    });
    await newSubscribe.save();
    res.status(201).json({ message: "Subscription created successfully", newSubscribe });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

export const deleteSubscribe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscribe = await Subscribe.findById(id);
    if (!subscribe) {
      res.status(404).json({ message: "Subscribe not found" });
      return;
    }

    subscribe.isDeleted = true;
    await subscribe.save();

    res.json({ message: "Subscribe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
