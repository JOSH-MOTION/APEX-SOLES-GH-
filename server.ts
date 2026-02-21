import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel has a read-only filesystem except for /tmp
const dbPath = process.env.NODE_ENV === "production" ? "/tmp/shoes.db" : "shoes.db";
let db: any;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS shoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        color TEXT NOT NULL
      )
    `);

    const count = db.prepare("SELECT COUNT(*) as count FROM shoes").get() as { count: number };
    if (count.count === 0) {
      const insert = db.prepare(`
        INSERT INTO shoes (name, brand, price, category, description, image_url, color)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const seedData = [
        ["Apex Velocity X", "APEX SOLES", 2200.00, "Performance", "Engineered for speed with responsive cushioning and breathable mesh. The ultimate track-to-street crossover.", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", "Electric Volt"],
        ["Midnight Street Low", "APEX SOLES", 1600.00, "Lifestyle", "Classic silhouette with premium leather and a minimalist aesthetic. A staple for any rotation.", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop", "Obsidian Black"],
        ["Cloud Burst High", "APEX SOLES", 1950.00, "Basketball", "High-top support with multi-directional traction for the court. Dominate the paint in style.", "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop", "Hyper White/Blue"],
        ["Desert Nomad", "APEX SOLES", 1800.00, "Outdoor", "Rugged outsole meets street style. Built for the urban explorer who never stops.", "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop", "Sand/Earth"],
        ["Neon Pulse", "APEX SOLES", 2400.00, "Limited", "Exclusive drop featuring glow-in-the-dark accents and unique textures. Only 500 pairs worldwide.", "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop", "Glow Green"],
        ["Retro Glide", "APEX SOLES", 1500.00, "Classic", "Vintage-inspired design with modern comfort technology. Bringing back the 80s vibe.", "https://images.unsplash.com/photo-1512374382149-4332c6c02151?q=80&w=800&auto=format&fit=crop", "Heritage Red"],
      ];

      for (const shoe of seedData) {
        insert.run(...shoe);
      }
    }
  }
  return db;
}

async function createServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/shoes", (req, res) => {
    try {
      const database = getDb();
      const shoes = database.prepare("SELECT * FROM shoes ORDER BY id DESC").all();
      res.json(shoes);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/shoes", (req, res) => {
    try {
      const { name, brand, price, category, description, image_url, color } = req.body;
      if (!name || !brand || !price || !category || !description || !image_url || !color) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const database = getDb();
      const insert = database.prepare(`
        INSERT INTO shoes (name, brand, price, category, description, image_url, color)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = insert.run(name, brand, price, category, description, image_url, color);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/shoes/:id", (req, res) => {
    try {
      const database = getDb();
      const shoe = database.prepare("SELECT * FROM shoes WHERE id = ?").get(req.params.id);
      if (shoe) {
        res.json(shoe);
      } else {
        res.status(404).json({ error: "Shoe not found" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  return app;
}

// For local development
if (process.env.NODE_ENV !== "production") {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};
