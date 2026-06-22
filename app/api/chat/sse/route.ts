import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId");
  if (!partnerId) {
    return new Response("Bad Request", { status: 400 });
  }

  const encoder = new TextEncoder();

  // Create a ReadableStream that polls the database for new messages
  const stream = new ReadableStream({
    async start(controller) {
      let lastChecked = new Date();

      const intervalId = setInterval(async () => {
        try {
          const newMessages = await prisma.message.findMany({
            where: {
              senderId: partnerId,
              receiverId: user.id,
              createdAt: {
                gt: lastChecked
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          });

          if (newMessages.length > 0) {
            lastChecked = newMessages[newMessages.length - 1].createdAt;
            for (const msg of newMessages) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
            }
          }
        } catch (error) {
          console.error("[SSE ERROR] failed to fetch messages:", error);
          controller.close();
          clearInterval(intervalId);
        }
      }, 1000); // Poll database every 1 second for new incoming messages

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
