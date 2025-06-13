import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// Criar nova enquete (apenas admin)
router.post("/polls", auth, isAdmin, async (req, res) => {
  const { title, options } = req.body;

  try {
    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          create: options.map((title) => ({ titleManga: title })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao criar enquete." });
  }
});

router.post("/polls/:id/options", auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { titles } = req.body; // Ex: ["Chainsaw Man", "One Piece"]

  try {
    const poll = await prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      return res.status(404).json({ message: "Enquete não encontrada." });
    }

    const createdOptions = await Promise.all(
      titles.map((title) =>
        prisma.mangaOption.create({
          data: {
            title,
            pollId: id,
          },
        })
      )
    );

    res.status(201).json({ message: "Opções adicionadas com sucesso.", options: createdOptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao adicionar opções." });
  }
});


// Listar todas as enquetes com opções e votos
router.get("/polls", async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
       where: {
        closed: false,
      },
      include: {
        options: {
          include: { votes: true },
        },
      },
    });

    res.json(polls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar enquetes." });
  }
});

// Votar em uma opção (um voto por enquete por usuário)
router.post("/votes", auth, async (req, res) => {
  const { mangaOptionId } = req.body;

  try {
    const option = await prisma.mangaOption.findUnique({
      where: { id: mangaOptionId },
      include: { poll: true },
    });

    if (!option) {
      return res.status(404).json({ message: "Opção não encontrada." });
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: req.userId,
        mangaOption: {
          pollId: option.pollId,
        },
      },
    });

    if (existingVote) {
      return res.status(400).json({ message: "Você já votou nesta enquete." });
    }

    const vote = await prisma.vote.create({
      data: {
        userId: req.userId,
        mangaOptionId,
      },
    });

    res.status(201).json(vote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao votar." });
  }
});

// Encerrar enquete (apenas admin)
router.put("/polls/:id/close", auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const poll = await prisma.poll.update({
      where: { id },
      data: { closed: true },
    });

    res.json({ message: "Enquete encerrada.", poll });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao encerrar enquete." });
  }
});

export default router;
