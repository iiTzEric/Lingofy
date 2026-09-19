import 'dotenv/config'; // must be the first import so env vars exist before other modules load
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import helmet from "helmet";
import path from "path";

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.route.js';

import { connectDB } from './lib/db.js';

const app = express();
app.set("trust proxy", 1); // Render sits behind one proxy; needed for correct client IPs (rate limiting)

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

const __dirname = path.resolve();

const allowedOrigins = new Set([
  "https://lingofy-1.onrender.com",
]);
const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(helmet({
  // Left off for now: a wrong CSP would block Google sign-in, Stream chat/video and avatar images.
  contentSecurityPolicy: false,
  // Helmet's default ("same-origin") breaks the Google sign-in popup.
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  // Helmet's default ("no-referrer") can interfere with Google sign-in.
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header: same-origin GETs, curl, server-to-server
    if (!origin) return callback(null, true);

    // FIXED: local dev origins are trusted regardless of NODE_ENV
    if (allowedOrigins.has(origin) || localOriginPattern.test(origin)) {
      return callback(null, true);
    }

    // Refuse quietly (no CORS headers) instead of throwing a server error
    return callback(null, false);
  },
  credentials: true, // allow frontend to send cookies
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Unknown API routes get a JSON 404 instead of falling through to index.html
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});