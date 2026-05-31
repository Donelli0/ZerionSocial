// ================================================
// ZERION — notificacoes.js
// ================================================

const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

async function carregarNotificacoes() {
    const lista = document.getElementById("lista-notificacoes");

    // Por enquanto exibe notificações estáticas elegantes
    // Quando houver rota de notificações no back-end, substitui pelo fetch
    const notificacoes = [
        { tipo: "like",     texto: "Suas publicações receberam curtidas recentemente", tempo: "agora",  nova: true  },
        { tipo: "seguidor", texto: "Novos usuários estão na plataforma",               tempo: "hoje",   nova: true  },
        { tipo: "sistema",  texto: "Bem-vindo à Zerion! Explore e conecte-se.",        tempo: "sempre", nova: false },
    ];

    const icones = {
        like:     { icon: "fa-solid fa-heart",    cor: "#fa709a" },
        seguidor: { icon: "fa-solid fa-user-plus", cor: "#00f2fe" },
        sistema:  { icon: "fa-solid fa-satellite", cor: "#9d94b8" },
        comentario: { icon: "fa-solid fa-comment", cor: "#a78bfa" },
    };

    lista.innerHTML = "";

    notificacoes.forEach(n => {
        const ic = icones[n.tipo] || icones.sistema;
        const item = document.createElement("li");
        item.classList.add("notif-item");
        if (n.nova) item.classList.add("notif-nova");

        item.innerHTML = `
            <div class="notif-avatar"></div>
            <div class="notif-info">
                <span class="notif-texto">${n.texto}</span>
                <span class="notif-tempo">${n.tempo}</span>
            </div>
            <i class="${ic.icon} notif-icone" style="color:${ic.cor};"></i>
        `;

        lista.appendChild(item);
    });
}

carregarNotificacoes();
