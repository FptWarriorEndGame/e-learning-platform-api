import { Request, Response, NextFunction } from "express";
import CustomError from "../../utils/error";
import CustomErrorMessage from "../../utils/errorMessage";
import { TreeNode, coreHelper } from "../../utils/coreHelper";
import { enumData } from "../../config/enumData";
import { CREATE_SUCCESS } from "../../config/constant";
import Permission from "../../models/Permission";
import mongoose, { ClientSession } from "mongoose";

interface GetPermissionsQuery {
  $text?: { $search: string };
  userId?: { $in: string[] };
  categoryId?: string;
}

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {

  const listPermissionDefault = coreHelper.convertToTreeNodes(enumData.RoleGroup)
  const {userId } = req.query;

  try {
    let result: TreeNode[][] = [];
    const foundPermissionByUserId = await Permission.findOne({
      userId: userId
    })

  if(foundPermissionByUserId) {
    result = JSON.parse(foundPermissionByUserId.listPermission)
  }else {
    result = listPermissionDefault
  }

    res.status(200).json({
      message: "Fetch all permissions successfully!",
      listPermission: result
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch permissions!", 422);
      return next(customError);
    }
  }
};

export const getAllPermissions = async (req: Request, res: Response, next: NextFunction) => {
  const _q: string = req.query._q as string;

  const query: GetPermissionsQuery = {};

  if (_q) {
    query.$text = { $search: _q };
  }

  try {
    res.status(200).json({
      message: "Fetch all Permissions successfully!",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch all permissions!", 422);
      return next(customError);
    }
  }
};

export const getPermissionById = async (req: Request, res: Response, next: NextFunction) => {

  try {
    
    res.status(200).json({
      message: "Fetch single permission successfully!",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch permission by id!", 422);
      return next(customError);
    }
  }
};

export const postPermission = async (req: Request, res: Response, next: NextFunction) => {
  const {
  } = req.body;

  try {

    res.json({
      message: CREATE_SUCCESS,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to fetch permissions!", 422);
      return next(customError);
    }
  }
};

export const updatePermission = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, listPermission
  } = req.body;
  let session: ClientSession | null = null;
  
  try {

    session = await mongoose.startSession();
    session.startTransaction();
  
    const foundPermissionOfUser = await Permission.findOne({
      userId: userId
    }).session(session);
  
    if (foundPermissionOfUser) {
      foundPermissionOfUser.listPermission = JSON.stringify(listPermission);
      foundPermissionOfUser.updatedBy = (req as any).userId
      await Permission.updateOne({ userId: userId }, foundPermissionOfUser).session(session);
    }else {
      const newPermission = new Permission({
        userId: userId,
        listPermission: JSON.stringify(listPermission),
        createdBy: (req as any).userId
      });
      await newPermission.save()
    }
  
  
    await session.commitTransaction();
    session.endSession();
  
    res.json({
      message: "Create permission successfully!",
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage((error as any)._message, 422);
      return next(customError);
    }
  }
};

export const deletePermission = async (req: Request, res: Response, next: NextFunction) => {
  const { permissionId } = req.params;

  try {

    res.json({
      message: "Delete permission successfully!",
      permissionId: permissionId,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to delete permissions!", 422);
      return next(customError);
    }
  }
};
