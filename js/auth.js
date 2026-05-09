/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: auth.js - Sistema de Registo e Login
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_AUTH = {
    chaveStorage: 'musica-alendaria-usuario',
    chaveLembrar: 'musica-alendaria-lembrar',
    tempoSessao: 7 * 24 * 60 * 60 * 1000, // 7 dias
    senhaMinima: 6,
    telefoneRegex: /^[0-9]{9}$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// ========== ESTADO ==========
let usuarioAtual = null;
let sessaoAtiva = false;

// ========== INICIALIZAÇÃO ==========
function inicializarAuth() {
    // Verificar sessão guardada
    const usuarioGuardado = localStorage.getItem(CONFIG_AUTH.chaveStorage);
    const lembrar = localStorage.getItem(CONFIG_AUTH.chaveLembrar);

    if (usuarioGuardado && lembrar === 'true') {
        try {
            usuarioAtual = JSON.parse(usuarioGuardado);
            sessaoAtiva = true;
            console.log('👤 Sessão restaurada:', usuarioAtual.nome);
        } catch (e) {
            console.error('Erro ao restaurar sessão');
            logout();
        }
    }

    // Configurar formulários
    configurarFormLogin();
    configurarFormRegisto();
    configurarTabsAuth();
    configurarMetodoRegisto();
    configurarOpicionais();
    configurarMostrarSenha();

    // Verificar se está na página de login
    if (window.location.pathname.includes('login.html')) {
        if (sessaoAtiva) {
            redirecionarParaHome();
        }
    }

    // Verificar se precisa de login
    if (!sessaoAtiva && !window.location.pathname.includes('login.html')) {
        redirecionarParaLogin();
    }

    atualizarUIUsuario();
}

// ========== TABS LOGIN/REGISTO ==========
function configurarTabsAuth() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegisto = document.getElementById('tab-registo');
    const formLogin = document.getElementById('form-login');
    const formRegisto = document.getElementById('form-registo');

    if (!tabLogin || !tabRegisto) return;

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('tab-ativo');
        tabLogin.classList.remove('tab-inativo');
        tabRegisto.classList.add('tab-inativo');
        tabRegisto.classList.remove('tab-ativo');
        formLogin.classList.remove('hidden');
        formRegisto.classList.add('hidden');
    });

    tabRegisto.addEventListener('click', () => {
        tabRegisto.classList.add('tab-ativo');
        tabRegisto.classList.remove('tab-inativo');
        tabLogin.classList.add('tab-inativo');
        tabLogin.classList.remove('tab-ativo');
        formRegisto.classList.remove('hidden');
        formLogin.classList.add('hidden');
    });
}

// ========== MÉTODO DE REGISTO (EMAIL/TELEFONE) ==========
function configurarMetodoRegisto() {
    const botoesMetodo = document.querySelectorAll('.btn-metodo');
    const camposEmail = document.getElementById('campos-email');
    const camposTelefone = document.getElementById('campos-telefone');

    if (!botoesMetodo.length) return;

    botoesMetodo.forEach(btn => {
        btn.addEventListener('click', () => {
            const metodo = btn.dataset.metodo;

            // Atualizar botões
            botoesMetodo.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            // Mostrar/esconder campos
            if (metodo === 'email') {
                camposEmail.classList.remove('hidden');
                camposTelefone.classList.add('hidden');
                document.getElementById('reg-email').required = true;
                document.getElementById('reg-telefone').required = false;
            } else {
                camposTelefone.classList.remove('hidden');
                camposEmail.classList.add('hidden');
                document.getElementById('reg-telefone').required = true;
                document.getElementById('reg-email').required = false;
            }
        });
    });
}

// ========== CAMPOS OPCIONAIS ==========
function configurarOpicionais() {
    const btnOpicionais = document.getElementById('btn-opcionais');
    const camposOpicionais = document.getElementById('campos-opcionais');

    if (!btnOpicionais || !camposOpicionais) return;

    btnOpicionais.addEventListener('click', () => {
        const isHidden = camposOpicionais.classList.contains('hidden');
        if (isHidden) {
            camposOpicionais.classList.remove('hidden');
            btnOpicionais.textContent = '- Ocultar Informações Opcionais';
            camposOpicionais.style.animation = 'slideInUp 0.3s ease';
        } else {
            camposOpicionais.classList.add('hidden');
            btnOpicionais.textContent = '+ Informações Opcionais (Redes Sociais, Blog, Contacto para Show)';
        }
    });
}

// ========== MOSTRAR/ESCONDER SENHA ==========
function configurarMostrarSenha() {
    document.querySelectorAll('.mostrar-senha').forEach(icone => {
        icone.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });
}

// ========== FORMULÁRIO DE LOGIN ==========
function configurarFormLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return;

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailTelefone = document.getElementById('login-email').value.trim();
        const senha = document.getElementById('login-senha').value;

        // Validação
        if (!emailTelefone || !senha) {
            mostrarErroLogin('Preencha todos os campos obrigatórios.');
            return;
        }

        // Simular login (em produção seria requisição ao backend)
        realizarLogin(emailTelefone, senha);
    });
}

// ========== REALIZAR LOGIN ==========
function realizarLogin(emailTelefone, senha) {
    // Mostrar loading
    mostrarLoadingLogin(true);

    // Simular delay de rede
    setTimeout(() => {
        // Para o mock, vamos usar o usuário de teste
        // Em produção, validaria com o backend
        const usuarioMock = { ...DB.usuarioTeste };

        // Verificar se o email/telefone corresponde
        if (emailTelefone === usuarioMock.email ||
            emailTelefone === usuarioMock.telefone ||
            emailTelefone === 'teste@teste.com' ||
            emailTelefone === '123456789') {

            // Login bem sucedido
            usuarioAtual = usuarioMock;
            sessaoAtiva = true;

            // Guardar sessão
            localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
            localStorage.setItem(CONFIG_AUTH.chaveLembrar, 'true');

            mostrarLoadingLogin(false);
            mostrarMensagemSucesso('Login realizado com sucesso!');

            // Redirecionar após breve delay
            setTimeout(() => {
                redirecionarParaHome();
            }, 1000);

        } else {
            // Login falhou
            mostrarLoadingLogin(false);
            mostrarErroLogin('Email/Telefone ou senha incorretos.');
        }
    }, 1500);
}

// ========== FORMULÁRIO DE REGISTO ==========
function configurarFormRegisto() {
    const formRegisto = document.getElementById('form-registo');
    if (!formRegisto) return;

    formRegisto.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obter método de registo
        const metodoAtivo = document.querySelector('.btn-metodo.ativo');
        const metodo = metodoAtivo ? metodoAtivo.dataset.metodo : 'email';

        // Validar campos obrigatórios
        const nome = document.getElementById('reg-nome').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const codigoPais = document.getElementById('reg-codigo-pais')?.value || '';
        const telefone = document.getElementById('reg-telefone').value.trim();
        const senha = document.getElementById('reg-senha').value;
        const pais = document.getElementById('reg-pais').value;
        const provincia = document.getElementById('reg-provincia').value.trim();
        const lingua = document.getElementById('reg-lingua').value.trim();

        // Validações
        if (!nome) {
            mostrarErroRegisto('Nome completo é obrigatório.');
            return;
        }

        if (metodo === 'email' && !email) {
            mostrarErroRegisto('Email é obrigatório.');
            return;
        }

        if (metodo === 'email' && !CONFIG_AUTH.emailRegex.test(email)) {
            mostrarErroRegisto('Formato de email inválido.');
            return;
        }

        if (metodo === 'telefone' && !telefone) {
            mostrarErroRegisto('Número de telefone é obrigatório.');
            return;
        }

        if (metodo === 'telefone' && !CONFIG_AUTH.telefoneRegex.test(telefone)) {
            mostrarErroRegisto('Formato de telefone inválido (9 dígitos).');
            return;
        }

        if (!senha || senha.length < CONFIG_AUTH.senhaMinima) {
            mostrarErroRegisto(`Senha deve ter no mínimo ${CONFIG_AUTH.senhaMinima} caracteres.`);
            return;
        }

        if (!pais) {
            mostrarErroRegisto('País é obrigatório.');
            return;
        }

        if (!provincia) {
            mostrarErroRegisto('Província/Estado é obrigatório.');
            return;
        }

        if (!lingua) {
            mostrarErroRegisto('Língua preferida é obrigatória.');
            return;
        }

        // Criar usuário
        const novoUsuario = {
            id: 'user-' + Date.now(),
            nome: nome,
            email: metodo === 'email' ? email : '',
            telefone: metodo === 'telefone' ? codigoPais + telefone : '',
            pais: pais,
            provincia: provincia,
            lingua: lingua,
            fotoPerfil: document.getElementById('reg-foto')?.value || '',
            contactoShow: document.getElementById('reg-contacto-show')?.value || '',
            blog: document.getElementById('reg-blog')?.value || '',
            redesSociais: {
                youtube: document.getElementById('reg-youtube')?.value || '',
                instagram: document.getElementById('reg-instagram')?.value || '',
                tiktok: document.getElementById('reg-tiktok')?.value || '',
                outras: document.getElementById('reg-outras-redes')?.value || ''
            },
            favoritos: [],
            offline: [],
            historico: [],
            definicoes: {
                tema: 'lit',
                notificacoes: true
            }
        };

        // Guardar usuário
        usuarioAtual = novoUsuario;
        sessaoAtiva = true;
        localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
        localStorage.setItem(CONFIG_AUTH.chaveLembrar, 'true');

        // Feedback
        mostrarMensagemSucesso('Conta criada com sucesso! Bem-vindo à Musica Alendaria.');

        // Redirecionar
        setTimeout(() => {
            redirecionarParaHome();
        }, 1500);
    });
}

// ========== LOGOUT ==========
function logout() {
    usuarioAtual = null;
    sessaoAtiva = false;
    localStorage.removeItem(CONFIG_AUTH.chaveStorage);
    localStorage.removeItem(CONFIG_AUTH.chaveLembrar);
    redirecionarParaLogin();
}

// ========== UI DE LOADING ==========
function mostrarLoadingLogin(mostrar) {
    const btnSubmit = document.querySelector('#form-login .btn-principal');
    if (btnSubmit) {
        if (mostrar) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner spinner-pequeno"></span> Entrando...';
        } else {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Entrar';
        }
    }
}

// ========== MENSAGENS DE ERRO ==========
function mostrarErroLogin(mensagem) {
    // Remover erros anteriores
    const erroAnterior = document.querySelector('.erro-login');
    if (erroAnterior) erroAnterior.remove();

    const erro = document.createElement('div');
    erro.className = 'mensagem-sistema rejeitado erro-login';
    erro.textContent = mensagem;
    erro.style.animation = 'shake 0.5s ease';

    const form = document.getElementById('form-login');
    form.insertBefore(erro, form.querySelector('.btn-principal'));

    setTimeout(() => {
        erro.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => erro.remove(), 300);
    }, 4000);
}

function mostrarErroRegisto(mensagem) {
    const erroAnterior = document.querySelector('.erro-registo');
    if (erroAnterior) erroAnterior.remove();

    const erro = document.createElement('div');
    erro.className = 'mensagem-sistema rejeitado erro-registo';
    erro.textContent = mensagem;
    erro.style.animation = 'shake 0.5s ease';

    const form = document.getElementById('form-registo');
    form.insertBefore(erro, form.querySelector('.btn-principal'));

    setTimeout(() => {
        erro.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => erro.remove(), 300);
    }, 4000);
}

function mostrarMensagemSucesso(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-sucesso';
    toast.innerHTML = `
        <span class="toast-icone">✅</span>
        <span class="toast-mensagem">${mensagem}</span>
    `;

    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== NAVEGAÇÃO ==========
function redirecionarParaHome() {
    window.location.href = 'index.html';
}

function redirecionarParaLogin() {
    window.location.href = 'login.html';
}

// ========== ATUALIZAR UI COM DADOS DO USUÁRIO ==========
function atualizarUIUsuario() {
    if (!sessaoAtiva || !usuarioAtual) return;

    // Atualizar nome do usuário em menus
    document.querySelectorAll('.usuario-nome').forEach(el => {
        el.textContent = usuarioAtual.nome;
    });

    // Atualizar avatar
    document.querySelectorAll('.usuario-avatar').forEach(el => {
        if (usuarioAtual.fotoPerfil) {
            el.src = usuarioAtual.fotoPerfil;
        }
    });

    // Atualizar badge de notificações
    const notificacoes = DB.mensagens.filter(m =>
        m.usuarioId === usuarioAtual.id && !m.lida
    );
    document.querySelectorAll('.notificacoes-badge').forEach(el => {
        el.textContent = notificacoes.length;
        el.classList.toggle('hidden', notificacoes.length === 0);
    });
}

// ========== VERIFICAR AUTENTICAÇÃO ==========
function isAutenticado() {
    return sessaoAtiva && usuarioAtual !== null;
}

function getUsuarioAtual() {
    return usuarioAtual;
}

// ========== ATUALIZAR PERFIL ==========
function atualizarPerfil(dados) {
    if (!usuarioAtual) return false;

    // Mesclar dados
    usuarioAtual = { ...usuarioAtual, ...dados };
    localStorage.setItem(CONFIG_AUTH.chaveStorage, JSON.stringify(usuarioAtual));
    atualizarUIUsuario();
    return true;
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

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarAuth();
});

console.log('🔐 Sistema de autenticação pronto!');