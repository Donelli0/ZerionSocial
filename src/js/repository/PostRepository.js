// src/js/repository/PostRepository.js

const db = require('../../db/connection');

class PostRepository {

    salvar(post) {
        const sql = 'INSERT INTO posts (usuario_id, conteudo, imagem) VALUES (?, ?, ?)';
        return db.promise().query(sql, [post.usuario_id, post.conteudo, post.imagem]);
    }

    deletar(post_id, usuario_id) {
        const sql = 'DELETE FROM posts WHERE id = ? AND usuario_id = ?';
        return db.promise().query(sql, [post_id, usuario_id]);
    }

    buscarTodos(usuario_id) {
        const uid = usuario_id || 0;
        const sql = `
            SELECT
                posts.id,
                posts.usuario_id,
                posts.conteudo,
                posts.imagem,
                posts.criado_em,
                usuarios.username,
                usuarios.foto_perfil,
                usuarios.verificado,
                NULL AS repostado_por,
                NULL AS repostado_por_id,
                posts.criado_em AS ordem_tempo,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id) AS total_likes,
                (SELECT COUNT(*) FROM comentarios WHERE comentarios.post_id = posts.id) AS total_comentarios,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id) AS total_reposts,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id AND likes.usuario_id   = ?) AS ja_curtiu,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id AND reposts.usuario_id = ?) AS ja_repostou
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id

            UNION ALL

            SELECT
                posts.id,
                posts.usuario_id,
                posts.conteudo,
                posts.imagem,
                posts.criado_em,
                usuarios.username,
                usuarios.foto_perfil,
                usuarios.verificado,
                repostador.username AS repostado_por,
                reposts.usuario_id  AS repostado_por_id,
                reposts.criado_em   AS ordem_tempo,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id) AS total_likes,
                (SELECT COUNT(*) FROM comentarios WHERE comentarios.post_id = posts.id) AS total_comentarios,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id) AS total_reposts,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id AND likes.usuario_id   = ?) AS ja_curtiu,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id AND reposts.usuario_id = ?) AS ja_repostou
            FROM reposts
            JOIN posts    ON reposts.post_id     = posts.id
            JOIN usuarios ON posts.usuario_id    = usuarios.id
            JOIN usuarios AS repostador ON reposts.usuario_id = repostador.id

            ORDER BY ordem_tempo DESC
        `;
        return db.promise().query(sql, [uid, uid, uid, uid]);
    }

    buscarPorUsuario(usuario_id, viewer_id) {
        const uid = viewer_id || 0;
        const sql = `
            SELECT
                posts.id,
                posts.usuario_id,
                posts.conteudo,
                posts.imagem,
                posts.criado_em,
                usuarios.username,
                usuarios.foto_perfil,
                usuarios.verificado,
                NULL AS repostado_por,
                NULL AS repostado_por_id,
                posts.criado_em AS ordem_tempo,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id) AS total_likes,
                (SELECT COUNT(*) FROM comentarios WHERE comentarios.post_id = posts.id) AS total_comentarios,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id) AS total_reposts,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id AND likes.usuario_id   = ?) AS ja_curtiu,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id AND reposts.usuario_id = ?) AS ja_repostou
            FROM posts
            JOIN usuarios ON posts.usuario_id = usuarios.id
            WHERE posts.usuario_id = ?

            UNION ALL

            SELECT
                posts.id,
                posts.usuario_id,
                posts.conteudo,
                posts.imagem,
                posts.criado_em,
                usuarios.username,
                usuarios.foto_perfil,
                usuarios.verificado,
                repostador.username AS repostado_por,
                reposts.usuario_id  AS repostado_por_id,
                reposts.criado_em   AS ordem_tempo,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id) AS total_likes,
                (SELECT COUNT(*) FROM comentarios WHERE comentarios.post_id = posts.id) AS total_comentarios,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id) AS total_reposts,
                (SELECT COUNT(*) FROM likes       WHERE likes.post_id       = posts.id AND likes.usuario_id   = ?) AS ja_curtiu,
                (SELECT COUNT(*) FROM reposts     WHERE reposts.post_id     = posts.id AND reposts.usuario_id = ?) AS ja_repostou
            FROM reposts
            JOIN posts    ON reposts.post_id      = posts.id
            JOIN usuarios ON posts.usuario_id     = usuarios.id
            JOIN usuarios AS repostador ON reposts.usuario_id = repostador.id
            WHERE reposts.usuario_id = ?

            ORDER BY ordem_tempo DESC
        `;
        return db.promise().query(sql, [uid, uid, usuario_id, uid, uid, usuario_id]);
    }
}

module.exports = new PostRepository();