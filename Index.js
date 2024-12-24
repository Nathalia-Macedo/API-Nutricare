

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const swaggerJsDoc = require("swagger-jsdoc");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Swagger Configuração
// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Nutricare API",
//       version: "1.0.0",
//       description: "API da Nutricare para gerenciar informações do site",
//     },
//     servers: [
//       {
//         url: process.env.BASE_URL || "http://localhost:3000",
//         description: "Servidor local",
//       },
//     ],
//   },
//   apis: ["./index.js"], // Define onde os comentários com Swagger estão localizados
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // Conexão com o MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB conectado"))
//   .catch((err) => console.error(err));

// // Modelos
// const Header = mongoose.model(
//   "Header",
//   new mongoose.Schema({
//     phone: { type: String, required: true },
//     whatsapp: { type: String, required: true },
//     email: { type: String, required: true },
//     logo: { type: String, required: true },
//     socialLinks: [{ type: String }],
//   })
// );

// // Rotas

// /**
//  * @swagger
//  * /header:
//  *   get:
//  *     summary: Retorna as informações do header
//  *     responses:
//  *       200:
//  *         description: Lista de informações do header
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 phone:
//  *                   type: string
//  *                   description: Telefone de contato
//  *                 whatsapp:
//  *                   type: string
//  *                   description: Número do WhatsApp
//  *                 email:
//  *                   type: string
//  *                   description: E-mail de contato
//  *                 logo:
//  *                   type: string
//  *                   description: URL da logo
//  *                 socialLinks:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  */
// app.get("/header", async (req, res) => {
//   const headers = await Header.find();
//   res.json(headers);
// });

// /**
//  * @swagger
//  * /header:
//  *   post:
//  *     summary: Adiciona uma nova configuração ao header
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               phone:
//  *                 type: string
//  *                 description: Telefone de contato
//  *               whatsapp:
//  *                 type: string
//  *                 description: Número do WhatsApp
//  *               email:
//  *                 type: string
//  *                 description: E-mail de contato
//  *               logo:
//  *                 type: string
//  *                 description: URL da logo
//  *               socialLinks:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       201:
//  *         description: Header criado com sucesso
//  */
// app.post("/header", async (req, res) => {
//   const { phone, whatsapp, email, logo, socialLinks } = req.body;
//   if (!phone || !whatsapp || !email || !logo) {
//     return res
//       .status(400)
//       .json({ message: "Campos obrigatórios estão faltando" });
//   }
//   const header = new Header({ phone, whatsapp, email, logo, socialLinks });
//   await header.save();
//   res.status(201).json(header);
// });

// /**
//  * @swagger
//  * /header/{id}:
//  *   put:
//  *     summary: Atualiza as informações do header
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID do header
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               phone:
//  *                 type: string
//  *                 description: Telefone de contato
//  *               whatsapp:
//  *                 type: string
//  *                 description: Número do WhatsApp
//  *               email:
//  *                 type: string
//  *                 description: E-mail de contato
//  *               logo:
//  *                 type: string
//  *                 description: URL da logo
//  *               socialLinks:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       200:
//  *         description: Header atualizado com sucesso
//  */
// app.put("/header/:id", async (req, res) => {
//   const { id } = req.params;
//   const updatedHeader = await Header.findByIdAndUpdate(id, req.body, {
//     new: true,
//   });
//   res.json(updatedHeader);
// });

// /**
//  * @swagger
//  * /header/{id}:
//  *   delete:
//  *     summary: Remove uma configuração do header
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID do header
//  *     responses:
//  *       204:
//  *         description: Header removido com sucesso
//  */
// app.delete("/header/:id", async (req, res) => {
//   const { id } = req.params;
//   await Header.findByIdAndDelete(id);
//   res.status(204).send();
// });

// // Inicia o servidor
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
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nutricare API",
      version: "1.0.0",
      description: "API da Nutricare para gerenciar informações do site",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
      {
        url: process.env.BASE_URL || "https://api-nutricare-1.onrender.com",
        description: "Servidor de produção",
      },
    ],
  },
  apis: ["./index.js"], // Garante que os comentários do Swagger estão sendo lidos
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
 * components:
 *   schemas:
 *     Header:
 *       type: object
 *       required:
 *         - phone
 *         - whatsapp
 *         - email
 *         - logo
 *       properties:
 *         phone:
 *           type: string
 *           description: Telefone de contato
 *         whatsapp:
 *           type: string
 *           description: Número do WhatsApp
 *         email:
 *           type: string
 *           description: E-mail de contato
 *         logo:
 *           type: string
 *           description: URL da logo
 *         socialLinks:
 *           type: array
 *           items:
 *             type: string
 *           description: Links das redes sociais
 */

/**
 * @swagger
 * /header:
 *   get:
 *     summary: Retorna as informações do header
 *     tags: [Header]
 *     responses:
 *       200:
 *         description: Lista de informações do header
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Header'
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
 *     tags: [Header]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Header'
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
 *     tags: [Header]
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
 *             $ref: '#/components/schemas/Header'
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
 *     tags: [Header]
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
