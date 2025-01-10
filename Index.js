const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const nanoid  = require("nanoid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "30mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Permite até 10MB em requisições codificadas por URL

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

const FooterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true }, // Telefone fixo
  whatsapp: { type: String, required: true }, // WhatsApp
  email: { type: String, required: true },
  address: { type: String, required: true },
});

const Footer = mongoose.model("Footer", FooterSchema);




const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);


const ContactSchema = new mongoose.Schema({
  phone: { type: String, required: true }, // Telefone fixo
  whatsapp: { type: String, required: true }, // Telefone WhatsApp
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
        backgroundColor: { type: String, default: "#ffffff" }, // Cor de fundo
        iconColor: { type: String, default: "#000000" }, // Cor do ícone
        titleColor: { type: String, default: "#000000" }, // Cor do título
        descriptionColor: { type: String, default: "#000000" } // Cor da descrição
      }
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


// Funções auxiliares
function generateToken(user) {
  const SECRET = process.env.JWT_SECRET || "secret_key";
  return jwt.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: "1h" });
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  const SECRET = process.env.JWT_SECRET || "secret_key";

  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });

    try {
      // Busca apenas os campos necessários do usuário
      const user = await User.findById(decoded.id, "username").lean();
      if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

      req.user = user; // Adiciona o usuário ao objeto de requisição
      next();
    } catch (error) {
      res.status(500).json({ error: "Erro ao autenticar usuário" });
    }
  });
}


// Função para gerar IDs customizados
function generateId(length = 8) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


// Rotas

/**
 * @swagger
 * /api/footer:
 *   get:
 *     summary: Retorna as informações do footer
 *     responses:
 *       200:
 *         description: Dados do footer retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 whatsapp:
 *                   type: string
 *                 email:
 *                   type: string
 *                 address:
 *                   type: string
 */
app.get("/api/footer", async (req, res) => {
  try {
    const footer = await Footer.findOne();
    res.json(footer || { message: "Nenhuma informação encontrada para o footer" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar informações do footer" });
  }
});

/**
 * @swagger
 * /api/footer:
 *   post:
 *     summary: Cria ou atualiza as informações do footer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Footer criado ou atualizado com sucesso
 */
app.post("/api/footer", authenticateToken, async (req, res) => {
  try {
    const { title, description, phone, whatsapp, email, address } = req.body;
    const footerData = { title, description, phone, whatsapp, email, address };

    const footer = await Footer.findOneAndUpdate({}, footerData, { upsert: true, new: true });
    res.status(201).json(footer);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar ou atualizar footer" });
  }
});

/**
 * @swagger
 * /api/footer:
 *   delete:
 *     summary: Remove as informações do footer
 *     responses:
 *       200:
 *         description: Footer removido com sucesso
 *       404:
 *         description: Nenhum dado encontrado para o footer
 */
app.delete("/api/footer", authenticateToken, async (req, res) => {
  try {
    const footer = await Footer.findOneAndDelete();
    if (!footer) {
      return res.status(404).json({ message: "Nenhum dado encontrado para o footer" });
    }
    res.json({ message: "Footer removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover footer" });
  }
});


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário único
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Erro ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifica se o usuário já existe para evitar duplicatas
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Usuário já existe" });

    // Hash da senha e criação do novo usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login de usuário e retorna um token
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *       401:
 *         description: Usuário ou senha inválidos
 *       500:
 *         description: Erro ao realizar login
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Busca o usuário no banco de dados
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    // Gera o token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar login" });
  }
});









/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Rota protegida (apenas para usuários autenticados)
 *     tags:
 *       - Autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acesso autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acesso autorizado", user: req.user });
});


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
app.post("/api/contacts", authenticateToken, async (req, res) => {
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
app.put("/api/contacts/:id", authenticateToken, async (req, res) => {
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
 *     summary: Retorna o cabeçalho com as informações de contato e logo.
 *     responses:
 *       200:
 *         description: Sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logo:
 *                   type: string
 *                   description: URL do logo.
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       whatsapp:
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
    const header = await Header.findOne({}, "logo contacts").lean(); // Projeção e lean para performance
    res.json(header || { message: "Nenhuma informação encontrada no Header" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cabeçalho" });
  }
});



/**
 * @swagger
 * /api/header:
 *   put:
 *     summary: Atualiza ou cria o cabeçalho com novas informações.
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
 *                     whatsapp:
 *                       type: string
 *                     email:
 *                       type: string
 *                     social:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Cabeçalho criado ou atualizado com sucesso.
 *       400:
 *         description: Erro de validação.
 */
app.put("/api/header", authenticateToken, async (req, res) => {
  try {
    const { logo, contacts } = req.body;

    const updatedHeader = await Header.findOneAndUpdate(
      {},
      { logo, contacts },
      { upsert: true, new: true }
    );
    res.status(201).json(updatedHeader);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar ou criar cabeçalho" });
  }
});




// Rotas do Carrossel
/**
 * @swagger
 * /api/slides:
 *   get:
 *     summary: Retorna todos os slides do carrossel.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página para paginação.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de slides por página.
 *     responses:
 *       200:
 *         description: Lista de slides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slides:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 */
app.get("/api/slides", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const slides = await Slide.find({}, "title description position image")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Slide.countDocuments();
    res.json({ slides, total });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar slides" });
  }
});


/**
 * @swagger
 * /api/slides:
 *   post:
 *     summary: Adiciona um novo slide ao carrossel.
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
 *         description: Slide criado.
 */
app.post("/api/slides", authenticateToken, async (req, res) => {
  try {
    const { image, title, description, buttonText, buttonLink, position } = req.body;

    const slide = new Slide({ image, title, description, buttonText, buttonLink, position });
    await slide.save();

    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar slide" });
  }
});

  /**
 * @swagger
 * /api/slides/{id}:
 *   put:
 *     summary: Atualiza um slide existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do slide.
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
 *         description: Slide atualizado.
 */
app.put("/api/slides/:id", authenticateToken, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slide);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar slide" });
  }
});



/**
 * @swagger
 * /api/slides/{id}:
 *   delete:
 *     summary: Deleta um slide.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do slide.
 *     responses:
 *       200:
 *         description: Slide deletado.
 */
app.delete("/api/slides/:id", authenticateToken, async (req, res) => {
  try {
    await Slide.findByIdAndDelete(req.params.id);
    res.json({ message: "Slide deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar slide" });
  }
});

  
 

// Rotas de Sobre Nós


/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Retorna as informações da seção "Sobre Nós"
 *     tags:
 *       - Sobre Nós
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informações da seção "Sobre Nós" retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: "Título da seção"
 *                 highlightedName:
 *                   type: string
 *                   description: "Nome destacado na seção"
 *                 image:
 *                   type: string
 *                   description: "URL da imagem associada"
 *                 description:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "Descrição em parágrafos"
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: "Título do card"
 *                       icon:
 *                         type: string
 *                         description: "URL do ícone do card"
 *                       description:
 *                         type: string
 *                         description: "Descrição do card"
 *                       backgroundColor:
 *                         type: string
 *                         description: "Cor de fundo do card (exemplo: #ffffff)"
 *                       iconColor:
 *                         type: string
 *                         description: "Cor do ícone (exemplo: #000000)"
 *                       titleColor:
 *                         type: string
 *                         description: "Cor do título (exemplo: #0000ff)"
 *                       descriptionColor:
 *                         type: string
 *                         description: "Cor da descrição (exemplo: #666666)"
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
 *     tags:
 *       - Sobre Nós
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: "Título da seção"
 *               highlightedName:
 *                 type: string
 *                 description: "Nome destacado na seção"
 *               image:
 *                 type: string
 *                 description: "URL da imagem associada"
 *               description:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Descrição em parágrafos"
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: "Título do card"
 *                     icon:
 *                       type: string
 *                       description: "URL do ícone do card"
 *                     description:
 *                       type: string
 *                       description: "Descrição do card"
 *                     backgroundColor:
 *                       type: string
 *                       description: "Cor de fundo do card (exemplo: #ffffff)"
 *                     iconColor:
 *                       type: string
 *                       description: "Cor do ícone (exemplo: #000000)"
 *                     titleColor:
 *                       type: string
 *                       description: "Cor do título (exemplo: #0000ff)"
 *                     descriptionColor:
 *                       type: string
 *                       description: "Cor da descrição (exemplo: #666666)"
 *     responses:
 *       201:
 *         description: Informações da seção "Sobre Nós" criadas ou atualizadas com sucesso
 *       400:
 *         description: Erro na validação dos dados enviados
 *       401:
 *         description: Não autorizado - Token ausente ou inválido
 *       500:
 *         description: Erro interno ao criar ou atualizar informações
 */


app.post("/api/about", authenticateToken, async (req, res) => {
    try {
      const aboutData = {
        title: req.body.title,
        highlightedName: req.body.highlightedName,
        image: req.body.image,
        description: req.body.description,
        cards: req.body.cards.map((card) => ({
          title: card.title,
          icon: card.icon,
          description: card.description,
          backgroundColor: card.backgroundColor || "#ffffff",
          iconColor: card.iconColor || "#000000",
          titleColor: card.titleColor || "#000000",
          descriptionColor: card.descriptionColor || "#000000",
        })),
      };
  
      const about = await About.findOneAndUpdate({}, aboutData, {
        upsert: true,
        new: true,
      });
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
  app.post("/api/specialties", authenticateToken, async (req, res) => {
    try {
      console.log(req.body)
      const { name, description, icon } = req.body;
  
      if (!icon.startsWith("data:image")) {
        return res.status(400).json({ error: "O campo 'icon' deve estar no formato Base64" });
      }
  
      const specialty = new Specialty({ name, description, icon });
      console.log("Especialidade criada (antes de salvar):", specialty);

      await specialty.save();
  
      res.status(201).json(specialty);
    } catch (error) {
      console.error("Erro ao criar especialidade:", error);
      res.status(500).json({ error: "Erro ao criar especialidade" });
    }
  });
  
  
  /**
   * @swagger
   * /api/specialties/{id}:
   *   put:
   *     summary: Atualiza uma especialidade existente
   */
  app.put("/api/specialties/:id", authenticateToken, async (req, res) => {
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
  app.delete("/api/specialties/:id", authenticateToken, async (req, res) => {
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
app.get("/api/blog",  async (req, res) => {
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
  app.post("/api/blog", authenticateToken, async (req, res) => {
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
  app.post("/api/blog/cards", authenticateToken, async (req, res) => {
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
  app.put("/api/blog/cards/:id", authenticateToken, async (req, res) => {
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
  app.delete("/api/blog/cards/:id", authenticateToken, async (req, res) => {
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

app.post("/api/base64", authenticateToken, async (req, res) => {
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

    // Defina o tipo de dado (exemplo: PNG)
    const mimeType = "image/png"; // Ajuste para o tipo correto
    const base64Data = entry.data.replace(/^data:image\/\w+;base64,/, "");

    // Envie a imagem como resposta
    const buffer = Buffer.from(base64Data, "base64");
    res.setHeader("Content-Type", mimeType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar Base64" });
  }
});


// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));




// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const swaggerJsDoc = require("swagger-jsdoc");
// const nanoid = require("nanoid");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const redis = require("redis"); // Para caching
// const { promisify } = require("util");

// require("dotenv").config();

// const app = express();

// // Configuração do Redis
// const redisClient = redis.createClient();
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const setAsync = promisify(redisClient.set).bind(redisClient);

// redisClient.on("error", (err) => {
//   console.error("Erro no Redis:", err);
// });

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: "30mb" })); 
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

// // Swagger Configuration
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
//       {
//         url: "https://api-nutricare-1.onrender.com",
//         description: "Servidor de produção",
//       },
//     ],
//   },
//   apis: ["./index.js"],
// };

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // Conexão ao MongoDB
// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));



//   // Função para autenticação via JWT
// function authenticateToken(req, res, next) {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Token não fornecido" });

//   const SECRET = process.env.JWT_SECRET || "secret_key";
//   jwt.verify(token, SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: "Token inválido" });
//     req.user = user;
//     next();
//   });
// }

// // Schemas
// const FooterSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   phone: { type: String, required: true },
//   whatsapp: { type: String, required: true },
//   email: { type: String, required: true },
//   address: { type: String, required: true },
// });

// FooterSchema.index({ title: 1 }); // Índice para melhorar buscas
// const Footer = mongoose.model("Footer", FooterSchema);


// const SlideSchema = new mongoose.Schema({
//   image: { type: String, required: true },
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   buttonText: { type: String, required: true },
//   buttonLink: { type: String, required: true },
//   position: { type: String, enum: ["left", "center", "right"], default: "center" },
// }, { timestamps: true }); // Inclui campos de criação e atualização automática

// SlideSchema.index({ title: 1 }); // Índice para melhorar buscas
// const Slide = mongoose.model("Slide", SlideSchema);

// const UserSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true, unique: true, index: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true } // Inclui createdAt e updatedAt
// );


// const BlogSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     cards: [
//       {
//         tags: [String],
//         image: { type: String, required: true },
//         title: { type: String, required: true },
//         description: { type: String, required: true },
//       },
//     ],
//   },
//   { timestamps: true } // Adiciona createdAt e updatedAt
// );

// const Blog = mongoose.model("Blog", BlogSchema);

// // Middleware para hashing de senha antes de salvar
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// const User = mongoose.model("User", UserSchema);



// // Middleware de caching
// async function cacheMiddleware(req, res, next) {
//   const cacheKey = req.originalUrl;
//   const cachedData = await getAsync(cacheKey);

//   if (cachedData) {
//     return res.json(JSON.parse(cachedData));
//   }

//   res.sendResponse = res.json;
//   res.json = async (body) => {
//     await setAsync(cacheKey, JSON.stringify(body), "EX", 3600); // Expira em 1 hora
//     res.sendResponse(body);
//   };

//   next();
// }

// // Rotas
// /**
//  * @swagger
//  * /api/footer:
//  *   get:
//  *     summary: Retorna as informações do footer
//  */
// app.get("/api/footer", cacheMiddleware, async (req, res) => {
//   try {
//     const footer = await Footer.findOne().lean(); // Uso de lean para melhorar desempenho
//     res.json(footer || { message: "Nenhuma informação encontrada para o footer" });
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao buscar informações do footer" });
//   }
// });

// /**
//  * @swagger
//  * /api/footer:
//  *   post:
//  *     summary: Cria ou atualiza as informações do footer
//  */
// app.post("/api/footer", async (req, res) => {
//   try {
//     const { title, description, phone, whatsapp, email, address } = req.body;
//     const footerData = { title, description, phone, whatsapp, email, address };

//     const footer = await Footer.findOneAndUpdate({}, footerData, { upsert: true, new: true });
//     redisClient.del("/api/footer"); // Invalida o cache
//     res.status(201).json(footer);
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao criar ou atualizar footer" });
//   }
// });

// /**
//  * @swagger
//  * /api/slides:
//  *   get:
//  *     summary: Retorna todos os slides do carrossel
//  *     responses:
//  *       200:
//  *         description: Lista de slides retornada com sucesso
//  */
// app.get("/api/slides", cacheMiddleware, async (req, res) => {
//   try {
//     const slides = await Slide.find().lean(); // Uso de lean para performance
//     res.status(200).json(slides);
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao buscar slides" });
//   }
// });


// /**
//  * @swagger
//  * /api/slides:
//  *   post:
//  *     summary: Adiciona um novo slide ao carrossel
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               image:
//  *                 type: string
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               buttonText:
//  *                 type: string
//  *               buttonLink:
//  *                 type: string
//  *               position:
//  *                 type: string
//  *                 enum: [left, center, right]
//  *     responses:
//  *       201:
//  *         description: Slide criado com sucesso
//  */
// app.post("/api/slides", authenticateToken, async (req, res) => {
//   try {
//     const { image, title, description, buttonText, buttonLink, position } = req.body;
//     const slide = new Slide({ image, title, description, buttonText, buttonLink, position });
//     await slide.save();
//     redisClient.del("/api/slides"); // Invalida o cache
//     res.status(201).json(slide);
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao criar slide" });
//   }
// });


// /**
//  * @swagger
//  * /api/slides/{id}:
//  *   put:
//  *     summary: Atualiza um slide existente
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID do slide
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               image:
//  *                 type: string
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               buttonText:
//  *                 type: string
//  *               buttonLink:
//  *                 type: string
//  *               position:
//  *                 type: string
//  *                 enum: [left, center, right]
//  *     responses:
//  *       200:
//  *         description: Slide atualizado com sucesso
//  */
// app.put("/api/slides/:id", authenticateToken, async (req, res) => {
//   try {
//     const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     redisClient.del("/api/slides"); // Invalida o cache
//     res.json(slide);
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao atualizar slide" });
//   }
// });



// /**
//  * @swagger
//  * /api/slides/{id}:
//  *   delete:
//  *     summary: Deleta um slide
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID do slide
//  *     responses:
//  *       200:
//  *         description: Slide deletado com sucesso
//  */
// app.delete("/api/slides/:id", authenticateToken, async (req, res) => {
//   try {
//     await Slide.findByIdAndDelete(req.params.id);
//     redisClient.del("/api/slides"); // Invalida o cache
//     res.json({ message: "Slide deletado com sucesso" });
//   } catch (error) {
//     res.status(404).json({ error: "Slide não encontrado" });
//   }
// });


// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Registra um novo usuário
//  *     tags:
//  *       - Autenticação
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *                 description: Nome de usuário único
//  *               password:
//  *                 type: string
//  *                 description: Senha do usuário
//  *     responses:
//  *       201:
//  *         description: Usuário registrado com sucesso
//  *       400:
//  *         description: Erro ao registrar usuário
//  */
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Verifica se o usuário já existe
//     const existingUser = await User.findOne({ username });
//     if (existingUser) return res.status(400).json({ error: "Usuário já existe" });

//     const newUser = new User({ username, password });
//     await newUser.save();

//     res.status(201).json({ message: "Usuário registrado com sucesso" });
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao registrar usuário" });
//   }
// });


// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Realiza login de usuário e retorna um token
//  *     tags:
//  *       - Autenticação
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *                 description: Nome de usuário
//  *               password:
//  *                 type: string
//  *                 description: Senha do usuário
//  *     responses:
//  *       200:
//  *         description: Login realizado com sucesso
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 token:
//  *                   type: string
//  *                   description: Token JWT para autenticação
//  *       401:
//  *         description: Usuário ou senha inválidos
//  */
// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos" });

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ error: "Usuário ou senha inválidos" });

//     const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao realizar login" });
//   }
// });

// /**
//  * @swagger
//  * /api/auth/me:
//  *   get:
//  *     summary: Retorna os dados do usuário autenticado
//  *     tags:
//  *       - Autenticação
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Dados do usuário autenticado retornados com sucesso
//  *       401:
//  *         description: Token inválido ou ausente
//  */
// app.get("/api/auth/me", authenticateToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password"); // Exclui a senha
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao buscar informações do usuário" });
//   }
// });

// /**
//  * @swagger
//  * /api/auth/update:
//  *   put:
//  *     summary: Atualiza os dados do usuário autenticado
//  *     tags:
//  *       - Autenticação
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Dados do usuário atualizados com sucesso
//  */
// app.put("/api/auth/update", authenticateToken, async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     const updatedData = {};
//     if (username) updatedData.username = username;
//     if (password) updatedData.password = await bcrypt.hash(password, 10);

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
//     res.json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao atualizar dados do usuário" });
//   }
// });


// /**
//  * @swagger
//  * /api/auth/delete:
//  *   delete:
//  *     summary: Deleta o usuário autenticado
//  *     tags:
//  *       - Autenticação
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Usuário deletado com sucesso
//  */
// app.delete("/api/auth/delete", authenticateToken, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);
//     res.json({ message: "Usuário deletado com sucesso" });
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao deletar usuário" });
//   }
// });


// /**
//  * @swagger
//  * /api/blog:
//  *   get:
//  *     summary: Retorna os dados do blog
//  *     tags:
//  *       - Blog
//  *     responses:
//  *       200:
//  *         description: Dados do blog retornados com sucesso
//  */
// app.get("/api/blog", cacheMiddleware, async (req, res) => {
//   try {
//     const blog = await Blog.findOne().lean(); // Uso de lean para melhor desempenho
//     res.json(blog || { message: "Nenhum dado encontrado para o blog" });
//   } catch (error) {
//     res.status(500).json({ error: "Erro ao buscar dados do blog" });
//   }
// });

// /**
//  * @swagger
//  * /api/blog:
//  *   post:
//  *     summary: Cria ou atualiza os dados do blog
//  *     tags:
//  *       - Blog
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               cards:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     tags:
//  *                       type: array
//  *                       items:
//  *                         type: string
//  *                     image:
//  *                       type: string
//  *                     title:
//  *                       type: string
//  *                     description:
//  *                       type: string
//  *     responses:
//  *       201:
//  *         description: Blog criado ou atualizado com sucesso
//  */
// app.post("/api/blog", authenticateToken, async (req, res) => {
//   try {
//     const { title, description, cards } = req.body;
//     const blogData = { title, description, cards };

//     const blog = await Blog.findOneAndUpdate({}, blogData, {
//       upsert: true,
//       new: true,
//     });
//     redisClient.del("/api/blog"); // Invalida o cache
//     res.status(201).json(blog);
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao criar ou atualizar dados do blog" });
//   }
// });


// /**
//  * @swagger
//  * /api/blog/cards/{id}:
//  *   put:
//  *     summary: Atualiza um card existente do blog
//  *     tags:
//  *       - Blog
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               tags:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *               image:
//  *                 type: string
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Card atualizado com sucesso
//  */
// app.put("/api/blog/cards/:id", authenticateToken, async (req, res) => {
//   try {
//     const blog = await Blog.findOne();
//     const card = blog.cards.id(req.params.id);
//     if (!card) return res.status(404).json({ error: "Card não encontrado" });

//     Object.assign(card, req.body);
//     await blog.save();
//     redisClient.del("/api/blog"); // Invalida o cache
//     res.json(blog);
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao atualizar card do blog" });
//   }
// });

// /**
//  * @swagger
//  * /api/blog/cards/{id}:
//  *   delete:
//  *     summary: Remove um card do blog
//  *     tags:
//  *       - Blog
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Card removido com sucesso
//  */
// app.delete("/api/blog/cards/:id", authenticateToken, async (req, res) => {
//   try {
//     const blog = await Blog.findOne();
//     const card = blog.cards.id(req.params.id);
//     if (!card) return res.status(404).json({ error: "Card não encontrado" });

//     card.remove();
//     await blog.save();
//     redisClient.del("/api/blog"); // Invalida o cache
//     res.json({ message: "Card removido com sucesso" });
//   } catch (error) {
//     res.status(400).json({ error: "Erro ao remover card do blog" });
//   }
// });



// // Porta
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
