const express = require('express');
const cors = require('cors');

const UsuarioController = require('./src/js/controller/UsuarioController');


const app = express();

app.use(cors());
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static('public'));

// ROTAS DO BACKEND
app.post('/usuarios/cadastro', (req, res) => UsuarioController.cadastrar(req, res));
app.post('/usuarios/login', (req, res) => UsuarioController.login(req, res));

app.listen(3000, () => console.log('Rodando em http://localhost:3000'));