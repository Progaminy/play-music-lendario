/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: eventos.js - Sistema de Eventos
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_EVENTOS = {
    chaveStorage: 'musica-alendaria-eventos',
    maxEventosPorPagina: 10,
    tiposEvento: DB.filtros.tiposEvento
};

// ========== ESTADO ==========
const estadoEventos = {
    lista: [],
    filtroTipo: '',
    filtroData: 'todos', // 'todos', 'futuros', 'passados', 'hoje'
    paginaAtual: 1
};

// ========== INICIALIZAÇÃO ==========
function inicializarEventos() {
    // Carregar eventos
    carregarEventos();

    // Configurar UI
    configurarFormEvento();
    configurarFiltrosEventos();
    configurarListaEventos();

    console.log('📅 Sistema de eventos pronto!');
}

// ========== CARREGAR EVENTOS ==========
function carregarEventos() {
    // Carregar da base de dados mock
    estadoEventos.lista = [...DB.eventos];

    // Ordenar por data (mais próximos primeiro)
    ordenarEventosPorData();
}

// ========== ORDENAR EVENTOS ==========
function ordenarEventosPorData() {
    estadoEventos.lista.sort((a, b) => {
        const dataA = new Date(a.data + 'T' + (a.hora || '00:00'));
        const dataB = new Date(b.data + 'T' + (b.hora || '00:00'));
        return dataA - dataB;
    });
}

// ========== CRIAR EVENTO ==========
function criarEvento(dadosEvento) {
    const usuario = window.auth?.getUsuarioAtual();
    if (!usuario) {
        mostrarToast('Faça login para criar eventos', 'erro');
        return null;
    }

    // Validar tipo (obrigatório)
    if (!dadosEvento.tipo) {
        mostrarToast('O tipo de evento é obrigatório', 'erro');
        return null;
    }

    const novoEvento = {
        id: 'evento-' + Date.now(),
        usuarioId: usuario.id,
        tipo: dadosEvento.tipo,
        titulo: dadosEvento.titulo || `Evento de ${usuario.nome}`,
        descricao: dadosEvento.descricao || '',
        data: dadosEvento.data || '',
        hora: dadosEvento.hora || '',
        local: dadosEvento.local || '',
        foto: dadosEvento.foto || '',
        video: dadosEvento.video || '',
        audio: dadosEvento.audio || '',
        status: 'pendente', // Pendente de aprovação
        dataCriacao: new Date().toISOString(),
        criador: {
            nome: usuario.nome,
            fotoPerfil: usuario.fotoPerfil || ''
        }
    };

    // Adicionar à lista
    estadoEventos.lista.unshift(novoEvento);
    salvarEventos();

    // Simular envio para aprovação
    simularAprovacaoEvento(novoEvento);

    // Atualizar UI
    renderizarListaEventos();

    console.log('📅 Evento criado:', novoEvento.titulo);
    return novoEvento;
}

// ========== SIMULAR APROVAÇÃO ==========
function simularAprovacaoEvento(evento) {
    mostrarToast('📧 Evento enviado para aprovação!', 'info');

    // Simular aprovação automática após 2 segundos (para teste)
    setTimeout(() => {
        const eventoEncontrado = estadoEventos.lista.find(e => e.id === evento.id);
        if (eventoEncontrado) {
            eventoEncontrado.status = 'aprovado';
            salvarEventos();
            renderizarListaEventos();
            mostrarToast('✅ Evento aprovado!', 'sucesso');
        }
    }, 2000);
}

// ========== EDITAR EVENTO ==========
function editarEvento(eventoId, novosDados) {
    const index = estadoEventos.lista.findIndex(e => e.id === eventoId);
    if (index === -1) return false;

    estadoEventos.lista[index] = {
        ...estadoEventos.lista[index],
        ...novosDados,
        status: 'pendente' // Volta para aprovação
    };

    salvarEventos();
    simularAprovacaoEvento(estadoEventos.lista[index]);
    renderizarListaEventos();

    console.log('✏️ Evento editado:', eventoId);
    return true;
}

// ========== APAGAR EVENTO ==========
function apagarEvento(eventoId) {
    const evento = estadoEventos.lista.find(e => e.id === eventoId);
    if (!evento) return false;

    window.modal?.confirmacao(
        `Tem certeza que deseja apagar o evento "${evento.titulo}"?`,
        () => {
            estadoEventos.lista = estadoEventos.lista.filter(e => e.id !== eventoId);
            salvarEventos();
            renderizarListaEventos();
            mostrarToast('🗑️ Evento apagado', 'info');
        }
    );

    return true;
}

// ========== SALVAR EVENTOS ==========
function salvarEventos() {
    localStorage.setItem(CONFIG_EVENTOS.chaveStorage, JSON.stringify(estadoEventos.lista));
    // Também atualizar DB mock
    DB.eventos = [...estadoEventos.lista];
}

// ========== FILTRAR EVENTOS ==========
function getEventosFiltrados() {
    let eventos = [...estadoEventos.lista];

    // Filtrar por tipo
    if (estadoEventos.filtroTipo) {
        eventos = eventos.filter(e => e.tipo === estadoEventos.filtroTipo);
    }

    // Filtrar por data
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    switch (estadoEventos.filtroData) {
        case 'hoje':
            eventos = eventos.filter(e => {
                const dataEvento = new Date(e.data + 'T00:00:00');
                return dataEvento.getTime() === hoje.getTime();
            });
            break;
        case 'futuros':
            eventos = eventos.filter(e => {
                const dataEvento = new Date(e.data + 'T' + (e.hora || '00:00'));
                return dataEvento >= new Date();
            });
            break;
        case 'passados':
            eventos = eventos.filter(e => {
                const dataEvento = new Date(e.data + 'T' + (e.hora || '00:00'));
                return dataEvento < new Date();
            });
            break;
    }

    // Mostrar apenas aprovados (exceto para o criador)
    const usuario = window.auth?.getUsuarioAtual();
    if (usuario) {
        eventos = eventos.filter(e =>
            e.status === 'aprovado' || e.usuarioId === usuario.id
        );
    } else {
        eventos = eventos.filter(e => e.status === 'aprovado');
    }

    return eventos;
}

// ========== CONFIGURAR FORMULÁRIO DE EVENTO ==========
function configurarFormEvento() {
    const formEvento = document.getElementById('form-evento');
    if (!formEvento) return;

    // Popular tipos de evento
    const selectTipo = document.getElementById('evento-tipo');
    if (selectTipo) {
        selectTipo.innerHTML = '<option value="">Selecionar tipo *</option>' +
            CONFIG_EVENTOS.tiposEvento.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    formEvento.addEventListener('submit', function (e) {
        e.preventDefault();

        const dados = {
            tipo: document.getElementById('evento-tipo')?.value || '',
            titulo: document.getElementById('evento-titulo')?.value || '',
            descricao: document.getElementById('evento-descricao')?.value || '',
            data: document.getElementById('evento-data')?.value || '',
            hora: document.getElementById('evento-hora')?.value || '',
            local: document.getElementById('evento-local')?.value || '',
            foto: document.getElementById('evento-foto')?.value || '',
            video: document.getElementById('evento-video')?.value || '',
            audio: document.getElementById('evento-audio')?.value || ''
        };

        if (!dados.tipo) {
            mostrarToast('O tipo de evento é obrigatório', 'erro');
            return;
        }

        criarEvento(dados);

        // Limpar formulário
        formEvento.reset();
    });
}

// ========== CONFIGURAR FILTROS DE EVENTOS ==========
function configurarFiltrosEventos() {
    // Filtro por tipo
    const selectTipo = document.getElementById('filtro-evento-tipo');
    if (selectTipo) {
        selectTipo.innerHTML = '<option value="">Todos os tipos</option>' +
            CONFIG_EVENTOS.tiposEvento.map(t => `<option value="${t}">${t}</option>`).join('');

        selectTipo.addEventListener('change', function () {
            estadoEventos.filtroTipo = this.value;
            renderizarListaEventos();
        });
    }

    // Filtro por data
    const botoesData = document.querySelectorAll('.filtro-evento-data');
    botoesData.forEach(btn => {
        btn.addEventListener('click', function () {
            botoesData.forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            estadoEventos.filtroData = this.dataset.dataFiltro || 'todos';
            renderizarListaEventos();
        });
    });
}

// ========== CONFIGURAR LISTA DE EVENTOS ==========
function configurarListaEventos() {
    renderizarListaEventos();
}

// ========== RENDERIZAR LISTA DE EVENTOS ==========
function renderizarListaEventos() {
    const container = document.querySelector('.grid-eventos') ||
                      document.querySelector('.lista-eventos');
    if (!container) return;

    const eventos = getEventosFiltrados();

    if (eventos.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio" style="grid-column: 1 / -1;">
                <div class="vazio-icone">📅</div>
                <h4 class="vazio-titulo">Nenhum evento encontrado</h4>
                <p class="vazio-descricao">
                    ${temFiltrosEventosAtivos() ? 'Tente alterar os filtros.' : 'Nenhum evento disponível no momento.'}
                </p>
                ${!temFiltrosEventosAtivos() ? `
                    <button class="btn btn-primario" onclick="window.modal?.postagem()">
                        + Criar Evento
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = eventos.map((evento, index) => criarCardEvento(evento, index)).join('');
}

// ========== CRIAR CARD DE EVENTO ==========
function criarCardEvento(evento, index) {
    const dataEvento = evento.data ? new Date(evento.data + 'T00:00:00') : null;
    const dia = dataEvento ? dataEvento.getDate().toString().padStart(2, '0') : '??';
    const mes = dataEvento ? dataEvento.toLocaleString('pt', { month: 'short' }) : '???';

    const isPassado = dataEvento && dataEvento < new Date();
    const statusBadge = evento.status === 'pendente'
        ? '<span class="badge badge-pendente">⏳ Pendente</span>'
        : '';

    const fotoEvento = evento.foto || evento.criador?.fotoPerfil || '';

    return `
        <div class="card-evento stagger-item ${isPassado ? 'evento-passado' : ''}"
             style="animation-delay: ${index * 0.05}s">
            <div class="data-evento">
                <span class="dia-evento">${dia}</span>
                <span class="mes-evento">${mes}</span>
            </div>
            <div class="info-evento">
                <span class="tipo-evento">${evento.tipo}</span>
                ${statusBadge}
                <h4 class="nome-evento">${evento.titulo || 'Evento sem título'}</h4>
                ${evento.descricao ? `<p style="font-size: 0.8rem; color: var(--texto-secundario); margin: 0.25rem 0;">${evento.descricao.substring(0, 100)}${evento.descricao.length > 100 ? '...' : ''}</p>` : ''}
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.75rem; color: var(--texto-terciario);">
                    ${evento.hora ? `<span>🕐 ${evento.hora}</span>` : ''}
                    ${evento.local ? `<span>📍 ${evento.local}</span>` : ''}
                </div>
                ${fotoEvento ? `
                    <img src="${fotoEvento}" alt="${evento.titulo}"
                         style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-top: 0.75rem;"
                         onclick="event.stopPropagation(); window.modal?.imagem('${fotoEvento}', '${evento.titulo}')">
                ` : `
                    <div style="width: 100%; height: 80px; background: var(--fundo-secundario); border-radius: 8px; margin-top: 0.75rem; display: flex; align-items: center; justify-content: center;">
                        <span style="color: var(--texto-terciario); font-size: 0.75rem;">
                            ${evento.criador?.fotoPerfil ? `<img src="${evento.criador.fotoPerfil}" style="width: 40px; height: 40px; border-radius: 50%;">` : '📷 Sem imagem'}
                        </span>
                    </div>
                `}
                ${evento.criador ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                        ${evento.criador.fotoPerfil ? `<img src="${evento.criador.fotoPerfil}" style="width: 24px; height: 24px; border-radius: 50%;">` : ''}
                        <span style="font-size: 0.7rem; color: var(--texto-terciario);">por ${evento.criador.nome}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========== VERIFICAR FILTROS ATIVOS ==========
function temFiltrosEventosAtivos() {
    return estadoEventos.filtroTipo !== '' || estadoEventos.filtroData !== 'todos';
}

// ========== COMPARTILHAR EVENTO ==========
function compartilharEvento(eventoId) {
    const evento = estadoEventos.lista.find(e => e.id === eventoId);
    if (!evento) return;

    const texto = `📅 ${evento.titulo}\n📌 ${evento.tipo}\n📆 ${evento.data} ${evento.hora || ''}\n📍 ${evento.local || ''}\n\nVia Musica Alendaria - Do Zero ao Infinito! 🚀`;

    if (navigator.share) {
        navigator.share({
            title: evento.titulo,
            text: texto
        }).catch(() => {
            copiarTexto(texto);
        });
    } else {
        copiarTexto(texto);
    }
}

function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('📋 Informações do evento copiadas!', 'sucesso');
    }).catch(() => {
        mostrarToast('Erro ao copiar', 'erro');
    });
}

// ========== ADICIONAR AO CALENDÁRIO ==========
function adicionarAoCalendario(eventoId) {
    const evento = estadoEventos.lista.find(e => e.id === eventoId);
    if (!evento || !evento.data) return;

    const dataInicio = new Date(evento.data + 'T' + (evento.hora || '00:00'));
    const dataFim = new Date(dataInicio.getTime() + 3 * 60 * 60 * 1000); // +3 horas

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.titulo)}&dates=${dataInicio.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${dataFim.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(evento.descricao || '')}&location=${encodeURIComponent(evento.local || '')}`;

    window.open(googleCalUrl, '_blank');
    mostrarToast('📅 Abrindo Google Calendar...', 'info');
}

// ========== TOAST ==========
function mostrarToast(mensagem, tipo = 'info') {
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

// ========== EXPORTAR ==========
window.eventos = {
    inicializar: inicializarEventos,
    criar: criarEvento,
    editar: editarEvento,
    apagar: apagarEvento,
    getFiltrados: getEventosFiltrados,
    compartilhar: compartilharEvento,
    adicionarAoCalendario: adicionarAoCalendario,
    getLista: () => estadoEventos.lista
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarEventos);

console.log('📅 Eventos prontos!');