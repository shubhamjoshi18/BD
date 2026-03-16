// =============================================
//  Backend Server - Video + Wish Storage
//  For Shikhu's Birthday 💙
//  FINAL PRODUCTION VERSION - ALL BUGS FIXED
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
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // Max requests per window
  UPLOAD_PATH: "shikhu-birthday",
  ALLOWED_FORMATS: ["mp4", "webm", "mov", "avi", "mkv"],
  MAX_WISH_LENGTH: 500,
  MAX_NOTE_LENGTH: 200,
};

// ========== MIDDLEWARE ==========
// Security middleware
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

// Rate limiting
const limiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW,
  max: CONFIG.RATE_LIMIT_MAX,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Logging
app.use(morgan("combined")); // Better for production

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGIN?.split(",") || "*"
      : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files - serve from public directory
app.use(express.static(path.join(__dirname, "public")));

// Create uploads directory if it doesn't exist (for local storage fallback)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads folder statically (for local storage fallback)
app.use("/uploads", express.static(uploadsDir));

// Handle favicon requests gracefully (fixes 404 error)
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// ========== DATABASE CONFIG (MongoDB) ==========
const isDBConfigured = !!process.env.MONGODB_URI;

if (isDBConfigured) {
  const mongooseOptions = {
    autoIndex: process.env.NODE_ENV !== "production", // Disable auto-index in production
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  mongoose
    .connect(process.env.MONGODB_URI, mongooseOptions)
    .then(() => console.log("🗄️  MongoDB Connected!"))
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      process.exit(1);
    });

  mongoose.connection.on("disconnected", () =>
    console.warn("⚠️  MongoDB disconnected."),
  );
  mongoose.connection.on("error", (err) =>
    console.error("❌ MongoDB runtime error:", err.message),
  );
  mongoose.connection.on("reconnected", () =>
    console.log("🔄 MongoDB reconnected."),
  );
} else {
  console.warn(
    "⚠️  WARNING: MONGODB_URI not set in .env. Database features will fail.",
  );
}

// ========== SCHEMAS ==========
const videoSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "cloudinary-video" },
    url: { type: String, required: true },
    size: { type: Number, default: 0, min: 0 },
    type: {
      type: String,
      enum: ["reaction", "reply", "other"],
      default: "reaction",
      required: true,
    },
    date: { type: Date, default: Date.now, index: true },
    metadata: {
      duration: Number,
      format: String,
      resolution: String,
    },
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
      validate: {
        validator: (v) => v.length > 0,
        message: "Wish cannot be empty",
      },
    },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: CONFIG.MAX_NOTE_LENGTH,
      trim: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Note cannot be empty",
      },
    },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

// Add indexes for better query performance
videoSchema.index({ date: -1, type: 1 });
wishSchema.index({ date: -1 });
noteSchema.index({ date: -1 });

const Video = mongoose.model("Video", videoSchema);
const Wish = mongoose.model("Wish", wishSchema);
const Note = mongoose.model("Note", noteSchema);

// ========== STORAGE CONFIG (Cloudinary) ==========
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
    secure: true, // Force HTTPS
  });
} else {
  console.warn(
    "⚠️  WARNING: Cloudinary credentials not set in .env. Video uploads will fail.",
  );
}

// Configure multer storage
let upload;
if (isCloudinaryConfigured) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: CONFIG.UPLOAD_PATH,
      resource_type: "video",
      allowed_formats: CONFIG.ALLOWED_FORMATS,
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // Optimize videos
      ],
    },
  });
  upload = multer({
    storage: storage,
    limits: { fileSize: CONFIG.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().substring(1);
      if (CONFIG.ALLOWED_FORMATS.includes(ext)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(", ")}`,
          ),
        );
      }
    },
  });
} else {
  // Fallback to local storage if Cloudinary not configured
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `shikhu-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
  upload = multer({
    storage: localStorage,
    limits: { fileSize: CONFIG.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().substring(1);
      if (CONFIG.ALLOWED_FORMATS.includes(ext)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file format. Allowed: ${CONFIG.ALLOWED_FORMATS.join(", ")}`,
          ),
        );
      }
    },
  });
}

// ========== UTILITY FUNCTIONS ==========
const logger = {
  info: (message, data = {}) => {
    console.log(`📌 [${new Date().toISOString()}] INFO:`, message, data);
  },
  error: (message, error) => {
    console.error(
      `❌ [${new Date().toISOString()}] ERROR:`,
      message,
      error?.message || error,
    );
  },
  success: (message, data = {}) => {
    console.log(`✅ [${new Date().toISOString()}] SUCCESS:`, message, data);
  },
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// ========== API ROUTES ==========

/**
 * @route   POST /api/upload-video
 * @desc    Upload video to Cloudinary/local storage
 * @access  Public
 */
app.post(
  "/api/upload-video",
  (req, res, next) => {
    upload.single("video")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("Multer error:", err);
        return res.status(400).json({
          error:
            err.code === "LIMIT_FILE_SIZE"
              ? `File too large. Max size: ${formatBytes(CONFIG.MAX_FILE_SIZE)}`
              : "Upload error",
        });
      } else if (err) {
        logger.error("Unknown upload error:", err);
        return res
          .status(500)
          .json({ error: err.message || "Server error during upload" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file received" });
      }

      const type = req.body.type || "reaction";

      // Generate URL for local files
      let fileUrl = req.file.path;
      if (!isCloudinaryConfigured && req.file.destination) {
        fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      logger.success("Video uploaded", {
        type,
        size: req.file.size,
        filename: req.file.filename,
      });

      // Save to database if configured
      if (isDBConfigured) {
        try {
          const newVideo = new Video({
            filename: req.file.filename || "video",
            url: fileUrl,
            size: req.file.size || 0,
            type: type,
            metadata: {
              format: req.file.mimetype,
              size: formatBytes(req.file.size),
            },
          });
          await newVideo.save();
          logger.info("Video metadata saved to DB");
        } catch (dbErr) {
          logger.error("Failed to save video to MongoDB:", dbErr);
        }
      }

      res.json({
        success: true,
        url: fileUrl,
        message: "Video uploaded successfully!",
      });
    } catch (error) {
      logger.error("Unexpected error in upload route:", error);
      res
        .status(500)
        .json({ error: "Internal server error processing the video upload." });
    }
  },
);

/**
 * @route   POST /api/wish
 * @desc    Save a birthday wish
 * @access  Public
 */
app.post("/api/wish", async (req, res) => {
  try {
    const { wish } = req.body;

    if (!wish || !wish.trim()) {
      return res.status(400).json({ error: "No wish provided" });
    }

    const trimmedWish = wish.trim().substring(0, CONFIG.MAX_WISH_LENGTH);

    logger.success("Wish received", { wish: trimmedWish });

    if (isDBConfigured) {
      try {
        const newWish = new Wish({ wish: trimmedWish });
        await newWish.save();
        return res.json({
          success: true,
          message: "✨ Your wish has been saved to the stars!",
        });
      } catch (dbErr) {
        logger.error("Failed to save wish to MongoDB:", dbErr);
        return res.status(500).json({ error: "Database Error" });
      }
    }

    res.json({
      success: true,
      message: "✨ Your wish has been sent to the universe!",
    });
  } catch (error) {
    logger.error("Wish endpoint error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/wishes
 * @desc    Get all wishes
 * @access  Public
 */
app.get("/api/wishes", async (req, res) => {
  try {
    if (!isDBConfigured) {
      return res.json({
        wishes: [],
        count: 0,
        error: "DB not configured",
        message: "Database not configured. Using local storage fallback.",
      });
    }

    const wishes = await Wish.find()
      .sort({ date: -1 })
      .limit(100) // Limit to last 100 wishes
      .lean();

    const mappedWishes = wishes.map((w) => ({
      wish: w.wish,
      date: w.date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.json({
      wishes: mappedWishes,
      count: mappedWishes.length,
      total: await Wish.countDocuments(),
    });
  } catch (err) {
    logger.error("Error fetching wishes:", err);
    res.status(500).json({ error: "Database Error" });
  }
});

/**
 * @route   GET /api/recordings
 * @desc    Get all video recordings
 * @access  Public
 */
app.get("/api/recordings", async (req, res) => {
  try {
    if (!isDBConfigured) {
      return res.json({
        recordings: [],
        count: 0,
        error: "DB not configured",
        message:
          "Database not configured. Check uploads folder for local files.",
      });
    }

    const videos = await Video.find()
      .sort({ date: -1 })
      .limit(50) // Limit to last 50 videos
      .lean();

    const mappedVideos = videos.map((v) => ({
      name: v.filename || "Birthday Video",
      url: v.url,
      size: v.size,
      sizeFormatted: v.size > 0 ? formatBytes(v.size) : "N/A",
      type: v.type,
      date: v.date ? v.date.toISOString() : new Date().toISOString(),
      formattedDate: v.date
        ? v.date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Unknown",
    }));

    res.json({
      recordings: mappedVideos,
      count: mappedVideos.length,
      total: await Video.countDocuments(),
    });
  } catch (err) {
    logger.error("Error fetching recordings:", err);
    res.status(500).json({ error: "Database Error" });
  }
});

/**
 * @route   POST /api/notes
 * @desc    Save a love note
 * @access  Public
 */
app.post("/api/notes", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Note content required" });
    }

    const trimmedContent = content.trim().substring(0, CONFIG.MAX_NOTE_LENGTH);

    logger.success("Love note received", { content: trimmedContent });

    if (isDBConfigured) {
      try {
        const note = new Note({ content: trimmedContent });
        await note.save();
        res.json({
          success: true,
          message: "💌 Your love note has been saved!",
        });
      } catch (err) {
        logger.error("Error saving note:", err);
        res.status(500).json({ error: "Database error" });
      }
    } else {
      res.json({
        success: true,
        message: "💌 Your love note has been sent!",
      });
    }
  } catch (error) {
    logger.error("Note endpoint error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route   GET /api/notes
 * @desc    Get all love notes
 * @access  Public
 */
app.get("/api/notes", async (req, res) => {
  try {
    if (!isDBConfigured) {
      return res.json([]);
    }

    const notes = await Note.find().sort({ date: -1 }).limit(50).lean();

    const mappedNotes = notes.map((n) => ({
      content: n.content,
      date: n.date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.json(mappedNotes);
  } catch (err) {
    logger.error("Error fetching notes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: isDBConfigured ? "connected" : "not configured",
    cloudinary: isCloudinaryConfigured ? "configured" : "not configured",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ========== DASHBOARD ==========
// Serve dashboard.html from public folder
app.get("/dashboard", (req, res) => {
  const dashboardPath = path.join(__dirname, "public", "dashboard.html");

  // Check if dashboard.html exists
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    // If not, create a simple dashboard
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Dashboard</title>
          <style>
              body { font-family: Arial; background: #0a0e1a; color: white; padding: 20px; }
              h1 { color: #00d4ff; }
              a { color: #1e90ff; }
          </style>
      </head>
      <body>
          <h1>💙 Shikhu's Dashboard</h1>
          <p>Dashboard file not found. Please ensure dashboard.html exists in the public folder.</p>
          <p>API is working! <a href="/api/health">Check health</a></p>
      </body>
      </html>
    `);
  }
});

// ========== ERROR HANDLING ==========
// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    message: "The requested API endpoint does not exist",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ error: "Duplicate entry" });
  }

  // Default error
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ========== SERVER START ==========
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n💙 ========================================`);
  console.log(`💙  Shikhu's Birthday Server Running!`);
  console.log(`💙 ========================================`);
  console.log(`🌐 Website:    http://localhost:${PORT}`);
  console.log(`📹 Dashboard:  http://localhost:${PORT}/dashboard`);
  console.log(`📊 Health:     http://localhost:${PORT}/api/health`);
  console.log(
    `☁️  Storage:    ${isCloudinaryConfigured ? "Cloudinary" : "Local"}`,
  );
  console.log(
    `🗄️  Database:   ${isDBConfigured ? "MongoDB" : "Not configured"}`,
  );
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`💙 ========================================\n`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  setTimeout(() => process.exit(1), 1000);
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("✅ HTTP server closed.");

    if (isDBConfigured) {
      try {
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed.");
      } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err);
      }
    }

    console.log("💙 Goodbye!");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("❌ Force shutdown after timeout");
    process.exit(1);
  }, 10000);
}
