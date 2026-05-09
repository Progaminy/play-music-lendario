/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: offline.js - Download e Modo Offline
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_OFFLINE = {
    chaveStorage: 'musica-alendaria-offline',
    maxOffline: 50,
    formatosAudio: ['mp3', 'aac', 'ogg'],
    formatosVideo: ['mp4', 'webm'],
    qualidadePadrao: 'alta' // 'baixa', 'media', 'alta'
};

// ========== ESTADO ==========
const estadoOffline = {
    downloads: [],        // Downloads concluídos
    downloadAtivo: null,  // Download em progresso
    filaDownload: [],     // Fila de downloads
    progressoAtual: 0,    // Progresso do download atual
    qualidade: CONFIG_OFFLINE.qualidadePadrao,
    espacoUsado: 0,       // MB usados
    espacoTotal: 500      // MB disponíveis (simulado)
};

// ========== INICIALIZAÇÃO ==========
function inicializarOffline() {
    // Carregar downloads do usuário
    carregarDownloads();

    // Configurar UI
    configurarPaginaOffline();
    configurarBotoesDownload();
    configurarIndicadorEspaco();

    // Verificar armazenamento disponível
    verificarArmazenamento();

    console.log('📲 Sistema offline pronto!');
}

// ========== CARREGAR DOWNLOADS ==========
function carregarDownloads() {
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario && usuario.offline) {
        estadoOffline.downloads = usuario.offline.map(id => ({
            musicaId: id,
            dataDownload: new Date().toISOString(),
            tipo: 'audio',
            tamanho: Math.floor(Math.random() * 8) + 3 // 3-10 MB simulados
        }));
    } else {
        const saved = localStorage.getItem(CONFIG_OFFLINE.chaveStorage);
        estadoOffline.downloads = saved ? JSON.parse(saved) : [];
    }

    // Calcular espaço usado
    estadoOffline.espacoUsado = estadoOffline.downloads.reduce((total, d) => total + (d.tamanho || 5), 0);
}

// ========== SALVAR DOWNLOADS ==========
function salvarDownloads() {
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario) {
        usuario.offline = estadoOffline.downloads.map(d => d.musicaId);
        window.auth.atualizarPerfil({ offline: usuario.offline });
    }
    localStorage.setItem(CONFIG_OFFLINE.chaveStorage, JSON.stringify(estadoOffline.downloads));
}

// ========== BAIXAR MÚSICA ==========
function baixarMusica(musicaId, tipo = 'audio', qualidade = null) {
    const musica = buscarMusica(musicaId);
    if (!musica) {
        mostrarToastOffline('Música não encontrada', 'erro');
        return;
    }

    // Verificar se já foi destrancado
    const estadoPlayer = window.player?.getEstado();
    if (!estadoPlayer?.estaDestrancado) {
        mostrarToastOffline('Destranque a música primeiro para baixar', 'aviso');
        return;
    }

    // Verificar se já está offline
    const jaBaixado = estadoOffline.downloads.find(d => d.musicaId === musicaId && d.tipo === tipo);
    if (jaBaixado) {
        mostrarToastOffline(`${tipo === 'audio' ? 'Áudio' : 'Vídeo'} já está offline!`, 'info');
        return;
    }

    // Verificar espaço disponível
    const tamanhoEstimado = tipo === 'video' ? 25 : 5;
    if (estadoOffline.espacoUsado + tamanhoEstimado > estadoOffline.espacoTotal) {
        mostrarToastOffline('Espaço insuficiente! Libere espaço para baixar.', 'erro');
        return;
    }

    // Verificar limite de downloads
    if (estadoOffline.downloads.length >= CONFIG_OFFLINE.maxOffline) {
        mostrarToastOffline(`Limite de ${CONFIG_OFFLINE.maxOffline} itens offline atingido.`, 'erro');
        return;
    }

    // Adicionar à fila
    const itemDownload = {
        id: 'download-' + Date.now(),
        musicaId: musicaId,
        musicaTitulo: musica.titulo,
        artistaId: musica.artistaId,
        tipo: tipo,
        qualidade: qualidade || estadoOffline.qualidade,
        progresso: 0,
        status: 'na_fila',
        tamanho: tamanhoEstimado,
        dataInicio: new Date().toISOString()
    };

    estadoOffline.filaDownload.push(itemDownload);

    // Se não houver download ativo, iniciar
    if (!estadoOffline.downloadAtivo || estadoOffline.downloadAtivo.status === 'concluido') {
        processarFilaDownload();
    }

    mostrarToastOffline(`⬇ ${tipo === 'audio' ? 'Áudio' : 'Vídeo'} adicionado à fila de download`, 'info');
    atualizarFilaUI();
    atualizarIndicadorEspaco();
}

// ========== PROCESSAR FILA DE DOWNLOAD ==========
function processarFilaDownload() {
    if (estadoOffline.filaDownload.length === 0) {
        estadoOffline.downloadAtivo = null;
        return;
    }

    // Pegar próximo da fila
    const item = estadoOffline.filaDownload.shift();
    estadoOffline.downloadAtivo = item;
    item.status = 'baixando';

    console.log(`⬇ Iniciando download: ${item.musicaTitulo} (${item.tipo})`);

    // Simular progresso de download
    item.progresso = 0;
    const intervalo = setInterval(() => {
        item.progresso += Math.random() * 20 + 5;

        if (item.progresso >= 100) {
            item.progresso = 100;
            clearInterval(intervalo);

            // Download concluído
            concluirDownload(item);
        }

        atualizarProgressoDownload(item);
    }, 300);
}

// ========== CONCLUIR DOWNLOAD ==========
function concluirDownload(item) {
    item.status = 'concluido';
    item.dataConclusao = new Date().toISOString();

    // Adicionar aos downloads
    estadoOffline.downloads.push({
        id: item.id,
        musicaId: item.musicaId,
        tipo: item.tipo,
        tamanho: item.tamanho,
        dataDownload: item.dataConclusao,
        qualidade: item.qualidade
    });

    // Atualizar espaço usado
    estadoOffline.espacoUsado += item.tamanho;

    // Salvar
    salvarDownloads();

    // Registrar como like
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario) {
        adicionarOffline(usuario, item.musicaId);
    }

    // Feedback
    const musica = buscarMusica(item.musicaId);
    const artista = musica ? buscarArtista(musica.artistaId) : null;

    mostrarToastOffline(
        `✅ ${item.tipo === 'audio' ? '🎵' : '🎬'} "${musica?.titulo || ''}" baixado com sucesso!`,
        'sucesso'
    );

    // Notificar service worker (se existir)
    notificarServiceWorker(item);

    // Processar próximo da fila
    estadoOffline.downloadAtivo = null;
    atualizarIndicadorEspaco();
    atualizarFilaUI();
    atualizarListaOffline();

    if (estadoOffline.filaDownload.length > 0) {
        setTimeout(processarFilaDownload, 500);
    }
}

// ========== NOTIFICAR SERVICE WORKER ==========
function notificarServiceWorker(item) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            tipo: 'cache-musica',
            musicaId: item.musicaId,
            tipoMidia: item.tipo
        });
        console.log('📲 Service Worker notificado para cache');
    }
}

// ========== ATUALIZAR PROGRESSO ==========
function atualizarProgressoDownload(item) {
    const progressoBarra = document.getElementById(`progresso-${item.id}`);
    if (progressoBarra) {
        progressoBarra.style.width = `${item.progresso}%`;
        progressoBarra.textContent = `${Math.round(item.progresso)}%`;
    }

    // Atualizar ícone de download
    const downloadItem = document.querySelector(`[data-download-id="${item.id}"]`);
    if (downloadItem) {
        const statusEl = downloadItem.querySelector('.download-status');
        if (statusEl) {
            statusEl.textContent = `${Math.round(item.progresso)}%`;
        }
    }
}

// ========== CANCELAR DOWNLOAD ==========
function cancelarDownload(downloadId) {
    // Remover da fila se ainda não iniciou
    estadoOffline.filaDownload = estadoOffline.filaDownload.filter(d => d.id !== downloadId);

    // Cancelar se for o download ativo
    if (estadoOffline.downloadAtivo?.id === downloadId) {
        estadoOffline.downloadAtivo.status = 'cancelado';
        estadoOffline.downloadAtivo = null;
        mostrarToastOffline('Download cancelado', 'info');

        // Processar próximo
        if (estadoOffline.filaDownload.length > 0) {
            processarFilaDownload();
        }
    }

    atualizarFilaUI();
}

// ========== REMOVER ITEM OFFLINE ==========
function removerOffline(musicaId, tipo) {
    const index = estadoOffline.downloads.findIndex(d => d.musicaId === musicaId && d.tipo === tipo);
    if (index === -1) return;

    const item = estadoOffline.downloads[index];

    window.modal?.confirmacao(
        `Remover ${tipo === 'audio' ? 'áudio' : 'vídeo'} offline?`,
        () => {
            // Liberar espaço
            estadoOffline.espacoUsado -= item.tamanho;
            estadoOffline.downloads.splice(index, 1);
            salvarDownloads();
            atualizarIndicadorEspaco();
            atualizarListaOffline();
            mostrarToastOffline('🗑️ Item offline removido', 'info');
        }
    );
}

// ========== VERIFICAR ARMAZENAMENTO ==========
function verificarArmazenamento() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
            const usado = estimate.usage || 0;
            const total = estimate.quota || 0;
            estadoOffline.espacoTotal = Math.floor(total / (1024 * 1024));
            estadoOffline.espacoUsado = Math.floor(usado / (1024 * 1024));
            atualizarIndicadorEspaco();
        });
    }
}

// ========== TOGGLE MODO OFFLINE ==========
function toggleModoOffline() {
    const body = document.body;
    const isOffline = body.classList.toggle('modo-offline');

    if (isOffline) {
        // Filtrar apenas conteúdo offline
        mostrarToastOffline('📡 Modo offline ativado', 'info');
        document.dispatchEvent(new CustomEvent('modo-offline-ativado'));
    } else {
        mostrarToastOffline('🌐 Modo online restaurado', 'info');
        document.dispatchEvent(new CustomEvent('modo-offline-desativado'));
    }

    return isOffline;
}

// ========== OBTER MÚSICAS OFFLINE ==========
function getMusicasOffline() {
    return estadoOffline.downloads
        .map(d => {
            const musica = buscarMusica(d.musicaId);
            if (musica) {
                return {
                    ...musica,
                    tipoDownload: d.tipo,
                    dataDownload: d.dataDownload,
                    tamanho: d.tamanho
                };
            }
            return null;
        })
        .filter(m => m !== null);
}

// ========== VERIFICAR SE ESTÁ OFFLINE ==========
function isMusicaOffline(musicaId) {
    return estadoOffline.downloads.some(d => d.musicaId === musicaId);
}

// ========== CONFIGURAR PÁGINA OFFLINE ==========
function configurarPaginaOffline() {
    const container = document.querySelector('.offline-container');
    if (!container) return;

    renderizarPaginaOffline(container);
}

function renderizarPaginaOffline(container) {
    const musicasOffline = getMusicasOffline();

    if (musicasOffline.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <div class="vazio-icone">📲</div>
                <h4 class="vazio-titulo">Nenhum conteúdo offline</h4>
                <p class="vazio-descricao">
                    Baixe músicas para ouvir sem internet. Toque no ícone ⬇ em qualquer música.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="offline-info">
            <div class="offline-espaco">
                <span>💾 ${estadoOffline.espacoUsado} MB / ${estadoOffline.espacoTotal} MB</span>
                <div class="barra-espaco">
                    <div class="barra-espaco-preenchida" style="width: ${(estadoOffline.espacoUsado / estadoOffline.espacoTotal) * 100}%"></div>
                </div>
            </div>
            <p style="font-size: 0.8rem; color: var(--texto-terciario);">
                ${musicasOffline.length} itens offline • ${estadoOffline.downloads.filter(d => d.tipo === 'audio').length} áudios • ${estadoOffline.downloads.filter(d => d.tipo === 'video').length} vídeos
            </p>
        </div>
        <div class="lista-musicas">
            ${musicasOffline.map((m, i) => {
                const artista = buscarArtista(m.artistaId);
                const downloadInfo = estadoOffline.downloads.find(d => d.musicaId === m.id);
                return `
                    <div class="card-musica-h stagger-item" style="animation-delay: ${i * 0.05}s">
                        <img src="${m.capa}" alt="${m.titulo}" class="capa-musica">
                        <div class="info-musica">
                            <div class="titulo-musica">${m.titulo}</div>
                            <div class="artista-musica">${artista?.nome || ''}</div>
                            <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.25rem;">
                                <span class="badge badge-contorno">${downloadInfo?.tipo === 'audio' ? '🎵 Áudio' : '🎬 Vídeo'}</span>
                                <span style="font-size: 0.7rem; color: var(--texto-terciario);">${downloadInfo?.tamanho || '?'} MB</span>
                            </div>
                        </div>
                        <div class="acoes-musica">
                            <button class="btn-icone-pequeno" 
                                    onclick="event.stopPropagation(); window.player.tocar(buscarMusica('${m.id}'), true)"
                                    title="Tocar offline">▶</button>
                            <button class="btn-icone-pequeno" 
                                    onclick="event.stopPropagation(); window.offline.remover('${m.id}', '${downloadInfo?.tipo || 'audio'}')"
                                    title="Remover">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ========== CONFIGURAR BOTÕES DE DOWNLOAD ==========
function configurarBotoesDownload() {
    document.addEventListener('click', function (e) {
        const btnDownload = e.target.closest('[data-acao="baixar"]');
        if (!btnDownload) return;

        e.preventDefault();
        e.stopPropagation();

        const musicaId = btnDownload.dataset.musicaId;
        const tipo = btnDownload.dataset.tipo || 'audio';

        if (musicaId) {
            baixarMusica(musicaId, tipo);
        }
    });
}

// ========== CONFIGURAR INDICADOR DE ESPAÇO ==========
function configurarIndicadorEspaco() {
    atualizarIndicadorEspaco();
}

function atualizarIndicadorEspaco() {
    const indicador = document.querySelector('.offline-espaco-indicador');
    if (!indicador) return;

    const percentual = (estadoOffline.espacoUsado / estadoOffline.espacoTotal) * 100;
    indicador.innerHTML = `
        <span>💾 ${estadoOffline.espacoUsado}/${estadoOffline.espacoTotal} MB</span>
        <div class="barra-espaco-mini">
            <div style="width: ${percentual}%; height: 100%; background: ${percentual > 80 ? 'var(--cor-secundaria)' : 'var(--cor-acento)'}; border-radius: 2px;"></div>
        </div>
    `;
}

// ========== ATUALIZAR FILA UI ==========
function atualizarFilaUI() {
    const filaContainer = document.querySelector('.fila-download');
    if (!filaContainer) return;

    const filaItens = [];

    // Download ativo
    if (estadoOffline.downloadAtivo && estadoOffline.downloadAtivo.status === 'baixando') {
        filaItens.push(estadoOffline.downloadAtivo);
    }

    // Fila de espera
    filaItens.push(...estadoOffline.filaDownload);

    if (filaItens.length === 0) {
        filaContainer.innerHTML = '';
        filaContainer.classList.add('hidden');
        return;
    }

    filaContainer.classList.remove('hidden');
    filaContainer.innerHTML = `
        <h4 style="margin-bottom: 0.5rem;">📥 Downloads (${filaItens.length})</h4>
        ${filaItens.map(item => `
            <div class="fila-item" data-download-id="${item.id}">
                <span>${item.status === 'baixando' ? '⬇' : '⏳'} ${item.musicaTitulo}</span>
                <span class="download-status">${item.status === 'baixando' ? `${Math.round(item.progresso)}%` : 'Na fila'}</span>
                ${item.status === 'baixando' ? `
                    <div class="barra-progresso-download">
                        <div id="progresso-${item.id}" style="width: ${item.progresso}%; height: 100%; background: var(--cor-acento); border-radius: 2px; transition: width 0.3s;"></div>
                    </div>
                ` : ''}
                <button class="btn-icone-pequeno" onclick="window.offline.cancelar('${item.id}')">✕</button>
            </div>
        `).join('')}
    `;
}

// ========== ATUALIZAR LISTA OFFLINE ==========
function atualizarListaOffline() {
    const container = document.querySelector('.offline-container');
    if (container) {
        renderizarPaginaOffline(container);
    }
}

// ========== TOAST ==========
function mostrarToastOffline(mensagem, tipo = 'info') {
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
    }, 3000);
}

// ========== LIMPAR CACHE OFFLINE ==========
function limparCacheOffline() {
    window.modal?.confirmacao(
        'Tem certeza que deseja remover todo o conteúdo offline?',
        () => {
            estadoOffline.downloads = [];
            estadoOffline.espacoUsado = 0;
            estadoOffline.filaDownload = [];
            estadoOffline.downloadAtivo = null;
            salvarDownloads();
            atualizarIndicadorEspaco();
            atualizarFilaUI();
            atualizarListaOffline();
            mostrarToastOffline('🗑️ Cache offline limpo!', 'info');
        }
    );
}

// ========== EXPORTAR ==========
window.offline = {
    inicializar: inicializarOffline,
    baixar: baixarMusica,
    cancelar: cancelarDownload,
    remover: removerOffline,
    toggleModo: toggleModoOffline,
    isOffline: isMusicaOffline,
    getMusicas: getMusicasOffline,
    limparCache: limparCacheOffline,
    getEstado: () => estadoOffline
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarOffline);

console.log('📲 Offline pronto! (Download e modo offline)');