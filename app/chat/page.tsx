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

  // 1. Fetch inbox partners and active messages concurrently
  const [inboxPartners, currentMessages] = await Promise.all([
    getInboxUsers(),
    partnerId
      ? prisma.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId: partnerId },
              { senderId: partnerId, receiverId: user.id }
            ]
          },
          orderBy: {
            createdAt: "asc"
          }
        })
      : Promise.resolve([] as Message[])
  ]);

  let messages = currentMessages;
  let activeProduct = null;
  let activeTransaction = null;
  let blockedByMe = false;
  let blockingMe = false;

  if (partnerId) {
    // 2. Mark incoming messages as read in background
    const updateReadPromise = prisma.message.updateMany({
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

    // 3. Fetch product details
    const productPromise = targetProductId
      ? prisma.product.findUnique({ where: { id: targetProductId } })
      : Promise.resolve(null);

    // 4. Block status checks
    const blockMePromise = prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: partnerId,
        },
      },
    });

    const blockPartnerPromise = prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: partnerId,
          blockedId: user.id,
        },
      },
    });

    // Run active conversation details concurrently
    const [prod, blockMe, blockPartner] = await Promise.all([
      productPromise,
      blockMePromise,
      blockPartnerPromise,
      updateReadPromise
    ]);

    activeProduct = prod;
    blockedByMe = !!blockMe;
    blockingMe = !!blockPartner;

    if (activeProduct) {
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
  } else if (inboxPartners.length > 0) {
    const firstPartner = inboxPartners[0];
    redirect(`/chat?partnerId=${firstPartner.partnerId}${firstPartner.productId ? `&productId=${firstPartner.productId}` : ""}`);
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
