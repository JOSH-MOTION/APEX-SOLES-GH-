import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const shoe = db.prepare("SELECT * FROM shoes WHERE id = ?").get(params.id);
    
    if (shoe) {
      return NextResponse.json(shoe);
    } else {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
