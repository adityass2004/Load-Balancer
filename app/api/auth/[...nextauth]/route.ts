import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { getClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit("auth:ip", clientIp, request);
  if (limited) return limited;
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit("auth:ip", clientIp, request);
  if (limited) return limited;
  return handlers.POST(request);
}
