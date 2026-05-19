const UsuarioService = require('../service/UsuarioService');

class UsuarioController {

    async cadastrar(req, res) {
        const { nome, telefone, username, email, genero, senha } = req.body;
        await UsuarioService.cadastrar(nome, telefone, username, email, genero, senha);
        res.json({ msg: 'Cadastrado com sucesso' });
    }

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            const usuario = await UsuarioService.login(email, senha);

            if (!usuario) {
                return res.status(401).json({ msg: 'Email ou senha inválidos' });
            }

            res.json(usuario);

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro no servidor' });
        }
    }
}

module.exports = new UsuarioController();