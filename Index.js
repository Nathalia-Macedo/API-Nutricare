// // index.js
// const express = require('express');
// const mongoose = require('mongoose');
// const { PrismaClient } = require('@prisma/client');
// const cors = require('cors');

// const app = express();
// const prisma = new PrismaClient();



// const path = require('path');

// // Servir arquivos estáticos do React
// app.use(express.static(path.join(__dirname, '../build')));

// // Rota padrão para o React
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../build', 'index.html'));
// });


// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })

// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

// // Models
// const Professional = mongoose.model('Professional', new mongoose.Schema({
//     name: { type: String, required: true },
//     specialty: { type: String, required: true },
//     contact: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
// }));

// const Recipe = mongoose.model('Recipe', new mongoose.Schema({
//     title: { type: String, required: true },
//     ingredients: { type: [String], required: true },
//     instructions: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
// }));

// // Routes
// // Professionals CRUD
// app.get('/professionals', async (req, res) => {
//     const professionals = await Professional.find();
//     res.json(professionals);
// });

// app.post('/professionals', async (req, res) => {
//     const professional = new Professional(req.body);
//     await professional.save();
//     res.status(201).json(professional);
// });

// app.put('/professionals/:id', async (req, res) => {
//     const professional = await Professional.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(professional);
// });

// app.delete('/professionals/:id', async (req, res) => {
//     await Professional.findByIdAndDelete(req.params.id);
//     res.status(204).end();
// });

// // Recipes CRUD
// app.get('/recipes', async (req, res) => {
//     const recipes = await Recipe.find();
//     res.json(recipes);
// });

// app.post('/recipes', async (req, res) => {
//     const recipe = new Recipe(req.body);
//     await recipe.save();
//     res.status(201).json(recipe);
// });

// app.put('/recipes/:id', async (req, res) => {
//     const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(recipe);
// });

// app.delete('/recipes/:id', async (req, res) => {
//     await Recipe.findByIdAndDelete(req.params.id);
//     res.status(204).end();
// });

// // Prisma example route (for demonstration)
// app.get('/prisma-test', async (req, res) => {
//     const data = await prisma.example.findMany();
//     res.json(data);
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
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

// Models (Exemplo de Professional e Recipe)
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

// Outras rotas da API podem ser adicionadas aqui...

// **Certifique-se de que as rotas da API vêm antes de servir os arquivos estáticos**

// Servir arquivos estáticos do React
app.use(express.static(path.join(__dirname, '../build')));

// Qualquer rota não definida retorna o React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Porta dinâmica
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
