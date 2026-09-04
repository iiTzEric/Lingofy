import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use, please use a different email" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`

    const newUser = await User.create({
      fullname,
      email,
      password,
      avatar: randomAvatar
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, 
      { 
        expiresIn: "1h" 
      });

      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // prevent xss attacks
        sameSite: "strict", // prevent csrf attacks
        secure: process.env.NODE_ENV === "production", // only send cookie over https in production
      }); 

      res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function login(req, res) {
  res.send("Login route");
}

export function logout(req, res) {
  res.send("Logout route");
};