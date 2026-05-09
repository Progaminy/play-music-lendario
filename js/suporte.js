/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: suporte.js - Sistema de Suporte
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_SUPORTE = {
    whatsapp: {
        numero: '244900000000',
        mensagemPadrao: 'Olá! Preciso de ajuda com a Musica Alendaria.'
    },
    telegram: {
        username: 'MusicaAlendariaSuporte',
        mensagemPadrao: 'Olá! Preciso de ajuda com a plataforma.'
    },
    telefone: {
        numero: '+244900000000',
        label: 'Ligar para Suporte'
    },
    sms: {
        numero: '+244900000000',
        mensagemPadrao: 'Ajuda Musica Alendaria'
    },
    email: {
        endereco: 'suporte@musicaalendaria.com',
        assuntoPadrao: 'Suporte - Musica Alendaria'
    },
    horarioAtendimento: {
        diasUteis: '08:00 - 22:00',
        finsDeSemana: '09:00 - 18:00',
        fusoHorario: 'GMT+1 (Luanda)'
    }
};

// ========== ESTADO ==========
const estadoSuporte = {
    canaisDisponiveis: ['whatsapp', 'telegram', 'telefone', 'sms', 'email'],
    metodosAdicionais: [],
    chatAberto: false,
    ticketsAbertos: []
};

// ========== INICIALIZAÇÃO ==========
function inicializarSuporte() {
    configurarLinksSuporte();
    configurarModalSuporte();
    configurarSuporteLogin();
    verificarHorarioAtendimento();

    console.log('📞 Sistema de suporte pronto!');
}

// ========== CONFIGURAR LINKS DE SUPORTE ==========
function configurarLinksSuporte() {
    // Links com dados atualizados
    document.querySelectorAll('.btn-suporte').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const canal = this.dataset.canal;
            if (canal) {
                e.preventDefault();
                abrirCanalSuporte(canal);
            }
        });
    });
}

// ========== ABRIR CANAL DE SUPORTE ==========
function abrirCanalSuporte(canal, mensagemPersonalizada = '') {
    const mensagem = mensagemPersonalizada || CONFIG_SUPORTE[canal]?.mensagemPadrao || 'Preciso de ajuda';

    switch (canal) {
        case 'whatsapp':
            abrirWhatsApp(mensagem);
            break;
        case 'telegram':
            abrirTelegram(mensagem);
            break;
        case 'telefone':
            abrirChamada();
            break;
        case 'sms':
            abrirSMS(mensagem);
            break;
        case 'email':
            abrirEmail();
            break;
        default:
            // Canal personalizado adicionado pelo admin
            const metodoAdicional = estadoSuporte.metodosAdicionais.find(m => m.id === canal);
            if (metodoAdicional) {
                window.open(metodoAdicional.url, '_blank');
            }
    }

    console.log(`📞 Canal de suporte aberto: ${canal}`);
}

// ========== WHATSAPP ==========
function abrirWhatsApp(mensagem) {
    const numero = CONFIG_SUPORTE.whatsapp.numero.replace(/\D/g, '');
    const texto = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numero}?text=${texto}`;
    window.open(url, '_blank');
}

// ========== TELEGRAM ==========
function abrirTelegram(mensagem) {
    const username = CONFIG_SUPORTE.telegram.username.replace('@', '');
    const texto = encodeURIComponent(mensagem);
    const url = `https://t.me/${username}?text=${texto}`;
    window.open(url, '_blank');
}

// ========== CHAMADA TELEFÓNICA ==========
function abrirChamada() {
    const numero = CONFIG_SUPORTE.telefone.numero;
    window.location.href = `tel:${numero}`;
}

// ========== SMS ==========
function abrirSMS(mensagem) {
    const numero = CONFIG_SUPORTE.sms.numero;
    const texto = encodeURIComponent(mensagem);
    window.location.href = `sms:${numero}?body=${texto}`;
}

// ========== EMAIL ==========
function abrirEmail(assunto = '', mensagem = '') {
    const endereco = CONFIG_SUPORTE.email.endereco;
    const assuntoFinal = encodeURIComponent(assunto || CONFIG_SUPORTE.email.assuntoPadrao);
    const mensagemFinal = encodeURIComponent(mensagem || '');
    window.location.href = `mailto:${endereco}?subject=${assuntoFinal}&body=${mensagemFinal}`;
}

// ========== CONFIGURAR MODAL DE SUPORTE ==========
function configurarModalSuporte() {
    const btnSuporte = document.getElementById('btn-suporte-modal');
    if (btnSuporte) {
        btnSuporte.addEventListener('click', () => {
            window.modal?.abrir(conteudoModalSuporte(), {
                classeExtra: 'modal-suporte',
                animacao: 'modalSlideUp'
            });
            configurarBotoesModalSuporte();
        });
    }
}

// ========== CONTEÚDO DO MODAL DE SUPORTE ==========
function conteudoModalSuporte() {
    const horario = getHorarioAtendimento();

    return `
        <h3 class="suporte-titulo">📞 Central de Ajuda</h3>
        <p class="suporte-descricao">Escolha o melhor canal para nos contactar:</p>

        <div class="suporte-opcoes">
            <div class="suporte-opcao" data-canal="whatsapp">
                <span class="suporte-icone">💬</span>
                <span class="suporte-nome">WhatsApp</span>
                <span class="suporte-detalhe">Resposta rápida</span>
            </div>
            <div class="suporte-opcao" data-canal="telegram">
                <span class="suporte-icone">📨</span>
                <span class="suporte-nome">Telegram</span>
                <span class="suporte-detalhe">Suporte 24h</span>
            </div>
            <div class="suporte-opcao" data-canal="telefone">
                <span class="suporte-icone">📞</span>
                <span class="suporte-nome">Ligar</span>
                <span class="suporte-detalhe">Atendimento direto</span>
            </div>
            <div class="suporte-opcao" data-canal="sms">
                <span class="suporte-icone">📱</span>
                <span class="suporte-nome">SMS</span>
                <span class="suporte-detalhe">Sem internet</span>
            </div>
            <div class="suporte-opcao" data-canal="email">
                <span class="suporte-icone">📧</span>
                <span class="suporte-nome">Email</span>
                <span class="suporte-detalhe">Resposta em 24h</span>
            </div>
        </div>

        ${estadoSuporte.metodosAdicionais.length > 0 ? `
            <h4 style="margin-top: 1.5rem;">🔗 Outros Canais</h4>
            <div class="suporte-opcoes" style="margin-top: 0.5rem;">
                ${estadoSuporte.metodosAdicionais.map(m => `
                    <div class="suporte-opcao" data-canal="${m.id}">
                        <span class="suporte-icone">🔗</span>
                        <span class="suporte-nome">${m.nome}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="suporte-horario">
            <h4>🕐 Horário de Atendimento</h4>
            <p>${horario}</p>
        </div>

        <div class="suporte-faq" style="margin-top: 1rem;">
            <h4>❓ Perguntas Frequentes</h4>
            <div class="faq-item">
                <button class="faq-pergunta" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Como faço para postar conteúdo?
                </button>
                <p class="faq-resposta hidden">Vá até a página de postagem, preencha o título, cole o link do conteúdo e escolha a visibilidade. O conteúdo será enviado para aprovação.</p>
            </div>
            <div class="faq-item">
                <button class="faq-pergunta" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Como destrancar uma música?
                </button>
                <p class="faq-resposta hidden">Após os 30 segundos grátis, clique no botão "Destrancar" para aceder ao conteúdo completo, incluindo áudio, vídeo, letra e download.</p>
            </div>
            <div class="faq-item">
                <button class="faq-pergunta" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Como funciona o modo offline?
                </button>
                <p class="faq-resposta hidden">Depois de destrancar uma música, pode baixá-la para ouvir offline. O conteúdo ficará disponível mesmo sem internet.</p>
            </div>
        </div>
    `;
}

// ========== CONFIGURAR BOTÕES DO MODAL ==========
function configurarBotoesModalSuporte() {
    document.querySelectorAll('.suporte-opcao').forEach(opcao => {
        opcao.addEventListener('click', function () {
            const canal = this.dataset.canal;
            if (canal) {
                abrirCanalSuporte(canal);
            }
        });
    });
}

// ========== CONFIGURAR SUPORTE NO LOGIN ==========
function configurarSuporteLogin() {
    const botoesSuporte = document.querySelectorAll('.suporte-login .btn-suporte');
    botoesSuporte.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank');
            }
        });
    });
}

// ========== VERIFICAR HORÁRIO DE ATENDIMENTO ==========
function verificarHorarioAtendimento() {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0 = Domingo
    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    const horaAtual = hora + minuto / 60;

    const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
    const [horaInicio, horaFim] = isDiaUtil
        ? CONFIG_SUPORTE.horarioAtendimento.diasUteis.split(' - ').map(h => {
            const [hh, mm] = h.split(':').map(Number);
            return hh + mm / 60;
        })
        : CONFIG_SUPORTE.horarioAtendimento.finsDeSemana.split(' - ').map(h => {
            const [hh, mm] = h.split(':').map(Number);
            return hh + mm / 60;
        });

    estadoSuporte.dentroHorario = horaAtual >= horaInicio && horaAtual <= horaFim;

    // Atualizar indicador visual
    const indicador = document.querySelector('.status-atendimento');
    if (indicador) {
        if (estadoSuporte.dentroHorario) {
            indicador.innerHTML = '<span style="color: var(--cor-acento);">🟢 Atendimento disponível</span>';
        } else {
            indicador.innerHTML = '<span style="color: var(--cor-secundaria);">🔴 Fora do horário</span>';
        }
    }
}

// ========== OBTER HORÁRIO FORMATADO ==========
function getHorarioAtendimento() {
    return `
        Dias úteis: ${CONFIG_SUPORTE.horarioAtendimento.diasUteis}<br>
        Fins de semana: ${CONFIG_SUPORTE.horarioAtendimento.finsDeSemana}<br>
        <small>Fuso: ${CONFIG_SUPORTE.horarioAtendimento.fusoHorario}</small>
    `;
}

// ========== ADICIONAR MÉTODO DE CONTATO ==========
function adicionarMetodoSuporte(nome, url, icone = '🔗') {
    const novoMetodo = {
        id: 'metodo-' + Date.now(),
        nome: nome,
        url: url,
        icone: icone,
        dataAdicao: new Date().toISOString()
    };

    estadoSuporte.metodosAdicionais.push(novoMetodo);
    console.log(`🔗 Novo método de suporte adicionado: ${nome}`);

    return novoMetodo;
}

// ========== CRIAR TICKET DE SUPORTE ==========
function criarTicket(assunto, descricao, prioridade = 'normal') {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) {
        mostrarToastSuporte('Faça login para abrir um ticket', 'erro');
        return null;
    }

    const ticket = {
        id: 'ticket-' + Date.now(),
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        assunto: assunto,
        descricao: descricao,
        prioridade: prioridade,
        status: 'aberto',
        dataCriacao: new Date().toISOString(),
        respostas: []
    };

    estadoSuporte.ticketsAbertos.push(ticket);
    console.log('🎫 Ticket criado:', ticket.assunto);
    mostrarToastSuporte('🎫 Ticket criado com sucesso! Responderemos em breve.', 'sucesso');

    // Simular envio para o sistema de tickets
    setTimeout(() => {
        ticket.respostas.push({
            de: 'Suporte Musica Alendaria',
            mensagem: 'Obrigado pelo contacto! A sua mensagem foi recebida e será respondida em breve.',
            data: new Date().toISOString()
        });
    }, 2000);

    return ticket;
}

// ========== TOAST ==========
function mostrarToastSuporte(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icone">${tipo === 'sucesso' ? '✅' : tipo === 'erro' ? '❌' : 'ℹ️'}</span>
        <span class="toast-mensagem">${mensagem}</span>
        <span class="toast-fechar">✕</span>
    `;

    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    container.appendChild(toast);

    toast.addEventListener('click', () => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('saindo');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// ========== EXPORTAR ==========
window.suporte = {
    inicializar: inicializarSuporte,
    abrirCanal: abrirCanalSuporte,
    whatsapp: () => abrirWhatsApp(),
    telegram: () => abrirTelegram(),
    ligar: () => abrirChamada(),
    sms: () => abrirSMS(),
    email: () => abrirEmail(),
    adicionarMetodo: adicionarMetodoSuporte,
    criarTicket: criarTicket,
    getHorario: getHorarioAtendimento,
    isDentroHorario: () => estadoSuporte.dentroHorario
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarSuporte);

console.log('📞 Suporte pronto! (WhatsApp, Telegram, Call, SMS, Email)');