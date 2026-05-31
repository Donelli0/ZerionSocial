const db = require('../../db/connection');

class MensagemRepository {

    enviar(remetente_id, destinatario_id, conteudo) {
        const sql = 'INSERT INTO mensagens (remetente_id, destinatario_id, conteudo) VALUES (?, ?, ?)';
        return db.promise().query(sql, [remetente_id, destinatario_id, conteudo]);
    }

    buscarConversa(usuario1_id, usuario2_id) {
        const sql = `
            SELECT mensagens.*, usuarios.username AS remetente_username
            FROM mensagens
            JOIN usuarios ON mensagens.remetente_id = usuarios.id
            WHERE (remetente_id = ? AND destinatario_id = ?)
               OR (remetente_id = ? AND destinatario_id = ?)
            ORDER BY criado_em ASC
        `;
        return db.promise().query(sql, [usuario1_id, usuario2_id, usuario2_id, usuario1_id]);
    }

    listarConversas(usuario_id) {
        const sql = `
            SELECT
                u.id,
                u.username,
                u.foto_perfil,
                m.conteudo AS ultima_mensagem,
                m.criado_em
            FROM mensagens m
            JOIN usuarios u ON u.id = IF(m.remetente_id = ?, m.destinatario_id, m.remetente_id)
            WHERE m.id IN (
                SELECT MAX(m2.id)
                FROM mensagens m2
                WHERE m2.remetente_id = ? OR m2.destinatario_id = ?
                GROUP BY
                    LEAST(m2.remetente_id, m2.destinatario_id),
                    GREATEST(m2.remetente_id, m2.destinatario_id)
            )
            AND (m.remetente_id = ? OR m.destinatario_id = ?)
            ORDER BY m.criado_em DESC
        `;
        return db.promise().query(sql, [usuario_id, usuario_id, usuario_id, usuario_id, usuario_id]);
    }
}

module.exports = new MensagemRepository();