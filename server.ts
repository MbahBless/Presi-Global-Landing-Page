import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Set up Local Database configuration
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]), "utf-8");
}

// Interfaces
interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

// Cryptography settings
const SECRET_KEY = process.env.JWT_SECRET || "presi_global_super_secure_session_key_2026";

// Helpers for reading/writing users DB safely with locks/fallbacks
function readUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data) as User[];
  } catch (err) {
    console.error("Error reading users file, resetting", err);
    return [];
  }
}

function writeUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file", err);
  }
}

// Cryptographic Password Hashing (PBKDF2 SHA-512)
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return checkHash === hash;
}

// Cryptographically Signed Session Tokens (HS256 behavior using native crypto HMAC)
function generateToken(userId: string): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
  const payload = `${userId}:${expiry}`;
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [userId, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    if (expiry < Date.now()) return null; // Token has expired
    
    // Validate signature authenticity
    const payload = `${userId}:${expiry}`;
    const expectedSignature = crypto.createHmac("sha256", SECRET_KEY).update(payload).digest("hex");
    if (signature !== expectedSignature) return null;
    
    return userId;
  } catch (err) {
    return null;
  }
}

// --- SECURE AUTHENTICATION ENDPOINTS ---

// Register Endpoint
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Rigid valid validation constraints
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "All profile fields are required." });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedFullName = String(fullName).trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (trimmedFullName.length < 2 || trimmedFullName.length > 80) {
      return res.status(400).json({ error: "Full name must be between 2 and 80 characters long." });
    }

    const users = readUsers();
    
    // Check duplication
    const duplicate = users.find((u) => u.email === trimmedEmail);
    if (duplicate) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Secure hashing
    const { salt, hash } = hashPassword(password);
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email: trimmedEmail,
      fullName: trimmedFullName,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    const token = generateToken(newUser.id);

    return res.status(201).json({
      message: "Registration completed successfully.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error("Register endpoint error:", err);
    return res.status(500).json({ error: "Internal server registry error." });
  }
});

// Login Endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const users = readUsers();
    
    const user = users.find((u) => u.email === trimmedEmail);
    if (!user) {
      // Return a non-specific generic message to prevent account harvesting sweeps
      return res.status(401).json({ error: "Invalid email or password combination." });
    }

    const isMatch = verifyPassword(String(password), user.passwordSalt, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password combination." });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      message: "Welcome back!",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Login endpoint error:", err);
    return res.status(500).json({ error: "Internal login verification error." });
  }
});

// Profile / Token Verification Endpoint
app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No active session authentication credentials provided." });
    }

    const token = authHeader.split(" ")[1];
    const userId = verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Session has expired or token is invalid. Please log in again." });
    }

    const users = readUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User account no longer exists in our registry." });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("GetCurrentUser endpoint error:", err);
    return res.status(500).json({ error: "Failed to verify session authentication status." });
  }
});


// --- MOUNT VITE MIDDLEWARE OR STATIC SERVER ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PRESI GLOBAL Secure full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
