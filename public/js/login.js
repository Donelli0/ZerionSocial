const form = document.getElementById('formLogin');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('iemail').value;
    const senha = document.getElementById('isenha').value;

    const resposta = await fetch('http://localhost:3000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })

    if (resposta.status === 200) {
        const usuario = await resposta.json();

        // guarda usuário logado
        localStorage.setItem('usuario', JSON.stringify(usuario));

        window.location.href = '/home.html';
    } else {
        alert('Email ou senha inválidos');
    }
});