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

// // Models (Exemplo de Professional e Recipe)
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

// // Outras rotas da API podem ser adicionadas aqui...

// // Porta dinâmica
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Models
const Professional = mongoose.model('Professional', new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  contact: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}));

const Recipe = mongoose.model('Recipe', new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}));

const Header = mongoose.model('Header', new mongoose.Schema({
  logo: { type: String, required: true }, // URL da imagem da logo
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, required: true },
  socialLinks: { type: [String], required: true }, // Lista de links para redes sociais
  createdAt: { type: Date, default: Date.now },
}));

// Rotas da API
app.get('/api/professionals', async (req, res) => {
  const professionals = await Professional.find();
  res.json(professionals);
});

app.post('/api/professionals', async (req, res) => {
  const professional = new Professional(req.body);
  await professional.save();
  res.status(201).json(professional);
});

app.get('/api/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

app.post('/api/recipes', async (req, res) => {
  const recipe = new Recipe(req.body);
  await recipe.save();
  res.status(201).json(recipe);
});

// Rotas para o header
app.get('/api/header', async (req, res) => {
  const header = await Header.findOne();
  res.json(header);
});

app.post('/api/header', async (req, res) => {
  const header = new Header(req.body);
  await header.save();
  res.status(201).json(header);
});

app.put('/api/header/:id', async (req, res) => {
  const header = await Header.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(header);
});

app.delete('/api/header/:id', async (req, res) => {
  await Header.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Documentação da API na rota raiz
app.get('/', (req, res) => {
  res.send(`
    <h1>NutriCare API</h1>
    <p>Bem-vindo à documentação da API NutriCare. Aqui estão os endpoints disponíveis:</p>
    <ul>
      <li><strong>GET /api/professionals</strong>: Retorna todos os profissionais cadastrados.</li>
      <li><strong>POST /api/professionals</strong>: Cadastra um novo profissional.</li>
      <li><strong>GET /api/recipes</strong>: Retorna todas as receitas cadastradas.</li>
      <li><strong>POST /api/recipes</strong>: Cadastra uma nova receita.</li>
      <li><strong>GET /api/header</strong>: Retorna as informações do header.</li>
      <li><strong>POST /api/header</strong>: Cadastra as informações do header.</li>
      <li><strong>PUT /api/header/:id</strong>: Atualiza as informações do header.</li>
      <li><strong>DELETE /api/header/:id</strong>: Exclui as informações do header.</li>
    </ul>
  `);
});

// Porta dinâmica
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
