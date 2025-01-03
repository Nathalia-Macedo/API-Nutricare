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
  console.log("Token recebido:", token);
  console.error("Erro ao verificar o token:", err); // Log do erro



  const SECRET = process.env.JWT_SECRET || "secret_key";
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
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


// Rotas de Autenticação
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
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao registrar usuário" });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Erro ao realizar login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Usuário ou senha inválidos" });

    const token = generateToken(user);
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

/* @swagger
*   /api/header:
*     put:
*       summary: Atualiza ou cria o cabeçalho com novas informações
*       requestBody:
*         required: true
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 logo:
*                   type: string
*                   description: URL do logo
*                 contacts:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       phone:
*                         type: string
*                         description: Telefone fixo
*                       whatsapp:
*                         type: string
*                         description: Telefone WhatsApp
*                       email:
*                         type: string
*                         description: Endereço de e-mail
*                       social:
*                         type: array
*                         items:
*                           type: string
*                           description: Links para redes sociais
*       responses:
*         200:
*           description: Cabeçalho atualizado ou criado com sucesso
*           content:
*             application/json:
*               schema:
*                 type: object
*                 properties:
*                   logo:
*                     type: string
*                   contacts:
*                     type: array
*                     items:
*                       type: object
*                       properties:
*                         phone:
*                           type: string
*                         whatsapp:
*                           type: string
*                         email:
*                           type: string
*                         social:
*                           type: array
*                           items:
*                             type: string
*         400:
*          description: Erro de validação
*/

app.put("/api/header", authenticateToken, async (req, res) => {
  try {
    const header = await Header.findOneAndUpdate(
      {},
      {
        $set: {
          logo: req.body.logo,
          contacts: req.body.contacts.map((contact) => ({
            phone: contact.phone,
            whatsapp: contact.whatsapp,
            email: contact.email,
            social: contact.social,
          })),
        },
      },
      {
        new: true, // Retorna o documento atualizado
        upsert: true, // Cria um novo documento caso não exista
      }
    );
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

    // Atualiza cada slide para substituir o Base64 pela URL curta
    const updatedSlides = await Promise.all(
      slides.map(async (slide) => {
        if (typeof slide.image === "string" && slide.image.startsWith("data:image")) {
          // Verifica se já existe uma entrada correspondente no Base64Model
          let existingEntry = await Base64Model.findOne({ data: slide.image });
          if (!existingEntry) {
            // Cria uma nova entrada no Base64Model
            const slug = generateId(8); // Gera um ID customizado
            existingEntry = new Base64Model({ slug, data: slide.image });
            await existingEntry.save();
          }

          // Atualiza o campo image com a URL curta
          slide.image = `${process.env.BASE_URL || "http://localhost:3000"}/api/base64/${existingEntry.slug}`;
        }
        return slide;
      })
    );

    res.status(200).json(updatedSlides);
  } catch (error) {
    console.error("Erro ao buscar slides:", error);
    res.status(400).json({ error: "Erro ao buscar slides" });
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
  // Rota POST /api/slides
app.post("/api/slides", authenticateToken, async (req, res) => {
  try {
    const { image, title, description, buttonText, buttonLink, position } = req.body;

    let imageUrl = image;

    if (image.startsWith("data:image")) {
      const slug = generateId(8); // Gera um ID customizado
      const base64Entry = new Base64Model({ slug, data: image });
      await base64Entry.save();
      imageUrl = `${process.env.BASE_URL || "http://localhost:3000"}/api/base64/${slug}`;
    }

    const slide = new Slide({ image: imageUrl, title, description, buttonText, buttonLink, position });
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
  app.put("/api/slides/:id", authenticateToken, async (req, res) => {
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
  app.delete("/api/slides/:id",authenticateToken, async (req, res) => {
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




