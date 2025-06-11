import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// Criar mensagem (caso precise envio manual)
router.post("/messages", auth, async (req, res) => {
  const { receiverId, content, mangaId } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: "Destinatário e conteúdo são obrigatórios." });
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId,
        content,
        mangaId,
      },
    });
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao enviar mensagem." });
  } finally {
    await prisma.$disconnect();
  }
});

// Mensagens recebidas
router.get("/messages/inbox", auth, async (req, res) => {
  try {
    const inbox = await prisma.message.findMany({
      where: { receiverId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { sender: true, manga: true },
    });
    res.status(200).json(inbox);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar inbox." });
  } finally {
    await prisma.$disconnect();
  }
});

// Mensagens enviadas
router.get("/messages/sent", auth, async (req, res) => {
  try {
    const sent = await prisma.message.findMany({
      where: { senderId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { receiver: true, manga: true },
    });
    res.status(200).json(sent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar mensagens enviadas." });
  } finally {
    await prisma.$disconnect();
  }
});

// Marcar como lida
router.put("/messages/:id/read", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.message.update({
      where: { id },
      data: { read: true },
    });
    res.status(200).json({ message: "Mensagem marcada como lida.", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao marcar como lida." });
  } finally {
    await prisma.$disconnect();
  }
});

// Deletar mensagem
router.delete("/messages/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.message.delete({ where: { id } });
    res.status(200).json({ message: "Mensagem excluída com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar mensagem." });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
