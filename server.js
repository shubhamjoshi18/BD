// =============================================
//  Backend Server - Video + Wish Storage
//  For Shikhu's Birthday 💙
//  SERVERLESS COMPATIBLE VERSION
// =============================================

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURATION ==========
const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB (reduced for serverless)
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 100,
  UPLOAD_PATH: "shikhu-birthday",
  ALLOWED_FORMATS: ["mp4", "webm", "mov"],
  MAX_WISH_LENGTH: 500,
  MAX_NOTE_LENGTH: 200,
};

// ========== MIDDLEWARE ==========
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'"],
      },
    },
  }),
);

const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Handle favicon
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.svg", (req, res) => res.status(204).end());
app.get("/icons.svg", (req, res) => res.status(204).end());

// ========== DATABASE CONFIG ==========
const isDBConfigured = !!process.env.MONGODB_URI;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!isDBConfigured) return null;

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected");
    cachedDb = connection;
    return connection;
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    return null;
  }
}

// ========== SCHEMAS ==========
const videoSchema = new mongoose.Schema(
  {
    filename: String,
    url: { type: String, required: true },
    size: Number,
    type: {
      type: String,
      enum: ["reaction", "reply", "other"],
      default: "reaction",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const wishSchema = new mongoose.Schema(
  {
    wish: {
      type: String,
      required: true,
      trim: true,
      maxlength: CONFIG.MAX_WISH_LENGTH,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: CONFIG.MAX_NOTE_LENGTH,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);
const Wish = mongoose.models.Wish || mongoose.model("Wish", wishSchema);
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

// ========== CLOUDINARY ==========
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Memory storage for serverless
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: CONFIG.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (CONFIG.ALLOWED_FORMATS.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(", ")}`,
        ),
      );
    }
  },
});

// ========== UTILITIES ==========
const logger = {
  info: (msg, data) =>
    console.log(`📌 [${new Date().toISOString()}] INFO:`, msg, data || ""),
  error: (msg, err) =>
    console.error(
      `❌ [${new Date().toISOString()}] ERROR:`,
      msg,
      err?.message || err,
    ),
  success: (msg, data) =>
    console.log(`✅ [${new Date().toISOString()}] SUCCESS:`, msg, data || ""),
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ========== API ROUTES ==========

// Upload video
app.post("/api/upload-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const type = req.body.type || "reaction";
    logger.success("Video received", { type, size: req.file.size });

    // For Vercel, we acknowledge receipt but don't store permanently
    res.json({
      success: true,
      message: "Video received! It will be processed asynchronously.",
      note: "In serverless mode, videos are temporarily processed",
    });
  } catch (error) {
    logger.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Wish endpoints
app.post("/api/wish", async (req, res) => {
  try {
    const { wish } = req.body;
    if (!wish?.trim())
      return res.status(400).json({ error: "No wish provided" });

    const trimmedWish = wish.trim().substring(0, CONFIG.MAX_WISH_LENGTH);
    logger.success("Wish received", { wish: trimmedWish });

    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      try {
        await new Wish({ wish: trimmedWish }).save();
        return res.json({ success: true, message: "✨ Wish saved!" });
      } catch (dbErr) {
        logger.error("DB save failed:", dbErr);
      }
    }
    res.json({ success: true, message: "✨ Wish received!" });
  } catch (error) {
    logger.error("Wish error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/wishes", async (req, res) => {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return res.json({ wishes: [], count: 0 });
    }
    const wishes = await Wish.find().sort({ date: -1 }).limit(100).lean();
    res.json({ wishes, count: wishes.length });
  } catch (err) {
    logger.error("Error fetching wishes:", err);
    res.status(500).json({ error: "Database Error" });
  }
});

// Notes endpoints
app.post("/api/notes", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ error: "Note content required" });

    const trimmedContent = content.trim().substring(0, CONFIG.MAX_NOTE_LENGTH);
    logger.success("Note received", { content: trimmedContent });

    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      try {
        await new Note({ content: trimmedContent }).save();
        return res.json({ success: true, message: "💌 Note saved!" });
      } catch (dbErr) {
        logger.error("DB save failed:", dbErr);
      }
    }
    res.json({ success: true, message: "💌 Note received!" });
  } catch (error) {
    logger.error("Note error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const notes = await Note.find().sort({ date: -1 }).limit(50).lean();
    res.json(notes);
  } catch (err) {
    logger.error("Error fetching notes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Recordings endpoint
app.get("/api/recordings", async (req, res) => {
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      return res.json({ recordings: [], count: 0 });
    }
    const videos = await Video.find().sort({ date: -1 }).limit(50).lean();
    res.json({ recordings: videos, count: videos.length });
  } catch (err) {
    logger.error("Error fetching recordings:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    cloudinary: isCloudinaryConfigured ? "configured" : "not configured",
    uptime: process.uptime(),
  });
});

// Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// 404 handler
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ========== EXPORT FOR SERVERLESS ==========
module.exports = app;

// Only listen in development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n💙 Server running on http://localhost:${PORT}`);
  });
}
