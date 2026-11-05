import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "ai-fashion-studio",
    timestamp: new Date().toISOString(),
  });
}
