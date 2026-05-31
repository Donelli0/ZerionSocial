// ================================================
// LikeController.js — src/js/controller/
// ================================================
const LikeServiceInstance = require('../service/LikeService');

class LikeController {

    async curtir(req, res) {
        try {
            const { post_id, usuario_id } = req.body;
            await LikeServiceInstance.curtir(post_id, usuario_id);
            const total = await LikeServiceInstance.contar(post_id);
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
