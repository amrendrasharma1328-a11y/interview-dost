import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AIError, toPublicError } from "@/lib/ai/errors";
import { AppError } from "./validation";

function toResponse(e) {
  if (e instanceof AppError) return { status: e.status, body: { error: { code: e.code, message: e.message, hint: e.hint } } };
  if (e instanceof AIError) return { status: e.code === "INVALID_RESPONSE" ? 502 : 503, body: { error: toPublicError(e) } };
  if (e instanceof ZodError) {
    const first = e.issues[0]?.message || "Some inputs look invalid.";
    return { status: 400, body: { error: { code: "INVALID_INPUT", message: first, hint: "Check your input and try again." } } };
  }
  if (e?.name?.startsWith("PrismaClient") || String(e?.message).includes("@prisma/client")) {
    return { status: 500, body: { error: { code: "DATABASE", message: "We couldn't save your session.", hint: "Run `npx prisma migrate dev --name init`, then retry." } } };
  }
  return { status: 500, body: { error: { code: "INTERNAL", message: "Something went wrong.", hint: "Please retry." } } };
}

/** Wrap a route handler: log server-side, return friendly JSON, never leak stack traces. */
export function route(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error("[api]", e);
      const { status, body } = toResponse(e);
      return NextResponse.json(body, { status });
    }
  };
}
