const ComentarioService  = require('../service/ComentarioService');
const NotificacaoServiceC = require('../service/NotificacaoService');

class ComentarioController {

    async comentar(req, res) {
        try {
            const { post_id, usuario_id, conteudo } = req.body;
            if (!conteudo?.trim()) return res.status(400).json({ msg: 'Comentário vazio' });
            await ComentarioService.comentar(post_id, usuario_id, conteudo);
            const total = await ComentarioService.contar(post_id);

            // Notifica o dono do post
            const dono = await NotificacaoServiceC.buscarDonoDoPosto(post_id);
            if (dono) await NotificacaoServiceC.criar(dono, usuario_id, 'comentario', post_id);

            res.json({ total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao comentar' });
        }
    }

    async listar(req, res) {
        try {
            const { post_id } = req.params;
            const comentarios = await ComentarioService.listar(post_id);
            res.json(comentarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao listar comentários' });
        }
    }
}

module.exports = new ComentarioController();