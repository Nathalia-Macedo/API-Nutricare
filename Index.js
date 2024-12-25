const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" })); // Permite até 10MB no JSON
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Permite até 10MB em requisições codificadas por URL
app.use(cors());

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

const Base64Schema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  data: { type: String, required: true },
});

const Base64Model = mongoose.model("Base64", Base64Schema);


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

  const SpecialtySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
  });

  const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    cards: [
      {
        tags: [String],
        image: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  });

const About = mongoose.model("About", AboutSchema);
const Contact = mongoose.model("Contact", ContactSchema);
const Header = mongoose.model("Header", HeaderSchema);
const Slide = mongoose.model("Slide", SlideSchema);
const Specialty = mongoose.model("Specialty", SpecialtySchema);
const Blog = mongoose.model("Blog", BlogSchema);



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
 */
app.get("/api/header", async (req, res) => {
  try {
    const header = await Header.findOne(); // Busca o único documento da coleção
    console.log(header)
    res.json(header || { message: "Nenhuma informação encontrada no Header" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cabeçalho" });
  }
});

/**
 * @swagger
 * /api/header:
 *   put:
 *     summary: Atualiza ou cria o cabeçalho com novas informações
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cabeçalho atualizado ou criado
 *       400:
 *         description: Erro de validação
 */
app.put("/api/header", async (req, res) => {
  try {
    const header = await Header.findOneAndUpdate({}, req.body, {
      new: true, // Retorna o documento atualizado
      upsert: true, // Cria um novo documento caso não exista
    });
    console.log(header)
    res.json(header);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar ou criar cabeçalho" });
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


  // Rotas de Especialidades
/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Retorna todas as especialidades
 */
app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await Specialty.find();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar especialidades" });
    }
  });
  
  /**
   * @swagger
   * /api/specialties:
   *   post:
   *     summary: Cria uma nova especialidade
   */
  app.post("/api/specialties", async (req, res) => {
    try {
      const specialty = new Specialty(req.body);
      await specialty.save();
      res.status(201).json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar especialidade" });
    }
  });
  
  /**
   * @swagger
   * /api/specialties/{id}:
   *   put:
   *     summary: Atualiza uma especialidade existente
   */
  app.put("/api/specialties/:id", async (req, res) => {
    try {
      const specialty = await Specialty.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(specialty);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar especialidade" });
    }
  });
  
  /**
   * @swagger
   * /api/specialties/{id}:
   *   delete:
   *     summary: Deleta uma especialidade
   */
  app.delete("/api/specialties/:id", async (req, res) => {
    try {
      await Specialty.findByIdAndDelete(req.params.id);
      res.json({ message: "Especialidade deletada com sucesso" });
    } catch (error) {
      res.status(404).json({ error: "Especialidade não encontrada" });
    }
  });
  
  /**
   * @swagger
   * /api/specialties/filter:
   *   get:
   *     summary: Filtra especialidades pelo nome
   */
  app.get("/api/specialties/filter", async (req, res) => {
    try {
      const { name } = req.query;
      const specialties = await Specialty.find({ name: new RegExp(name, "i") });
      res.json(specialties);
    } catch (error) {
      res.status(400).json({ error: "Erro ao filtrar especialidades" });
    }
  });


  // Rotas do Blog
/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Retorna os dados do blog
 *     responses:
 *       200:
 *         description: Dados do blog retornados com sucesso
 */
app.get("/api/blog", async (req, res) => {
    try {
      const blog = await Blog.findOne();
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar dados do blog" });
    }
  });
  
  /**
   * @swagger
   * /api/blog:
   *   post:
   *     summary: Cria ou atualiza os dados do blog
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Dados do blog criados ou atualizados com sucesso
   */
  app.post("/api/blog", async (req, res) => {
    try {
      const blog = await Blog.findOneAndUpdate({}, req.body, { upsert: true, new: true });
      res.status(201).json(blog);
    } catch (error) {
      res.status(400).json({ error: "Erro ao criar ou atualizar dados do blog" });
    }
  });
  
  /**
   * @swagger
   * /api/blog/cards:
   *   post:
   *     summary: Adiciona um novo card ao blog
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       201:
   *         description: Card adicionado com sucesso
   */
  app.post("/api/blog/cards", async (req, res) => {
    try {
      const blog = await Blog.findOne();
      blog.cards.push(req.body);
      await blog.save();
      res.status(201).json(blog);
    } catch (error) {
      res.status(400).json({ error: "Erro ao adicionar card ao blog" });
    }
  });
  
  /**
   * @swagger
   * /api/blog/cards/{id}:
   *   put:
   *     summary: Atualiza um card existente do blog
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Card atualizado com sucesso
   */
  app.put("/api/blog/cards/:id", async (req, res) => {
    try {
      const blog = await Blog.findOne();
      const card = blog.cards.id(req.params.id);
      Object.assign(card, req.body);
      await blog.save();
      res.json(blog);
    } catch (error) {
      res.status(400).json({ error: "Erro ao atualizar card do blog" });
    }
  });
  
  /**
   * @swagger
   * /api/blog/cards/{id}:
   *   delete:
   *     summary: Remove um card do blog
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Card removido com sucesso
   */
  app.delete("/api/blog/cards/:id", async (req, res) => {
    try {
      const blog = await Blog.findOne();
      blog.cards.id(req.params.id).remove();
      await blog.save();
      res.json({ message: "Card removido com sucesso" });
    } catch (error) {
      res.status(400).json({ error: "Erro ao remover card do blog" });
    }
  });
  
  /**
   * @swagger
   * /api/blog/search:
   *   get:
   *     summary: Busca no blog por título, descrição ou tags
   *     parameters:
   *       - in: query
   *         name: term
   *         required: true
   *         schema:
   *           type: string
   *         description: Termo de busca
   *     responses:
   *       200:
   *         description: Resultados da busca
   */
  app.get("/api/blog/search", async (req, res) => {
    try {
      const { term } = req.query;
      const blog = await Blog.findOne();
      const results = blog.cards.filter(
        (card) =>
          card.title.toLowerCase().includes(term.toLowerCase()) ||
          card.description.toLowerCase().includes(term.toLowerCase()) ||
          card.tags.some((tag) => tag.toLowerCase().includes(term.toLowerCase()))
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Erro ao realizar busca no blog" });
    }
  });


  const { nanoid } = require("nanoid");
/**
 * @swagger
 * /api/base64:
 *   post:
 *     summary: Recebe uma string Base64 e retorna uma URL curta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64:
 *                 type: string
 *     responses:
 *       201:
 *         description: URL curta criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 */

app.post("/api/base64", async (req, res) => {
  try {
    const { base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "Base64 é obrigatório" });
    }

    const slug = nanoid(8); // Gerar um identificador único
    const newEntry = new Base64Model({ slug, data: base64 });
    await newEntry.save();

    const url = `${process.env.BASE_URL || "http://localhost:3000"}/api/base64/${slug}`;
    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar Base64" });
  }
});

/**
 * @swagger
 * /api/base64/{slug}:
 *   get:
 *     summary: Retorna a string Base64 correspondente ao slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Base64 retornado com sucesso
 *       404:
 *         description: Slug não encontrado
 */

app.get("/api/base64/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const entry = await Base64Model.findOne({ slug });
    if (!entry) {
      return res.status(404).json({ error: "Slug não encontrado" });
    }

    res.json({ base64: entry.data });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar Base64" });
  }
});


// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

