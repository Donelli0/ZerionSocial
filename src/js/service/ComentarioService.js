// src/js/service/ComentarioService.js
const ComentarioRepository = require('../repository/ComentarioRepository');

class ComentarioService {

    async comentar(post_id, usuario_id, conteudo) {
        return await ComentarioRepository.salvar(post_id, usuario_id, conteudo);
    }

    async listar(post_id) {
        const [comentarios] = await ComentarioRepository.buscarPorPost(post_id);
        return comentarios;
    }

    async contar(post_id) {
        const [[resultado]] = await ComentarioRepository.contar(post_id);
        return resultado.total;
    }
}

module.exports = new ComentarioService();
