const LikeServiceInstance      = require('../service/LikeService');
const NotificacaoService       = require('../service/NotificacaoService');

class LikeController {

    async curtir(req, res) {
        try {
            const { post_id, usuario_id } = req.body;
            await LikeServiceInstance.curtir(post_id, usuario_id);
            const total = await LikeServiceInstance.contar(post_id);

            // Notifica o dono do post
            const dono = await NotificacaoService.buscarDonoDoPosto(post_id);
            if (dono) await NotificacaoService.criar(dono, usuario_id, 'like', post_id);

            res.json({ total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao curtir' });
        }
    }

    async descurtir(req, res) {
        try {
            const { post_id, usuario_id } = req.body;
            await LikeServiceInstance.descurtir(post_id, usuario_id);
            const total = await LikeServiceInstance.contar(post_id);

            // Remove a notificação de like
            const dono = await NotificacaoService.buscarDonoDoPosto(post_id);
            if (dono) await NotificacaoService.deletar(dono, usuario_id, 'like', post_id);

            res.json({ total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao descurtir' });
        }
    }

    async contar(req, res) {
        try {
            const { post_id } = req.params;
            const total = await LikeServiceInstance.contar(post_id);
            res.json({ total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao contar likes' });
        }
    }
}

module.exports = new LikeController();