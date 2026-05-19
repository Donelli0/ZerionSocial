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
}

module.exports = new UsuarioRepository();