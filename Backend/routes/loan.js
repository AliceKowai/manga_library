import express from "express";
import { PrismaClient, LoanStatus } from "@prisma/client";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

import {
  notificarAprovacao,
  notificarRejeicao,
  notificarFilaDeEspera,
  notificationAdminPostManga,
} from "../utils/loanMesseges.js";

const router = express.Router();
const prisma = new PrismaClient();

// Criar empréstimo
router.post("/loans", auth, async (req, res) => {
  const { mangaId } = req.body;

  if (!mangaId)
    return res.status(400).json({ message: "ID do mangá é obrigatório." });

  try {
    const manga = await prisma.manga.findUnique({ where: { id: mangaId } });
    if (!manga)
      return res.status(404).json({ message: "Mangá não encontrado." });

    const activeLoan = await prisma.loan.findFirst({
      where: {
        mangaId,
        status: { in: [LoanStatus.PENDING, LoanStatus.APPROVED] },
      },
    });

    if (activeLoan) {
      return res
        .status(400)
        .json({ message: "Já existe um empréstimo ativo ou pendente." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    if (!admin) {
      return res
        .status(500)
        .json({ message: "Nenhum administrador encontrado." });
    }

    console.log(admin)
    const loan = await prisma.loan.create({
      data: {
        mangaId,
        userId: req.userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: LoanStatus.PENDING,
      },
      include: { manga: true, user: true },
    });
        await notificationAdminPostManga(prisma, loan, admin.id);

    res
      .status(201)
      .json({ message: "Empréstimo solicitado com sucesso.", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar empréstimo." });
  } finally {
    await prisma.$disconnect();
  }
});

// Listar todos os empréstimos (admin)
router.get("/loans", auth, isAdmin, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      include: { user: true, manga: true },
    });
    res.status(200).json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar empréstimos." });
  } finally {
    await prisma.$disconnect();
  }
});

// Listar empréstimos do usuário autenticado
router.get("/loans/user", auth, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.userId },
      include: { manga: true },
    });
    res.status(200).json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar seus empréstimos." });
  } finally {
    await prisma.$disconnect();
  }
});

// Atualizar status do empréstimo (admin)
router.put("/loans/:id/status", auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!Object.values(LoanStatus).includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }

  const exists = await prisma.loan.findUnique({ where: { id } });
  if (!exists)
    return res.status(404).json({ message: "Empréstimo não encontrado." });

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: { status },
      include: { manga: true },
    });

    const admin = await prisma.user.findUnique({ where: { id: req.userId } });

    switch (status) {
      case LoanStatus.APPROVED:
        await notificarAprovacao(prisma, loan, admin.id);
        break;
      case LoanStatus.REJECTED:
        await notificarRejeicao(prisma, loan, admin.id);
        break;
      case LoanStatus.RETURNED:
        await notificarFilaDeEspera(prisma, loan.mangaId, admin.id);
        break;
    }

    res.status(200).json({ message: "Status atualizado com sucesso.", loan });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ message: "Erro ao atualizar empréstimo." });
  } finally {
    await prisma.$disconnect();
  }
});

// Marcar como devolvido
router.put("/loans/:id/return", auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  const waitlist = await prisma.waitlist.findMany({
    where: { mangaId: loan.mangaId },
  });

  for (const item of waitlist) {
    await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId: item.userId,
        mangaId: loan.mangaId,
        content: `O mangá "${manga.title}" que você está esperando agora está disponível para empréstimo!`,
      },
    });
  }

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: { returned: true },
    });

    res
      .status(200)
      .json({ message: "Empréstimo marcado como devolvido.", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao marcar devolução." });
  } finally {
    await prisma.$disconnect();
  }
});

// Excluir empréstimo (admin)
router.delete("/loans/:id", auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await prisma.loan.delete({ where: { id } });
    res.status(200).json({ message: "Empréstimo deletado.", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar empréstimo." });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
