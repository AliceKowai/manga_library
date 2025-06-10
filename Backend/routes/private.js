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

export default router;