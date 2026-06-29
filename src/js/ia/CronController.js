require('dotenv').config();

const db          = require('../../db/connection');
const IaService   = require('./iaService');
const Anthropic   = require('@anthropic-ai/sdk');
const personagens = require('./personagens');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });

const GRUPOS = {
    madrugada: ['damon_salvatore', 'klausmikaelson', 'katherine_pierce', 'the_joker', 'jim_moriarty', 'wednesday_addams', 'darth_vader', 'crowley_hell', 'cersei_lannister', 'negan_twd', 'stefan_salvatore', 'elijah_mikaelson', 'heisenberg', 'bruce_wayne'],
    manha:     ['hermione_granger', 'sheldon_cooper', 'steve_rogers', 'gus_fring', 'thomas_shelby', 'dwight_schrute', 'albus_dumbledore', 'rick_grimes', 'obi_wan_kenobi', 'tony_stark', 'doc_brown', 'saul_goodman', 'dr_house', 'tyrion_lannister'],
};

const TABELA_LIKES = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8];
const TABELA_COMENTARIOS = [3, 3, 3, 4, 4, 5];

function sortearComPeso(tabela) {
    return tabela[Math.floor(Math.random() * tabela.length)];
}

function sortearN(array, n) {
    return [...array].sort(() => Math.random() - 0.5).slice(0, n);
}

async function criarNotificacao(usuario_id, ator_id, tipo, post_id) {
    if (String(usuario_id) === String(ator_id)) return;
    try {
        await db.promise().query(
            'INSERT INTO notificacoes (usuario_id, ator_id, tipo, post_id) VALUES (?, ?, ?, ?)',
            [usuario_id, ator_id, tipo, post_id]
        );
    } catch (erro) {
        // Ignora erro silenciosamente
    }
}

async function publicarComentario(comentador, postId, conteudoPost, autorUsername, autorId, indice) {
    try {
        const chave  = comentador.username.replace('@', '');
        const config = personagens[chave];
        if (!config) return;

        const resposta = await client.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 80,
            system:     config.prompt,
            messages: [{
                role:    'user',
                content: `${autorUsername} postou: "${conteudoPost}". Comente em 1 frase no seu estilo. Só o texto, sem aspas.`
            }]
        });

        const texto = resposta.content[0].text;
        if (!texto) return;

        await db.promise().query(
            'INSERT INTO comentarios (post_id, usuario_id, conteudo) VALUES (?, ?, ?)',
            [postId, comentador.id, texto]
        );

        console.log(`[IA] 💬 ${comentador.username} comentou no post ${postId}`);
        await criarNotificacao(autorId, comentador.id, 'comentario', postId);

    } catch (erro) {
        console.error(`[IA] Erro ao comentar (${comentador.username}):`, erro.message);
    }
}

async function adicionarLikes(postId, conteudo, autorId, todosIas) {
    try {
        const grupoDetectado = IaService.detectarGrupo(conteudo);
        const grupos         = IaService.grupos();

        let candidatos = [];

        if (grupoDetectado && grupos[grupoDetectado]) {
            const usernamesGrupo = grupos[grupoDetectado];
            const [iasGrupo]     = await db.promise().query(
                `SELECT id, username FROM usuarios
                 WHERE is_ia = 1
                   AND id != ?
                   AND REPLACE(username, '@', '') IN (${usernamesGrupo.map(() => '?').join(',')})`,
                [autorId, ...usernamesGrupo]
            );
            candidatos = iasGrupo;
        }

        if (candidatos.length < 3) {
            const outros = todosIas.filter(ia =>
                ia.id !== autorId &&
                !candidatos.find(c => c.id === ia.id)
            );
            candidatos = [...candidatos, ...sortearN(outros, 6 - candidatos.length)];
        }

        const qtd        = sortearComPeso(TABELA_LIKES);
        const curtidores = sortearN(candidatos, Math.min(qtd, candidatos.length));

        for (const curtidor of curtidores) {
            const [res] = await db.promise().query(
                'INSERT IGNORE INTO likes (post_id, usuario_id) VALUES (?, ?)',
                [postId, curtidor.id]
            );

            if (res.affectedRows > 0) {
                await criarNotificacao(autorId, curtidor.id, 'like', postId);
            }
        }

        console.log(`[IA] ❤️  ${curtidores.length} likes no post ${postId} (grupo: ${grupoDetectado || 'geral'})`);
    } catch (erro) {
        console.error('[IA] Erro ao adicionar likes:', erro.message);
    }
}

async function interagirComPostReal(post, todosIas) {
    try {
        const qtdComentarios = sortearComPeso(TABELA_COMENTARIOS);
        const comentadores   = sortearN(
            todosIas.filter(ia => ia.id !== post.usuario_id),
            Math.min(qtdComentarios, todosIas.length)
        );

        console.log(`[IA] Interagindo com post real ${post.id} de @${post.username} (${qtdComentarios} comentários imediatos)`);

        const promessasComentarios = comentadores.map((comentador, i) => 
            publicarComentario(comentador, post.id, post.conteudo, `@${post.username}`, post.usuario_id, i)
        );

        // Dispara likes e todos os comentários em paralelo
        await Promise.all([
            adicionarLikes(post.id, post.conteudo, post.usuario_id, todosIas),
            ...promessasComentarios
        ]);

    } catch (erro) {
        console.error('[IA] Erro ao interagir com post real:', erro.message);
    }
}

async function publicarPost(grupoFavorecido) {
    try {
        const [todosIas] = await db.promise().query(
            'SELECT id, username FROM usuarios WHERE is_ia = 1'
        );
        if (todosIas.length === 0) return;

        let pool = [...todosIas];
        if (grupoFavorecido) {
            const extras = todosIas.filter(ia =>
                grupoFavorecido.includes(ia.username.replace('@', ''))
            );
            pool = [...pool, ...extras, ...extras];
        }

        const personagem = pool[Math.floor(Math.random() * pool.length)];
        const chave      = personagem.username.replace('@', '');
        const config     = personagens[chave];

        if (!config) {
            console.log(`[IA] Personagem ${chave} não encontrado no personagens.js`);
            return;
        }

        const [ultimos] = await db.promise().query(
            'SELECT conteudo FROM posts WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 3',
            [personagem.id]
        );
        const contexto = ultimos.length > 0
            ? `Seus posts recentes: "${ultimos.map(p => p.conteudo).join(' | ')}". Não repita esses temas.`
            : '';

        const resposta = await client.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 120,
            system:     config.prompt,
            messages: [{
                role:    'user',
                content: `Crie um post curto para uma rede social no seu estilo. Só o texto, sem aspas. Máximo 2 frases. ${contexto}`
            }]
        });

        const conteudo = resposta.content[0].text;
        if (!conteudo) return;

        const [result] = await db.promise().query(
            'INSERT INTO posts (usuario_id, conteudo) VALUES (?, ?)',
            [personagem.id, conteudo]
        );
        const postId = result.insertId;

        console.log(`[IA] ✅ ${personagem.username} postou (id: ${postId}): "${conteudo.substring(0, 60)}..."`);

        const qtdComentarios = sortearComPeso(TABELA_COMENTARIOS);
        const outros         = todosIas.filter(ia => ia.id !== personagem.id);
        const comentadores   = sortearN(outros, Math.min(qtdComentarios, outros.length));

        console.log(`[IA] Adicionando likes e ${qtdComentarios} comentários imediatos para post ${postId}`);

        const promessasComentarios = comentadores.map((comentador, i) => 
            publicarComentario(comentador, postId, conteudo, personagem.username, personagem.id, i)
        );

        // Dispara Likes e Comentários ao mesmo tempo
        await Promise.all([
            adicionarLikes(postId, conteudo, personagem.id, todosIas),
            ...promessasComentarios
        ]);

    } catch (erro) {
        console.error('[IA] Erro ao publicar post:', erro.message);
    }
}

class CronController {

    verificarAutorizacao(req, res) {
        const authHeader = req.headers.authorization;
        // O Vercel injeta "Bearer SEU_SEGREDO" no cabeçalho
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            res.status(401).json({ error: 'Acesso não autorizado ao Cron Job' });
            return false;
        }
        return true;
    }

    async executarMadrugada(req, res) {
        if (!this.verificarAutorizacao(req, res)) return;
        console.log(`[IA] Cron madrugada disparado pelo Vercel`);
        
        await publicarPost(GRUPOS.madrugada);
        res.status(200).json({ msg: 'Cron Madrugada Executado com Sucesso' });
    }

    async executarManha(req, res) {
        if (!this.verificarAutorizacao(req, res)) return;
        console.log(`[IA] Cron manhã disparado pelo Vercel`);
        
        await publicarPost(GRUPOS.manha);
        res.status(200).json({ msg: 'Cron Manhã Executado com Sucesso' });
    }

    async executarTardeNoite(req, res) {
        if (!this.verificarAutorizacao(req, res)) return;
        console.log(`[IA] Cron tarde/noite disparado pelo Vercel`);
        
        await publicarPost(null);
        res.status(200).json({ msg: 'Cron Tarde/Noite Executado com Sucesso' });
    }

    async executarInteracao(req, res) {
        if (!this.verificarAutorizacao(req, res)) return;
        
        try {
            const [posts] = await db.promise().query(`
                SELECT p.id, p.conteudo, p.usuario_id, u.username
                FROM posts p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE u.is_ia = 0
                  AND p.criado_em > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                  AND p.id NOT IN (
                      SELECT DISTINCT c.post_id
                      FROM comentarios c
                      JOIN usuarios uc ON c.usuario_id = uc.id
                      WHERE uc.is_ia = 1
                  )
                ORDER BY p.criado_em ASC
                LIMIT 3
            `);

            if (posts.length === 0) {
                return res.status(200).json({ msg: 'Nenhum post de usuário real novo para interagir.' });
            }

            const [todosIas] = await db.promise().query(
                'SELECT id, username FROM usuarios WHERE is_ia = 1'
            );
            
            if (todosIas.length > 0) {
                // Interage com os posts encontrados simultaneamente
                const promessasInteracoes = posts.map(post => {
                    console.log(`[IA] Post real detectado: @${post.username} (id: ${post.id})`);
                    return interagirComPostReal(post, todosIas);
                });
                await Promise.all(promessasInteracoes);
            }

            res.status(200).json({ msg: 'Cron de Interação Executado com sucesso' });

        } catch (erro) {
            console.error('[IA] Erro no cron de interação:', erro.message);
            res.status(500).json({ error: 'Erro ao executar interação' });
        }
    }
}

module.exports = new CronController();