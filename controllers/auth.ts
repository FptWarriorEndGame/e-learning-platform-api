import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { IUser } from "../types/user.type";
import RevokedToken from "../models/RevokedToken";
import { IRevokedToken } from "../types/token.type";
import { UserAuthRequest } from "../middleware/is-user-auth";
import { AuthorAuthRequest } from "../middleware/is-auth";
import crypto from "crypto";
import sendmail from "../utils/sendmail";
import CustomError from "../utils/error";
import CustomErrorMessage from "../utils/errorMessage";
import { google } from "googleapis";
import admin from "firebase-admin";
import serviceAccount from "../firebase/serviceAccountKey.json";
import { BACKEND_URL } from "../config/backend-domain";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { enumData } from "../config/enumData";
import Permission from "../models/Permission";
import { TreeNode, coreHelper } from "../utils/coreHelper";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { Octokit } from "@octokit/rest";
import { getIO } from "../socket";
const serviceAccountConfig = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientCertUrl: serviceAccount.client_x509_cert_url,
  universeDomain: serviceAccount.universe_domain,
};

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "fullstack-es6",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "1143621327082143",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, name, password, role, avatar } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const error = new CustomError("Email", "Email already existed at website!", 422);
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: Partial<IUser> = {
      email,
      name,
      password: hashedPassword,
      role,
      avatar,
      providerId: "local",
    };

    const newUser = new User(userData);

    const result = await newUser.save();

    res.status(201).json({
      message: "User created successfully!",
      userId: result._id,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfoResponse = await oauth2.userinfo.get();
    const email = userInfoResponse.data.email;

    const userDoc = await User.findOne({ email, providerId: "google.com" });

    if (!userDoc) {
      const error = new CustomError("Email", "Could not find user by email!", 401);
      throw error;
    }

    const jwtToken = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    userDoc.loginToken = jwtToken;
    userDoc.loginTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
    await userDoc.save();
    res.status(200).json({
      message: "Login successful!",
      token: jwtToken,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const userDoc: IUser | null = await User.findOne({ email, providerId: "local" });

    if (!userDoc) {
      const error = new CustomError("Email", "Could not find user by email!", 401);
      throw error;
    }

    const isMatched: boolean = await bcrypt.compare(password, userDoc.password);

    if (!isMatched) {
      const error = new CustomError("Password", "Password wrong!", 401);
      throw error;
    }

    const token = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    userDoc.loginToken = token;
    userDoc.loginTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
    await userDoc.save();

    // Add realtime socket
    const socketIO = getIO();
    socketIO.emit("login", {
      message: `User ${userDoc.name} has been login at ${new Date(Date.now() + 60 * 60 * 1000)}`,
    });

    res.status(200).json({
      message: "Login successfuly!",
      token: token,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  try {
    let userDoc: IUser | null = null;
    if (email) {
      userDoc = await User.findOne({
        email,
        providerId: "local",
        status: enumData.UserStatus.ACTIVE.code,
      });
    } else if (username) {
      userDoc = await User.findOne({
        username,
        providerId: "local",
        status: enumData.UserStatus.ACTIVE.code,
      });
    }

    if (!userDoc) {
      const error = new CustomError("Email", "Could not find user by email or username!", 401);
      throw error;
    }

    const { role } = userDoc;

    if (role !== enumData.UserType.Admin.code && role !== enumData.UserType.Author.code) {
      const error = new CustomErrorMessage(
        "Could not authenticate because this account not admin or author role!",
        422
      );
      throw error;
    }

    const isMatched: boolean = await bcrypt.compare(password, userDoc.password);

    if (!isMatched) {
      throw new CustomError("Password", "Password wrong!", 401);
    }

    const token = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString(), adminRole: userDoc.role },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    userDoc.loginToken = token;
    userDoc.loginTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
    await userDoc.save();

    // Add realtime socket
    // getIO().emit('auth', {
    //   action: 'signupRequest',
    //   message: "ahihih"
    // });

    // Check Permission role
    const listKeyPermission = [];
    const userPermission = await Permission.findOne({
      userId: userDoc._id,
    });

    if (userPermission) {
      const listPermissionJSON = JSON.parse(userPermission.listPermission) as TreeNode[][];
      const list = listPermissionJSON.map((item) => item[0]).map((nodeItem) => nodeItem.children);
      const listPermissionObj = list.flat().flatMap((item) => item.children);

      listPermissionObj.forEach((permissionObj) => {
        if (permissionObj.checked) {
          listKeyPermission.push(permissionObj.key);
        }
      });
    }

    const roleEnum = coreHelper.getEnumMultiLevelToArray(enumData.RoleGroup);

    // Convert enumData
    const resEnumData = {
      ...enumData,
      Role: roleEnum,
    };

    res.status(200).json({
      message: "Login administrator successfuly!",
      token: token,
      userId: userDoc._id.toString(),
      enumData: resEnumData,
      role: roleEnum,
      listPermission: listKeyPermission,
      adminRole: userDoc.role,
    });
  } catch (error) {
    console.log("error: ", error);

    if (error) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const adminSignupRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { email, name, phone } = req.body;

  try {
    const userDoc: IUser | null = await User.findOne({
      email,
      providerId: "local",
      $or: [
        {
          role: enumData.UserType.Admin.code,
        },
        {
          role: enumData.UserType.Author.code,
        },
        {
          role: enumData.UserType.Employee.code,
        },
      ],
    });

    if (userDoc) {
      const error = new CustomError("Email", "Email already register at website", 401);
      throw error;
    }
    const countNumberOfUser = await User.countDocuments({});
    const currentYear = new Date().getFullYear();
    let username = `author_${currentYear}_${countNumberOfUser}`;
    let foundUserName = await User.findOne({ username });
    while (foundUserName) {
      username = await coreHelper.getCodeDefault("author", User);
      foundUserName = await User.findOne({ username });
    }

    const hashedPassword = await bcrypt.hash("123456", 12);
    const newUser = new User({
      email: email,
      name: name,
      username: username,
      phone: phone,
      password: hashedPassword,
      role: enumData.UserType.Author.code,
      status: enumData.UserStatus.NEW.code,
      providerId: enumData.LoginType.Local.value,
    });

    const createdUser = await newUser.save();
    getIO().emit("auth", {
      action: "signupRequest",
      user: createdUser,
    });
    res.status(200).json({
      message:
        "Signup request administrator successfuly! Wait a minutes and ready for email reply with account!",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const logout = async (req: UserAuthRequest, res: Response, next: NextFunction) => {
  try {
    const tokenToRevoke = req.token;

    const revokedTokenData: Partial<IRevokedToken> = { token: tokenToRevoke };
    const revokedToken = new RevokedToken(revokedTokenData);
    await revokedToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const adminLogout = async (req: AuthorAuthRequest, res: Response, next: NextFunction) => {
  try {
    const tokenToRevoke = req.token;

    const revokedTokenData: Partial<IRevokedToken> = { token: tokenToRevoke };
    const revokedToken = new RevokedToken(revokedTokenData);
    await revokedToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const postReset = async (req: Request, res: Response, next: NextFunction) => {
  const { email, resetPassUrl }: { email: string; resetPassUrl?: string } = req.body;
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      const error = new CustomErrorMessage("Error generating password reset", 503);
      return next(error);
    }

    const token = buffer.toString("hex");

    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        const error = new CustomError("Email", "No Email founded at this website!", 422);
        res.status(402).json({ message: error });
        throw error;
      }

      user.resetToken = token;
      user.resetTokenExpiration = new Date(Date.now() + 3600000);
      await user.save();

      res.status(202).json({
        message: "Check your email, we already sent token to your account!",
        user: { email, _id: user._id },
      });

      const hrefLink = resetPassUrl
        ? `${resetPassUrl}?token=${token}`
        : `${"http://localhost:8000"}/site/reset-password?token=${token}`;

      await sendmail({
        from: "nhatsang0101@gmail.com",
        to: email,
        subject: "Password reset",
        html: `<p>You requested a password reset!</p>
               <p>Click this <a href="${hrefLink}">Link Here</a> to set a new password.</p>`,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      } else {
        const customError = new CustomErrorMessage("Internal Server Error", 500);
        return next(customError);
      }
    }
  });
};

export const postNewPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password, userId, passwordToken } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
      },
      {
        $set: {
          password: hashedPassword,
          resetToken: undefined,
          resetTokenExpiration: undefined,
        },
      }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found or token expired." });
      const error = new CustomError("User", "User not found or token expired.", 404);
      throw error;
    }

    res.status(200).json({
      message: "Update password successfully!",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Internal Server Error", 500);
      return next(customError);
    }
  }
};

export const updateLastLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const { lastLogin } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { lastLogin });

    res.status(200).json({
      message: "Successfully to update last login for user",
      updatedUser: {
        _id: updatedUser._id,
        lastLogin: updatedUser.lastLogin,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return next(error);
    } else {
      const customError = new CustomErrorMessage("Failed to update last login for user", 422);
      return next(customError);
    }
  }
};

//facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: "1143621327082143",
      clientSecret: "c22d321e19b7ad993227a7889c752a7f",
      callbackURL: "http://localhost:8000",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Use the profile information to find or create a user
        let user = await User.findOne({
          email: profile.emails[0].value,
          providerId: "facebook.com",
        });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            avatar: profile.photos ? profile.photos[0].value : null,
            providerId: "facebook.com",
            role: "USER",
            payment: "COD",
            language: "en",
            showProfile: true,
            showCourses: true,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const githubLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;

  try {
    const clientID = "2c54ea01c90e1cbc1e0f";
    const clientSecret = "e212d5f4cd4e9fd080217b5ce2c4e43fbb3bcf50";
    const tokenURL = "https://github.com/login/oauth/access_token";

    const response = await fetch(tokenURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await response.json();
    console.log("Response from GitHub:", data);
    const githubToken = data.access_token;
    console.log(githubToken);

    // Get user information using the GitHub token
    const octokit = new Octokit({ auth: githubToken });
    const { data: userData } = await octokit.users.getAuthenticated();
    let userDoc = await User.findOne({ email: userData.email, providerId: "github.com" });
    if (!userDoc) {
      userDoc = new User({
        email: userData.email || "",
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        providerId: "github.com",
        role: "USER",
        payment: "COD",
        language: "en",
        showProfile: true,
        showCourses: true,
      });
      console.log(userDoc);
      await userDoc.save();
    }

    const jwtToken = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );
    userDoc.loginToken = jwtToken; // Use loginToken instead of token
    userDoc.loginTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
    await userDoc.save();

    res.status(200).json({
      message: "Login successful!",
      token: jwtToken,
      userId: userDoc._id.toString(),
    });
  } catch (error: any) {
    if (error.message === "Bad credentials") {
      console.error("The provided GitHub token is invalid.");
    } else {
      console.error(`Error fetching data from GitHub: ${error.message}`);
    }
  }
};

export const facebookLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("facebook", { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new CustomError("Facebook Authentication", "Authentication failed", 401));
    }

    const jwtToken = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    user.loginToken = jwtToken;
    user.loginTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);

    user
      .save()
      .then(() => {
        res.status(200).json({
          message: "Login successful!",
          token: jwtToken,
          userId: user._id.toString(),
        });
      })
      .catch((saveError: any) => {
        console.error("Error saving user:", saveError);
        next(new CustomError("User Save", "Error saving user", 500));
      });
  })(req, res, next);
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
