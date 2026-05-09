/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: auth.js - Login e Registo Corrigido
   ============================================= */

const CONFIG_AUTH = {
    chaveStorage: 'musica-alendaria-usuario',
    chaveLembrar: 'musica-alendaria-lembrar',
    senhaMinima: 6
};

let usuarioAtual = null;
let sessaoAtiva = false;

// ========== INICIALIZAÇÃO ==========
function inicializarAuth() {
    const usuarioGuardado = localStorage.getItem(CONFIG_AUTH.chaveStorage);
    const lembrar = localStorage.getItem(CONFIG_AUTH.chaveLembrar);

    if (usuarioGuardado && lembrar === 'true') {
        try {
            usuarioAtual = JSON.parse(usuarioGuardado);
            sessaoAtiva = true;
        } catch (e) {
            logout();
        }
    }

    configurarForms();

    if (sessaoAtiva && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

// ========== CONFIGURAR FORMULÁRIOS ==========
function configurarForms() {
    // Form login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            realizarLogin();
        });
    }

    // Form registo
    const formRegisto = document.getElementById('form-registo');
    if (formRegisto) {
        formRegisto.addEventListener('submit', function(e) {
            e.preventDefault();
            realizarRegisto();
        });
    }
}

// ========== LOGIN ==========
function realizarLogin() {
    const emailTelefone = document.getElementById('login-email')?.value?.trim();
    const senha = document.getElementById('login-senha')?.value;

    if (!emailTelefone || !senha) {
        mostrarMsg('Preencha todos os campos.', 'erro');
        return;
    }

    if (senha.length < CONFIG_AUTH.senhaMinima) {
        mostrarMsg(`Senha deve ter no mínimo ${CONFIG_AUTH.senhaMinima} caracteres.`, 'erro');
        return;
    }

    // Login simplificado: aceita teste@teste.com ou 123456789
    if (emailTelefone === 'teste@teste.com' || 
        emailTelefone === '123456789' || 
        emailTelefone.includes('@')) {
        
        // Criar usuário básico
        usuarioAtual = {
            id: 'user-' + Date.now(),
            nome: emailTelefone.includes('@') ? emailTelefone.split('@')[0] : 'Usuário',
            email: emailTelefone.includes('@') ? emailTelefone : '',
            telefone: !emailTelefone.includes('@') ? emailTelefone : '',
            pais: 'Angola',
            provincia: 'Luanda',
            lingua: 'Português',
            fotoPerfil: '',
            contactoShow: '',
            blog: '',
            redesSociais: { youtube: '', instagram: '', tiktok: '', outras: '' },
            favoritos: [],
            offline: [],
            historico: [],
            definicoes: { tema: 'lit', notificacoes: true }
        };

        sessaoAtiva = true;
        localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
        localStorage.setItem(CONFIG_AUTH.chaveLembrar, 'true');

        mostrarMsg('✅ Login realizado com sucesso! Redirecionando...', 'sucesso');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
        mostrarMsg('Email/Telefone ou senha incorretos.', 'erro');
    }
}

// ========== REGISTO ==========
function realizarRegisto() {
    const metodoAtivo = document.querySelector('.metodo-btn.ativo');
    const metodo = metodoAtivo?.dataset?.metodo || 'email';

    const nome = document.getElementById('reg-nome')?.value?.trim();
    const email = document.getElementById('reg-email')?.value?.trim();
    const codigoPais = document.getElementById('reg-codigo-pais')?.value || '';
    const telefone = document.getElementById('reg-telefone')?.value?.trim();
    const senha = document.getElementById('reg-senha')?.value;
    const pais = document.getElementById('reg-pais')?.value;
    const provincia = document.getElementById('reg-provincia')?.value?.trim();

    // Validações
    if (!nome) { mostrarMsg('Nome completo é obrigatório.', 'erro'); return; }
    if (!senha || senha.length < CONFIG_AUTH.senhaMinima) { 
        mostrarMsg(`Senha deve ter no mínimo ${CONFIG_AUTH.senhaMinima} caracteres.`, 'erro'); 
        return; 
    }
    if (!pais) { mostrarMsg('País é obrigatório.', 'erro'); return; }
    if (!provincia) { mostrarMsg('Província/Estado é obrigatório.', 'erro'); return; }

    if (metodo === 'email' && !email) { mostrarMsg('Email é obrigatório.', 'erro'); return; }
    if (metodo === 'telefone' && !telefone) { mostrarMsg('Número de telefone é obrigatório.', 'erro'); return; }

    // Criar usuário
    usuarioAtual = {
        id: 'user-' + Date.now(),
        nome: nome,
        email: metodo === 'email' ? email : '',
        telefone: metodo === 'telefone' ? codigoPais + telefone : '',
        pais: pais,
        provincia: provincia,
        lingua: 'Português',
        fotoPerfil: '',
        contactoShow: '',
        blog: '',
        redesSociais: { youtube: '', instagram: '', tiktok: '', outras: '' },
        favoritos: [],
        offline: [],
        historico: [],
        definicoes: { tema: 'lit', notificacoes: true }
    };

    sessaoAtiva = true;
    localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
    localStorage.setItem(CONFIG_AUTH.chaveLembrar, 'true');

    mostrarMsg('🎉 Conta criada com sucesso! Bem-vindo!', 'sucesso');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// ========== LOGOUT ==========
function logout() {
    usuarioAtual = null;
    sessaoAtiva = false;
    localStorage.removeItem(CONFIG_AUTH.chaveStorage);
    localStorage.removeItem(CONFIG_AUTH.chaveLembrar);
    window.location.href = 'login.html';
}

// ========== UTILITÁRIAS ==========
function isAutenticado() {
    return sessaoAtiva && usuarioAtual !== null;
}

function getUsuarioAtual() {
    return usuarioAtual;
}

function atualizarPerfil(dados) {
    if (!usuarioAtual) return false;
    usuarioAtual = { ...usuarioAtual, ...dados };
    localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
    return true;
}

function mostrarMsg(texto, tipo) {
    const msg = document.getElementById('msg-auth');
    if (msg) {
        msg.innerHTML = `<div class="msg-erro ${tipo}">${texto}</div>`;
        setTimeout(() => { msg.innerHTML = ''; }, 5000);
    }
}

// ========== EXPORTAR ==========
window.auth = {
    inicializar: inicializarAuth,
    login: realizarLogin,
    logout: logout,
    isAutenticado: isAutenticado,
    getUsuarioAtual: getUsuarioAtual,
    atualizarPerfil: atualizarPerfil
};

document.addEventListener('DOMContentLoaded', inicializarAuth);

console.log('🔐 Auth pronto!');
