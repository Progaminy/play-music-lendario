/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: player.js - Player Completo (15s)
   ============================================= */

const CONFIG_PLAYER = {
    tempoGratuito: 15,
    volumePadrao: 0.7,
    chaveStorage: 'musica-alendaria-player',
    chaveLikes: 'musica-alendaria-likes',
    chaveDesbloqueios: 'musica-alendaria-desbloqueios'
};

const estadoPlayer = {
    posteAtual: null,
    estaTocando: false,
    estaDestrancado: false,
    timer15s: null,
    segundosRestantes: CONFIG_PLAYER.tempoGratuito,
    iframeElement: null,
    videoIdAtual: null,
    likesRegistados: {},
    desbloqueiosRegistados: {}
};

// ========== INICIALIZAÇÃO ==========
function inicializarPlayer() {
    carregarDados();
    configurarPlayerFixo();
    console.log('🎧 Player pronto! (15s grátis)');
}

function carregarDados() {
    try {
        const likes = localStorage.getItem(CONFIG_PLAYER.chaveLikes);
        estadoPlayer.likesRegistados = likes ? JSON.parse(likes) : {};
        const desbloqueios = localStorage.getItem(CONFIG_PLAYER.chaveDesbloqueios);
        estadoPlayer.desbloqueiosRegistados = desbloqueios ? JSON.parse(desbloqueios) : {};
    } catch (e) {
        estadoPlayer.likesRegistados = {};
        estadoPlayer.desbloqueiosRegistados = {};
    }
}

function salvarLikes() {
    localStorage.setItem(CONFIG_PLAYER.chaveLikes, JSON.stringify(estadoPlayer.likesRegistados));
}

function salvarDesbloqueios() {
    localStorage.setItem(CONFIG_PLAYER.chaveDesbloqueios, JSON.stringify(estadoPlayer.desbloqueiosRegistados));
}

// ========== PARAR PLAYER ATUAL ==========
function pararPlayerAtual() {
    if (estadoPlayer.iframeElement) {
        estadoPlayer.iframeElement.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
        );
        estadoPlayer.iframeElement.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'stopVideo', args: [] }), '*'
        );
    }
    if (estadoPlayer.videoIdAtual) {
        const playerContainer = document.getElementById('player-iframe-container');
        if (playerContainer) playerContainer.innerHTML = '';
        estadoPlayer.iframeElement = null;
    }
    pararTimer15s();
    estadoPlayer.estaTocando = false;
    estadoPlayer.posteAtual = null;
    estadoPlayer.videoIdAtual = null;
    estadoPlayer.estaDestrancado = false;
    atualizarBotaoPlay();
    atualizarInfoPlayerVazia();
    atualizarTimer15sDisplay();
    atualizarBotaoDestrancar();
}

// ========== TOCAR VÍDEO ==========
function tocarVideo(poste) {
    if (!poste || !poste.link) return;

    // PARAR player anterior
    pararPlayerAtual();

    const videoId = extrairYoutubeId(poste.link);
    if (!videoId) {
        mostrarToast('Link do YouTube inválido', 'erro');
        return;
    }

    const usuario = window.auth?.getUsuarioAtual();

    // Verificar se é o DONO do poste
    const isDono = usuario && poste.usuarioId === usuario.id;

    // Se for dono, NUNCA bloqueia
    // Se não for dono, verifica se já desbloqueou
    let jaDesbloqueou = false;
    if (!isDono && usuario) {
        const chave = `${usuario.id}_${poste.id}`;
        jaDesbloqueou = !!estadoPlayer.desbloqueiosRegistados[chave];
    }

    estadoPlayer.posteAtual = poste;
    estadoPlayer.videoIdAtual = videoId;

    // Bloqueado só se: NÃO for dono, NÃO tiver desbloqueado, E a opção for 'bloquear'
    if (isDono) {
        estadoPlayer.estaDestrancado = true;
    } else if (poste.bloqueio === 'nao-bloquear') {
        estadoPlayer.estaDestrancado = true;
    } else if (jaDesbloqueou) {
        estadoPlayer.estaDestrancado = true;
    } else {
        estadoPlayer.estaDestrancado = false;
    }

    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;

    // Criar iframe no player (BLOQUEADO)
    criarIframePlayer(videoId);

    // Atualizar UI
    atualizarInfoPlayer(poste);
    atualizarTimer15sDisplay();
    atualizarBotaoDestrancar();

    // Iniciar
    estadoPlayer.estaTocando = true;
    atualizarBotaoPlay();

    if (!estadoPlayer.estaDestrancado) {
        iniciarTimer15s();
    } else {
        pararTimer15s();
        // Registrar like automático se não for dono
        if (!isDono) {
            registrarLikeAutomatico(poste.id);
        }
    }
}

// ========== CRIAR IFRAME (BLOQUEADO) ==========
function criarIframePlayer(videoId) {
    const container = document.getElementById('player-iframe-container');
    if (!container) return;

    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%;">
            <!-- CAMADA QUE BLOQUEIA QUALQUER CLIQUE NO IFRAME -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; cursor: default;" 
                 title="Controle pelo player"></div>
            <iframe id="player-iframe" 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&modestbranding=1&rel=0&enablejsapi=1&disablekb=1&iv_load_policy=3&showinfo=0"
                frameborder="0" 
                allow="encrypted-media"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; pointer-events: none;">
            </iframe>
        </div>
    `;

    estadoPlayer.iframeElement = document.getElementById('player-iframe');
}

// ========== PAUSAR ==========
function pausarVideo() {
    if (estadoPlayer.iframeElement) {
        estadoPlayer.iframeElement.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'
        );
    }
    estadoPlayer.estaTocando = false;
    pararTimer15s();
    atualizarBotaoPlay();
}

// ========== ALTERNAR PLAY/PAUSE ==========
function alternarPlayPause() {
    if (!estadoPlayer.posteAtual) return;

    if (estadoPlayer.estaTocando) {
        pausarVideo();
        return;
    }

    // Verificar se pode tocar
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
        iniciarTimer15s();
    }
}

// ========== TIMER 15 SEGUNDOS ==========
function iniciarTimer15s() {
    if (estadoPlayer.estaDestrancado) return;
    pararTimer15s();
    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;
    atualizarTimer15sDisplay();

    estadoPlayer.timer15s = setInterval(() => {
        estadoPlayer.segundosRestantes--;
        atualizarTimer15sDisplay();

        if (estadoPlayer.segundosRestantes <= 5) {
            const timerEl = document.querySelector('.player-fixo .timer-15s');
            if (timerEl && !timerEl.classList.contains('esgotado')) {
                timerEl.classList.add('esgotado');
            }
        }

        if (estadoPlayer.segundosRestantes <= 0) {
            pausarVideo();
            pararTimer15s();
            mostrarModalDestrancar(estadoPlayer.posteAtual);
        }
    }, 1000);
}

function pararTimer15s() {
    if (estadoPlayer.timer15s) {
        clearInterval(estadoPlayer.timer15s);
        estadoPlayer.timer15s = null;
    }
}

// ========== DESTRANCAR ==========
function destrancarVideo(posteId) {
    const poste = estadoPlayer.posteAtual;
    if (!poste) return;

    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return;

    // Mostrar modal de pagamento simulado
    mostrarModalPagamento(poste, () => {
        // Callback após pagamento
        estadoPlayer.estaDestrancado = true;
        pararTimer15s();
        atualizarBotaoDestrancar();
        atualizarTimer15sDisplay();

        // Guardar desbloqueio PERMANENTE
        const chave = `${usuario.id}_${poste.id}`;
        estadoPlayer.desbloqueiosRegistados[chave] = true;
        salvarDesbloqueios();

        // Registrar like automático
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
        mostrarToast('🔓 Conteúdo destrancado!', 'sucesso');
        console.log('🔓 Desbloqueado:', poste.artista);
    });
}

// ========== LIKE ==========
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
    window.postagem?.darLike(posteId);

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

// ========== BAIXAR / OFFLINE (SÓ APÓS DESBLOQUEAR) ==========
function baixarAudio(posteId) {
    if (!estadoPlayer.estaDestrancado) {
        mostrarToast('Destranque primeiro para baixar', 'aviso');
        return;
    }
    mostrarToast('⬇ Download de áudio iniciado', 'sucesso');
}

function baixarVideo(posteId) {
    if (!estadoPlayer.estaDestrancado) {
        mostrarToast('Destranque primeiro para baixar', 'aviso');
        return;
    }
    mostrarToast('⬇ Download de vídeo iniciado', 'sucesso');
}

function transferirOffline(posteId) {
    if (!estadoPlayer.estaDestrancado) {
        mostrarToast('Destranque primeiro para transferir', 'aviso');
        return;
    }
    mostrarToast('📲 Transferido para modo offline', 'sucesso');
}

// ========== MODAL DE PAGAMENTO SIMULADO ==========
function mostrarModalPagamento(poste, callback) {
    if (document.querySelector('.modal-pagamento')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-pagamento';
    overlay.style.zIndex = '4000';
    overlay.innerHTML = `
        <div class="modal-conteudo" style="max-width: 450px; padding: 1.5rem; text-align: center;">
            <h3 style="margin-bottom: 0.5rem;">💳 Desbloquear Conteúdo</h3>
            <p style="font-size: 0.9rem; color: var(--texto-secundario); margin-bottom: 1rem;">
                <strong>${poste.artista}</strong>
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
                <button class="btn btn-secundario metodo-pagamento" data-metodo="numero" 
                    style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; text-align: left;">
                    <span style="font-size: 1.5rem;">🔢</span>
                    <span>Digitar um número</span>
                </button>
                <button class="btn btn-secundario metodo-pagamento" data-metodo="cartao" 
                    style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; text-align: left;">
                    <span style="font-size: 1.5rem;">💳</span>
                    <span>Cartão Bancário</span>
                </button>
                <button class="btn btn-secundario metodo-pagamento" data-metodo="mpesa" 
                    style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; text-align: left;">
                    <span style="font-size: 1.5rem;">📱</span>
                    <span>M-Pesa</span>
                </button>
                <button class="btn btn-secundario metodo-pagamento" data-metodo="emola" 
                    style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; text-align: left;">
                    <span style="font-size: 1.5rem;">💰</span>
                    <span>EMOLA</span>
                </button>
            </div>

            <div id="form-pagamento" style="display: none;"></div>
            
            <button class="btn btn-secundario btn-pequeno" id="btn-cancelar-pagamento" style="width: 100%;">Cancelar</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    // Método de pagamento
    overlay.querySelectorAll('.metodo-pagamento').forEach(btn => {
        btn.addEventListener('click', function () {
            const metodo = this.dataset.metodo;
            overlay.querySelectorAll('.metodo-pagamento').forEach(b => b.style.display = 'none');
            mostrarFormPagamento(metodo, overlay, callback);
        });
    });

    overlay.querySelector('#btn-cancelar-pagamento').addEventListener('click', () => {
        overlay.classList.add('fechando');
        setTimeout(() => {
            overlay.remove();
            document.body.classList.remove('modal-aberto');
        }, 250);
    });

    overlay.addEventListener('click', function (e) {
        if (e.target === this) {
            overlay.querySelector('#btn-cancelar-pagamento').click();
        }
    });
}

function mostrarFormPagamento(metodo, overlay, callback) {
    const formContainer = overlay.querySelector('#form-pagamento');
    formContainer.style.display = 'block';

    let html = '';
    switch (metodo) {
        case 'numero':
            html = `
                <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">Digite qualquer número:</p>
                <input type="text" id="input-pagamento-numero" placeholder="Número" style="width: 100%; margin-bottom: 0.5rem;">
            `;
            break;
        case 'cartao':
            html = `
                <input type="text" id="input-pagamento-cartao" placeholder="Número do Cartão" style="width: 100%; margin-bottom: 0.5rem;">
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" placeholder="Validade" style="flex: 1;">
                    <input type="text" placeholder="CVV" style="flex: 1;">
                </div>
            `;
            break;
        case 'mpesa':
        case 'emola':
            html = `
                <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">Número de telefone ${metodo.toUpperCase()}:</p>
                <input type="tel" id="input-pagamento-telefone" placeholder="+244 9XX XXX XXX" style="width: 100%; margin-bottom: 0.5rem;">
            `;
            break;
    }

    html += `
        <button class="btn btn-primario" id="btn-confirmar-pagamento" style="width: 100%; margin-top: 0.5rem;">
            ✅ Confirmar Pagamento
        </button>
    `;

    formContainer.innerHTML = html;

    document.getElementById('btn-confirmar-pagamento').addEventListener('click', () => {
        overlay.classList.add('fechando');
        setTimeout(() => {
            overlay.remove();
            document.body.classList.remove('modal-aberto');
            mostrarToast('✅ Pagamento confirmado!', 'sucesso');
            if (callback) callback();
        }, 250);
    });
}

// ========== MODAL DESTRANCAR (15s ESGOTADOS) ==========
function mostrarModalDestrancar(poste) {
    if (!poste) return;
    if (document.querySelector('.modal-destrancar')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-destrancar';
    overlay.style.zIndex = '3500';
    overlay.innerHTML = `
        <div class="modal-conteudo" style="text-align: center; padding: 2rem;">
            <div class="destrancar-icone" style="font-size: 3rem;">🔒</div>
            <h3 style="margin: 1rem 0 0.5rem;">15 segundos esgotados!</h3>
            <p style="color: var(--texto-secundario); margin-bottom: 0.5rem;">
                Destranque para assistir ao vídeo completo de <strong>${poste.artista}</strong>.
            </p>
            <p style="font-size: 0.8rem; color: var(--texto-terciario); margin-bottom: 1.5rem;">
                ${poste.estilo || 'Diversa'} • ${poste.lingua || ''} • ${poste.ano || ''}
            </p>
            <button class="btn btn-primario btn-grande" id="btn-destrancar-modal" style="width: 100%; margin-bottom: 0.5rem;">
                🔓 Destrancar Agora
            </button>
            <button class="btn btn-secundario" id="btn-fechar-modal-destrancar" style="width: 100%;">
                Agora não
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    overlay.querySelector('#btn-destrancar-modal').addEventListener('click', () => {
        overlay.remove();
        document.body.classList.remove('modal-aberto');
        destrancarVideo(poste.id);
    });

    overlay.querySelector('#btn-fechar-modal-destrancar').addEventListener('click', () => {
        overlay.remove();
        document.body.classList.remove('modal-aberto');
    });

    overlay.addEventListener('click', function (e) {
        if (e.target === this) {
            overlay.remove();
            document.body.classList.remove('modal-aberto');
        }
    });
}

// ========== UI ==========
function atualizarInfoPlayer(poste) {
    if (!poste) return;
    document.querySelectorAll('.player-titulo').forEach(el => {
        el.textContent = poste.artista;
    });
    document.querySelectorAll('.player-artista').forEach(el => {
        el.textContent = poste.estilo || 'Diversa';
    });

    const btnFav = document.querySelector('.player-fixo .btn-favorito');
    if (btnFav) {
        btnFav.textContent = jaDeuLikePlayer(poste.id) ? '❤️' : '🤍';
    }
}

function atualizarInfoPlayerVazia() {
    document.querySelectorAll('.player-titulo').forEach(el => {
        el.textContent = 'Nenhuma música';
    });
    document.querySelectorAll('.player-artista').forEach(el => {
        el.textContent = 'Selecione uma música';
    });
    const btnFav = document.querySelector('.player-fixo .btn-favorito');
    if (btnFav) btnFav.textContent = '🤍';
}

function atualizarBotaoPlay() {
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.textContent = estadoPlayer.estaTocando ? '⏸' : '▶';
    });
}

function atualizarTimer15sDisplay() {
    const timerEl = document.querySelector('.player-fixo .timer-15s');
    if (!timerEl) return;

    if (estadoPlayer.estaDestrancado) {
        timerEl.classList.add('hidden');
    } else {
        timerEl.classList.remove('hidden');
        timerEl.textContent = `⏳ ${estadoPlayer.segundosRestantes}s`;
        timerEl.classList.toggle('esgotado', estadoPlayer.segundosRestantes <= 5);
    }
}

function atualizarBotaoDestrancar() {
    document.querySelectorAll('.btn-destrancar-player').forEach(btn => {
        if (estadoPlayer.estaDestrancado) {
            btn.classList.add('destrancado');
            btn.innerHTML = '🔓 Livre';
            btn.style.background = 'var(--gradiente-acento)';
        } else {
            btn.classList.remove('destrancado');
            btn.innerHTML = '🔓 Destrancar';
            btn.style.background = 'var(--gradiente-primario)';
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

// ========== CONFIGURAR PLAYER FIXO ==========
function configurarPlayerFixo() {
    const playerFixo = document.querySelector('.player-fixo');
    if (!playerFixo) return;

    playerFixo.querySelector('.btn-play')?.addEventListener('click', (e) => {
        e.stopPropagation();
        alternarPlayPause();
    });

    playerFixo.querySelector('.btn-destrancar-player')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (estadoPlayer.posteAtual) {
            destrancarVideo(estadoPlayer.posteAtual.id);
        }
    });

    playerFixo.querySelector('.btn-favorito')?.addEventListener('click', (e) => {
        e.stopPropagation();
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
    setTimeout(() => { 
        toast.classList.add('saindo'); 
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
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
    registrarLike: registrarLikeAutomatico,
    baixarAudio: baixarAudio,
    baixarVideo: baixarVideo,
    transferirOffline: transferirOffline,
    pararAtual: pararPlayerAtual,
    getEstado: () => estadoPlayer,
    getPosteAtual: () => estadoPlayer.posteAtual
};

document.addEventListener('DOMContentLoaded', inicializarPlayer);

console.log('🎧 Player completo pronto!');
console.log('   ✅ 15s grátis com bloqueio');
console.log('   ✅ Dono não vê bloqueio');
console.log('   ✅ Desbloqueio PERMANENTE');
console.log('   ✅ Play/Pause + Destrancar lado a lado');
console.log('   ✅ Iframe bloqueado (anti-clique)');
console.log('   ✅ Pagamento simulado');
console.log('   ✅ Download/Offline só após desbloquear');