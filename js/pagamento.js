/* =============================================
   MUSICA ALENDARIA - Do Zero ao Infinito
   Criado por Pensador Sem Fronteira
   ARQUIVO: pagamento.js - Simulação de Pagamento
   ============================================= */

const CONFIG_PAGAMENTO = {
    metodos: ['numero', 'cartao', 'mpesa', 'emola'],
    moeda: 'KZ',
    valorDesbloqueio: 100
};

const estadoPagamento = {
    pagamentosRealizados: [],
    modalAberto: false
};

// ========== INICIALIZAÇÃO ==========
function inicializarPagamento() {
    carregarPagamentos();
    console.log('💳 Pagamento pronto!');
}

function carregarPagamentos() {
    try {
        const saved = localStorage.getItem('musica-alendaria-pagamentos');
        estadoPagamento.pagamentosRealizados = saved ? JSON.parse(saved) : [];
    } catch (e) {
        estadoPagamento.pagamentosRealizados = [];
    }
}

function salvarPagamentos() {
    localStorage.setItem('musica-alendaria-pagamentos', JSON.stringify(estadoPagamento.pagamentosRealizados));
}

// ========== MOSTRAR MODAL DE PAGAMENTO ==========
function mostrarModalPagamento(poste, callback) {
    if (estadoPagamento.modalAberto) return;
    estadoPagamento.modalAberto = true;

    // Remover modal anterior se existir
    const anterior = document.querySelector('.modal-pagamento');
    if (anterior) anterior.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-pagamento';
    overlay.style.zIndex = '4000';
    overlay.innerHTML = `
        <div class="modal-conteudo" style="max-width: 450px; padding: 1.5rem; text-align: center; animation: fadeInScale 0.3s ease;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">💳</div>
            <h3 style="margin-bottom: 0.25rem;">Desbloquear Conteúdo</h3>
            <p style="font-size: 0.9rem; color: var(--texto-secundario); margin-bottom: 0.25rem;">
                <strong>${poste.artista}</strong>
            </p>
            <p style="font-size: 0.8rem; color: var(--texto-terciario); margin-bottom: 1rem;">
                ${poste.estilo || 'Diversa'} • Valor: <strong>${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda}</strong>
            </p>
            
            <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem;">Escolha o método de pagamento:</p>
            
            <div id="lista-metodos-pagamento" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                <button class="btn btn-secundario metodo-pagamento-btn" data-metodo="numero" 
                    style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; text-align: left; width: 100%;">
                    <span style="font-size: 1.8rem;">🔢</span>
                    <div style="text-align: left;">
                        <div style="font-weight: 600;">Digitar um Número</div>
                        <div style="font-size: 0.7rem; color: var(--texto-terciario);">Digite qualquer número para confirmar</div>
                    </div>
                </button>
                
                <button class="btn btn-secundario metodo-pagamento-btn" data-metodo="cartao" 
                    style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; text-align: left; width: 100%;">
                    <span style="font-size: 1.8rem;">💳</span>
                    <div style="text-align: left;">
                        <div style="font-weight: 600;">Cartão Bancário</div>
                        <div style="font-size: 0.7rem; color: var(--texto-terciario);">Visa, Mastercard, Multicaixa</div>
                    </div>
                </button>
                
                <button class="btn btn-secundario metodo-pagamento-btn" data-metodo="mpesa" 
                    style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; text-align: left; width: 100%;">
                    <span style="font-size: 1.8rem;">📱</span>
                    <div style="text-align: left;">
                        <div style="font-weight: 600;">M-Pesa</div>
                        <div style="font-size: 0.7rem; color: var(--texto-terciario);">Pagamento via telefone móvel</div>
                    </div>
                </button>
                
                <button class="btn btn-secundario metodo-pagamento-btn" data-metodo="emola" 
                    style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; text-align: left; width: 100%;">
                    <span style="font-size: 1.8rem;">💰</span>
                    <div style="text-align: left;">
                        <div style="font-weight: 600;">EMOLA</div>
                        <div style="font-size: 0.7rem; color: var(--texto-terciario);">Carteira digital EMOLA</div>
                    </div>
                </button>
            </div>

            <div id="form-pagamento-container" style="display: none;"></div>
            
            <button class="btn btn-secundario btn-pequeno" id="btn-cancelar-pagamento" style="width: 100%;">Cancelar</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-aberto');

    // Selecionar método
    overlay.querySelectorAll('.metodo-pagamento-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const metodo = this.dataset.metodo;
            overlay.querySelector('#lista-metodos-pagamento').style.display = 'none';
            overlay.querySelector('#btn-cancelar-pagamento').style.display = 'none';
            mostrarFormPagamento(metodo, overlay, poste, callback);
        });
    });

    // Cancelar
    overlay.querySelector('#btn-cancelar-pagamento').addEventListener('click', () => fecharModalPagamento(overlay));
    
    // Fechar ao clicar fora
    overlay.addEventListener('click', function(e) {
        if (e.target === this) fecharModalPagamento(overlay);
    });
}

// ========== MOSTRAR FORMULÁRIO DO MÉTODO ==========
function mostrarFormPagamento(metodo, overlay, poste, callback) {
    const container = overlay.querySelector('#form-pagamento-container');
    container.style.display = 'block';

    let html = '';
    
    switch (metodo) {
        case 'numero':
            html = `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">🔢 Digite qualquer número</p>
                    <p style="font-size: 0.75rem; color: var(--texto-terciario); margin-bottom: 0.75rem;">
                        Pode digitar qualquer quantidade de dígitos para confirmar o pagamento.
                    </p>
                    <input type="text" id="input-numero" placeholder="Digite um número..." 
                        style="width: 100%; padding: 12px; font-size: 1.1rem; text-align: center; border: 2px solid var(--borda); border-radius: 8px; margin-bottom: 0.75rem;">
                </div>
                <button class="btn btn-primario" id="btn-confirmar-numero" style="width: 100%;">
                    ✅ Confirmar Pagamento - ${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda}
                </button>
            `;
            break;
            
        case 'cartao':
            html = `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">💳 Dados do Cartão</p>
                    <input type="text" id="input-cartao-numero" placeholder="Número do Cartão (16 dígitos)" 
                        style="width: 100%; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px; margin-bottom: 0.5rem;" maxlength="16">
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="input-cartao-validade" placeholder="MM/AA" 
                            style="flex: 1; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px;" maxlength="5">
                        <input type="text" id="input-cartao-cvv" placeholder="CVV" 
                            style="flex: 1; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px;" maxlength="4">
                    </div>
                    <input type="text" id="input-cartao-nome" placeholder="Nome no Cartão" 
                        style="width: 100%; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px; margin-top: 0.5rem;">
                </div>
                <button class="btn btn-primario" id="btn-confirmar-cartao" style="width: 100%;">
                    💳 Pagar ${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda}
                </button>
            `;
            break;
            
        case 'mpesa':
            html = `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">📱 M-Pesa</p>
                    <p style="font-size: 0.75rem; color: var(--texto-terciario); margin-bottom: 0.75rem;">
                        Receberá uma notificação no seu telefone para confirmar o pagamento.
                    </p>
                    <div style="background: var(--fundo-secundario); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.75rem;">
                        <p style="font-size: 0.8rem; font-weight: 600;">Entidade: <strong>Musica Alendaria</strong></p>
                        <p style="font-size: 0.8rem;">Referência: <strong id="ref-mpesa">${gerarReferencia()}</strong></p>
                        <p style="font-size: 0.8rem;">Valor: <strong>${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda}</strong></p>
                    </div>
                </div>
                <button class="btn btn-primario" id="btn-confirmar-mpesa" style="width: 100%;">
                    📱 Confirmar Pagamento M-Pesa
                </button>
            `;
            break;
            
        case 'emola':
            html = `
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">💰 EMOLA</p>
                    <p style="font-size: 0.75rem; color: var(--texto-terciario); margin-bottom: 0.75rem;">
                        Pagamento via carteira digital EMOLA.
                    </p>
                    <input type="tel" id="input-emola-telefone" placeholder="Número EMOLA (ex: +244 9XX XXX XXX)" 
                        style="width: 100%; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px; margin-bottom: 0.5rem;">
                    <input type="text" id="input-emola-pin" placeholder="PIN EMOLA (4 dígitos)" 
                        style="width: 100%; padding: 12px; font-size: 1rem; border: 2px solid var(--borda); border-radius: 8px;" maxlength="4" type="password">
                </div>
                <button class="btn btn-primario" id="btn-confirmar-emola" style="width: 100%;">
                    💰 Pagar com EMOLA - ${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda}
                </button>
            `;
            break;
    }

    html += `
        <button class="btn btn-secundario btn-pequeno" id="btn-voltar-metodos" style="width: 100%; margin-top: 0.5rem;">
            ← Voltar
        </button>
    `;

    container.innerHTML = html;

    // Botão voltar
    container.querySelector('#btn-voltar-metodos').addEventListener('click', () => {
        container.style.display = 'none';
        overlay.querySelector('#lista-metodos-pagamento').style.display = 'flex';
        overlay.querySelector('#btn-cancelar-pagamento').style.display = 'block';
    });

    // Confirmar pagamento
    const btnConfirmar = container.querySelector('[id^="btn-confirmar-"]');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            confirmarPagamento(metodo, poste, overlay, callback);
        });
    }
}

// ========== CONFIRMAR PAGAMENTO ==========
function confirmarPagamento(metodo, poste, overlay, callback) {
    // Mostrar loading
    const container = overlay.querySelector('#form-pagamento-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
            <div class="spinner spinner-grande" style="margin: 0 auto 1rem;"></div>
            <p style="font-weight: 600;">🔄 Processando pagamento...</p>
            <p style="font-size: 0.8rem; color: var(--texto-terciario);">Método: ${getNomeMetodo(metodo)}</p>
        </div>
    `;

    // Simular processamento
    setTimeout(() => {
        // Registrar pagamento
        const usuario = window.auth?.getUsuarioAtual();
        const pagamento = {
            id: 'pag-' + Date.now(),
            usuarioId: usuario?.id || 'anonimo',
            posteId: poste.id,
            posteArtista: poste.artista,
            metodo: metodo,
            valor: CONFIG_PAGAMENTO.valorDesbloqueio,
            moeda: CONFIG_PAGAMENTO.moeda,
            data: new Date().toISOString(),
            status: 'confirmado'
        };

        estadoPagamento.pagamentosRealizados.push(pagamento);
        salvarPagamentos();

        // Mostrar sucesso
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 4rem; animation: bounce 0.6s ease;">✅</div>
                <h4 style="margin: 0.5rem 0;">Pagamento Confirmado!</h4>
                <p style="font-size: 0.85rem; color: var(--texto-secundario);">
                    ${CONFIG_PAGAMENTO.valorDesbloqueio} ${CONFIG_PAGAMENTO.moeda} via ${getNomeMetodo(metodo)}
                </p>
                <p style="font-size: 0.8rem; color: var(--cor-acento); font-weight: 600;">
                    🎉 Conteúdo desbloqueado com sucesso!
                </p>
            </div>
        `;

        // Fechar modal após 1.5s
        setTimeout(() => {
            fecharModalPagamento(overlay);
            if (callback) callback();
        }, 1500);

        console.log('💳 Pagamento confirmado:', pagamento);
    }, 2000);
}

// ========== FECHAR MODAL ==========
function fecharModalPagamento(overlay) {
    overlay.classList.add('fechando');
    setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('modal-aberto');
        estadoPagamento.modalAberto = false;
    }, 250);
}

// ========== UTILITÁRIAS ==========
function gerarReferencia() {
    return 'REF-' + Date.now().toString(36).toUpperCase().slice(-8);
}

function getNomeMetodo(metodo) {
    const nomes = {
        'numero': 'Número Digital',
        'cartao': 'Cartão Bancário',
        'mpesa': 'M-Pesa',
        'emola': 'EMOLA'
    };
    return nomes[metodo] || metodo;
}

// ========== EXPORTAR ==========
window.pagamento = {
    inicializar: inicializarPagamento,
    mostrarModal: mostrarModalPagamento,
    getPagamentos: () => estadoPagamento.pagamentosRealizados,
    getTotal: () => estadoPagamento.pagamentosRealizados.reduce((s, p) => s + p.valor, 0)
};

document.addEventListener('DOMContentLoaded', inicializarPagamento);

console.log('💳 Pagamento pronto! (Número, Cartão, M-Pesa, EMOLA)');