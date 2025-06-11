import express from "express";
import { PrismaClient, LoanStatus } from "@prisma/client";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// Criar empréstimo
router.post("/loans", auth, async (req, res) => {
  const { mangaId } = req.body;

  if (!mangaId) return res.status(400).json({ message: "ID do mangá é obrigatório." });

  try {
    const manga = await prisma.manga.findUnique({ where: { id: mangaId } });
    if (!manga) return res.status(404).json({ message: "Mangá não encontrado." });

    const activeLoan = await prisma.loan.findFirst({
      where: {
        mangaId,
        status: { in: [LoanStatus.PENDING, LoanStatus.APPROVED] },
      },
    });

    if (activeLoan) {
      return res.status(400).json({ message: "Já existe um empréstimo ativo ou pendente." });
    }

    const loan = await prisma.loan.create({
      data: {
        mangaId,
        userId: req.userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: LoanStatus.PENDING,
      },
    });

    res.status(201).json({ message: "Empréstimo solicitado com sucesso.", loan });
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

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: "Status atualizado.", loan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar status." });
  } finally {
    await prisma.$disconnect();
  }
});

// Marcar como devolvido
router.put("/loans/:id/return", auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: { returned: true },
    });

    res.status(200).json({ message: "Empréstimo marcado como devolvido.", loan });
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
