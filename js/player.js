/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: player.js - Player com Limite 30s
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_PLAYER = {
    tempoGratuito: 30, // segundos
    volumePadrao: 0.7,
    chaveStorage: 'musica-alendaria-player'
};

// ========== ESTADO DO PLAYER ==========
const estadoPlayer = {
    musicaAtual: null,
    estaTocando: false,
    tempoAtual: 0,
    duracaoTotal: 0,
    estaDestrancado: false,
    modoOffline: false,
    volume: CONFIG_PLAYER.volumePadrao,
    fila: [],
    indiceFila: -1,
    timer30s: null,
    segundosRestantes: CONFIG_PLAYER.tempoGratuito,
    audio: null
};

// ========== INICIALIZAÇÃO ==========
function inicializarPlayer() {
    // Criar elemento de áudio
    if (!estadoPlayer.audio) {
        estadoPlayer.audio = new Audio();
        estadoPlayer.audio.volume = estadoPlayer.volume;
    }

    // Configurar eventos do áudio
    configurarEventosAudio();

    // Restaurar estado do player
    restaurarEstadoPlayer();

    // Configurar player fixo
    configurarPlayerFixo();

    // Configurar mini players na página
    configurarMiniPlayers();

    console.log('🎧 Player inicializado!');
}

// ========== CONFIGURAR EVENTOS DO ÁUDIO ==========
function configurarEventosAudio() {
    const audio = estadoPlayer.audio;

    audio.addEventListener('timeupdate', () => {
        estadoPlayer.tempoAtual = audio.currentTime;
        atualizarProgresso();
        atualizarTempoDisplay();
    });

    audio.addEventListener('loadedmetadata', () => {
        estadoPlayer.duracaoTotal = audio.duration;
        if (estadoPlayer.duracaoTotal < CONFIG_PLAYER.tempoGratuito) {
            // Música muito curta, permite tocar inteira
            estadoPlayer.segundosRestantes = estadoPlayer.duracaoTotal;
        }
    });

    audio.addEventListener('ended', () => {
        if (!estadoPlayer.estaDestrancado) {
            // Parar após preview
            pausarMusica();
            mostrarModalDestrancar(estadoPlayer.musicaAtual);
        } else {
            // Música completa terminou
            estadoPlayer.estaTocando = false;
            atualizarBotaoPlay();
            proximaMusica();
        }
    });

    audio.addEventListener('play', () => {
        estadoPlayer.estaTocando = true;
        atualizarBotaoPlay();
        iniciarTimer30s();
    });

    audio.addEventListener('pause', () => {
        estadoPlayer.estaTocando = false;
        atualizarBotaoPlay();
        pararTimer30s();
    });

    audio.addEventListener('error', () => {
        console.error('Erro ao carregar áudio');
        estadoPlayer.estaTocando = false;
        atualizarBotaoPlay();
        mostrarToast('Erro ao carregar música', 'erro');
    });
}

// ========== CARREGAR MÚSICA ==========
function carregarMusica(musica, destrancado = false) {
    estadoPlayer.musicaAtual = musica;
    estadoPlayer.estaDestrancado = destrancado;
    estadoPlayer.tempoAtual = 0;
    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;

    // Para músicas offline, usar caminho local
    const usuario = window.auth?.getUsuarioAtual();
    const isOffline = usuario && usuario.offline.includes(musica.id);
    estadoPlayer.modoOffline = isOffline;

    if (isOffline && !destrancado) {
        // Preview offline também limitado a 30s
        estadoPlayer.audio.src = `assets/musicas/previews/${musica.id}.mp3`;
    } else if (isOffline && destrancado) {
        estadoPlayer.audio.src = `assets/musicas/offline/${musica.id}.mp3`;
    } else {
        // Online - usaria o link real (aqui simulamos)
        estadoPlayer.audio.src = `assets/musicas/previews/${musica.id}.mp3`;
    }

    // Atualizar UI
    atualizarInfoPlayer();
    atualizarBotaoDestrancar();

    // Salvar estado
    salvarEstadoPlayer();

    console.log(`🎵 Carregada: "${musica.titulo}" | Destrancado: ${destrancado}`);
}

// ========== TOCAR MÚSICA ==========
function tocarMusica(musica, destrancado = false) {
    if (estadoPlayer.musicaAtual?.id !== musica.id) {
        carregarMusica(musica, destrancado);
    }

    estadoPlayer.audio.play().catch(err => {
        console.error('Erro ao reproduzir:', err);
        mostrarToast('Clique novamente para reproduzir', 'aviso');
    });

    // Adicionar ao histórico
    if (window.auth?.isAutenticado()) {
        const usuario = window.auth.getUsuarioAtual();
        if (!usuario.historico.includes(musica.id)) {
            usuario.historico.push(musica.id);
            window.auth.atualizarPerfil({ historico: usuario.historico });
        }
    }

    // Scroll para o player
    document.querySelector('.player-fixo')?.scrollIntoView({ behavior: 'smooth' });
}

// ========== PAUSAR MÚSICA ==========
function pausarMusica() {
    estadoPlayer.audio.pause();
    estadoPlayer.estaTocando = false;
    atualizarBotaoPlay();
    pararTimer30s();
}

// ========== ALTERNAR PLAY/PAUSE ==========
function alternarPlayPause() {
    if (!estadoPlayer.musicaAtual) return;

    if (estadoPlayer.estaTocando) {
        pausarMusica();
    } else {
        estadoPlayer.audio.play().catch(err => {
            console.error('Erro ao reproduzir:', err);
        });
    }
}

// ========== PRÓXIMA MÚSICA ==========
function proximaMusica() {
    if (estadoPlayer.fila.length === 0) return;

    estadoPlayer.indiceFila++;
    if (estadoPlayer.indiceFila >= estadoPlayer.fila.length) {
        estadoPlayer.indiceFila = 0;
    }

    const proxima = estadoPlayer.fila[estadoPlayer.indiceFila];
    carregarMusica(proxima, estadoPlayer.estaDestrancado);
    tocarMusica(proxima, estadoPlayer.estaDestrancado);
}

// ========== MÚSICA ANTERIOR ==========
function musicaAnterior() {
    if (estadoPlayer.fila.length === 0) return;

    estadoPlayer.indiceFila--;
    if (estadoPlayer.indiceFila < 0) {
        estadoPlayer.indiceFila = estadoPlayer.fila.length - 1;
    }

    const anterior = estadoPlayer.fila[estadoPlayer.indiceFila];
    carregarMusica(anterior, estadoPlayer.estaDestrancado);
    tocarMusica(anterior, estadoPlayer.estaDestrancado);
}

// ========== TIMER 30 SEGUNDOS ==========
function iniciarTimer30s() {
    if (estadoPlayer.estaDestrancado) return;

    pararTimer30s();
    estadoPlayer.segundosRestantes = CONFIG_PLAYER.tempoGratuito;

    estadoPlayer.timer30s = setInterval(() => {
        estadoPlayer.segundosRestantes--;

        // Atualizar display do timer
        atualizarTimer30sDisplay();

        if (estadoPlayer.segundosRestantes <= 10) {
            // Piscar timer quando estiver acabando
            const timerEl = document.querySelector('.timer-30s');
            if (timerEl && !timerEl.classList.contains('esgotado')) {
                timerEl.style.animation = 'blink 0.5s ease-in-out 3';
            }
        }

        if (estadoPlayer.segundosRestantes <= 0) {
            // Tempo esgotado
            pausarMusica();
            pararTimer30s();
            mostrarModalDestrancar(estadoPlayer.musicaAtual);
        }
    }, 1000);
}

function pararTimer30s() {
    if (estadoPlayer.timer30s) {
        clearInterval(estadoPlayer.timer30s);
        estadoPlayer.timer30s = null;
    }
}

// ========== DESTRANCAR MÚSICA ==========
function destrancarMusica(musicaId = null) {
    const musica = musicaId ? buscarMusica(musicaId) : estadoPlayer.musicaAtual;
    if (!musica) return;

    estadoPlayer.estaDestrancado = true;
    estadoPlayer.segundosRestantes = estadoPlayer.duracaoTotal;
    pararTimer30s();

    // Atualizar áudio para versão completa
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario && usuario.offline.includes(musica.id)) {
        const tempoAtual = estadoPlayer.audio.currentTime;
        estadoPlayer.audio.src = `assets/musicas/offline/${musica.id}.mp3`;
        estadoPlayer.audio.currentTime = tempoAtual;
    }

    // Registrar como like
    registrarDestranque(musica.id);

    // Atualizar UI
    atualizarBotaoDestrancar();
    atualizarTimer30sDisplay();

    // Animação de celebração
    animarDestrancar();

    // Continuar reprodução
    estadoPlayer.audio.play().catch(err => console.error(err));

    mostrarToast('🔓 Conteúdo destrancado! Aproveite!', 'sucesso');
    console.log(`🔓 Música destrancada: "${musica.titulo}"`);
}

// ========== BAIXAR MÚSICA ==========
function baixarMusica(musicaId, tipo = 'audio') {
    const musica = buscarMusica(musicaId);
    if (!musica) return;

    if (!estadoPlayer.estaDestrancado) {
        mostrarToast('Destranque a música primeiro para baixar', 'aviso');
        return;
    }

    // Simular download
    mostrarToast(`⬇ Baixando ${tipo === 'audio' ? 'áudio' : 'vídeo'} de "${musica.titulo}"...`, 'sucesso');

    // Registrar como like
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario && !usuario.offline.includes(musicaId)) {
        adicionarOffline(usuario, musicaId);
    }

    console.log(`⬇ Download iniciado: ${musica.titulo} (${tipo})`);
}

// ========== TRANSFERIR PARA OFFLINE ==========
function transferirParaOffline(musicaId) {
    const musica = buscarMusica(musicaId);
    if (!musica) return;

    if (!estadoPlayer.estaDestrancado) {
        mostrarToast('Destranque a música primeiro para transferir', 'aviso');
        return;
    }

    const usuario = window.auth?.getUsuarioAtual();
    if (usuario) {
        adicionarOffline(usuario, musicaId);
        estadoPlayer.modoOffline = true;
        mostrarToast('📲 Música disponível offline!', 'sucesso');
    }

    console.log(`📲 Offline: "${musica.titulo}"`);
}

// ========== FILA DE REPRODUÇÃO ==========
function adicionarNaFila(musica) {
    estadoPlayer.fila.push(musica);
    if (estadoPlayer.fila.length === 1) {
        estadoPlayer.indiceFila = 0;
    }
    atualizarFilaUI();
}

function removerDaFila(index) {
    estadoPlayer.fila.splice(index, 1);
    if (estadoPlayer.indiceFila >= estadoPlayer.fila.length) {
        estadoPlayer.indiceFila = estadoPlayer.fila.length - 1;
    }
    atualizarFilaUI();
}

function limparFila() {
    estadoPlayer.fila = [];
    estadoPlayer.indiceFila = -1;
    atualizarFilaUI();
}

// ========== CONTROLE DE VOLUME ==========
function ajustarVolume(novoVolume) {
    estadoPlayer.volume = Math.max(0, Math.min(1, novoVolume));
    estadoPlayer.audio.volume = estadoPlayer.volume;
    atualizarVolumeUI();
}

// ========== ATUALIZAR UI ==========
function atualizarInfoPlayer() {
    if (!estadoPlayer.musicaAtual) return;

    const musica = estadoPlayer.musicaAtual;

    // Player fixo
    document.querySelectorAll('.player-capa').forEach(el => {
        el.src = musica.capa;
        el.alt = musica.titulo;
    });

    document.querySelectorAll('.player-titulo').forEach(el => {
        el.textContent = musica.titulo;
    });

    document.querySelectorAll('.player-artista').forEach(el => {
        const artista = buscarArtista(musica.artistaId);
        el.textContent = artista ? artista.nome : '';
    });

    atualizarBotaoPlay();
    atualizarTimer30sDisplay();
}

function atualizarBotaoPlay() {
    document.querySelectorAll('.btn-play, .btn-expandido-play').forEach(btn => {
        btn.textContent = estadoPlayer.estaTocando ? '⏸' : '▶';
    });

    // Animação do player
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

    // Barra de progresso 30s
    document.querySelectorAll('.barra-30s-preenchida').forEach(barra => {
        if (estadoPlayer.estaDestrancado) {
            barra.style.width = '100%';
            barra.classList.remove('esgotada');
        } else {
            const percentual = ((CONFIG_PLAYER.tempoGratuito - estadoPlayer.segundosRestantes) / CONFIG_PLAYER.tempoGratuito) * 100;
            barra.style.width = `${percentual}%`;
            barra.classList.toggle('esgotada', estadoPlayer.segundosRestantes <= 10);
        }
    });
}

function atualizarBotaoDestrancar() {
    document.querySelectorAll('.btn-destrancar-player').forEach(btn => {
        if (estadoPlayer.estaDestrancado) {
            btn.classList.add('destrancado');
            btn.innerHTML = '<span class="cadeado-icone">🔓</span> Destrancado';
            btn.onclick = null;
        } else {
            btn.classList.remove('destrancado');
            btn.innerHTML = '<span class="cadeado-icone">🔒</span> Destrancar';
            btn.onclick = () => destrancarMusica();
        }
    });
}

function atualizarProgresso() {
    const percentual = estadoPlayer.duracaoTotal > 0
        ? (estadoPlayer.tempoAtual / estadoPlayer.duracaoTotal) * 100
        : 0;

    document.querySelectorAll('.player-progresso-preenchido').forEach(barra => {
        barra.style.width = `${percentual}%`;
    });
}

function atualizarTempoDisplay() {
    const tempoAtual = formatarTempo(estadoPlayer.tempoAtual);
    const duracao = formatarTempo(estadoPlayer.duracaoTotal);

    document.querySelectorAll('.tempo-atual').forEach(el => el.textContent = tempoAtual);
    document.querySelectorAll('.tempo-duracao').forEach(el => el.textContent = duracao);
}

function atualizarVolumeUI() {
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.value = estadoPlayer.volume * 100;
    });
}

function atualizarFilaUI() {
    const filaContainer = document.querySelector('.queue-lista');
    if (!filaContainer) return;

    filaContainer.innerHTML = estadoPlayer.fila.length === 0
        ? '<div class="estado-vazio"><p class="vazio-descricao">Fila vazia</p></div>'
        : estadoPlayer.fila.map((musica, index) => {
            const artista = buscarArtista(musica.artistaId);
            return `
                <div class="queue-item ${index === estadoPlayer.indiceFila ? 'tocando' : ''}">
                    <span class="queue-numero">${index + 1}</span>
                    <img src="${musica.capa}" class="queue-capa" alt="${musica.titulo}">
                    <div class="queue-info">
                        <div class="queue-titulo">${musica.titulo}</div>
                        <div class="queue-artista">${artista ? artista.nome : ''}</div>
                    </div>
                    <span class="queue-duracao">${musica.duracao}</span>
                    <button class="btn-icone-pequeno" onclick="removerDaFila(${index})">✕</button>
                </div>
            `;
        }).join('');
}

// ========== CONFIGURAR PLAYER FIXO ==========
function configurarPlayerFixo() {
    const playerFixo = document.querySelector('.player-fixo');
    if (!playerFixo) return;

    // Play/Pause
    playerFixo.querySelector('.btn-play')?.addEventListener('click', alternarPlayPause);

    // Próxima
    playerFixo.querySelector('.btn-proxima')?.addEventListener('click', proximaMusica);

    // Anterior
    playerFixo.querySelector('.btn-anterior')?.addEventListener('click', musicaAnterior);

    // Expandir player
    playerFixo.addEventListener('click', function (e) {
        if (e.target === this || e.target.closest('.player-info')) {
            this.classList.toggle('expandido');
        }
    });

    // Fechar expandido
    playerFixo.querySelector('.fechar-expandido')?.addEventListener('click', function (e) {
        e.stopPropagation();
        playerFixo.classList.remove('expandido');
    });

    // Progresso clicável
    const progressoContainer = playerFixo.querySelector('.player-progresso-container');
    progressoContainer?.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const percentual = (e.clientX - rect.left) / rect.width;
        if (estadoPlayer.audio.duration) {
            estadoPlayer.audio.currentTime = percentual * estadoPlayer.audio.duration;
        }
    });

    // Volume
    const volumeSlider = playerFixo.querySelector('.volume-slider');
    volumeSlider?.addEventListener('input', function () {
        ajustarVolume(this.value / 100);
    });

    // Botão favorito
    playerFixo.querySelector('.btn-favorito')?.addEventListener('click', function () {
        if (!estadoPlayer.musicaAtual) return;
        const usuario = window.auth?.getUsuarioAtual();
        if (!usuario) return;

        if (isFavorito(usuario, estadoPlayer.musicaAtual.id)) {
            removerFavorito(usuario, estadoPlayer.musicaAtual.id);
            this.classList.remove('favoritado');
        } else {
            adicionarFavorito(usuario, estadoPlayer.musicaAtual.id);
            this.classList.add('favoritado');
        }
    });
}

// ========== CONFIGURAR MINI PLAYERS ==========
function configurarMiniPlayers() {
    document.querySelectorAll('.card-musica-h, .card-musica-v').forEach(card => {
        card.addEventListener('click', function () {
            const musicaId = this.dataset.musicaId;
            if (!musicaId) return;

            const musica = buscarMusica(musicaId);
            if (musica) {
                tocarMusica(musica, estadoPlayer.estaDestrancado);
            }
        });
    });
}

// ========== MODAL DE DESTRANCAR ==========
function mostrarModalDestrancar(musica) {
    if (!musica) return;

    // Verificar se já existe modal
    if (document.querySelector('.modal-destrancar')) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-destrancar';
    overlay.innerHTML = `
        <div class="modal-conteudo">
            <div class="destrancar-icone">🔒</div>
            <h3 class="destrancar-titulo">30 segundos esgotados!</h3>
            <p class="destrancar-descricao">
                Destranque "${musica.titulo}" para aceder ao conteúdo completo.
            </p>
            <div class="destrancar-beneficios">
                <div class="beneficio-item">
                    <span class="check">✓</span> Ouvir música completa
                </div>
                <div class="beneficio-item">
                    <span class="check">✓</span> Assistir videoclipe completo
                </div>
                <div class="beneficio-item">
                    <span class="check">✓</span> Baixar áudio e vídeo
                </div>
                <div class="beneficio-item">
                    <span class="check">✓</span> Ler letra completa
                </div>
                <div class="beneficio-item">
                    <span class="check">✓</span> Transferir para offline
                </div>
            </div>
            <button class="btn-confirmar-destrancar" id="btn-confirmar-destrancar">
                🔓 Destrancar Agora
            </button>
            <button class="btn-cancelar-destrancar" id="btn-cancelar-destrancar">
                Agora não
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    overlay.querySelector('#btn-confirmar-destrancar').addEventListener('click', () => {
        fecharModalDestrancar();
        destrancarMusica(musica.id);
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

// ========== ANIMAÇÃO DE DESTRANCAR ==========
function animarDestrancar() {
    // Efeito de confete ou brilho
    const playerFixo = document.querySelector('.player-fixo');
    if (playerFixo) {
        playerFixo.style.animation = 'pulseStrong 0.6s ease';
        setTimeout(() => {
            playerFixo.style.animation = '';
        }, 600);
    }

    // Brilho no botão
    const btnDestrancar = document.querySelector('.btn-destrancar-player');
    if (btnDestrancar) {
        btnDestrancar.style.animation = 'glowPulse 0.8s ease 3';
        setTimeout(() => {
            btnDestrancar.style.animation = '';
        }, 2400);
    }
}

// ========== UTILITÁRIAS ==========
function formatarTempo(segundos) {
    if (isNaN(segundos) || segundos < 0) return '0:00';
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg.toString().padStart(2, '0')}`;
}

function salvarEstadoPlayer() {
    const estado = {
        musicaId: estadoPlayer.musicaAtual?.id || null,
        estaDestrancado: estadoPlayer.estaDestrancado,
        volume: estadoPlayer.volume,
        tempoAtual: estadoPlayer.tempoAtual
    };
    localStorage.setItem(CONFIG_PLAYER.chaveStorage, JSON.stringify(estado));
}

function restaurarEstadoPlayer() {
    try {
        const estadoSalvo = JSON.parse(localStorage.getItem(CONFIG_PLAYER.chaveStorage));
        if (estadoSalvo && estadoSalvo.musicaId) {
            const musica = buscarMusica(estadoSalvo.musicaId);
            if (musica) {
                carregarMusica(musica, estadoSalvo.estaDestrancado);
                estadoPlayer.volume = estadoSalvo.volume || CONFIG_PLAYER.volumePadrao;
                estadoPlayer.audio.volume = estadoPlayer.volume;
                estadoPlayer.audio.currentTime = estadoSalvo.tempoAtual || 0;
            }
        }
    } catch (e) {
        console.error('Erro ao restaurar estado do player');
    }
}

// ========== TOAST ==========
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span class="toast-mensagem">${mensagem}</span>`;

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
    tocar: tocarMusica,
    pausar: pausarMusica,
    alternar: alternarPlayPause,
    proxima: proximaMusica,
    anterior: musicaAnterior,
    carregar: carregarMusica,
    destrancar: destrancarMusica,
    baixar: baixarMusica,
    transferirOffline: transferirParaOffline,
    ajustarVolume: ajustarVolume,
    adicionarNaFila: adicionarNaFila,
    getEstado: () => estadoPlayer,
    getMusicaAtual: () => estadoPlayer.musicaAtual
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarPlayer);

console.log('🎧 Player pronto! (30s grátis + destrancar)');