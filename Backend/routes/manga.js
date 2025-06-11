import express from "express";
import { PrismaClient } from "@prisma/client";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();
const prisma = new PrismaClient();

// Cadastrar novo mangá
router.post("/register-mangas", auth, isAdmin, async (req, res) => {
  const { title, author, genre, volume } = req.body;

  if (!title || !author || !genre || volume === undefined) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const manga = await prisma.manga.create({
      data: {
        title,
        author,
        genre,
        volume,
      },
    });
    res.status(201).json(manga);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao cadastrar o mangá." });
  } finally {
    await prisma.$disconnect();
  }
});

// Listar mangás (não excluídos)
router.get("/list-mangas", auth, async (req, res) => {
  try {
    const mangas = await prisma.manga.findMany({
      where: { deleted: false }, include:{waitlist: true},
    });
    res.status(200).json(mangas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao listar os mangás." });
  } finally {
    await prisma.$disconnect();
  }
});

// Editar mangá
router.put("/edit-manga/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, volume } = req.body;

  try {
    const manga = await prisma.manga.findUnique({ where: { id } });

    if (!manga || manga.deleted) {
      return res.status(404).json({ message: "Mangá não encontrado ou excluído." });
    }

    const mangaAtualizado = await prisma.manga.update({
      where: { id },
      data: { title, author, genre, volume },
    });

    res.status(200).json(mangaAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao editar o mangá." });
  } finally {
    await prisma.$disconnect();
  }
});

// Soft delete do mangá
router.put("/delete-manga/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const manga = await prisma.manga.findUnique({ where: { id } });

    if (!manga) {
      return res.status(404).json({ message: "Mangá não encontrado." });
    }

    const mangaExcluido = await prisma.manga.update({
      where: { id },
      data: { deleted: true },
    });

    res.status(200).json({ message: "Mangá excluído com sucesso.", mangaExcluido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir o mangá." });
  } finally {
    await prisma.$disconnect();
  }
});

// Registrar leitura (incrementa totalReadings)
router.post("/mangas/read/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const manga = await prisma.manga.findUnique({ where: { id } });

    if (!manga || manga.deleted) {
      return res.status(404).json({ message: "Mangá não encontrado ou excluído." });
    }

    const atualizado = await prisma.manga.update({
      where: { id },
      data: { totalReadings: manga.totalReadings + 1 },
    });

    res.status(200).json(atualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar leitura." });
  } finally {
    await prisma.$disconnect();
  }
});

// Mangás mais populares
router.get("/mangas/pop", async (req, res) => {
  try {
    const mangas = await prisma.manga.findMany({
      where: { deleted: false },
      orderBy: { totalReadings: "desc" },
      take: 10,
    });
    res.status(200).json(mangas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar mangás populares." });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
