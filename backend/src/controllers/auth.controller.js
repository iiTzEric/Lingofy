import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
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

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
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

    // NEW: Google-only accounts have no password, so tell the user how to sign in
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, cookieOptions);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// NEW: Google sign-in / sign-up
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

    // Same token settings as login
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, cookieOptions);

    const { password, ...safeUser } = user.toObject();
    res.status(200).json({ success: true, user: safeUser });
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

    const { fullname, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullname || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({ message: "All fields are required", missingFields: [
        !fullname && "fullname",
        !bio && "bio",
        !nativeLanguage && "nativeLanguage",
        !learningLanguage && "learningLanguage",
        !location && "location"
      ].filter(Boolean)
      });
    }

    const profilePicture = req.body.profilePicture?.trim() ||
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${userId}`;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      profilePicture,
      isOnboarded: true
    }, { new: true });

    if(!updatedUser) {
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
  
    res.status(200).json({ message: "Onboarding completed successfully", user: updatedUser });
  } catch (error) {
    console.error("Error during onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}