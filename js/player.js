/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: player.js - Player com 30s e Like
   ============================================= */

const CONFIG_PLAYER = {
    tempoGratuito: 30,
    volumePadrao: 0.7,
    chaveStorage: 'musica-alendaria-player'
};

const estadoPlayer = {
    posteAtual: null,
    estaTocando: false,
    tempoAtual: 0,
    duracaoTotal: 0,
    estaDestrancado: false,
    volume: CONFIG_PLAYER.volumePadrao,
    timer30s: null,
    segundosRestantes: CONFIG_PLAYER.tempoGratuito,
    iframeElement: null,
    videoIdAtual: null,
    likesRegistados: {}
};

// ========== INICIALIZAÇÃO ==========
function inicializarPlayer() {
    configurarPlayerFixo();
    carregarLikes();
    console.log('🎧 Player pronto!');
}

// ========== CARREGAR LIKES ==========
function carregarLikes() {
    try {
        const saved = localStorage.getItem('musica-alendaria-likes');
        estadoPlayer.likesRegistados = saved ? JSON.parse(saved) : {};
    } catch (e) {
        estadoPlayer.likesRegistados = {};
    }
}

function salvarLikes() {
    localStorage.setItem('musica-alendaria-likes', JSON.stringify(estadoPlayer.likesRegistados));
}

// ========== TOCAR VÍDEO (IFRAME) ==========
function tocarVideo(poste) {
    if (!poste || !poste.link) return;

    const videoId = extrairYoutubeId(poste.link);
    if (!videoId) {
        mostrarToast('Link do YouTube inválido', 'erro');
        return;
    }

    estadoPlayer.posteAtual = poste;
    estadoPlayer.videoIdAtual = videoId;
    estadoPlayer.estaDestrancado = poste.bloqueio === 'nao-bloquear';
    estadoPlayer.tempoAtual = 0;
    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;

    // Criar ou atualizar iframe no player fixo
    criarIframePlayer(videoId);

    // Atualizar UI
    atualizarInfoPlayer(poste);
    atualizarTimer30sDisplay();
    atualizarBotaoDestrancar();

    // Iniciar timer 30s se bloqueado
    if (!estadoPlayer.estaDestrancado) {
        iniciarTimer30s();
    } else {
        pararTimer30s();
        // Registrar like automático (assistir completo livre)
        registrarLikeAutomatico(poste.id);
    }

    estadoPlayer.estaTocando = true;
    atualizarBotaoPlay();
}

// ========== CRIAR IFRAME NO PLAYER ==========
function criarIframePlayer(videoId) {
    // Remover iframe antigo
    const playerContainer = document.getElementById('player-iframe-container');
    if (playerContainer) {
        playerContainer.innerHTML = `
            <iframe id="player-iframe" 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0"
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen
                style="border: none;">
            </iframe>
        `;
    }

    estadoPlayer.iframeElement = document.getElementById('player-iframe');
}

// ========== PAUSAR ==========
function pausarVideo() {
    estadoPlayer.estaTocando = false;
    pararTimer30s();
    atualizarBotaoPlay();

    // Pausar iframe (postMessage para YouTube)
    if (estadoPlayer.iframeElement) {
        estadoPlayer.iframeElement.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
        );
    }
}

// ========== ALTERNAR PLAY/PAUSE ==========
function alternarPlayPause() {
    if (!estadoPlayer.posteAtual) return;

    if (estadoPlayer.estaTocando) {
        pausarVideo();
    } else {
        if (!estadoPlayer.estaDestrancado && estadoPlayer.segundosRestantes <= 0) {
            mostrarModalDestrancar(estadoPlayer.posteAtual);
            return;
        }

        estadoPlayer.estaTocando = true;
        atualizarBotaoPlay();

        if (estadoPlayer.iframeElement) {
            estadoPlayer.iframeElement.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
            );
        }

        if (!estadoPlayer.estaDestrancado) {
            iniciarTimer30s();
        }
    }
}

// ========== TIMER 30 SEGUNDOS ==========
function iniciarTimer30s() {
    if (estadoPlayer.estaDestrancado) return;
    pararTimer30s();
    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;

    estadoPlayer.timer30s = setInterval(() => {
        estadoPlayer.segundosRestantes--;
        atualizarTimer30sDisplay();

        if (estadoPlayer.segundosRestantes <= 10) {
            const timerEl = document.querySelector('.timer-30s');
            if (timerEl && !timerEl.classList.contains('esgotado')) {
                timerEl.style.animation = 'blink 0.5s ease-in-out 3';
            }
        }

        if (estadoPlayer.segundosRestantes <= 0) {
            pausarVideo();
            pararTimer30s();
            mostrarModalDestrancar(estadoPlayer.posteAtual);
        }
    }, 1000);
}

function pararTimer30s() {
    if (estadoPlayer.timer30s) {
        clearInterval(estadoPlayer.timer30s);
        estadoPlayer.timer30s = null;
    }
}

// ========== DESTRANCAR ==========
function destrancarVideo(posteId) {
    const poste = posteId ? estadoPlayer.posteAtual : estadoPlayer.posteAtual;
    if (!poste) return;

    estadoPlayer.estaDestrancado = true;
    pararTimer30s();
    atualizarBotaoDestrancar();
    atualizarTimer30sDisplay();

    // Registrar like automático (desbloqueio conta como like)
    registrarLikeAutomatico(poste.id);

    // Retomar reprodução
    estadoPlayer.estaTocando = true;
    atualizarBotaoPlay();

    if (estadoPlayer.iframeElement) {
        estadoPlayer.iframeElement.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
        );
    }

    animarDestrancar();
    mostrarToast('🔓 Vídeo destrancado!', 'sucesso');

    // Também atualizar o poste original no localStorage
    const postes = JSON.parse(localStorage.getItem('musica-alendaria-postes') || '[]');
    const index = postes.findIndex(p => p.id === poste.id);
    if (index !== -1) {
        postes[index].bloqueio = 'nao-bloquear';
        localStorage.setItem('musica-alendaria-postes', JSON.stringify(postes));
    }
}

// ========== LIKE (1 por usuário por música) ==========
function darLikeManual(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return false;

    const chave = `${usuario.id}_${posteId}`;

    if (estadoPlayer.likesRegistados[chave]) {
        mostrarToast('Já deu like nesta música', 'info');
        return false;
    }

    estadoPlayer.likesRegistados[chave] = true;
    salvarLikes();

    // Também atualizar no poste
    window.postagem?.darLike(posteId);

    // Animar coração
    const btnFav = document.querySelector('.player-fixo .btn-favorito');
    if (btnFav) {
        btnFav.textContent = '❤️';
        btnFav.style.animation = 'heartbeat 0.6s ease';
        setTimeout(() => { btnFav.style.animation = ''; }, 600);
    }

    mostrarToast('❤️ Like registado!', 'sucesso');
    return true;
}

function registrarLikeAutomatico(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return;

    const chave = `${usuario.id}_${posteId}`;

    if (!estadoPlayer.likesRegistados[chave]) {
        estadoPlayer.likesRegistados[chave] = true;
        salvarLikes();
        window.postagem?.registrarLike(posteId);
        console.log('❤️ Like automático registado');
    }
}

function jaDeuLikePlayer(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return false;
    const chave = `${usuario.id}_${posteId}`;
    return !!estadoPlayer.likesRegistados[chave];
}

// ========== MODAL DESTRANCAR ==========
function mostrarModalDestrancar(poste) {
    if (!poste) return;
    if (document.querySelector('.modal-destrancar')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-destrancar';
    overlay.innerHTML = `
        <div class="modal-conteudo">
            <div class="destrancar-icone">🔒</div>
            <h3 class="destrancar-titulo">30 segundos esgotados!</h3>
            <p class="destrancar-descricao">
                Destranque para assistir ao vídeo completo de <strong>${poste.artista}</strong>.
            </p>
            <div class="destrancar-beneficios">
                <div class="beneficio-item"><span class="check">✓</span> Vídeo completo sem restrições</div>
                <div class="beneficio-item"><span class="check">✓</span> Acesso ilimitado</div>
            </div>
            <button class="btn-confirmar-destrancar" id="btn-confirmar-destrancar">🔓 Destrancar Agora</button>
            <button class="btn-cancelar-destrancar" id="btn-cancelar-destrancar">Agora não</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    overlay.querySelector('#btn-confirmar-destrancar').addEventListener('click', () => {
        fecharModalDestrancar();
        destrancarVideo(poste.id);
    });

    overlay.querySelector('#btn-cancelar-destrancar').addEventListener('click', fecharModalDestrancar);
    overlay.addEventListener('click', function (e) {
        if (e.target === this) fecharModalDestrancar();
    });
}

function fecharModalDestrancar() {
    const modal = document.querySelector('.modal-destrancar');
    if (modal) {
        modal.classList.add('fechando');
        setTimeout(() => {
            modal.remove();
            document.body.classList.remove('modal-aberto');
        }, 250);
    }
}

// ========== UI ==========
function atualizarInfoPlayer(poste) {
    if (!poste) return;
    document.querySelectorAll('.player-titulo').forEach(el => el.textContent = poste.artista);
    document.querySelectorAll('.player-artista').forEach(el => el.textContent = poste.estilo || 'Diversa');

    const btnFav = document.querySelector('.player-fixo .btn-favorito');
    if (btnFav) {
        btnFav.textContent = jaDeuLikePlayer(poste.id) ? '❤️' : '🤍';
    }
}

function atualizarBotaoPlay() {
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.textContent = estadoPlayer.estaTocando ? '⏸' : '▶';
    });
    const playerFixo = document.querySelector('.player-fixo');
    if (playerFixo) {
        playerFixo.classList.toggle('tocando', estadoPlayer.estaTocando);
    }
}

function atualizarTimer30sDisplay() {
    document.querySelectorAll('.timer-30s').forEach(el => {
        if (estadoPlayer.estaDestrancado) {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
            el.textContent = `⏳ ${estadoPlayer.segundosRestantes}s`;
            el.classList.toggle('esgotado', estadoPlayer.segundosRestantes <= 10);
        }
    });
}

function atualizarBotaoDestrancar() {
    document.querySelectorAll('.btn-destrancar-player').forEach(btn => {
        if (estadoPlayer.estaDestrancado) {
            btn.classList.add('destrancado');
            btn.innerHTML = '🔓 Livre';
        } else {
            btn.classList.remove('destrancado');
            btn.innerHTML = '🔒 Destrancar';
        }
    });
}

function animarDestrancar() {
    const playerFixo = document.querySelector('.player-fixo');
    if (playerFixo) {
        playerFixo.style.animation = 'pulseStrong 0.6s ease';
        setTimeout(() => { playerFixo.style.animation = ''; }, 600);
    }
}

// ========== PLAYER FIXO ==========
function configurarPlayerFixo() {
    const playerFixo = document.querySelector('.player-fixo');
    if (!playerFixo) return;

    playerFixo.querySelector('.btn-play')?.addEventListener('click', alternarPlayPause);
    playerFixo.querySelector('.btn-favorito')?.addEventListener('click', function () {
        if (estadoPlayer.posteAtual) {
            darLikeManual(estadoPlayer.posteAtual.id);
        }
    });
}

// ========== EXTRAIR YOUTUBE ID ==========
function extrairYoutubeId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// ========== TOAST ==========
function mostrarToast(msg, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span class="toast-mensagem">${msg}</span>`;
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('saindo'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ========== EXPORTAR ==========
window.player = {
    inicializar: inicializarPlayer,
    tocar: tocarVideo,
    pausar: pausarVideo,
    alternar: alternarPlayPause,
    destrancar: destrancarVideo,
    darLike: darLikeManual,
    jaDeuLike: jaDeuLikePlayer,
    getEstado: () => estadoPlayer,
    getPosteAtual: () => estadoPlayer.posteAtual
};

document.addEventListener('DOMContentLoaded', inicializarPlayer);

console.log('🎧 Player pronto! (30s + Like único + Desbloqueio)');