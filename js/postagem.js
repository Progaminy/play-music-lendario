/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: postagem.js - Sistema de Postagem
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_POSTAGEM = {
    chaveStorage: 'musica-alendaria-postagens',
    maxPostagensPorUsuario: 50,
    camposObrigatorios: ['titulo', 'link', 'visibilidade'],
    emailAdmin: 'admin@musicaalendaria.com'
};

// ========== ESTADO ==========
const estadoPostagem = {
    postagens: [],
    plataformasRegistadas: [],
    postagemAtual: null,
    enviando: false
};

// ========== INICIALIZAÇÃO ==========
function inicializarPostagem() {
    // Carregar plataformas registadas
    estadoPostagem.plataformasRegistadas = buscarPlataformasRegistadas();

    // Carregar postagens
    carregarPostagens();

    // Configurar UI
    configurarFormPostagem();
    configurarPrevisualizacaoLink();
    configurarMetodosPostagem();

    console.log('📤 Sistema de postagem pronto!');
}

// ========== CARREGAR POSTAGENS ==========
function carregarPostagens() {
    try {
        const saved = localStorage.getItem(CONFIG_POSTAGEM.chaveStorage);
        estadoPostagem.postagens = saved ? JSON.parse(saved) : [];
    } catch (e) {
        estadoPostagem.postagens = [];
    }
}

// ========== SALVAR POSTAGENS ==========
function salvarPostagens() {
    localStorage.setItem(CONFIG_POSTAGEM.chaveStorage, JSON.stringify(estadoPostagem.postagens));
}

// ========== CRIAR POSTAGEM ==========
function criarPostagem(dados) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) {
        mostrarNotificacao('Faça login para postar', 'erro');
        return null;
    }

    // Validar campos obrigatórios
    if (!dados.titulo || !dados.link || !dados.visibilidade) {
        mostrarNotificacao('Título, link e visibilidade são obrigatórios', 'erro');
        return null;
    }

    // Validar link (deve ser de plataforma registada ou nova)
    const linkValido = validarLink(dados.link);
    if (!linkValido) {
        mostrarNotificacao('Link não pertence a uma plataforma registada. Adicione a plataforma primeiro.', 'erro');
        return null;
    }

    // Extrair dados automáticos do link
    const dadosExtraidos = extrairDadosLink(dados.link);

    const novaPostagem = {
        id: 'post-' + Date.now(),
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioFoto: usuario.fotoPerfil || '',
        titulo: dados.titulo,
        link: dados.link,
        visibilidade: dados.visibilidade,
        capa: dadosExtraidos.capa || '',
        descricao: dadosExtraidos.descricao || '',
        ano: dadosExtraidos.ano || new Date().getFullYear(),
        estilo: dadosExtraidos.estilo || '',
        plataforma: dadosExtraidos.plataforma || '',
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
        dataAprovacao: null,
        motivoRejeicao: ''
    };

    // Adicionar à lista
    estadoPostagem.postagens.unshift(novaPostagem);
    salvarPostagens();

    // Enviar para aprovação
    enviarParaAprovacao(novaPostagem);

    console.log('📤 Postagem criada:', novaPostagem.titulo);
    return novaPostagem;
}

// ========== VALIDAR LINK ==========
function validarLink(link) {
    if (!link) return false;

    // Verificar se pertence a uma plataforma registada
    const plataformaEncontrada = estadoPostagem.plataformasRegistadas.find(p =>
        link.toLowerCase().includes(p.url.toLowerCase().replace('https://', '').replace('http://', ''))
    );

    if (plataformaEncontrada) return true;

    // Verificar se é uma plataforma nova já adicionada
    const plataformaNova = estadoPostagem.plataformasRegistadas.find(p =>
        p.status === 'pendente' && link.toLowerCase().includes(p.url.toLowerCase())
    );

    return !!plataformaNova;
}

// ========== EXTRAIR DADOS DO LINK ==========
function extrairDadosLink(link) {
    const dados = {
        capa: '',
        descricao: '',
        ano: '',
        estilo: '',
        plataforma: ''
    };

    // Identificar plataforma
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
        dados.plataforma = 'YouTube';
        dados.capa = `https://img.youtube.com/vi/${extrairYoutubeId(link)}/maxresdefault.jpg`;
    } else if (link.includes('spotify.com')) {
        dados.plataforma = 'Spotify';
    } else if (link.includes('music.apple.com')) {
        dados.plataforma = 'Apple Music';
    } else if (link.includes('deezer.com')) {
        dados.plataforma = 'Deezer';
    } else if (link.includes('soundcloud.com')) {
        dados.plataforma = 'SoundCloud';
    } else if (link.includes('audiomack.com')) {
        dados.plataforma = 'Audiomack';
    } else if (link.includes('boomplay.com')) {
        dados.plataforma = 'Boomplay';
    } else if (link.includes('tidal.com')) {
        dados.plataforma = 'Tidal';
    } else {
        dados.plataforma = 'Outra Plataforma';
    }

    return dados;
}

function extrairYoutubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
}

// ========== ENVIAR PARA APROVAÇÃO ==========
function enviarParaAprovacao(postagem) {
    if (estadoPostagem.enviando) return;
    estadoPostagem.enviando = true;

    mostrarNotificacao('📧 Enviando para aprovação...', 'info');

    // Simular envio de email para o admin
    setTimeout(() => {
        console.log(`📧 Email enviado para ${CONFIG_POSTAGEM.emailAdmin}:`);
        console.log(`   Assunto: Nova postagem para aprovação`);
        console.log(`   Usuário: ${postagem.usuarioNome}`);
        console.log(`   Título: ${postagem.titulo}`);
        console.log(`   Link: ${postagem.link}`);
        console.log(`   Visibilidade: ${postagem.visibilidade}`);

        // Simular resposta do admin (para teste, aprova após 3 segundos)
        simularRespostaAdmin(postagem);
    }, 1000);
}

// ========== SIMULAR RESPOSTA DO ADMIN ==========
function simularRespostaAdmin(postagem) {
    const tempoResposta = 2000 + Math.random() * 3000; // 2-5 segundos

    setTimeout(() => {
        // 80% de chance de aprovação para teste
        const aprovado = Math.random() < 0.8;

        if (aprovado) {
            aprovarPostagem(postagem.id);
        } else {
            const motivos = [
                'Link não pertence a uma plataforma registada.',
                'Conteúdo duplicado.',
                'Qualidade do link insuficiente.',
                'Informações incompletas.',
                'Violação dos termos de uso.'
            ];
            const motivo = motivos[Math.floor(Math.random() * motivos.length)];
            rejeitarPostagem(postagem.id, motivo);
        }

        estadoPostagem.enviando = false;
    }, tempoResposta);
}

// ========== APROVAR POSTAGEM ==========
function aprovarPostagem(postagemId) {
    const postagem = estadoPostagem.postagens.find(p => p.id === postagemId);
    if (!postagem) return;

    postagem.status = 'aprovado';
    postagem.dataAprovacao = new Date().toISOString();
    postagem.motivoRejeicao = '';
    salvarPostagens();

    // Criar notificação para o usuário
    criarNotificacaoUsuario(
        postagem.usuarioId,
        'aprovado',
        `A sua postagem "${postagem.titulo}" foi aprovada e já está visível na plataforma.`
    );

    mostrarNotificacao('✅ Postagem aprovada!', 'sucesso');
    atualizarUIAfterPostagem(postagem);
}

// ========== REJEITAR POSTAGEM ==========
function rejeitarPostagem(postagemId, motivo) {
    const postagem = estadoPostagem.postagens.find(p => p.id === postagemId);
    if (!postagem) return;

    postagem.status = 'rejeitado';
    postagem.motivoRejeicao = motivo;
    salvarPostagens();

    // Criar notificação para o usuário
    criarNotificacaoUsuario(
        postagem.usuarioId,
        'rejeitado',
        `A sua postagem "${postagem.titulo}" foi rejeitada. Motivo: ${motivo}`
    );

    mostrarNotificacao(`❌ Postagem rejeitada: ${motivo}`, 'erro');
    atualizarUIAfterPostagem(postagem);
}

// ========== CRIAR NOTIFICAÇÃO ==========
function criarNotificacaoUsuario(usuarioId, tipo, mensagem) {
    const novaMensagem = {
        id: 'msg-' + Date.now(),
        usuarioId: usuarioId,
        tipo: tipo,
        conteudo: mensagem,
        data: new Date().toISOString(),
        lida: false
    };

    // Adicionar à base de dados mock
    if (!DB.mensagens) DB.mensagens = [];
    DB.mensagens.unshift(novaMensagem);

    // Atualizar badge de notificações
    atualizarBadgeNotificacoes();

    console.log(`🔔 Notificação criada para ${usuarioId}: ${mensagem}`);
}

// ========== ATUALIZAR BADGE ==========
function atualizarBadgeNotificacoes() {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return;

    const naoLidas = DB.mensagens.filter(m =>
        m.usuarioId === usuario.id && !m.lida
    );

    document.querySelectorAll('.notificacoes-badge').forEach(badge => {
        badge.textContent = naoLidas.length;
        badge.classList.toggle('hidden', naoLidas.length === 0);
        if (naoLidas.length > 0) {
            badge.classList.add('sino-notificacao');
        }
    });
}

// ========== CONFIGURAR FORMULÁRIO ==========
function configurarFormPostagem() {
    const formPostagem = document.getElementById('form-postagem');
    if (!formPostagem) return;

    formPostagem.addEventListener('submit', function (e) {
        e.preventDefault();

        const dados = {
            titulo: document.getElementById('post-titulo')?.value.trim() || '',
            link: document.getElementById('post-link')?.value.trim() || '',
            visibilidade: document.querySelector('input[name="visibilidade"]:checked')?.value || 'publico'
        };

        const postagem = criarPostagem(dados);

        if (postagem) {
            formPostagem.reset();
            // Limpar preview
            const preview = document.getElementById('preview-capa');
            if (preview) preview.innerHTML = '<p>📎 Pré-visualização aparecerá aqui</p>';
        }
    });
}

// ========== PREVISUALIZAÇÃO DO LINK ==========
function configurarPrevisualizacaoLink() {
    const inputLink = document.getElementById('post-link');
    if (!inputLink) return;

    inputLink.addEventListener('input', function () {
        const link = this.value.trim();
        const preview = document.getElementById('preview-capa');

        if (!preview) return;

        if (link && link.includes('youtube.com')) {
            const youtubeId = extrairYoutubeId(link);
            if (youtubeId) {
                preview.innerHTML = `<img src="https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg" alt="Preview" style="width: 100%; border-radius: 8px;">`;
            }
        } else if (link) {
            preview.innerHTML = `
                <div style="padding: 1rem; text-align: center;">
                    <p style="color: var(--texto-secundario);">🔗 Link detectado: ${extrairDadosLink(link).plataforma}</p>
                </div>
            `;
        } else {
            preview.innerHTML = '<p style="color: var(--texto-terciario);">📎 Pré-visualização aparecerá aqui</p>';
        }
    });
}

// ========== MÉTODOS DE POSTAGEM ==========
function configurarMetodosPostagem() {
    // Método 1: Copiar e colar (já configurado no input)

    // Método 2: Selecionar plataforma registada
    document.querySelectorAll('.plataforma-item').forEach(item => {
        item.addEventListener('click', function () {
            const plataformaUrl = this.dataset.plataformaUrl;
            if (plataformaUrl) {
                // Levar ao perfil da plataforma
                const inputLink = document.getElementById('post-link');
                if (inputLink) {
                    inputLink.value = plataformaUrl + '/';
                    inputLink.focus();
                    // Disparar evento para preview
                    inputLink.dispatchEvent(new Event('input'));
                }
                mostrarNotificacao(`🔗 Cole o link completo do conteúdo de ${this.dataset.plataformaNome || 'plataforma'}`, 'info');
            }
        });
    });

    // Botão adicionar nova plataforma
    const btnAdicionarPlataforma = document.getElementById('btn-adicionar-plataforma');
    if (btnAdicionarPlataforma) {
        btnAdicionarPlataforma.addEventListener('click', adicionarNovaPlataforma);
    }
}

// ========== ADICIONAR NOVA PLATAFORMA ==========
function adicionarNovaPlataforma() {
    const nome = prompt('Nome da nova plataforma:');
    if (!nome) return;

    const url = prompt('URL da plataforma (ex: https://exemplo.com):');
    if (!url) return;

    const novaPlataforma = {
        id: 'plat-' + Date.now(),
        nome: nome,
        url: url,
        icone: 'assets/icones/link.svg',
        status: 'pendente'
    };

    estadoPostagem.plataformasRegistadas.push(novaPlataforma);
    DB.plataformasRegistadas.push(novaPlataforma);

    // Enviar para aprovação do admin
    console.log(`🔗 Nova plataforma sugerida: ${nome} (${url})`);
    mostrarNotificacao(`📤 Plataforma "${nome}" enviada para aprovação!`, 'info');

    // Atualizar UI de plataformas
    atualizarListaPlataformas();
}

// ========== ATUALIZAR LISTA DE PLATAFORMAS ==========
function atualizarListaPlataformas() {
    const container = document.querySelector('.lista-plataformas');
    if (!container) return;

    const plataformas = estadoPostagem.plataformasRegistadas.filter(p => p.status === 'ativo');

    container.innerHTML = plataformas.map(p => `
        <div class="plataforma-item"
             data-plataforma-url="${p.url}"
             data-plataforma-nome="${p.nome}"
             title="${p.nome}">
            <img src="${p.icone}" alt="${p.nome}" class="icon-plataforma" onerror="this.style.display='none'">
            <span>${p.nome}</span>
        </div>
    `).join('') + `
        <div class="plataforma-item" id="btn-adicionar-plataforma"
             style="border-style: dashed; justify-content: center;">
            <span>+ Adicionar</span>
        </div>
    `;

    // Reconfigurar eventos
    configurarMetodosPostagem();
}

// ========== ATUALIZAR UI APÓS POSTAGEM ==========
function atualizarUIAfterPostagem(postagem) {
    const statusContainer = document.querySelector('.status-postagem');
    if (!statusContainer) return;

    if (postagem.status === 'aprovado') {
        statusContainer.innerHTML = `
            <div class="mensagem-sistema aprovado">
                ✅ Postagem aprovada! Já está visível na plataforma.
            </div>
        `;
    } else if (postagem.status === 'rejeitado') {
        statusContainer.innerHTML = `
            <div class="mensagem-sistema rejeitado">
                ❌ Postagem rejeitada. Motivo: ${postagem.motivoRejeicao}
            </div>
        `;
    } else {
        statusContainer.innerHTML = `
            <div class="mensagem-sistema" style="background: rgba(247, 183, 49, 0.1); color: var(--cor-destaque); border: 1px solid rgba(247, 183, 49, 0.3);">
                ⏳ Aguardando aprovação...
            </div>
        `;
    }

    // Atualizar lista de postagens do usuário
    renderizarMinhasPostagens();
}

// ========== RENDERIZAR POSTAGENS DO USUÁRIO ==========
function renderizarMinhasPostagens() {
    const container = document.querySelector('.minhas-postagens');
    if (!container) return;

    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return;

    const minhasPostagens = estadoPostagem.postagens.filter(p => p.usuarioId === usuario.id);

    if (minhasPostagens.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <p class="vazio-descricao">Nenhuma postagem ainda.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = minhasPostagens.map(p => `
        <div class="card-musica-h" style="margin-bottom: 0.5rem;">
            ${p.capa ? `<img src="${p.capa}" alt="${p.titulo}" class="capa-musica" onerror="this.src='assets/imagens/placeholder.svg'">` : ''}
            <div class="info-musica">
                <div class="titulo-musica">${p.titulo}</div>
                <div class="artista-musica">${p.plataforma} • ${p.ano}</div>
            </div>
            <span class="badge ${p.status === 'aprovado' ? 'badge-sucesso' : p.status === 'rejeitado' ? 'badge-perigo' : 'badge-aviso'}">
                ${p.status === 'aprovado' ? '✅' : p.status === 'rejeitado' ? '❌' : '⏳'} ${p.status}
            </span>
            <span class="badge badge-contorno">${p.visibilidade === 'publico' ? '🌍' : '🔒'}</span>
        </div>
    `).join('');
}

// ========== ALTERNAR VISIBILIDADE ==========
function alternarVisibilidade(postagemId) {
    const postagem = estadoPostagem.postagens.find(p => p.id === postagemId);
    if (!postagem) return;

    postagem.visibilidade = postagem.visibilidade === 'publico' ? 'privado' : 'publico';
    salvarPostagens();
    renderizarMinhasPostagens();
    mostrarNotificacao(`Visibilidade alterada para ${postagem.visibilidade}`, 'info');
}

// ========== NOTIFICAÇÃO TOAST ==========
function mostrarNotificacao(mensagem, tipo = 'info') {
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
window.postagem = {
    inicializar: inicializarPostagem,
    criar: criarPostagem,
    aprovar: aprovarPostagem,
    rejeitar: rejeitarPostagem,
    alternarVisibilidade: alternarVisibilidade,
    adicionarPlataforma: adicionarNovaPlataforma,
    getPostagens: () => estadoPostagem.postagens,
    getPlataformas: () => estadoPostagem.plataformasRegistadas
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarPostagem);

console.log('📤 Postagem pronta! (Com aprovação por email)');