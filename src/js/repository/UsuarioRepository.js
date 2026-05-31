const db = require('../../db/connection');

class UsuarioRepository {

    salvar(usuario) {
        const sql = 'INSERT INTO usuarios (nome, telefone, username, email, genero, senha) VALUES (?, ?, ?, ?, ?, ?)';
        return db.promise().query(sql, [usuario.nome, usuario.telefone, usuario.username, usuario.email, usuario.genero, usuario.senha]);
    }

    buscarPorEmail(email) {
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        return db.promise().query(sql, [email]);
    }

    buscarPorUsername(termo) {
    // remove o @ se o usuário digitar, para buscar do jeito certo
    const termoLimpo = termo.replace('@', '');
    const sql = 'SELECT id, nome, username, foto_perfil FROM usuarios WHERE username LIKE ?';
    return db.promise().query(sql, [`%${termoLimpo}%`]);
}

    buscarPorId(id) {
        const sql = 'SELECT id, nome, username, foto_perfil, criado_em FROM usuarios WHERE id = ?';
        return db.promise().query(sql, [id]);
    }

    atualizarFoto(id, foto) {
        const sql = 'UPDATE usuarios SET foto_perfil = ? WHERE id = ?';
        return db.promise().query(sql, [foto, id]);
    }
}

module.exports = new UsuarioRepository();
