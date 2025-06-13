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

### Usuários
- **POST /register**  
  Cadastro de novo usuário (ADMIN ou READER).
- **POST /login**  
  Autenticação de usuário. Retorna token JWT.
- **GET /users**  
  Lista todos os usuários (rota protegida).
- **PUT /users/:id**  
  Atualiza nome e senha do usuário.
- **DELETE /users/:id**  
  Remove usuário e seus mangás associados.

### Mangás
- **GET /mangas**  
  Lista todos os mangás.
- **POST /mangas**  
  Cadastra um novo mangá.
- **PUT /mangas/:id**  
  Atualiza informações de um mangá.
- **DELETE /mangas/:id**  
  Remove um mangá.

  ### Empréstimos
- **GET /loans**  
  Lista todos os empréstimos.
- **POST /loans**  
  Cria um novo empréstimo.
- **PUT /loans/:id/return**  
  Realiza a devolução de um mangá emprestado.

### Enquetes
- **GET /polls**  
  Lista todas as enquetes.
- **POST /polls**  
  Cria uma nova enquete.
- **POST /polls/:id/vote**  
  Vota em uma opção da enquete.
### Lista de Espera
- **GET /waitlist**  
  Lista de espera de mangás.
- **POST /waitlist**  
  Adiciona usuário à lista de espera.

> Obs: Algumas rotas podem estar em desenvolvimento ou restritas a administradores.

## Estrutura do Banco de Dados

O banco de dados é definido em [`prisma/schema.prisma`](Backend/prisma/schema.prisma), incluindo modelos para Usuário, Mangá, Empréstimo, Mensagem, Enquete, Opção de Mangá, Voto e Lista de Espera.

## Observações

- O frontend ainda não está implementado.
- Para acessar rotas privadas, é necessário enviar o token JWT no header `Authorization`.
- O backend já possui rotas para cadastro, autenticação, listagem, atualização e exclusão de usuários, além de suporte para mangás, empréstimos, enquetes e lista de espera.


## Próximos passos

- Iniciar desenvolvimento do frontend
- Implementar painel administrativo


Feito com 🩷 por Alice.