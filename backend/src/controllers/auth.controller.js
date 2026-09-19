import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// One lifetime for both the JWT and the cookie so they always match
const TOKEN_LIFETIME = "7d";
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  maxAge: TOKEN_MAX_AGE_MS,
  httpOnly: true, // prevent XSS attacks
  sameSite: "strict", // prevent CSRF attacks
  secure: process.env.NODE_ENV === "production",
};

const signToken = (userId) =>
  jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET_KEY, {
    expiresIn: TOKEN_LIFETIME,
  });

// Never send the password hash to the browser
const toSafeUser = (user) => {
  const { password: _password, ...safeUser } = user.toObject();
  return safeUser;
};

export async function signup(req, res) {
  const { email, password, fullname } = req.body;

  try {
    if (!email || !password || !fullname) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}`;

    const newUser = await User.create({
      email: normalizedEmail,
      fullname,
      password,
      profilePicture: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullname,
        image: randomAvatar || "",
      });
      console.log(`Stream user created for ${newUser.fullname}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    res.cookie("jwt", signToken(newUser._id), cookieOptions);

    // FIXED: password hash is no longer returned
    res.status(201).json({ success: true, user: toSafeUser(newUser) });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({ message: "Server authentication is not configured" });
    }

    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Google-only accounts have no password, so tell the user how to sign in
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // FIXED: token now lasts as long as the cookie (7 days)
    res.cookie("jwt", signToken(user._id), cookieOptions);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Google sign-in / sign-up
export async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    if (!process.env.JWT_SECRET_KEY || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Server authentication is not configured" });
    }

    // Created inside the function so it always sees the loaded env variables
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verifies signature, expiry, and that the token was issued for OUR Client ID
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, email, email_verified, name, picture } = ticket.getPayload();

    if (!email || !email_verified) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ $or: [{ googleId: sub }, { email: normalizedEmail }] });

    if (!user) {
      // Brand new user
      user = await User.create({
        email: normalizedEmail,
        fullname: name || normalizedEmail.split("@")[0],
        profilePicture: picture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${sub}`,
        googleId: sub,
      });

      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullname,
          image: user.profilePicture || "",
        });
        console.log(`Stream user created for ${user.fullname} (Google)`);
      } catch (error) {
        console.log("Error creating Stream user:", error);
      }
    } else if (!user.googleId) {
      // Existing email/password account: link Google to it.
      // Clearing the password means only Google can access it from now on, which
      // prevents someone who pre-registered this email (unverified) from keeping access.
      user.googleId = sub;
      user.password = undefined;
      await user.save();
    }

    res.cookie("jwt", signToken(user._id), cookieOptions);
    res.status(200).json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    console.log("Error during Google auth:", error.message);
    res.status(401).json({ message: "Invalid Google token" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", cookieOptions);
  res.status(200).json({ message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    // Text fields must be real strings (rejects objects/arrays sent by mistake or on purpose)
    const str = (value) => (typeof value === "string" ? value.trim() : "");

    const fullname = str(req.body.fullname);
    const bio = str(req.body.bio);
    const nativeLanguage = str(req.body.nativeLanguage);
    const location = str(req.body.location);

    // Accept an array or a single string, keep only non-empty strings
    const rawLanguages = Array.isArray(req.body.learningLanguage)
      ? req.body.learningLanguage
      : [req.body.learningLanguage];
    const learningLanguage = rawLanguages.filter((l) => typeof l === "string" && l.trim()).map((l) => l.trim());

    const missingFields = [
      !fullname && "fullname",
      !bio && "bio",
      !nativeLanguage && "nativeLanguage",
      learningLanguage.length === 0 && "learningLanguage",
      !location && "location",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: "All fields are required", missingFields });
    }

    // Only accept http(s) URLs; otherwise keep the current picture (e.g. from Google) or use an avatar
    const submittedPicture = str(req.body.profilePicture);
    const profilePicture = /^https?:\/\//i.test(submittedPicture)
      ? submittedPicture
      : req.user.profilePicture || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`;

    // FIXED: whitelist the fields a user may change instead of spreading req.body
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullname,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePicture,
        isOnboarded: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullname,
        image: updatedUser.profilePicture || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullname}`);
    } catch (error) {
      console.log("Error updating Stream user after onboarding:", error);
    }

    // FIXED: password hash is no longer returned
    res.status(200).json({ message: "Onboarding completed successfully", user: toSafeUser(updatedUser) });
  } catch (error) {
    console.error("Error during onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}