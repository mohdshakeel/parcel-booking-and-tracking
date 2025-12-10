// app/api/upload-profile-image/route.js
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extMatch = file.name.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0] : ".jpg";
  const fileName = `${Date.now()}-${uuidv4()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  // ensure uploadDir exists (your deployment must ensure write permissions)
  try {
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch (err) {
    // In some hosts writing to public may not be allowed. Replace with cloud storage in prod.
    return NextResponse.json({ error: "Failed to save file", detail: err.message }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${fileName}` });
}