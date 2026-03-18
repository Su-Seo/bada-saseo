import { NextRequest, NextResponse } from "next/server";
import { deleteExpiredMessages } from "@/lib/message";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await deleteExpiredMessages();

  return NextResponse.json({ deleted });
}
