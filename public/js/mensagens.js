// ================================================
// ZERION — mensagens.js
// ================================================

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));
let destinatarioAtivo = null;

// Elementos — acessados após DOMContentLoaded
let elListaConversas, elTelaChat, elChatMensagens,
    elInputMensagem, elBtnEnviar, elBtnVoltar, elChatNome, elChatAvatar,
    elHeaderMensagens;
let intervaloAtualizacao = null;

document.addEventListener("DOMContentLoaded", () => {

    elListaConversas = document.getElementById("lista-conversas");
    elTelaChat       = document.getElementById("tela-chat");
    elChatMensagens  = document.getElementById("chat-mensagens");
    elInputMensagem  = document.getElementById("input-mensagem");
    elBtnEnviar      = document.getElementById("btn-enviar");
    elBtnVoltar      = document.getElementById("btn-voltar");
    elChatNome       = document.getElementById("chat-nome-usuario");
    elChatAvatar     = document.getElementById("chat-avatar");

    // Listeners
    elBtnEnviar.addEventListener("click", enviarMensagem);
    elBtnVoltar.addEventListener("click", voltarLista);
    elInputMensagem.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enviarMensagem();
    });

    // Verifica se veio do perfil com ?id=
    const params    = new URLSearchParams(window.location.search);
    const idDireto  = params.get("id");

    if (idDireto) {
        abrirChatPorId(idDireto);
    } else {
        carregarConversas();
    }
});

// ================================================
// ABRIR CHAT DIRETO POR ID (vindo do perfil)
// ================================================

async function abrirChatPorId(id) {
    try {
        const resposta = await fetch(`/usuarios/${id}`);
        const usuario  = await resposta.json();
        const username = usuario.username.startsWith("@")
            ? usuario.username.slice(1)
            : usuario.username;
        abrirChat(id, username, usuario.foto_perfil);
    } catch (erro) {
        console.error("Erro ao abrir chat:", erro);
        carregarConversas();
    }
}

// ================================================
// CARREGAR CONVERSAS
// ================================================

async function carregarConversas() {
    if (!usuarioLogado) return;

    try {
        const resposta  = await fetch(`/mensagens/conversas/${usuarioLogado.id}`);
        const conversas = await resposta.json();

        const lista = document.querySelector(".conversas");
        lista.innerHTML = "";

        if (conversas.length === 0) {
            lista.innerHTML = `<li style="color:#9d94b8;text-align:center;padding:2rem;font-size:0.8rem;">Nenhuma conversa ainda</li>`;
            return;
        }

        conversas.forEach(c => {
            const username = c.username.startsWith("@") ? c.username.slice(1) : c.username;
            const item = document.createElement("li");
            item.classList.add("conversa-item");
            item.innerHTML = `
                <div class="conversa-avatar" style="${c.foto_perfil ? `background-image:url(${c.foto_perfil});background-size:cover;background-position:center;` : ''}"></div>
                <div class="conversa-info">
                    <div class="conversa-topo">
                        <span class="conversa-nome">@${username}</span>
                        <span class="conversa-tempo">${formatarTempo(c.criado_em)}</span>
                    </div>
                    <span class="conversa-preview">${c.ultima_mensagem}</span>
                </div>
            `;
            item.addEventListener("click", () => abrirChat(c.id, username, c.foto_perfil));
            lista.appendChild(item);
        });

    } catch (erro) {
        console.error("Erro ao carregar conversas:", erro);
    }
}

// ================================================
// ABRIR CHAT
// ================================================

async function abrirChat(id, username, fotoPerfil) {
    destinatarioAtivo = id;

    elListaConversas.style.display = "none";
    elTelaChat.style.display       = "flex";
    elChatNome.textContent         = "@" + username;

    if (fotoPerfil) {
        elChatAvatar.style.backgroundImage    = `url(${fotoPerfil})`;
        elChatAvatar.style.backgroundSize     = "cover";
        elChatAvatar.style.backgroundPosition = "center";
    } else {
        elChatAvatar.style.backgroundImage = "";
    }

    await carregarMensagens();
    iniciarAtualizacaoChat();
    elInputMensagem.focus();
}

// ================================================
// CARREGAR MENSAGENS
// ================================================

async function carregarMensagens() {
    if (!destinatarioAtivo || !usuarioLogado) return;

    try {
        const resposta  = await fetch(`/mensagens/${destinatarioAtivo}?meu_id=${usuarioLogado.id}`);
        const mensagens = await resposta.json();

        elChatMensagens.innerHTML = "";
        mensagens.forEach(m => {
            const tipo = String(m.remetente_id) === String(usuarioLogado.id) ? "enviada" : "recebida";
            adicionarMensagemNaTela(m.conteudo, tipo);
        });

    } catch (erro) {
        console.error("Erro ao carregar mensagens:", erro);
    }
}

// ================================================
// ENVIAR MENSAGEM
// ================================================

async function enviarMensagem() {
    const texto = elInputMensagem.value.trim();
    if (texto === "" || !destinatarioAtivo || !usuarioLogado) return;

    try {
        const resposta = await fetch("/mensagens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                remetente_id:    usuarioLogado.id,
                destinatario_id: destinatarioAtivo,
                conteudo:        texto
            })
        });

        if (!resposta.ok) {
            throw new Error('Falha ao enviar mensagem');
        }

        adicionarMensagemNaTela(texto, "enviada");
        elInputMensagem.value = "";
        elInputMensagem.focus();
        carregarConversas();

    } catch (erro) {
        console.error("Erro ao enviar:", erro);
    }
}

// ================================================
// RENDERIZAR MENSAGEM
// ================================================
// Função para adicionar mensagem na tela

function adicionarMensagemNaTela(texto, tipo) {
    const item = document.createElement("li");
    item.classList.add("msg-item", tipo === "enviada" ? "msg-enviada" : "msg-recebida");
    item.textContent = texto;
    elChatMensagens.appendChild(item);
    elChatMensagens.scrollTop = elChatMensagens.scrollHeight;
}

// ================================================
// VOLTAR
// ================================================
// Função para voltar lista

function voltarLista() {
    destinatarioAtivo = null;
    pararAtualizacaoChat();

    // Mostra o header mobile ao sair do chat
    if (elHeaderMensagens && window.innerWidth < 1024) {
    elHeaderMensagens.style.display = "flex";
    }
    elTelaChat.style.top = "55px";

    elTelaChat.style.display       = "none";
    elListaConversas.style.display = "block";
    history.replaceState(null, "", "mensagens.html");
    carregarConversas();
}

// ================================================
// FORMATAR TEMPO
// ================================================
// Função para formatar tempo

function formatarTempo(data) {
    const diff = Math.floor((new Date() - new Date(data)) / 60000);
    if (diff < 1)    return "agora";
    if (diff < 60)   return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
}

function iniciarAtualizacaoChat() {
    pararAtualizacaoChat();
    intervaloAtualizacao = setInterval(async () => {
        if (destinatarioAtivo) await carregarMensagens();
        carregarConversas();
    }, 5000);
}

function pararAtualizacaoChat() {
    if (intervaloAtualizacao) {
        clearInterval(intervaloAtualizacao);
        intervaloAtualizacao = null;
    }
}

window.addEventListener("beforeunload", pararAtualizacaoChat);
