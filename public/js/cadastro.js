const form = document.getElementById('formCadastro');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('inome').value;
    const telefone = document.getElementById('itelefone').value;
    const username = document.getElementById('iusername').value;
    const email = document.getElementById('iemail').value;
    const genero = document.getElementById('igenero').value;
    const senha = document.getElementById('isenha').value;

    const resposta = await fetch('http://localhost:3000/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, username, email, genero, senha })
    });

    if (resposta.status === 200) {
        alert('Cadastro realizado! Faça login.');
        window.location.href = '/index.html';
    } else {
        alert('Erro ao cadastrar');
    }
});