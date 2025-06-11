// utils/loanMessages.js
export async function notificarAprovacao(prisma, loan, adminId) {
  await prisma.message.create({
    data: {
      senderId: adminId,
      receiverId: loan.userId,
      mangaId: loan.mangaId,
      content: `Seu empréstimo do mangá "${loan.manga.title}" foi aceito! Você já pode retirá-lo.`,
    },
  });
}

export async function notificarRejeicao(prisma, loan, adminId) {
  await prisma.message.create({
    data: {
      senderId: adminId,
      receiverId: loan.userId,
      mangaId: loan.mangaId,
      content: `Infelizmente, seu empréstimo para o mangá "${loan.manga.title}" foi rejeitado.`,
    },
  });
}

export async function notificationAdminPostManga(prisma, loan, adminId) {
  await prisma.message.create({
    data: {
      senderId: loan.userId,
      receiverId: adminId,
      mangaId: loan.mangaId,
      content: `O usuário ${loan.user.name} solicitou o empréstimo do mangá "${loan.manga.title}".`,
    },
  });
}

export async function notificarFilaDeEspera(prisma, mangaId, adminId) {
  const fila = await prisma.waitlist.findMany({ where: { mangaId } });
  const manga = await prisma.manga.findUnique({ where: { id: mangaId } });

  for (const item of fila) {
    await prisma.message.create({
      data: {
        senderId: adminId,
        receiverId: item.userId,
        mangaId,
        content: `O mangá "${manga.title}" que você estava aguardando está disponível! Corra e solicite o empréstimo.`,
      },
    });
  }
}
