import { NextResponse } from "next/server";

export async function GET() {
  const data = await fetch("https://www.gamersberg.com/api/blox-fruits/stock");
  const r = await data.json();
  return NextResponse.json(r);
}
