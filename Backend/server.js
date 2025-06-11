import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'
import mangaRoutes from './routes/manga.js'
import loanRoutes from './routes/loan.js'
import messageRoutes from './routes/message.js'
import auth from './middlewares/auth.js';
import cors from 'cors';

const app = express()



// Middleware para analisar o corpo da solicitação
app.use(express.json());
app.use(cors())

app.use('/', publicRoutes);
app.use('/', auth, privateRoutes);
app.use('/', auth, mangaRoutes);
app.use('/', auth, loanRoutes);
app.use('/', auth, messageRoutes);

app.listen(3000, ()=> console.log("Servidor Rodando"))