/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: modal.js - Sistema de Modais
   ============================================= */

// ========== ESTADO DOS MODAIS ==========
const estadoModais = {
    modaisAbertos: [],
    historicoModais: []
};

// ========== INICIALIZAÇÃO ==========
function inicializarModais() {
    // Fechar modais com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && estadoModais.modaisAbertos.length > 0) {
            fecharModalAtual();
        }
    });

    // Configurar links de vídeo para abrir no modal
    configurarLinksVideo();

    // Configurar botões de fechar modal
    configurarBotoesFechar();

    console.log('🪟 Sistema de modais pronto!');
}

// ========== ABRIR MODAL GENÉRICO ==========
function abrirModal(conteudoHTML, opcoes = {}) {
    const {
        classeExtra = '',
        fecharAoCliqueFora = true,
        animacao = 'fadeInScale',
        aoAbrir = null,
        aoFechar = null
    } = opcoes;

    // Fechar modal atual se existir
    if (estadoModais.modaisAbertos.length > 0) {
        fecharModalAtual(false);
    }

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = `modal-overlay ${classeExtra}`;
    overlay.style.animation = 'fadeIn 0.2s ease';

    // Criar conteúdo
    const conteudo = document.createElement('div');
    conteudo.className = 'modal-conteudo';
    conteudo.style.animation = `${animacao} 0.3s ease`;
    conteudo.innerHTML = conteudoHTML;

    overlay.appendChild(conteudo);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    // Guardar referência
    const modalInfo = {
        overlay,
        conteudo,
        aoFechar,
        id: Date.now()
    };
    estadoModais.modaisAbertos.push(modalInfo);
    estadoModais.historicoModais.push(modalInfo);

    // Fechar ao clicar fora
    if (fecharAoCliqueFora) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                fecharModal(modalInfo.id);
            }
        });
    }

    // Callback
    if (aoAbrir) aoAbrir(conteudo);

    return modalInfo.id;
}

// ========== FECHAR MODAL ==========
function fecharModal(modalId) {
    const index = estadoModais.modaisAbertos.findIndex(m => m.id === modalId);
    if (index === -1) return;

    const modalInfo = estadoModais.modaisAbertos[index];

    // Animação de saída
    modalInfo.overlay.style.animation = 'fadeIn 0.2s ease reverse';
    modalInfo.conteudo.style.animation = 'fadeInScale 0.2s ease reverse';

    setTimeout(() => {
        modalInfo.overlay.remove();
        estadoModais.modaisAbertos.splice(index, 1);

        if (estadoModais.modaisAbertos.length === 0) {
            document.body.classList.remove('modal-aberto');
        }

        // Callback
        if (modalInfo.aoFechar) modalInfo.aoFechar();
    }, 200);
}

function fecharModalAtual(animar = true) {
    if (estadoModais.modaisAbertos.length === 0) return;

    const modalAtual = estadoModais.modaisAbertos[estadoModais.modaisAbertos.length - 1];

    if (animar) {
        fecharModal(modalAtual.id);
    } else {
        modalAtual.overlay.remove();
        estadoModais.modaisAbertos.pop();
        if (estadoModais.modaisAbertos.length === 0) {
            document.body.classList.remove('modal-aberto');
        }
    }
}

function fecharTodosModais() {
    while (estadoModais.modaisAbertos.length > 0) {
        fecharModalAtual(false);
    }
}

// ========== MODAL DE VÍDEO (ANTI-NAVEGAÇÃO) ==========
function abrirModalVideo(musica) {
    if (!musica || !musica.linkYoutube) {
        mostrarToast('Link do vídeo não disponível', 'erro');
        return;
    }

    // Extrair ID do YouTube
    const youtubeId = extrairYoutubeId(musica.linkYoutube);
    if (!youtubeId) {
        mostrarToast('Link do YouTube inválido', 'erro');
        return;
    }

    const artista = buscarArtista(musica.artistaId);
    const nomeArtista = artista ? artista.nome : 'Artista';

    const conteudoHTML = `
        <div class="video-topo">
            <span class="video-titulo-modal">🎬 ${musica.titulo} - ${nomeArtista}</span>
            <button class="btn-fechar-video" onclick="window.modal.fecharAtual()">✕</button>
        </div>
        <div class="video-container">
            <div class="camada-protetora"></div>
            <iframe
                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&controls=0&modestbranding=1&showinfo=0"
                title="${musica.titulo}"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
        </div>
        <div class="video-info">
            <h4 class="video-titulo-info">${musica.titulo}</h4>
            <p class="video-artista-info">${nomeArtista}</p>
            <div class="video-acoes">
                <button class="btn-video-acao" onclick="window.player.destrancar('${musica.id}')">
                    🔓 Destrancar
                </button>
                <button class="btn-video-acao" onclick="window.player.baixar('${musica.id}', 'video')">
                    ⬇ Baixar Vídeo
                </button>
                <button class="btn-video-acao" onclick="window.player.baixar('${musica.id}', 'audio')">
                    🎵 Baixar Áudio
                </button>
            </div>
        </div>
        <div class="aviso-navegacao">
            <span class="aviso-icone">⚠️</span>
            Conteúdo oficial. A navegação externa está bloqueada para proteger os direitos do artista.
        </div>
    `;

    return abrirModal(conteudoHTML, {
        classeExtra: 'modal-video',
        fecharAoCliqueFora: false,
        animacao: 'modalSlideUp',
        aoFechar: () => {
            // Parar vídeo ao fechar (o iframe é removido)
            console.log('📹 Modal de vídeo fechado');
        }
    });
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function abrirModalConfirmacao(mensagem, onConfirmar, onCancelar = null) {
    const conteudoHTML = `
        <div class="confirmacao-icone">⚠️</div>
        <p class="confirmacao-mensagem">${mensagem}</p>
        <div class="confirmacao-botoes">
            <button class="btn-nao" id="btn-cancelar-confirmacao">Cancelar</button>
            <button class="btn-sim" id="btn-confirmar-confirmacao">Confirmar</button>
        </div>
    `;

    const modalId = abrirModal(conteudoHTML, {
        classeExtra: 'modal-confirmacao',
        fecharAoCliqueFora: true
    });

    // Aguardar DOM atualizar
    setTimeout(() => {
        document.getElementById('btn-confirmar-confirmacao')?.addEventListener('click', () => {
            fecharModal(modalId);
            if (onConfirmar) onConfirmar();
        });

        document.getElementById('btn-cancelar-confirmacao')?.addEventListener('click', () => {
            fecharModal(modalId);
            if (onCancelar) onCancelar();
        });
    }, 100);

    return modalId;
}

// ========== MODAL DE ARTISTA (VISUALIZAÇÃO RÁPIDA) ==========
function abrirModalArtista(artistaId) {
    const artista = buscarArtista(artistaId);
    if (!artista) return;

    const musicasArtista = buscarMusicasPorArtista(artistaId);

    const conteudoHTML = `
        <img src="${artista.fotoCapa}" alt="${artista.nome}" class="artista-capa-modal">
        <img src="${artista.fotoPerfil}" alt="${artista.nome}" class="artista-foto-modal">
        <div class="artista-info-modal">
            <h3 class="artista-nome-modal">${artista.nome}</h3>
            <p class="artista-genero-modal">${artista.genero.join(' • ')}</p>
            <div class="artista-redes-modal">
                ${Object.entries(artista.redesSociais).map(([rede, link]) => `
                    <a href="${link}" target="_blank" class="link-rede" onclick="event.stopPropagation()">
                        ${rede.charAt(0).toUpperCase() + rede.slice(1)}
                    </a>
                `).join('')}
            </div>
            ${musicasArtista.length > 0 ? `
                <div style="margin-top: 1rem; text-align: left;">
                    <h4 style="margin-bottom: 0.5rem;">🎵 Músicas (${musicasArtista.length})</h4>
                    ${musicasArtista.map(m => `
                        <div class="card-musica-h" data-musica-id="${m.id}" style="margin-bottom: 0.5rem;">
                            <img src="${m.capa}" class="capa-musica" alt="${m.titulo}">
                            <div class="info-musica">
                                <div class="titulo-musica">${m.titulo}</div>
                                <div class="artista-musica">${m.ano} • ${m.duracao}</div>
                            </div>
                            <button class="btn-icone-pequeno" onclick="event.stopPropagation(); window.player.tocar(buscarMusica('${m.id}'))">▶</button>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    return abrirModal(conteudoHTML, {
        classeExtra: 'modal-artista',
        animacao: 'modalSlideUp'
    });
}

// ========== MODAL DE IMAGEM (FULLSCREEN) ==========
function abrirModalImagem(src, alt = '') {
    const conteudoHTML = `
        <button class="fechar-imagem" onclick="window.modal.fecharAtual()">✕</button>
        <img src="${src}" alt="${alt}" class="imagem-full">
    `;

    return abrirModal(conteudoHTML, {
        classeExtra: 'modal-imagem',
        fecharAoCliqueFora: true,
        animacao: 'zoomIn'
    });
}

// ========== MODAL DE POSTAGEM RÁPIDA ==========
function abrirModalPostagem(linkPreenchido = '') {
    const plataformas = buscarPlataformasRegistadas();

    const conteudoHTML = `
        <div class="postagem-header">
            <h3 class="postagem-titulo">Nova Postagem</h3>
            <button class="fechar-postagem" onclick="window.modal.fecharAtual()">✕</button>
        </div>
        <div class="postagem-body">
            <div class="campo">
                <label for="post-titulo">Título *</label>
                <input type="text" id="post-titulo" placeholder="Título da postagem" required>
            </div>
            <div class="campo">
                <label for="post-link">Link *</label>
                <input type="url" id="post-link" placeholder="https://..." value="${linkPreenchido}" required>
            </div>
            <div class="preview-link" id="preview-link">
                ${linkPreenchido ? '<p>🔗 Preview será carregado...</p>' : '<p>📎 Cole um link para ver a pré-visualização</p>'}
            </div>
            <div class="campo">
                <label>Visibilidade *</label>
                <div class="radio-group">
                    <label class="radio-opcao">
                        <input type="radio" name="visibilidade" value="publico" checked> 🌍 Público
                    </label>
                    <label class="radio-opcao">
                        <input type="radio" name="visibilidade" value="privado"> 🔒 Privado
                    </label>
                </div>
            </div>
            <p style="font-size: 0.75rem; color: var(--texto-terciario); margin-bottom: 1rem;">
                Ou selecione uma plataforma registada:
            </p>
            <div class="lista-plataformas" style="grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                ${plataformas.map(p => `
                    <div class="plataforma-item" onclick="window.modal.selecionarPlataforma('${p.url}')" style="padding: 0.5rem; font-size: 0.75rem;">
                        <span>🔗</span> ${p.nome}
                    </div>
                `).join('')}
            </div>
            <button class="btn-principal" onclick="window.modal.enviarPostagem()" style="margin-top: 1rem;">
                📤 Enviar para Aprovação
            </button>
        </div>
    `;

    return abrirModal(conteudoHTML, {
        classeExtra: 'modal-postagem',
        animacao: 'modalSlideUp'
    });
}

// ========== MODAL DE SUPORTE ==========
function abrirModalSuporte() {
    const conteudoHTML = `
        <h3 class="suporte-titulo">📞 Precisa de Ajuda?</h3>
        <p class="suporte-descricao">Escolha um dos nossos canais de suporte:</p>
        <div class="suporte-opcoes">
            <a href="https://wa.me/SEUNUMERO" target="_blank" class="suporte-opcao">
                <span class="suporte-icone">💬</span>
                <span class="suporte-nome">WhatsApp</span>
            </a>
            <a href="https://t.me/SEUUSERNAME" target="_blank" class="suporte-opcao">
                <span class="suporte-icone">📨</span>
                <span class="suporte-nome">Telegram</span>
            </a>
            <a href="tel:SEUNUMERO" class="suporte-opcao">
                <span class="suporte-icone">📞</span>
                <span class="suporte-nome">Ligar</span>
            </a>
            <a href="sms:SEUNUMERO" class="suporte-opcao">
                <span class="suporte-icone">📱</span>
                <span class="suporte-nome">SMS</span>
            </a>
        </div>
    `;

    return abrirModal(conteudoHTML, {
        classeExtra: 'modal-suporte'
    });
}

// ========== CONFIGURAR LINKS DE VÍDEO ==========
function configurarLinksVideo() {
    document.addEventListener('click', function (e) {
        const linkVideo = e.target.closest('[data-acao="ver-video"]');
        if (!linkVideo) return;

        e.preventDefault();
        const musicaId = linkVideo.dataset.musicaId;
        if (musicaId) {
            const musica = buscarMusica(musicaId);
            if (musica) {
                abrirModalVideo(musica);
            }
        }
    });
}

// ========== CONFIGURAR BOTÕES FECHAR ==========
function configurarBotoesFechar() {
    document.addEventListener('click', function (e) {
        if (e.target.matches('.fechar-modal, [data-acao="fechar-modal"]')) {
            e.preventDefault();
            fecharModalAtual();
        }
    });
}

// ========== SELEcionar PLATAFORMA (POSTAGEM) ==========
function selecionarPlataforma(urlBase) {
    // Esta função é chamada do modal de postagem
    // Leva o usuário ao perfil da plataforma para escolher conteúdo
    const linkInput = document.getElementById('post-link');
    if (linkInput) {
        linkInput.value = urlBase + '/';
        linkInput.focus();
    }

    mostrarToast('🔗 Cole o link completo do conteúdo que deseja partilhar', 'info');
}

// ========== ENVIAR POSTAGEM ==========
function enviarPostagem() {
    const titulo = document.getElementById('post-titulo')?.value.trim();
    const link = document.getElementById('post-link')?.value.trim();
    const visibilidade = document.querySelector('input[name="visibilidade"]:checked')?.value;

    if (!titulo) {
        mostrarToast('Título é obrigatório', 'erro');
        return;
    }

    if (!link) {
        mostrarToast('Link é obrigatório', 'erro');
        return;
    }

    if (!visibilidade) {
        mostrarToast('Selecione a visibilidade', 'erro');
        return;
    }

    // Simular envio para aprovação
    console.log('📤 Postagem enviada para aprovação:', { titulo, link, visibilidade });

    fecharModalAtual();

    // Simular email para o admin
    setTimeout(() => {
        mostrarToast('📧 Postagem enviada para aprovação! Receberá uma notificação em breve.', 'sucesso');
    }, 500);
}

// ========== UTILITÁRIAS ==========
function extrairYoutubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function mostrarToast(mensagem, tipo = 'info') {
    // Usa o toast do player ou cria um próprio
    if (window.player?.mostrarToast) {
        // Não exposto publicamente, criar aqui
    }

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
    }, 3500);
}

// ========== EXPORTAR ==========
window.modal = {
    inicializar: inicializarModais,
    abrir: abrirModal,
    fechar: fecharModal,
    fecharAtual: fecharModalAtual,
    fecharTodos: fecharTodosModais,
    video: abrirModalVideo,
    confirmacao: abrirModalConfirmacao,
    artista: abrirModalArtista,
    imagem: abrirModalImagem,
    postagem: abrirModalPostagem,
    suporte: abrirModalSuporte,
    selecionarPlataforma: selecionarPlataforma,
    enviarPostagem: enviarPostagem
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarModais);

console.log('🪟 Modais prontos! (Vídeo anti-navegação incluso)');