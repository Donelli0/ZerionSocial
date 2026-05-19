const UsuarioRepository = require('../repository/UsuarioRepository');
const Usuario = require('../model/Usuario');

class UsuarioService {
    async cadastrar(nome, telefone, username, email, genero, senha) {
        const usuario = new Usuario(null, nome, telefone, username, email, genero, senha);
        return await UsuarioRepository.salvar(usuario);
    }

    async login(email, senha) {
    const [usuarios] = await UsuarioRepository.buscarPorEmail(email);

    if (usuarios.length === 0) return null;

    const usuario = usuarios[0];

    if (usuario.senha !== senha) return null;

    return usuario;
    }
}

module.exports = new UsuarioService();