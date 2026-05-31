-- ================================================
-- ZERION — rede_social.sql
-- Execute este arquivo completo no MySQL
-- ================================================

CREATE DATABASE IF NOT EXISTS rede_social;
USE rede_social;

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    telefone VARCHAR(15) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    genero VARCHAR(50),
    senha VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    foto_perfil LONGTEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    imagem LONGTEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Seguidores
CREATE TABLE IF NOT EXISTS seguidores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seguidor_id INT NOT NULL,
    seguindo_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (seguindo_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unico_seguir (seguidor_id, seguindo_id)
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unico_like (post_id, usuario_id)
);

-- Comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Bloqueios
CREATE TABLE IF NOT EXISTS bloqueios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bloqueador_id INT NOT NULL,
    bloqueado_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bloqueador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (bloqueado_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unico_bloqueio (bloqueador_id, bloqueado_id)
);

-- Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Se o banco já existia, rode estes ALTER TABLE para adicionar colunas faltando:
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil LONGTEXT;
-- ALTER TABLE posts ADD COLUMN IF NOT EXISTS imagem LONGTEXT;
-- ALTER TABLE posts CHANGE COLUMN data_post criado_em DATETIME DEFAULT CURRENT_TIMESTAMP;
