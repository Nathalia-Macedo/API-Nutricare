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

// Swagger Configuration
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
      {
        url: "https://api-nutricare-1.onrender.com",
        description: "Servidor de produção",
      },
    ],
  },
  apis: ["./index.js"], // Atualize este caminho caso o arquivo seja renomeado
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexão ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Schemas
const ContactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  social: [{ type: String }],
});

const HeaderSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  contacts: [ContactSchema],
});

const SlideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: true },
    position: { type: String, enum: ["left", "center", "right"], default: "center" },
  });

  const AboutSchema = new mongoose.Schema({
    title: { type: String, required: true },
    highlightedName: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: [String], required: true },
    cards: [
      {
        title: { type: String, required: true },
        icon: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  });

const About = mongoose.model("About", AboutSchema);
const Contact = mongoose.model("Contact", ContactSchema);
const Header = mongoose.model("Header", HeaderSchema);
const Slide = mongoose.model("Slide", SlideSchema);

// Rotas
/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Retorna todos os contatos
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   social:
 *                     type: array
 *                     items:
 *                       type: string
 */
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar contatos" });
  }
});

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Adiciona um novo contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               social:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Contato criado
 *       400:
 *         description: Erro de validação
 */
app.post("/api/contacts", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar contato" });
  }
});

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Atualiza um contato existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               email:
 *                 type: string
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Contato atualizado
 */
app.put("/api/contacts/:id", async (req, res) => {
    try {
      const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar contato" });
    }
  });

/**
 * @swagger
 * /api/header:
 *   get:
 *     summary: Retorna o cabeçalho com as informações de contato e logo
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logo:
 *                   type: string
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       social:
 *                         type: array
 *                         items:
 *                           type: string
 */
app.get("/api/header", async (req, res) => {
  try {
    const header = await Header.findOne();
    res.json(header);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cabeçalho" });
  }
});

/**
 * @swagger
 * /api/header:
 *   put:
 *     summary: Atualiza o cabeçalho com novas informações
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     social:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Cabeçalho atualizado
 *       400:
 *         description: Erro de validação
 */
app.put("/api/header", async (req, res) => {
  try {
    const header = await Header.findOneAndUpdate({}, req.body, { new: true });
    res.json(header);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar cabeçalho" });
  }
});

// Rotas do Carrossel
/**
 * @swagger
 * /api/slides:
 *   get:
 *     summary: Retorna todos os slides do carrossel
 *     responses:
 *       200:
 *         description: Lista de slides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get("/api/slides", async (req, res) => {
    try {
      const slides = await Slide.find();
      res.json(slides);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar slides" });
    }
  });
  
  /**
   * @swagger
   * /api/slides:
   *   post:
   *     summary: Adiciona um novo slide ao carrossel
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               buttonText:
   *                 type: string
   *               buttonLink:
   *                 type: string
   *               position:
   *                 type: string
   *                 enum: [left, center, right]
   *     responses:
   *       201:
   *         description: Slide criado
   */
  app.post("/api/slides", async (req, res) => {
    try {
      const slide = new Slide(req.body);
      await slide.save();
      res.status(201).json(slide);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar slide" });
    }
  });
  
  /**
   * @swagger
   * /api/slides/{id}:
   *   put:
   *     summary: Atualiza um slide existente
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do slide
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               buttonText:
   *                 type: string
   *               buttonLink:
   *                 type: string
   *               position:
   *                 type: string
   *                 enum: [left, center, right]
   *     responses:
   *       200:
   *         description: Slide atualizado
   */
  app.put("/api/slides/:id", async (req, res) => {
    try {
      const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(slide);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar slide" });
    }
  });
  
  /**
   * @swagger
   * /api/slides/{id}:
   *   delete:
   *     summary: Deleta um slide
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do slide
   *     responses:
   *       200:
   *         description: Slide deletado
   */
  app.delete("/api/slides/:id", async (req, res) => {
    try {
      await Slide.findByIdAndDelete(req.params.id);
      res.json({ message: "Slide deletado com sucesso" });
    } catch (error) {
      res.status(404).json({ error: "Slide não encontrado" });
    }
  });


// Rotas de Sobre Nós
/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Retorna as informações da seção "Sobre Nós"
 *     responses:
 *       200:
 *         description: Informações da seção "Sobre Nós"
 */
app.get("/api/about", async (req, res) => {
    try {
      const about = await About.findOne();
      res.json(about);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar informações sobre nós" });
    }
  });
  
  /**
   * @swagger
   * /api/about:
   *   post:
   *     summary: Cria ou atualiza as informações da seção "Sobre Nós"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               highlightedName:
   *                 type: string
   *               image:
   *                 type: string
   *               description:
   *                 type: array
   *                 items:
   *                   type: string
   *               cards:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     title:
   *                       type: string
   *                     icon:
   *                       type: string
   *                     description:
   *                       type: string
   *     responses:
   *       201:
   *         description: Informações da seção "Sobre Nós" criadas ou atualizadas
   */
  app.post("/api/about", async (req, res) => {
    try {
      const about = await About.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      res.status(201).json(about);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar ou atualizar informações sobre nós" });
    }
  });

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

