// ================================================
// SeguidorRepository.js — src/js/repository/
// ================================================
const db = require('../../db/connection');

class SeguidorRepository {

    seguir(seguidor_id, seguindo_id) {
        const sql = 'INSERT IGNORE INTO seguidores (seguidor_id, seguindo_id) VALUES (?, ?)';
        return db.promise().query(sql, [seguidor_id, seguindo_id]);
    }

    desseguir(seguidor_id, seguindo_id) {
        const sql = 'DELETE FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?';
        return db.promise().query(sql, [seguidor_id, seguindo_id]);
    }

    contar(usuario_id) {
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM seguidores WHERE seguindo_id = ?) AS seguidores,
                (SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?) AS seguindo
        `;
        return db.promise().query(sql, [usuario_id, usuario_id]);
    }

    checar(seguidor_id, seguindo_id) {
        const sql = 'SELECT id FROM seguidores WHERE seguidor_id = ? AND seguindo_id = ?';
        return db.promise().query(sql, [seguidor_id, seguindo_id]);
    }
}

module.exports = new SeguidorRepository();