/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: postagem.js - Sistema de Postagem
   ============================================= */

const CONFIG_POSTAGEM = {
    chaveStorage: 'musica-alendaria-postes',
    maxPostagensPorUsuario: 50
};

const estadoPostagem = {
    postagens: [],
    enviando: false
};

// ========== INICIALIZAÇÃO ==========
function inicializarPostagem() {
    carregarPostagens();
    configurarFormPostagem();
    console.log('📤 Postagem pronto!');
}

// ========== CARREGAR ==========
function carregarPostagens() {
    try {
        const saved = localStorage.getItem(CONFIG_POSTAGEM.chaveStorage);
        estadoPostagem.postagens = saved ? JSON.parse(saved) : [];
    } catch (e) {
        estadoPostagem.postagens = [];
    }
}

// ========== SALVAR ==========
function salvarPostagens() {
    localStorage.setItem(CONFIG_POSTAGEM.chaveStorage, JSON.stringify(estadoPostagem.postagens));
}

// ========== CRIAR POSTAGEM ==========
function criarPostagem(dados) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) {
        mostrarToast('Faça login para postar', 'erro');
        return null;
    }

    // Validar campos obrigatórios
    if (!dados.artista || !dados.link) {
        mostrarToast('Nome do artista e link são obrigatórios', 'erro');
        return null;
    }

    const novaPostagem = {
        id: 'post-' + Date.now(),
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        artista: dados.artista,
        link: dados.link,
        visibilidade: dados.visibilidade || 'publico',
        bloqueio: dados.bloqueio || 'bloquear',
        descricao: dados.descricao || '',
        estilo: dados.estilo || 'Diversa',
        lingua: dados.lingua || '',
        ano: dados.ano || '',
        dataCriacao: new Date().toISOString(),
        status: 'aprovado',
        likes: [],
        quemDeuLike: []
    };

    estadoPostagem.postagens.unshift(novaPostagem);
    salvarPostagens();

    console.log('📤 Postagem criada:', novaPostagem.artista);
    return novaPostagem;
}

// ========== CONFIGURAR FORMULÁRIO ==========
function configurarFormPostagem() {
    const form = document.getElementById('form-postagem');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const dados = {
            artista: document.getElementById('post-artista')?.value.trim() || '',
            link: document.getElementById('post-link')?.value.trim() || '',
            visibilidade: document.querySelector('input[name="visibilidade"]:checked')?.value || 'publico',
            bloqueio: document.querySelector('input[name="bloqueio"]:checked')?.value || 'bloquear',
            descricao: document.getElementById('post-descricao')?.value.trim() || '',
            estilo: document.getElementById('post-estilo')?.value.trim() || 'Diversa',
            lingua: document.getElementById('post-lingua')?.value.trim() || '',
            ano: document.getElementById('post-ano')?.value.trim() || ''
        };

        const postagem = criarPostagem(dados);

        if (postagem) {
            form.reset();
            document.getElementById('preview-video').style.display = 'none';
            document.querySelector('input[name="visibilidade"][value="publico"]').checked = true;
            document.querySelector('input[name="bloqueio"][value="bloquear"]').checked = true;
            mostrarToast('✅ Postagem publicada com sucesso!', 'sucesso');
        }
    });
}

// ========== DAR LIKE (1 por usuário por poste) ==========
function darLike(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return false;

    const poste = estadoPostagem.postagens.find(p => p.id === posteId);
    if (!poste) return false;

    if (!poste.quemDeuLike) poste.quemDeuLike = [];

    // Verificar se já deu like
    if (poste.quemDeuLike.includes(usuario.id)) {
        return false; // Já deu like
    }

    poste.quemDeuLike.push(usuario.id);
    poste.likes = (poste.likes || 0) + 1;
    salvarPostagens();
    return true;
}

// ========== REMOVER LIKE ==========
function removerLike(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return false;

    const poste = estadoPostagem.postagens.find(p => p.id === posteId);
    if (!poste || !poste.quemDeuLike) return false;

    const index = poste.quemDeuLike.indexOf(usuario.id);
    if (index === -1) return false;

    poste.quemDeuLike.splice(index, 1);
    poste.likes = Math.max(0, (poste.likes || 1) - 1);
    salvarPostagens();
    return true;
}

// ========== VERIFICAR SE USUÁRIO DEU LIKE ==========
function jaDeuLike(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return false;
    const poste = estadoPostagem.postagens.find(p => p.id === posteId);
    return poste?.quemDeuLike?.includes(usuario.id) || false;
}

// ========== REGISTRAR LIKE (desbloquear/assistir completo) ==========
function registrarLikeAutomatico(posteId) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) return;

    const poste = estadoPostagem.postagens.find(p => p.id === posteId);
    if (!poste) return;

    if (!poste.quemDeuLike) poste.quemDeuLike = [];

    if (!poste.quemDeuLike.includes(usuario.id)) {
        poste.quemDeuLike.push(usuario.id);
        poste.likes = (poste.likes || 0) + 1;
        salvarPostagens();
    }
}

// ========== EDITAR POSTE ==========
function editarPoste(posteId, novosDados) {
    const index = estadoPostagem.postagens.findIndex(p => p.id === posteId);
    if (index === -1) return false;

    estadoPostagem.postagens[index] = {
        ...estadoPostagem.postagens[index],
        artista: novosDados.artista || estadoPostagem.postagens[index].artista,
        descricao: novosDados.descricao || '',
        estilo: novosDados.estilo || 'Diversa',
        lingua: novosDados.lingua || '',
        ano: novosDados.ano || '',
        visibilidade: novosDados.visibilidade || estadoPostagem.postagens[index].visibilidade,
        bloqueio: novosDados.bloqueio || estadoPostagem.postagens[index].bloqueio
    };

    salvarPostagens();
    return true;
}

// ========== APAGAR POSTE ==========
function apagarPoste(posteId) {
    estadoPostagem.postagens = estadoPostagem.postagens.filter(p => p.id !== posteId);
    salvarPostagens();
}

// ========== OBTER POSTES PÚBLICOS (HOME) ==========
function getPostesPublicos() {
    return estadoPostagem.postagens.filter(p => p.visibilidade === 'publico');
}

// ========== OBTER POSTES DO USUÁRIO ==========
function getPostesDoUsuario(usuarioId) {
    return estadoPostagem.postagens.filter(p => p.usuarioId === usuarioId);
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
window.postagem = {
    inicializar: inicializarPostagem,
    criar: criarPostagem,
    editar: editarPoste,
    apagar: apagarPoste,
    darLike: darLike,
    removerLike: removerLike,
    jaDeuLike: jaDeuLike,
    registrarLike: registrarLikeAutomatico,
    getPublicos: getPostesPublicos,
    getDoUsuario: getPostesDoUsuario,
    getTodas: () => estadoPostagem.postagens
};

document.addEventListener('DOMContentLoaded', inicializarPostagem);

console.log('📤 Postagem pronto! (Bloquear/Não Bloquear + Like único)');