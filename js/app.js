/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: app.js - Inicialização Principal
   ============================================= */

// ========== CONFIGURAÇÃO GLOBAL ==========
const CONFIG_APP = {
    nome: 'Musica Alendaria',
    slogan: 'Do Zero ao Infinito',
    criador: 'Pensador Sem Fronteira',
    versao: '1.0.0',
    dataLancamento: '2026-05-09',
    debug: true
};

// ========== ESTADO GLOBAL ==========
const estadoApp = {
    inicializado: false,
    paginaAtual: '',
    carregando: false,
    erros: [],
    metricas: {
        inicioApp: null,
        tempoCarregamento: 0
    }
};

// ========== INICIALIZAÇÃO PRINCIPAL ==========
function inicializarApp() {
    if (estadoApp.inicializado) {
        console.warn('⚠️ App já inicializado!');
        return;
    }

    const inicio = performance.now();
    estadoApp.metricas.inicioApp = new Date();
    estadoApp.carregando = true;

    console.log('🚀 Inicializando Musica Alendaria...');
    console.log(`📦 Versão: ${CONFIG_APP.versao}`);
    console.log(`🎯 "${CONFIG_APP.slogan}"`);

    // Passo 1: Identificar página atual
    identificarPaginaAtual();

    // Passo 2: Inicializar módulos core
    inicializarModulosCore();

    // Passo 3: Inicializar módulos específicos da página
    inicializarModulosPagina();

    // Passo 4: Configurar navegação
    configurarNavegacao();

    // Passo 5: Configurar funcionalidades globais
    configurarFuncionalidadesGlobais();

    // Passo 6: Verificar atualizações
    verificarAtualizacoes();

    // Finalizar
    estadoApp.inicializado = true;
    estadoApp.carregando = false;
    estadoApp.metricas.tempoCarregamento = performance.now() - inicio;

    console.log(`✅ App inicializado em ${estadoApp.metricas.tempoCarregamento.toFixed(0)}ms`);
    console.log(`📄 Página atual: ${estadoApp.paginaAtual || 'desconhecida'}`);

    // Disparar evento
    document.dispatchEvent(new CustomEvent('app-inicializado', {
        detail: { tempo: estadoApp.metricas.tempoCarregamento }
    }));

    // Esconder tela de loading
    esconderLoadingScreen();
}

// ========== IDENTIFICAR PÁGINA ATUAL ==========
function identificarPaginaAtual() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';

    estadoApp.paginaAtual = pageName;
    document.body.dataset.pagina = pageName;

    console.log(`📍 Página: ${pageName}`);
}

// ========== INICIALIZAR MÓDULOS CORE ==========
function inicializarModulosCore() {
    // Estes módulos são necessários em todas as páginas
    const modulosCore = [
        { nome: 'Tema', fn: window.tema?.inicializar },
        { nome: 'Auth', fn: window.auth?.inicializar },
        { nome: 'Player', fn: window.player?.inicializar },
        { nome: 'Modais', fn: window.modal?.inicializar }
    ];

    modulosCore.forEach(modulo => {
        if (modulo.fn) {
            try {
                modulo.fn();
                console.log(`  ✅ ${modulo.nome}`);
            } catch (erro) {
                console.error(`  ❌ ${modulo.nome}:`, erro);
                estadoApp.erros.push({ modulo: modulo.nome, erro });
            }
        } else {
            console.warn(`  ⚠️ ${modulo.nome} não encontrado`);
        }
    });
}

// ========== INICIALIZAR MÓDULOS DA PÁGINA ==========
function inicializarModulosPagina() {
    const pagina = estadoApp.paginaAtual;

    const modulosPorPagina = {
        'index': ['Favoritos', 'Filtros', 'Eventos', 'Postagem', 'Offline', 'Suporte'],
        'login': ['Suporte'],
        'artista': ['Favoritos', 'Player', 'Suporte'],
        'musica': ['Favoritos', 'Player', 'Postagem', 'Suporte'],
        'perfil': ['Favoritos', 'Eventos', 'Postagem', 'Offline', 'Suporte'],
        'favoritos': ['Favoritos', 'Filtros', 'Player', 'Suporte'],
        'eventos': ['Eventos', 'Suporte'],
        'postar': ['Postagem', 'Suporte'],
        'definicoes': ['Suporte'],
        'offline': ['Offline', 'Suporte']
    };

    const modulosParaInicializar = modulosPorPagina[pagina] || [];

    const mapaModulos = {
        'Favoritos': window.favoritos?.inicializar,
        'Filtros': window.filtros?.inicializar,
        'Eventos': window.eventos?.inicializar,
        'Postagem': window.postagem?.inicializar,
        'Offline': window.offline?.inicializar,
        'Suporte': window.suporte?.inicializar,
        'Player': window.player?.inicializar
    };

    modulosParaInicializar.forEach(nomeModulo => {
        const fn = mapaModulos[nomeModulo];
        if (fn) {
            try {
                // Verificar se já foi inicializado (evitar duplicação)
                fn();
                console.log(`  ✅ ${nomeModulo} (página)`);
            } catch (erro) {
                console.error(`  ❌ ${nomeModulo}:`, erro);
                estadoApp.erros.push({ modulo: nomeModulo, erro });
            }
        }
    });
}

// ========== CONFIGURAR NAVEGAÇÃO ==========
function configurarNavegacao() {
    // Navegação mobile
    configurarNavMobile();

    // Navegação desktop
    configurarNavDesktop();

    // Links internos (SPA simulada)
    configurarLinksInternos();

    // Botão voltar do navegador
    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.pagina) {
            navegarPara(e.state.pagina, false);
        }
    });
}

function configurarNavMobile() {
    const navItems = document.querySelectorAll('.nav-item');
    const paginaAtual = estadoApp.paginaAtual;

    navItems.forEach(item => {
        const destino = item.dataset.nav;
        if (destino === paginaAtual || 
            (destino === 'index' && paginaAtual === 'index') ||
            (destino === 'index' && paginaAtual === '')) {
            item.classList.add('ativo');
        }

        item.addEventListener('click', function (e) {
            e.preventDefault();
            const pagina = this.dataset.nav;
            if (pagina) {
                navegarPara(pagina);
            }
        });
    });
}

function configurarNavDesktop() {
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
    const paginaAtual = estadoApp.paginaAtual;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const destino = href.replace('.html', '').replace('./', '').replace('/', '');
            if (destino === paginaAtual || (destino === 'index' && paginaAtual === '')) {
                link.classList.add('ativo');
            }
        }
    });
}

function configurarLinksInternos() {
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href^="./"], a[href^="/"], a[href$=".html"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        // É um link interno
        const pagina = href.replace('.html', '').replace('./', '').replace('/', '');
        if (pagina && pagina !== estadoApp.paginaAtual) {
            e.preventDefault();
            navegarPara(pagina);
        }
    });
}

// ========== NAVEGAR PARA PÁGINA ==========
function navegarPara(pagina, adicionarHistorico = true) {
    if (estadoApp.carregando) return;

    estadoApp.carregando = true;
    mostrarLoadingScreen();

    const url = pagina === 'index' ? 'index.html' : `${pagina}.html`;

    console.log(`🧭 Navegando para: ${pagina}`);

    if (adicionarHistorico) {
        history.pushState({ pagina: pagina }, '', url);
    }

    // Simular carregamento de página (SPA)
    setTimeout(() => {
        window.location.href = url;
    }, 200);
}

// ========== FUNCIONALIDADES GLOBAIS ==========
function configurarFuncionalidadesGlobais() {
    // Marca d'água em todas as páginas
    garantirMarcaDagua();

    // Botão voltar ao topo
    configurarBotaoTopo();

    // Gestos de swipe (mobile)
    configurarGestosSwipe();

    // Atalhos de teclado
    configurarAtalhosTeclado();

    // Detectar offline/online
    configurarDeteccaoRede();

    // Service Worker (se suportado)
    registrarServiceWorker();
}

// ========== GARANTIR MARCA D'ÁGUA ==========
function garantirMarcaDagua() {
    if (!document.querySelector('.marca-dagua')) {
        const marca = document.createElement('div');
        marca.className = 'marca-dagua';
        marca.textContent = `Criado por ${CONFIG_APP.criador}`;
        document.body.appendChild(marca);
    }
}

// ========== BOTÃO VOLTAR AO TOPO ==========
function configurarBotaoTopo() {
    if (document.querySelector('.btn-topo')) return;

    const btnTopo = document.createElement('button');
    btnTopo.className = 'btn-flutuante btn-topo hidden';
    btnTopo.innerHTML = '⬆';
    btnTopo.style.bottom = '160px';
    btnTopo.style.right = '20px';
    btnTopo.style.background = 'var(--gradiente-primario)';
    btnTopo.title = 'Voltar ao topo';

    btnTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(btnTopo);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btnTopo.classList.remove('hidden');
        } else {
            btnTopo.classList.add('hidden');
        }
    });
}

// ========== GESTOS SWIPE ==========
function configurarGestosSwipe() {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Swipe horizontal (ignorar se vertical for maior)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 80) {
            if (diffX > 0) {
                console.log('👈 Swipe direita');
                // Pode ser usado para menu lateral
            } else {
                console.log('👉 Swipe esquerda');
                // Pode ser usado para voltar
            }
        }
    });
}

// ========== ATALHOS DE TECLADO ==========
function configurarAtalhosTeclado() {
    document.addEventListener('keydown', function (e) {
        // Espaço = Play/Pause (quando não está num input)
        if (e.code === 'Space' && 
            document.activeElement === document.body &&
            !estadoApp.carregando) {
            e.preventDefault();
            window.player?.alternar();
        }

        // Seta direita = Próxima música
        if (e.code === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            window.player?.proxima();
        }

        // Seta esquerda = Música anterior
        if (e.code === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            window.player?.anterior();
        }

        // M = Alternar mudo
        if (e.code === 'KeyM' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const estado = window.player?.getEstado();
            if (estado) {
                window.player?.ajustarVolume(estado.volume === 0 ? 0.7 : 0);
            }
        }

        // ESC = Fechar modais
        if (e.code === 'Escape') {
            window.modal?.fecharAtual();
        }
    });
}

// ========== DETECÇÃO DE REDE ==========
function configurarDeteccaoRede() {
    function atualizarStatusRede() {
        const online = navigator.onLine;
        document.body.classList.toggle('offline', !online);
        document.body.classList.toggle('online', online);

        if (!online) {
            mostrarNotificacaoApp('📡 Sem conexão com a internet. Conteúdo offline disponível.', 'aviso');
        } else {
            mostrarNotificacaoApp('🌐 Conexão restaurada!', 'sucesso');
        }
    }

    window.addEventListener('online', atualizarStatusRede);
    window.addEventListener('offline', atualizarStatusRede);

    // Status inicial
    if (!navigator.onLine) {
        document.body.classList.add('offline');
    }
}

// ========== SERVICE WORKER ==========
function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('⚙️ Service Worker registado:', registration.scope);
                })
                .catch(erro => {
                    console.warn('⚠️ Service Worker falhou:', erro);
                });
        });
    }
}

// ========== VERIFICAR ATUALIZAÇÕES ==========
function verificarAtualizacoes() {
    const versaoSalva = localStorage.getItem('musica-alendaria-versao');

    if (versaoSalva && versaoSalva !== CONFIG_APP.versao) {
        console.log('🆕 Nova versão detectada!');
        // Limpar caches antigos se necessário
        localStorage.setItem('musica-alendaria-versao', CONFIG_APP.versao);
    } else if (!versaoSalva) {
        localStorage.setItem('musica-alendaria-versao', CONFIG_APP.versao);
    }
}

// ========== LOADING SCREEN ==========
function mostrarLoadingScreen() {
    if (document.querySelector('.loading-screen')) return;

    const loading = document.createElement('div');
    loading.className = 'loading-screen';
    loading.innerHTML = `
        <div style="text-align: center;">
            <div class="spinner spinner-grande"></div>
            <p style="margin-top: 1rem; color: var(--texto-secundario);">Carregando...</p>
        </div>
    `;
    loading.style.cssText = `
        position: fixed;
        inset: 0;
        background: var(--fundo-principal);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    document.body.appendChild(loading);
}

function esconderLoadingScreen() {
    const loading = document.querySelector('.loading-screen');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loading.remove(), 300);
    }
}

// ========== NOTIFICAÇÃO ==========
function mostrarNotificacaoApp(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icone">${tipo === 'sucesso' ? '✅' : tipo === 'erro' ? '❌' : 'ℹ️'}</span>
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
    }, 4000);
}

// ========== TRATAMENTO DE ERROS GLOBAL ==========
window.addEventListener('error', function (e) {
    console.error('❌ Erro global:', e.error);
    estadoApp.erros.push({
        tipo: 'global',
        mensagem: e.message,
        arquivo: e.filename,
        linha: e.lineno
    });
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('❌ Promise rejeitada:', e.reason);
    estadoApp.erros.push({
        tipo: 'promise',
        mensagem: e.reason?.message || 'Promise rejeitada'
    });
});

// ========== EXPORTAR ==========
window.app = {
    inicializar: inicializarApp,
    navegarPara: navegarPara,
    getEstado: () => estadoApp,
    getConfig: () => CONFIG_APP,
    getErros: () => estadoApp.erros,
    getMetricas: () => estadoApp.metricas
};

// ========== INICIALIZAR QUANDO DOM PRONTO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

// Também inicializar se o DOM já estiver pronto
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(inicializarApp, 100);
}

console.log('🎵 Musica Alendaria - App carregado!');
console.log('💡 Criado por Pensador Sem Fronteira');
console.log('🚀 Do Zero ao Infinito');