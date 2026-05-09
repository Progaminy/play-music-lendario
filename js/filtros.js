/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: filtros.js - Sistema de Filtros
   ============================================= */

// ========== CONFIGURAÇÃO ==========
const CONFIG_FILTROS = {
    chaveStorage: 'musica-alendaria-filtros',
    debounceMs: 300
};

// ========== ESTADO DOS FILTROS ==========
const estadoFiltros = {
    ativos: {
        nomeArtista: '',
        tituloMusica: '',
        pais: '',
        provincia: '',
        estilo: '',
        lingua: ''
    },
    disponiveis: DB.filtros,
    resultados: [],
    buscaLivre: '',
    timerDebounce: null
};

// ========== INICIALIZAÇÃO ==========
function inicializarFiltros() {
    // Restaurar filtros salvos
    restaurarFiltros();

    // Configurar UI
    configurarBarraFiltros();
    configurarBuscaLivre();
    configurarFiltrosAvancados();

    console.log('🔍 Sistema de filtros pronto!');
}

// ========== RESTAURAR FILTROS ==========
function restaurarFiltros() {
    try {
        const saved = localStorage.getItem(CONFIG_FILTROS.chaveStorage);
        if (saved) {
            estadoFiltros.ativos = { ...estadoFiltros.ativos, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Erro ao restaurar filtros');
    }
}

// ========== SALVAR FILTROS ==========
function salvarFiltros() {
    localStorage.setItem(CONFIG_FILTROS.chaveStorage, JSON.stringify(estadoFiltros.ativos));
}

// ========== CONFIGURAR BARRA DE FILTROS ==========
function configurarBarraFiltros() {
    // Filtros rápidos (tags clicáveis)
    document.querySelectorAll('.filtro-item').forEach(item => {
        item.addEventListener('click', function () {
            const tipo = this.dataset.filtroTipo;
            const valor = this.dataset.filtroValor;

            if (!tipo || !valor) return;

            // Alternar filtro
            if (estadoFiltros.ativos[tipo] === valor) {
                // Remover filtro
                estadoFiltros.ativos[tipo] = '';
                this.classList.remove('ativo');
            } else {
                // Aplicar filtro
                estadoFiltros.ativos[tipo] = valor;
                // Remover ativo de outros do mesmo tipo
                document.querySelectorAll(`.filtro-item[data-filtro-tipo="${tipo}"]`).forEach(i => i.classList.remove('ativo'));
                this.classList.add('ativo');
            }

            aplicarFiltros();
        });

        // Verificar se já está ativo
        const tipo = item.dataset.filtroTipo;
        const valor = item.dataset.filtroValor;
        if (estadoFiltros.ativos[tipo] === valor) {
            item.classList.add('ativo');
        }
    });

    // Botão limpar filtros
    const btnLimpar = document.getElementById('limpar-filtros');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparTodosFiltros);
    }
}

// ========== CONFIGURAR BUSCA LIVRE ==========
function configurarBuscaLivre() {
    const searchInput = document.getElementById('busca-livre');
    if (!searchInput) return;

    searchInput.value = estadoFiltros.buscaLivre;

    searchInput.addEventListener('input', function () {
        clearTimeout(estadoFiltros.timerDebounce);
        estadoFiltros.timerDebounce = setTimeout(() => {
            estadoFiltros.buscaLivre = this.value.trim();
            aplicarFiltros();
        }, CONFIG_FILTROS.debounceMs);
    });

    // Botão limpar busca
    const btnClear = searchInput.parentElement?.querySelector('.search-clear');
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            searchInput.value = '';
            estadoFiltros.buscaLivre = '';
            aplicarFiltros();
        });
    }
}

// ========== CONFIGURAR FILTROS AVANÇADOS ==========
function configurarFiltrosAvancados() {
    // Select de país
    const selectPais = document.getElementById('filtro-pais');
    if (selectPais) {
        popularSelect(selectPais, estadoFiltros.disponiveis.paises, 'Todos os países');
        selectPais.value = estadoFiltros.ativos.pais;
        selectPais.addEventListener('change', function () {
            estadoFiltros.ativos.pais = this.value;
            aplicarFiltros();
            atualizarProvincias();
        });
    }

    // Select de província
    const selectProvincia = document.getElementById('filtro-provincia');
    if (selectProvincia) {
        atualizarProvincias();
        selectProvincia.value = estadoFiltros.ativos.provincia;
        selectProvincia.addEventListener('change', function () {
            estadoFiltros.ativos.provincia = this.value;
            aplicarFiltros();
        });
    }

    // Select de estilo
    const selectEstilo = document.getElementById('filtro-estilo');
    if (selectEstilo) {
        popularSelect(selectEstilo, estadoFiltros.disponiveis.generos, 'Todos os estilos');
        selectEstilo.value = estadoFiltros.ativos.estilo;
        selectEstilo.addEventListener('change', function () {
            estadoFiltros.ativos.estilo = this.value;
            aplicarFiltros();
        });
    }

    // Select de língua
    const selectLingua = document.getElementById('filtro-lingua');
    if (selectLingua) {
        popularSelect(selectLingua, estadoFiltros.disponiveis.linguas, 'Todas as línguas');
        selectLingua.value = estadoFiltros.ativos.lingua;
        selectLingua.addEventListener('change', function () {
            estadoFiltros.ativos.lingua = this.value;
            aplicarFiltros();
        });
    }
}

// ========== POPULAR SELECT ==========
function popularSelect(select, opcoes, placeholder = 'Todos') {
    select.innerHTML = `<option value="">${placeholder}</option>` +
        opcoes.map(op => `<option value="${op}">${op}</option>`).join('');
}

// ========== ATUALIZAR PROVÍNCIAS BASEADO NO PAÍS ==========
function atualizarProvincias() {
    const selectProvincia = document.getElementById('filtro-provincia');
    if (!selectProvincia) return;

    const paisSelecionado = estadoFiltros.ativos.pais;

    // Filtrar províncias pelo país (simplificado - mock)
    let provincias = estadoFiltros.disponiveis.provincias;
    if (paisSelecionado === 'Angola') {
        provincias = ['Luanda', 'Benguela', 'Huíla', 'Namibe', 'Cabinda', 'Huambo', 'Bié', 'Malanje'];
    } else if (paisSelecionado === 'Portugal') {
        provincias = ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Aveiro'];
    } else if (paisSelecionado === 'Brasil') {
        provincias = ['São Paulo', 'Rio de Janeiro', 'Bahia', 'Minas Gerais', 'Pernambuco'];
    }

    popularSelect(selectProvincia, provincias, 'Todas as províncias');
    selectProvincia.value = estadoFiltros.ativos.provincia;
}

// ========== APLICAR FILTROS ==========
function aplicarFiltros() {
    let resultados = [...DB.musicas];

    // Filtro por nome do artista
    if (estadoFiltros.ativos.nomeArtista) {
        const nome = estadoFiltros.ativos.nomeArtista.toLowerCase();
        resultados = resultados.filter(m => {
            const artista = buscarArtista(m.artistaId);
            return artista && artista.nome.toLowerCase().includes(nome);
        });
    }

    // Filtro por título da música
    if (estadoFiltros.ativos.tituloMusica) {
        const titulo = estadoFiltros.ativos.tituloMusica.toLowerCase();
        resultados = resultados.filter(m => m.titulo.toLowerCase().includes(titulo));
    }

    // Filtro por país
    if (estadoFiltros.ativos.pais) {
        const pais = estadoFiltros.ativos.pais;
        resultados = resultados.filter(m => {
            const artista = buscarArtista(m.artistaId);
            return artista && artista.pais === pais;
        });
    }

    // Filtro por província
    if (estadoFiltros.ativos.provincia) {
        const provincia = estadoFiltros.ativos.provincia;
        resultados = resultados.filter(m => {
            const artista = buscarArtista(m.artistaId);
            return artista && artista.provincia === provincia;
        });
    }

    // Filtro por estilo
    if (estadoFiltros.ativos.estilo) {
        const estilo = estadoFiltros.ativos.estilo.toLowerCase();
        resultados = resultados.filter(m => m.genero.toLowerCase() === estilo);
    }

    // Filtro por língua
    if (estadoFiltros.ativos.lingua) {
        const lingua = estadoFiltros.ativos.lingua.toLowerCase();
        resultados = resultados.filter(m => m.lingua.toLowerCase() === lingua);
    }

    // Busca livre (nome da música, artista, gênero, língua)
    if (estadoFiltros.buscaLivre) {
        const termo = estadoFiltros.buscaLivre.toLowerCase();
        resultados = resultados.filter(m => {
            const artista = buscarArtista(m.artistaId);
            return m.titulo.toLowerCase().includes(termo) ||
                (artista && artista.nome.toLowerCase().includes(termo)) ||
                m.genero.toLowerCase().includes(termo) ||
                m.lingua.toLowerCase().includes(termo);
        });
    }

    estadoFiltros.resultados = resultados;
    salvarFiltros();
    atualizarUIResultados(resultados);

    console.log(`🔍 Filtros aplicados: ${resultados.length} resultados`);
}

// ========== ATUALIZAR UI COM RESULTADOS ==========
function atualizarUIResultados(resultados) {
    // Atualizar contador
    const contador = document.getElementById('resultados-contador');
    if (contador) {
        contador.textContent = `${resultados.length} música(s) encontrada(s)`;
    }

    // Atualizar grid de músicas
    const gridMusicas = document.querySelector('.grid-musicas');
    if (gridMusicas) {
        if (resultados.length === 0) {
            gridMusicas.innerHTML = `
                <div class="estado-vazio" style="grid-column: 1 / -1;">
                    <div class="vazio-icone">🔍</div>
                    <h4 class="vazio-titulo">Nenhum resultado</h4>
                    <p class="vazio-descricao">
                        Nenhuma música encontrada com os filtros atuais. Tente outros filtros.
                    </p>
                    <button class="btn btn-secundario" onclick="window.filtros.limparTodos()">
                        Limpar Filtros
                    </button>
                </div>
            `;
        } else {
            gridMusicas.innerHTML = resultados.map((m, i) => {
                const artista = buscarArtista(m.artistaId);
                return `
                    <div class="card-musica-v stagger-item" 
                         data-musica-id="${m.id}"
                         style="animation-delay: ${i * 0.05}s"
                         onclick="window.player.tocar(buscarMusica('${m.id}'))">
                        <img src="${m.capa}" alt="${m.titulo}" class="capa-musica">
                        <div class="info-musica">
                            <div class="titulo-musica">${m.titulo}</div>
                            <div class="artista-musica">${artista?.nome || ''}</div>
                            <div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
                                <span class="badge badge-primario">${m.genero}</span>
                                <span class="badge badge-contorno">${m.lingua}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Atualizar lista de músicas (outra visualização)
    const listaMusicas = document.querySelector('.lista-musicas');
    if (listaMusicas && !document.querySelector('.grid-musicas')) {
        if (resultados.length === 0) {
            listaMusicas.innerHTML = `
                <div class="estado-vazio">
                    <div class="vazio-icone">🔍</div>
                    <p class="vazio-descricao">Nenhuma música encontrada.</p>
                </div>
            `;
        } else {
            listaMusicas.innerHTML = resultados.map((m, i) => {
                const artista = buscarArtista(m.artistaId);
                return `
                    <div class="card-musica-h stagger-item" 
                         data-musica-id="${m.id}"
                         style="animation-delay: ${i * 0.05}s"
                         onclick="window.player.tocar(buscarMusica('${m.id}'))">
                        <img src="${m.capa}" alt="${m.titulo}" class="capa-musica">
                        <div class="info-musica">
                            <div class="titulo-musica">${m.titulo}</div>
                            <div class="artista-musica">${artista?.nome || ''} • ${m.ano} • ${m.duracao}</div>
                        </div>
                        <span class="badge badge-primario">${m.genero}</span>
                    </div>
                `;
            }).join('');
        }
    }

    // Atualizar indicador de filtros ativos
    atualizarIndicadorFiltrosAtivos();
}

// ========== INDICADOR DE FILTROS ATIVOS ==========
function atualizarIndicadorFiltrosAtivos() {
    const container = document.getElementById('filtros-ativos-tags');
    if (!container) return;

    const filtrosAtivos = Object.entries(estadoFiltros.ativos)
        .filter(([_, valor]) => valor !== '');

    if (filtrosAtivos.length === 0 && !estadoFiltros.buscaLivre) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    let tags = '';

    if (estadoFiltros.buscaLivre) {
        tags += `<span class="tag ativa">🔍 "${estadoFiltros.buscaLivre}" <span class="remover-tag" onclick="window.filtros.limparBusca()">✕</span></span>`;
    }

    filtrosAtivos.forEach(([tipo, valor]) => {
        const nomeTipo = {
            nomeArtista: 'Artista',
            tituloMusica: 'Título',
            pais: 'País',
            provincia: 'Província',
            estilo: 'Estilo',
            lingua: 'Língua'
        }[tipo] || tipo;

        tags += `<span class="tag ativa">${nomeTipo}: ${valor} <span class="remover-tag" onclick="window.filtros.removerFiltro('${tipo}')">✕</span></span>`;
    });

    container.innerHTML = tags;
}

// ========== DEFINIR FILTRO ESPECÍFICO ==========
function definirFiltro(tipo, valor) {
    estadoFiltros.ativos[tipo] = valor;

    // Atualizar UI dos filtros
    if (tipo === 'pais') {
        const select = document.getElementById('filtro-pais');
        if (select) select.value = valor;
        atualizarProvincias();
    } else if (tipo === 'provincia') {
        const select = document.getElementById('filtro-provincia');
        if (select) select.value = valor;
    } else if (tipo === 'estilo') {
        const select = document.getElementById('filtro-estilo');
        if (select) select.value = valor;
    } else if (tipo === 'lingua') {
        const select = document.getElementById('filtro-lingua');
        if (select) select.value = valor;
    }

    // Atualizar tags
    document.querySelectorAll(`.filtro-item[data-filtro-tipo="${tipo}"]`).forEach(i => {
        i.classList.toggle('ativo', i.dataset.filtroValor === valor);
    });

    aplicarFiltros();
}

// ========== REMOVER FILTRO ESPECÍFICO ==========
function removerFiltro(tipo) {
    estadoFiltros.ativos[tipo] = '';

    // Limpar select relacionado
    const select = document.getElementById(`filtro-${tipo}`);
    if (select) select.value = '';

    // Limpar tags
    document.querySelectorAll(`.filtro-item[data-filtro-tipo="${tipo}"]`).forEach(i => i.classList.remove('ativo'));

    aplicarFiltros();
}

// ========== LIMPAR BUSCA ==========
function limparBusca() {
    estadoFiltros.buscaLivre = '';
    const searchInput = document.getElementById('busca-livre');
    if (searchInput) searchInput.value = '';
    aplicarFiltros();
}

// ========== LIMPAR TODOS FILTROS ==========
function limparTodosFiltros() {
    // Resetar estado
    estadoFiltros.ativos = {
        nomeArtista: '',
        tituloMusica: '',
        pais: '',
        provincia: '',
        estilo: '',
        lingua: ''
    };
    estadoFiltros.buscaLivre = '';

    // Limpar busca
    const searchInput = document.getElementById('busca-livre');
    if (searchInput) searchInput.value = '';

    // Limpar selects
    ['pais', 'provincia', 'estilo', 'lingua'].forEach(tipo => {
        const select = document.getElementById(`filtro-${tipo}`);
        if (select) select.value = '';
    });

    // Limpar tags
    document.querySelectorAll('.filtro-item').forEach(i => i.classList.remove('ativo'));

    // Aplicar
    aplicarFiltros();
    console.log('🔄 Todos os filtros foram limpos');
}

// ========== OBTER RESULTADOS ATUAIS ==========
function getResultados() {
    return estadoFiltros.resultados;
}

// ========== VERIFICAR SE HÁ FILTROS ATIVOS ==========
function temFiltrosAtivos() {
    return Object.values(estadoFiltros.ativos).some(v => v !== '') ||
        estadoFiltros.buscaLivre !== '';
}

// ========== CONTAR RESULTADOS ==========
function contarResultados() {
    return estadoFiltros.resultados.length;
}

// ========== EXPORTAR ==========
window.filtros = {
    inicializar: inicializarFiltros,
    aplicar: aplicarFiltros,
    definir: definirFiltro,
    remover: removerFiltro,
    limparTodos: limparTodosFiltros,
    limparBusca: limparBusca,
    getResultados: getResultados,
    temAtivos: temFiltrosAtivos,
    contar: contarResultados,
    getAtivos: () => estadoFiltros.ativos
};

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', inicializarFiltros);

console.log('🔍 Filtros prontos! (Nome, Título, País, Província, Estilo, Língua)');