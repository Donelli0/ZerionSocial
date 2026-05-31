// ================================================
// RepostController.js — src/js/controller/
// ================================================
const RepostServiceInstance = require('../service/RepostService');

class RepostController {

    async repostar(req, res) {
        try {
            const { post_id, usuario_id } = req.body;
            await RepostServiceInstance.repostar(post_id, usuario_id);
            const total = await RepostServiceInstance.contar(post_id);
            res.json({ total, repostado: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao repostar' });
        }
    }

    async desfazer(req, res) {
        try {
            const { post_id, usuario_id } = req.body;
            await RepostServiceInstance.desfazer(post_id, usuario_id);
            const total = await RepostServiceInstance.contar(post_id);
            res.json({ total, repostado: false });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Erro ao desfazer repost' });
        }
    }
}

module.exports = new RepostController();
