import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { getAuthUser } from "@/lib/auth";
import { getInboxUsers } from "@/app/actions/messages";
import { prisma } from "@/lib/prisma";
import ChatWindow from "@/components/ChatWindow";

import type { Message } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ partnerId?: string; productId?: string }>;
}

export default async function ChatPage({ searchParams }: PageProps) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const { partnerId, productId } = await searchParams;

  const inboxPartners = await getInboxUsers();

  let messages: Message[] = [];
  let activeProduct = null;

  if (partnerId) {

    messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id }
        ]
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    const targetProductId = productId || inboxPartners.find(p => p.partnerId === partnerId)?.productId;
    if (targetProductId) {
      activeProduct = await prisma.product.findUnique({
        where: { id: targetProductId }
      });
    }
  } else if (inboxPartners.length > 0) {

    const firstPartner = inboxPartners[0];
    redirect(`/chat?partnerId=${firstPartner.partnerId}${firstPartner.productId ? `&productId=${firstPartner.productId}` : ""}`);
  }

  let activeTransaction = null;
  if (user && partnerId && activeProduct) {
    activeTransaction = await prisma.transaction.findFirst({
      where: {
        productId: activeProduct.id,
        OR: [
          { buyerId: user.id, sellerId: partnerId },
          { buyerId: partnerId, sellerId: user.id }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
  let blockedByMe = false;
  let blockingMe = false;
  if (user && partnerId) {
    const blockMe = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: partnerId,
        },
      },
    });
    const blockPartner = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: partnerId,
          blockedId: user.id,
        },
      },
    });
    blockedByMe = !!blockMe;
    blockingMe = !!blockPartner;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      <ChatWindow
        currentUser={{
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        }}
        inboxPartners={inboxPartners}
        selectedPartnerId={partnerId || null}
        messages={messages}
        activeProduct={activeProduct}
        activeTransaction={activeTransaction}
        isBlockedByMe={blockedByMe}
        isBlockingMe={blockingMe}
      />

      <MobileNav />
    </div>
  );
}
