import { NextResponse } from "next/server";
import { getAgents } from "@/lib/agents";

export async function GET() {
  const agents = getAgents().map(({ id, name, description, type }) => ({
    id,
    name,
    description,
    type,
  }));
  return NextResponse.json(agents);
}
