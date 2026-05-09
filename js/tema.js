/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: tema.js - Sistema de Temas Lit/Dark
   ============================================= */

// ========== CONFIGURAÇÃO DE TEMAS ==========
const CONFIG_TEMA = {
    // Tema padrão inicial (Lit)
    temaPadrao: 'lit',

    // Chave para localStorage
    chaveStorage: 'musica-alendaria-tema',

    // Classes CSS
    classeLit: 'tema-lit',
    classeDark: 'tema-dark',

    // Transição ao mudar
    duracaoTransicao: 300
};

// ========== ESTADO DO TEMA ==========
let temaAtual = CONFIG_TEMA.temaPadrao;

// ========== INICIALIZAÇÃO ==========
function inicializarTema() {
    // Verificar tema guardado no localStorage
    const temaGuardado = localStorage.getItem(CONFIG_TEMA.chaveStorage);

    if (temaGuardado && (temaGuardado === 'lit' || temaGuardado === 'dark')) {
        temaAtual = temaGuardado;
    } else {
        // Verificar preferência do sistema
        const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaAtual = prefereDark ? 'dark' : 'lit';
    }

    // Aplicar tema
    aplicarTema(temaAtual);

    // Ouvir mudanças do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Só muda automaticamente se o usuário nunca escolheu manualmente
        if (!localStorage.getItem(CONFIG_TEMA.chaveStorage)) {
            aplicarTema(e.matches ? 'dark' : 'lit');
        }
    });

    console.log(`🎨 Tema inicializado: ${temaAtual.toUpperCase()}`);
}

// ========== APLICAR TEMA ==========
function aplicarTema(tema) {
    const body = document.body;

    // Remover classes de tema
    body.classList.remove(CONFIG_TEMA.classeLit, CONFIG_TEMA.classeDark);

    // Adicionar classe do tema escolhido
    if (tema === 'dark') {
        body.classList.add(CONFIG_TEMA.classeDark);
    } else {
        body.classList.add(CONFIG_TEMA.classeLit);
    }

    // Atualizar estado
    temaAtual = tema;

    // Guardar no localStorage
    localStorage.setItem(CONFIG_TEMA.chaveStorage, tema);

    // Atualizar ícones de switch se existirem
    atualizarSwitchTema(tema);

    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('tema-alterado', {
        detail: { tema: tema }
    }));
}

// ========== ALTERNAR TEMA ==========
function alternarTema() {
    const novoTema = temaAtual === 'lit' ? 'dark' : 'lit';
    aplicarTema(novoTema);

    // Animação de transição
    const body = document.body;
    body.style.transition = `background-color ${CONFIG_TEMA.duracaoTransicao}ms ease, color ${CONFIG_TEMA.duracaoTransicao}ms ease`;
    setTimeout(() => {
        body.style.transition = '';
    }, CONFIG_TEMA.duracaoTransicao);

    // Toast de feedback
    mostrarToastTema(novoTema);

    return novoTema;
}

// ========== ATUALIZAR SWITCH NAS DEFINIÇÕES ==========
function atualizarSwitchTema(tema) {
    const switchTema = document.getElementById('switch-tema');
    if (switchTema) {
        switchTema.checked = tema === 'dark';
    }

    // Atualizar todos os switches de tema na página
    document.querySelectorAll('.switch-tema-input').forEach(input => {
        input.checked = tema === 'dark';
    });
}

// ========== TOAST DE FEEDBACK ==========
function mostrarToastTema(tema) {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-sucesso';
    toast.innerHTML = `
        <span class="toast-icone">${tema === 'dark' ? '🌙' : '☀️'}</span>
        <span class="toast-mensagem">Tema ${tema === 'dark' ? 'Dark' : 'Lit'} ativado!</span>
        <span class="toast-fechar">✕</span>
    `;

    // Adicionar ao container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    container.appendChild(toast);

    // Remover após 2 segundos
    setTimeout(() => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 300);
    }, 2000);

    // Fechar ao clicar
    toast.addEventListener('click', () => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 300);
    });
}

// ========== OBTER TEMA ATUAL ==========
function getTemaAtual() {
    return temaAtual;
}

// ========== VERIFICAR SE É DARK ==========
function isDarkMode() {
    return temaAtual === 'dark';
}

// ========== VERIFICAR SE É LIT ==========
function isLitMode() {
    return temaAtual === 'lit';
}

// ========== CONFIGURAR OUVINTES DE SWITCH ==========
function configurarSwitchesTema() {
    // Switch principal nas definições
    const switchPrincipal = document.getElementById('switch-tema');
    if (switchPrincipal) {
        switchPrincipal.checked = isDarkMode();
        switchPrincipal.addEventListener('change', function () {
            aplicarTema(this.checked ? 'dark' : 'lit');
            mostrarToastTema(this.checked ? 'dark' : 'lit');
        });
    }

    // Todos os switches de tema
    document.querySelectorAll('.switch-tema-input').forEach(input => {
        input.checked = isDarkMode();
        input.addEventListener('change', function () {
            aplicarTema(this.checked ? 'dark' : 'lit');
            mostrarToastTema(this.checked ? 'dark' : 'lit');
        });
    });

    // Botões de alternância rápida
    document.querySelectorAll('.btn-alternar-tema').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alternarTema();
        });
    });
}

// ========== SINCRONIZAR COM PÁGINAS ==========
function sincronizarTemaEntrePaginas() {
    // Ouvir mudanças de tema em outras abas
    window.addEventListener('storage', (e) => {
        if (e.key === CONFIG_TEMA.chaveStorage && e.newValue) {
            if (e.newValue !== temaAtual) {
                aplicarTema(e.newValue);
            }
        }
    });
}

// ========== EXPORTAR PARA USO GLOBAL ==========
window.tema = {
    inicializar: inicializarTema,
    aplicar: aplicarTema,
    alternar: alternarTema,
    getAtual: getTemaAtual,
    isDark: isDarkMode,
    isLit: isLitMode,
    configurarSwitches: configurarSwitchesTema
};

// ========== INICIALIZAR AO CARREGAR ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    sincronizarTemaEntrePaginas();

    // Configurar switches após um pequeno delay (garantir DOM pronto)
    setTimeout(configurarSwitchesTema, 100);

    // Reconfigurar quando o DOM mudar (SPA simulada)
    document.addEventListener('pagina-carregada', () => {
        setTimeout(configurarSwitchesTema, 100);
    });
});

console.log('🎨 Sistema de temas pronto! (Lit ↔ Dark)');