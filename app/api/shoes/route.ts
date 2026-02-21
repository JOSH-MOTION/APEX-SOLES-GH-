import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const shoes = db.prepare("SELECT * FROM shoes ORDER BY id DESC").all();
    return NextResponse.json(shoes);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, price, category, description, image_url, color } = body;
    
    if (!name || !brand || !price || !category || !description || !image_url || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();
    const insert = db.prepare(`
      INSERT INTO shoes (name, brand, price, category, description, image_url, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(name, brand, price, category, description, image_url, color);
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
