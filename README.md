# Manga Library

Sistema completo para gerenciamento de biblioteca de mangás, com autenticação de usuários, controle de empréstimos, enquetes e lista de espera.

## Estrutura do Projeto

```
manga_library/
├── Backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── routes/
│       ├── private.js
│       └── public.js
└── Frontend/
```

## Tecnologias Utilizadas

- Node.js
- Express
- Prisma ORM (MongoDB)
- JWT (JSON Web Token)
- Bcrypt
- CORS

## Como rodar o projeto

1. **Clone o repositório**
2. **Configure as variáveis de ambiente**  
   Crie um arquivo `.env` em `Backend/` com as variáveis `DATABASE_URL` e `JWT_SECRET` (exemplo no próprio projeto).
3. **Instale as dependências**
   ```sh
   cd Backend
   npm install
   ```
4. **Rode as migrations do Prisma**
   ```sh
   npx prisma generate
   ```
5. **Inicie o servidor**
   ```sh
   node server.js
   ```
   O backend estará disponível em `http://localhost:3000`.

## Principais Rotas

- **POST /login**  
  Autenticação de usuário. Retorna token JWT.
- **POST /register**  
  Cadastro de novo usuário.
- **GET /users**  
  Lista todos os usuários (rota protegida).

## Estrutura do Banco de Dados

O banco de dados é definido em [`prisma/schema.prisma`](Backend/prisma/schema.prisma), incluindo modelos para Usuário, Mangá, Empréstimo, Mensagem, Enquete, Opção de Mangá, Voto e Lista de Espera.

## Observações

- O frontend ainda não está implementado.
- Para acessar rotas privadas, é necessário enviar o token JWT no header `Authorization`.

## Próximos passos

Criar rotas de mangás/empréstimos/enquetes/notificações/lista de espera
Iniciar desenvolvimento do frontend
Implementar painel administrativo


Feito com 🩷 por Alice.