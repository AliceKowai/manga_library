import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    const role = user.role || "READER";

    const allowedRoles = ["ADMIN", "READER"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "O campo 'role' deve ser ADMIN ou READER." });
    }

    const userDB = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword,
        role: role,
      },
    });
    res.status(201).json(userDB);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erro no Servidor, tente novamente" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        loans: true,
        messages: true,
        votes: true,
        waitlist: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao listar usuários." });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { name, password } = req.body;
    const { id } = req.params;
    const userDB = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!userDB) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    let updatedData = { name };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      updatedData.password = hashPassword;
    }


    const user = await prisma.user.update({
      where: { id },
      data: { name, password: updatedData.password },
    });

    res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      // Erro "Registro não encontrado"
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao atualizar usuário." });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar o usuário no banco para verificar existência
    const userDB = await prisma.user.findUnique({
      where: { id },
    });

    if (!userDB) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await prisma.manga.deleteMany({
      where: { UserId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro no servidor ao excluir usuário." });
  }
});

export default router;
