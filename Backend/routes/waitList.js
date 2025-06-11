import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middlewares/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

//Adicionar à fila de espera
router.post("/waitlist", auth, async (req, res) => {
  const { mangaId } = req.body;

  if (!mangaId) {
    return res.status(400).json({ message: "ID do mangá é obrigatório." });
  }

  try {
    const existente = await prisma.waitlist.findFirst({
      where: { userId: req.userId, mangaId },
    });

    if (existente) {
      return res.status(400).json({ message: "Você já está na fila de espera desse mangá." });
    }

    const entry = await prisma.waitlist.create({
      data: {
        userId: req.userId,
        mangaId,
      },
    });

    res.status(201).json({ message: "Adicionado à fila com sucesso!", entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao adicionar à fila." });
  } finally {
    await prisma.$disconnect();
  }
});

// Listar fila de um mangá
router.get("/waitlist/:mangaId", async (req, res) => {
  const { mangaId } = req.params;

  try {
    const fila = await prisma.waitlist.findMany({
      where: { mangaId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(fila);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar a fila." });
  } finally {
    await prisma.$disconnect();
  }
});

// Remover da fila (autenticado)
router.delete("/waitlist/:mangaId", auth, async (req, res) => {
  const { mangaId } = req.params;

  try {
    const entry = await prisma.waitlist.findFirst({
      where: { mangaId, userId: req.userId },
    });

    if (!entry) {
      return res.status(404).json({ message: "Você não está na fila desse mangá." });
    }

    await prisma.waitlist.delete({ where: { id: entry.id } });
    res.status(200).json({ message: "Removido da fila com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao remover da fila." });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
