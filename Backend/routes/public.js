import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();
const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const userInfo = req.body;
  const userConsulta = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  if (!userConsulta) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }
  const isMatch = await bcrypt.compare(
    userInfo.password,
    userConsulta.password
  );
  console.log(userConsulta);
  
  if (!isMatch) {
    return res.json({ message: "Email ou senha inválidos" });
  }
  const token = jwt.sign(
    { id: userConsulta.id, role: userConsulta.role },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return res.status(202).json({
    success: true,
    token: token,
    userId: userConsulta.id,
    message: "Login realizado com sucesso!",
    role: userConsulta.role,
  });
});

export default router;
