/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: favoritos.js - Gestão de Favoritos
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_FAVORITOS = {
    chaveStorage: 'musica-alendaria-favoritos',
    maxItemsPorPagina: 20
};

// ========== ESTADO ==========
const estadoFavoritos = {
    lista: [],
    ordenacao: 'recente', // 'recente', 'titulo', 'artista', 'genero', 'lingua'
    agrupamento: 'nenhum', // 'nenhum', 'estilo', 'cantor', 'lingua'
    paginaAtual: 1
};

// ========== INICIALIZAÇÃO ==========
function inicializarFavoritos() {
    // Carregar favoritos do usuário
    carregarFavoritos();

    // Configurar UI
    configurarPaginaFavoritos();
    configurarBotoesFavorito();

    console.log('❤️ Sistema de favoritos pronto!');
}

// ========== CARREGAR FAVORITOS ==========
function carregarFavoritos() {
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario && usuario.favoritos) {
        estadoFavoritos.lista = [...usuario.favoritos];
    } else {
        // Tentar localStorage
        const saved = localStorage.getItem(CONFIG_FAVORITOS.chaveStorage);
        estadoFavoritos.lista = saved ? JSON.parse(saved) : [];
    }
}

// ========== SALVAR FAVORITOS ==========
function salvarFavoritos() {
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario) {
        usuario.favoritos = [...estadoFavoritos.lista];
        window.auth.atualizarPerfil({ favoritos: usuario.favoritos });
    }
    localStorage.setItem(CONFIG_FAVORITOS.chaveStorage, JSON.stringify(estadoFavoritos.lista));
}

// ========== ADICIONAR AOS FAVORITOS ==========
function adicionarAosFavoritos(musicaId) {
    if (estadoFavoritos.lista.includes(musicaId)) {
        return false; // Já está nos favoritos
    }

    estadoFavoritos.lista.unshift(musicaId); // Adicionar no início
    salvarFavoritos();
    atualizarUIAfterChange(musicaId, true);

    // Toast
    const musica = buscarMusica(musicaId);
    mostrarToastFavoritos(`❤️ "${musica?.titulo || 'Música'}" adicionada aos favoritos!`, 'sucesso');

    // Animar botão
    animarBotaoFavorito(musicaId, true);

    console.log(`❤️ Adicionado aos favoritos: ${musicaId}`);
    return true;
}

// ========== REMOVER DOS FAVORITOS ==========
function removerDosFavoritos(musicaId) {
    const index = estadoFavoritos.lista.indexOf(musicaId);
    if (index === -1) {
        return false; // Não está nos favoritos
    }

    estadoFavoritos.lista.splice(index, 1);
    salvarFavoritos();
    atualizarUIAfterChange(musicaId, false);

    // Toast
    const musica = buscarMusica(musicaId);
    mostrarToastFavoritos(`💔 "${musica?.titulo || 'Música'}" removida dos favoritos.`, 'info');

    // Animar botão
    animarBotaoFavorito(musicaId, false);

    console.log(`💔 Removido dos favoritos: ${musicaId}`);
    return true;
}

// ========== ALTERNAR FAVORITO ==========
function alternarFavorito(musicaId) {
    if (estadoFavoritos.lista.includes(musicaId)) {
        return removerDosFavoritos(musicaId);
    } else {
        return adicionarAosFavoritos(musicaId);
    }
}

// ========== VERIFICAR SE É FAVORITO ==========
function isFavorito(musicaId) {
    return estadoFavoritos.lista.includes(musicaId);
}

// ========== OBTER MÚSICAS FAVORITAS (COM DADOS COMPLETOS) ==========
function getMusicasFavoritas() {
    return estadoFavoritos.lista
        .map(id => buscarMusica(id))
        .filter(m => m !== null);
}

// ========== OBTER FAVORITOS AGRUPADOS ==========
function getFavoritosAgrupados(agrupamento) {
    const musicas = getMusicasFavoritas();

    switch (agrupamento) {
        case 'estilo':
            return agruparPorGenero(musicas);
        case 'cantor':
            return agruparPorArtista(musicas);
        case 'lingua':
            return agruparPorLingua(musicas);
        default:
            return { 'Todos': musicas };
    }
}

function agruparPorGenero(musicas) {
    const grupos = {};
    musicas.forEach(m => {
        if (!grupos[m.genero]) grupos[m.genero] = [];
        grupos[m.genero].push(m);
    });
    return grupos;
}

function agruparPorArtista(musicas) {
    const grupos = {};
    musicas.forEach(m => {
        const artista = buscarArtista(m.artistaId);
        const nome = artista ? artista.nome : 'Desconhecido';
        if (!grupos[nome]) grupos[nome] = [];
        grupos[nome].push(m);
    });
    return grupos;
}

function agruparPorLingua(musicas) {
    const grupos = {};
    musicas.forEach(m => {
        if (!grupos[m.lingua]) grupos[m.lingua] = [];
        grupos[m.lingua].push(m);
    });
    return grupos;
}

// ========== ORDENAR FAVORITOS ==========
function ordenarFavoritos(ordenacao) {
    estadoFavoritos.ordenacao = ordenacao;
    const musicas = getMusicasFavoritas();

    switch (ordenacao) {
        case 'titulo':
            musicas.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
        case 'artista':
            musicas.sort((a, b) => {
                const artA = buscarArtista(a.artistaId)?.nome || '';
                const artB = buscarArtista(b.artistaId)?.nome || '';
                return artA.localeCompare(artB);
            });
            break;
        case 'genero':
            musicas.sort((a, b) => a.genero.localeCompare(b.genero));
            break;
        case 'lingua':
            musicas.sort((a, b) => a.lingua.localeCompare(b.lingua));
            break;
        case 'ano':
            musicas.sort((a, b) => b.ano - a.ano);
            break;
        default: // 'recente'
            // Já está na ordem da lista (mais recente primeiro)
            break;
    }

    // Atualizar lista de IDs
    estadoFavoritos.lista = musicas.map(m => m.id);
    salvarFavoritos();
    renderizarListaFavoritos();

    console.log(`📋 Favoritos ordenados por: ${ordenacao}`);
}

// ========== CONFIGURAR PÁGINA DE FAVORITOS ==========
function configurarPaginaFavoritos() {
    // Tabs de agrupamento
    document.querySelectorAll('.favoritos-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.favoritos-tab').forEach(t => t.classList.remove('ativo'));
            this.classList.add('ativo');

            const agrupamento = this.dataset.agrupamento || 'nenhum';
            estadoFavoritos.agrupamento = agrupamento;
            renderizarListaFavoritos();
        });
    });

    // Select de ordenação
    const selectOrdenacao = document.getElementById('ordenacao-favoritos');
    if (selectOrdenacao) {
        selectOrdenacao.value = estadoFavoritos.ordenacao;
        selectOrdenacao.addEventListener('change', function () {
            ordenarFavoritos(this.value);
        });
    }

    // Renderizar lista inicial
    if (window.location.pathname.includes('favoritos.html') ||
        document.querySelector('.favoritos-container')) {
        renderizarListaFavoritos();
    }
}

// ========== RENDERIZAR LISTA DE FAVORITOS ==========
function renderizarListaFavoritos() {
    const container = document.querySelector('.favoritos-container') ||
                      document.querySelector('.lista-favoritos');
    if (!container) return;

    const musicas = getMusicasFavoritas();

    if (musicas.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <div class="vazio-icone">💔</div>
                <h4 class="vazio-titulo">Nenhum favorito ainda</h4>
                <p class="vazio-descricao">
                    Comece a explorar músicas e adicione as suas favoritas tocando no coração ❤️
                </p>
            </div>
        `;
        return;
    }

    const agrupamento = estadoFavoritos.agrupamento;

    if (agrupamento === 'nenhum') {
        // Lista simples
        container.innerHTML = `
            <div class="lista-musicas">
                ${musicas.map((m, index) => criarCardFavorito(m, index)).join('')}
            </div>
        `;
    } else {
        // Lista agrupada
        const grupos = getFavoritosAgrupados(agrupamento);
        container.innerHTML = Object.entries(grupos).map(([nomeGrupo, musicasGrupo]) => `
            <div class="grupo-favoritos">
                <h4 class="grupo-titulo">
                    ${agrupamento === 'estilo' ? '🎸' : agrupamento === 'cantor' ? '🎤' : '🌐'} ${nomeGrupo}
                    <span class="grupo-contagem">(${musicasGrupo.length})</span>
                </h4>
                <div class="lista-musicas">
                    ${musicasGrupo.map((m, index) => criarCardFavorito(m, index)).join('')}
                </div>
            </div>
        `).join('');
    }
}

// ========== CRIAR CARD DE FAVORITO ==========
function criarCardFavorito(musica, index) {
    const artista = buscarArtista(musica.artistaId);
    const nomeArtista = artista ? artista.nome : 'Artista Desconhecido';

    return `
        <div class="card-musica-h stagger-item" data-musica-id="${musica.id}" style="animation-delay: ${index * 0.05}s">
            <img src="${musica.capa}" alt="${musica.titulo}" class="capa-musica">
            <div class="info-musica">
                <div class="titulo-musica">${musica.titulo}</div>
                <div class="artista-musica">${nomeArtista} • ${musica.ano}</div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                    <span class="badge badge-primario">${musica.genero}</span>
                    <span class="badge badge-contorno">${musica.lingua}</span>
                </div>
            </div>
            <div class="acoes-musica">
                <button class="btn-icone-pequeno btn-favorito-card ativo" 
                        data-musica-id="${musica.id}" 
                        onclick="event.stopPropagation(); window.favoritos.alternar('${musica.id}')"
                        title="Remover dos favoritos">
                    ❤️
                </button>
                <button class="btn-icone-pequeno" 
                        onclick="event.stopPropagation(); window.player.tocar(buscarMusica('${musica.id}'))"
                        title="Tocar">
                    ▶
                </button>
            </div>
        </div>
    `;
}

// ========== CONFIGURAR BOTÕES DE FAVORITO ==========
function configurarBotoesFavorito() {
    // Atualizar estado inicial dos botões
    document.querySelectorAll('.btn-favorito, .btn-favorito-card').forEach(btn => {
        const musicaId = btn.dataset.musicaId;
        if (musicaId && isFavorito(musicaId)) {
            btn.classList.add('favoritado', 'ativo');
        }
    });

    // Delegação de eventos para botões de favorito
    document.addEventListener('click', function (e) {
        const btnFavorito = e.target.closest('.btn-favorito:not(.btn-favorito-card)');
        if (!btnFavorito) return;

        e.preventDefault();
        e.stopPropagation();

        const musicaId = btnFavorito.dataset.musicaId;
        if (!musicaId) return;

        alternarFavorito(musicaId);
    });
}

// ========== ATUALIZAR UI APÓS MUDANÇA ==========
function atualizarUIAfterChange(musicaId, isFav) {
    // Atualizar todos os botões com este musicaId
    document.querySelectorAll(`.btn-favorito[data-musica-id="${musicaId}"], .btn-favorito-card[data-musica-id="${musicaId}"]`).forEach(btn => {
        if (isFav) {
            btn.classList.add('favoritado', 'ativo');
            btn.textContent = '❤️';
        } else {
            btn.classList.remove('favoritado', 'ativo');
            btn.textContent = '🤍';
        }
    });

    // Atualizar contador se existir
    const contador = document.querySelector('.favoritos-contador');
    if (contador) {
        contador.textContent = estadoFavoritos.lista.length;
    }

    // Renderizar lista se estiver na página de favoritos
    if (document.querySelector('.favoritos-container')) {
        renderizarListaFavoritos();
    }
}

// ========== ANIMAR BOTÃO FAVORITO ==========
function animarBotaoFavorito(musicaId, isFav) {
    document.querySelectorAll(`.btn-favorito[data-musica-id="${musicaId}"], .btn-favorito-card[data-musica-id="${musicaId}"]`).forEach(btn => {
        if (isFav) {
            btn.style.animation = 'heartbeat 0.6s ease';
        } else {
            btn.style.animation = 'shake 0.4s ease';
        }
        setTimeout(() => {
            btn.style.animation = '';
        }, 600);
    });
}

// ========== TOAST DE FAVORITOS ==========
function mostrarToastFavoritos(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icone">${tipo === 'sucesso' ? '❤️' : '💔'}</span>
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
    }, 2500);
}

// ========== EXPORTAR LISTA DE FAVORITOS ==========
function exportarFavoritos() {
    const musicas = getMusicasFavoritas();
    const dados = musicas.map(m => ({
        titulo: m.titulo,
        artista: buscarArtista(m.artistaId)?.nome || '',
        genero: m.genero,
        lingua: m.lingua,
        ano: m.ano
    }));

    // Criar blob e download
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus-favoritos-musica-alendaria.json';
    a.click();
    URL.revokeObjectURL(url);

    mostrarToastFavoritos('📥 Lista de favoritos exportada!', 'sucesso');
}

// ========== COMPARTILHAR FAVORITOS ==========
function compartilharFavoritos() {
    const musicas = getMusicasFavoritas();
    if (musicas.length === 0) {
        mostrarToastFavoritos('Adicione músicas aos favoritos primeiro!', 'aviso');
        return;
    }

    const texto = `🎵 Meus favoritos na Musica Alendaria:\n${musicas.map(m => `• ${m.titulo} - ${buscarArtista(m.artistaId)?.nome || ''}`).join('\n')}\n\nDo Zero ao Infinito! 🚀`;

    if (navigator.share) {
        navigator.share({
            title: 'Meus Favoritos - Musica Alendaria',
            text: texto
        }).catch(() => {
            copiarParaClipboard(texto);
        });
    } else {
        copiarParaClipboard(texto);
    }
}

function copiarParaClipboard(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToastFavoritos('📋 Lista copiada para a área de transferência!', 'sucesso');
    }).catch(() => {
        mostrarToastFavoritos('Erro ao copiar lista', 'erro');
    });
}

// ========== LIMPAR TODOS FAVORITOS ==========
function limparTodosFavoritos() {
    if (estadoFavoritos.lista.length === 0) return;

    window.modal?.confirmacao(
        'Tem certeza que deseja remover todas as músicas dos favoritos?',
        () => {
            estadoFavoritos.lista = [];
            salvarFavoritos();
            renderizarListaFavoritos();
            atualizarUIAfterChange(null, false);
            mostrarToastFavoritos('🗑️ Todos os favoritos foram removidos.', 'info');
        }
    );
}

// ========== CONTAR FAVORITOS ==========
function contarFavoritos() {
    return estadoFavoritos.lista.length;
}

// ========== EXPORTAR ==========
window.favoritos = {
    inicializar: inicializarFavoritos,
    adicionar: adicionarAosFavoritos,
    remover: removerDosFavoritos,
    alternar: alternarFavorito,
    isFavorito: isFavorito,
    getMusicas: getMusicasFavoritas,
    getAgrupados: getFavoritosAgrupados,
    ordenar: ordenarFavoritos,
    contar: contarFavoritos,
    limparTodos: limparTodosFavoritos,
    exportar: exportarFavoritos,
    compartilhar: compartilharFavoritos,
    renderizar: renderizarListaFavoritos
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarFavoritos);

console.log('❤️ Favoritos pronto! (Com agrupamento e ordenação)');