import { NextRequest, NextResponse } from "next/server";
import { findMessageById } from "@/lib/message";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const message = await findMessageById(id);

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ message });
}
