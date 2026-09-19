import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    let decoded;
    try {
      // Pin the algorithm so only tokens signed the way we sign them are accepted
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ["HS256"] });
    } catch (error) {
      // Expired, malformed, or tampered token: the client is unauthorized, not a server error
      if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        res.clearCookie("jwt"); // drop the dead cookie so it isn't resent on every request
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
      }
      throw error; // anything else (e.g. missing secret) is a real server problem
    }

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}