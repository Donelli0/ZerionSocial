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

    async buscar(termo) {
        const [usuarios] = await UsuarioRepository.buscarPorUsername(termo);
        return usuarios;
    }

    async buscarPorId(id) {
        const [usuarios] = await UsuarioRepository.buscarPorId(id);
        return usuarios[0] || null;
    }

    async atualizarFoto(id, foto) {
        return await UsuarioRepository.atualizarFoto(id, foto);
    }
}

module.exports = new UsuarioService();
