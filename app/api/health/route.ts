import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "UP",
        timestamp: new Date().toISOString(),
        services: {
          database: "UP",
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      {
        status: "DOWN",
        timestamp: new Date().toISOString(),
        services: {
          database: "DOWN",
        },
        error: process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
      },
      { status: 500 }
    );
  }
}
