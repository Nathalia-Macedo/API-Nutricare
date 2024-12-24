// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Conectar ao MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log(err));

// // Models
// const Professional = mongoose.model('Professional', new mongoose.Schema({
//   name: { type: String, required: true },
//   specialty: { type: String, required: true },
//   contact: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// }));

// const Recipe = mongoose.model('Recipe', new mongoose.Schema({
//   title: { type: String, required: true },
//   ingredients: { type: [String], required: true },
//   instructions: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// }));

// const Header = mongoose.model('Header', new mongoose.Schema({
//   logo: { type: String, required: true }, // URL da imagem da logo
//   phone: { type: String, required: true },
//   whatsapp: { type: String, required: true },
//   email: { type: String, required: true },
//   socialLinks: { type: [String], required: true }, // Lista de links para redes sociais
//   createdAt: { type: Date, default: Date.now },
// }));

// // Rotas da API
// app.get('/api/professionals', async (req, res) => {
//   const professionals = await Professional.find();
//   res.json(professionals);
// });

// app.post('/api/professionals', async (req, res) => {
//   const professional = new Professional(req.body);
//   await professional.save();
//   res.status(201).json(professional);
// });

// app.get('/api/recipes', async (req, res) => {
//   const recipes = await Recipe.find();
//   res.json(recipes);
// });

// app.post('/api/recipes', async (req, res) => {
//   const recipe = new Recipe(req.body);
//   await recipe.save();
//   res.status(201).json(recipe);
// });

// // Rotas para o header
// app.get('/api/header', async (req, res) => {
//   const header = await Header.findOne();
//   res.json(header);
// });

// app.post('/api/header', async (req, res) => {
//   const header = new Header(req.body);
//   await header.save();
//   res.status(201).json(header);
// });

// app.put('/api/header/:id', async (req, res) => {
//   const header = await Header.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(header);
// });

// app.delete('/api/header/:id', async (req, res) => {
//   await Header.findByIdAndDelete(req.params.id);
//   res.status(204).send();
// });

// // Documentação da API na rota raiz
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>NutriCare API</h1>
//     <p>Bem-vindo à documentação da API NutriCare. Aqui estão os endpoints disponíveis:</p>
//     <ul>
//       <li><strong>GET /api/professionals</strong>: Retorna todos os profissionais cadastrados.</li>
//       <li><strong>POST /api/professionals</strong>: Cadastra um novo profissional.</li>
//       <li><strong>GET /api/recipes</strong>: Retorna todas as receitas cadastradas.</li>
//       <li><strong>POST /api/recipes</strong>: Cadastra uma nova receita.</li>
//       <li><strong>GET /api/header</strong>: Retorna as informações do header.</li>
//       <li><strong>POST /api/header</strong>: Cadastra as informações do header.</li>
//       <li><strong>PUT /api/header/:id</strong>: Atualiza as informações do header.</li>
//       <li><strong>DELETE /api/header/:id</strong>: Exclui as informações do header.</li>
//     </ul>
//   `);
// });

// // Porta dinâmica
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Configuração
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Nutricare API",
      version: "1.0.0",
      description: "API da Nutricare para gerenciar informações do site",
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./index.js"], // Define onde os comentários com Swagger estão localizados
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexão com o MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

// Modelos
const Header = mongoose.model(
  "Header",
  new mongoose.Schema({
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    email: { type: String, required: true },
    logo: { type: String, required: true },
    socialLinks: [{ type: String }],
  })
);

// Rotas

/**
 * @swagger
 * /header:
 *   get:
 *     summary: Retorna as informações do header
 *     responses:
 *       200:
 *         description: Lista de informações do header
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 phone:
 *                   type: string
 *                   description: Telefone de contato
 *                 whatsapp:
 *                   type: string
 *                   description: Número do WhatsApp
 *                 email:
 *                   type: string
 *                   description: E-mail de contato
 *                 logo:
 *                   type: string
 *                   description: URL da logo
 *                 socialLinks:
 *                   type: array
 *                   items:
 *                     type: string
 */
app.get("/header", async (req, res) => {
  const headers = await Header.find();
  res.json(headers);
});

/**
 * @swagger
 * /header:
 *   post:
 *     summary: Adiciona uma nova configuração ao header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Telefone de contato
 *               whatsapp:
 *                 type: string
 *                 description: Número do WhatsApp
 *               email:
 *                 type: string
 *                 description: E-mail de contato
 *               logo:
 *                 type: string
 *                 description: URL da logo
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Header criado com sucesso
 */
app.post("/header", async (req, res) => {
  const { phone, whatsapp, email, logo, socialLinks } = req.body;
  if (!phone || !whatsapp || !email || !logo) {
    return res
      .status(400)
      .json({ message: "Campos obrigatórios estão faltando" });
  }
  const header = new Header({ phone, whatsapp, email, logo, socialLinks });
  await header.save();
  res.status(201).json(header);
});

/**
 * @swagger
 * /header/{id}:
 *   put:
 *     summary: Atualiza as informações do header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Telefone de contato
 *               whatsapp:
 *                 type: string
 *                 description: Número do WhatsApp
 *               email:
 *                 type: string
 *                 description: E-mail de contato
 *               logo:
 *                 type: string
 *                 description: URL da logo
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Header atualizado com sucesso
 */
app.put("/header/:id", async (req, res) => {
  const { id } = req.params;
  const updatedHeader = await Header.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updatedHeader);
});

/**
 * @swagger
 * /header/{id}:
 *   delete:
 *     summary: Remove uma configuração do header
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do header
 *     responses:
 *       204:
 *         description: Header removido com sucesso
 */
app.delete("/header/:id", async (req, res) => {
  const { id } = req.params;
  await Header.findByIdAndDelete(id);
  res.status(204).send();
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
