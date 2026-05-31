const SeguidorRepository = require('../repository/SeguidorRepository');

class SeguidorService {

    async seguir(seguidor_id, seguindo_id) {
        return await SeguidorRepository.seguir(seguidor_id, seguindo_id);
    }

    async desseguir(seguidor_id, seguindo_id) {
        return await SeguidorRepository.desseguir(seguidor_id, seguindo_id);
    }

    async contar(usuario_id) {
        const [rows] = await SeguidorRepository.contar(usuario_id);
        return rows[0]; // retorna { seguidores: X, seguindo: Y }
    }

    async checar(seguidor_id, seguindo_id) {
        const [rows] = await SeguidorRepository.checar(seguidor_id, seguindo_id);
        return rows.length > 0;
    }
}

module.exports = new SeguidorService();