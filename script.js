// Navegação SPA entre seções
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = {
        dashboard: ['dashboard-section','insights-section','graph-section','history-section','form-section'],
        produtos: ['produtos-section'],
        relatorios: ['relatorios-section'],
        config: ['config-section']
    };
    function showSection(key) {
        // Esconde todas as seções
        document.querySelectorAll('.dashboard-main > section').forEach(sec => sec.style.display = 'none');
        // Mostra as do grupo
        (sections[key]||[]).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        // Ativa link
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector('.sidebar-nav a[data-section="'+key+'"]');
        if (active) active.classList.add('active');
    }
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sec = link.getAttribute('data-section');
            showSection(sec);
            // Produtos: renderizar lista
            if (sec === 'produtos') renderizarProdutosProdutos();
            // Reforçar eventos do formulário e botão de imagem ao exibir seção de cadastro
            if (sec === 'dashboard') {
                reforcarEventosForm();
            }
        });
    });
    // Inicial: dashboard
    showSection('dashboard');
    // Reforçar eventos ao carregar
    reforcarEventosForm();
// Garante que os eventos do formulário e do botão de imagem estejam sempre ativos
function reforcarEventosForm() {
    const form = document.getElementById('product-form');
    const btnImg = document.getElementById('btn-img');
    if (form) {
        // Remove qualquer evento antigo para evitar duplicidade
        form.onsubmit = null;
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Buscar elementos do formulário no momento do submit
            const nomeInput = form.querySelector('#nome');
            const dataInput = form.querySelector('#data');
            const custoInput = form.querySelector('#custo');
            const vendaInput = form.querySelector('#venda');
            const quantidadeInput = form.querySelector('#quantidade');
            const nome = nomeInput.value.trim();
            const data = dataInput.value;
            const custo = parseMoeda(custoInput.value);
            const venda = parseMoeda(vendaInput.value);
            const quantidade = parseInt(quantidadeInput.value, 10);
            const erro = validarCampos(nome, data, custo, venda, quantidade);
            if (erro) {
                alert(erro);
                return;
            }
            const lucroUnidade = venda - custo;
            const lucroTotal = lucroUnidade * quantidade;
            const porcentagemLucro = custo > 0 ? ((lucroUnidade / custo) * 100).toFixed(1) : '0.0';
            produtos.push({
                nome,
                data,
                custo,
                venda,
                quantidade,
                lucroUnidade,
                lucroTotal,
                porcentagemLucro
            });
            salvarProdutos();
            atualizarDashboard();
            renderizarProdutos();
            form.reset();
            custoInput.value = '';
            vendaInput.value = '';
            quantidadeInput.value = 1;
            nomeInput.focus();
        });
    }
    if (btnImg && !btnImg._eventBound) {
        btnImg.addEventListener('click', async function() {
            // ...código de exportação já existente...
            let overlay = document.createElement('div');
            overlay.id = 'img-loading-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(255,255,255,0.7)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 9999;
            overlay.innerHTML = '<div style="background:rgba(255,255,255,0.9);padding:24px 32px;border-radius:18px;box-shadow:0 4px 24px 0 rgba(180,120,200,0.13);font-size:1.2rem;color:#b96bb8;display:flex;align-items:center;gap:10px;"><span class="loader" style="width:24px;height:24px;border:3px solid #e9b6d2;border-top:3px solid #b96bb8;border-radius:50%;display:inline-block;animation:spin 1s linear infinite;"></span>Gerando imagem premium...</div>';
            document.body.appendChild(overlay);
            const dashboard = document.getElementById('dashboard');
            const produtosLista = document.getElementById('produtos-lista');
            const chartCanvas = document.getElementById('lucroChart');
            if (!dashboard || !produtosLista || !chartCanvas) {
                document.body.removeChild(overlay);
                alert('Não foi possível capturar os dados.');
                return;
            }
            let totalInvestido = document.getElementById('total-investido').textContent;
            let totalVendido = document.getElementById('total-vendido').textContent;
            let lucroTotal = document.getElementById('lucro-total').textContent;
            let qtdVendas = 0;
            let topProduto = '';
            let maiorLucro = -Infinity;
            let produtos = [];
            produtosLista.querySelectorAll('.card').forEach(card => {
                let nome = card.querySelector('strong')?.textContent || '';
                let lucro = 0;
                card.querySelectorAll('span').forEach(span => {
                    if (span.textContent.toLowerCase().includes('lucro total')) {
                        let val = span.querySelector('b')?.textContent?.replace(/[^
,.-]/g, '').replace(',', '.') || '0';
                        lucro = parseFloat(val);
                    }
                });
                produtos.push({ nome, lucro });
                if (lucro > maiorLucro) {
                    maiorLucro = lucro;
                    topProduto = nome;
                }
                qtdVendas++;
            });
            let chartImg = chartCanvas.toDataURL('image/png', 1.0);
            let dataAtual = new Date();
            let dataStr = dataAtual.toLocaleDateString('pt-BR');
            const exportDiv = document.createElement('div');
            exportDiv.id = 'export-image';
            exportDiv.innerHTML = `
            <div class="export-gradient">
                <div class="export-header">
                    <div class="export-title"><span class="icon">📊</span> Relatório de Vendas</div>
                    <div class="export-subtitle">Resumo financeiro do período</div>
                    <div class="export-date">${dataStr}</div>
                </div>
                <div class="export-dashboard">
                    <div class="export-card">
                        <span class="icon">💰</span>
                        <span>Total Investido</span>
                        <strong>${totalInvestido}</strong>
                    </div>
                    <div class="export-card">
                        <span class="icon">🛒</span>
                        <span>Total Vendido</span>
                        <strong>${totalVendido}</strong>
                    </div>
                    <div class="export-card">
                        <span class="icon">📈</span>
                        <span>Lucro Total</span>
                        <strong>${lucroTotal}</strong>
                    </div>
                    <div class="export-card">
                        <span class="icon">🏆</span>
                        <span>Top Produto</span>
                        <strong>${topProduto || '-'}</strong>
                    </div>
                </div>
                <div class="export-section">
                    <div class="export-section-title">Gráfico de Lucro</div>
                    <img src="${chartImg}" class="export-chart-img" alt="Gráfico de Lucro" />
                </div>
                <div class="export-section">
                    <div class="export-section-title">Histórico de Vendas</div>
                    <div class="export-historico">
                        ${produtos.length > 0 ? produtos.map(p => `<div class='export-produto'><span class='icon'>📦</span> <b>${p.nome}</b> <span class='lucro'>${p.lucro.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</span></div>`).join('') : '<div class="export-vazio">Nenhuma venda registrada.</div>'}
                    </div>
                </div>
                <div class="export-resumo">
                    <div><span class="icon">🔢</span> Total de vendas realizadas: <b>${qtdVendas}</b></div>
                    <div><span class="icon">💡</span> Margem de lucro: <b>${lucroTotal && totalInvestido && totalInvestido !== 'R$ 0,00' ? ((parseFloat(lucroTotal.replace(/[^\d,.-]/g, '').replace(',', '.')) / parseFloat(totalInvestido.replace(/[^\d,.-]/g, '').replace(',', '.')) * 100).toFixed(1) : '0.0'}%</b></div>
                </div>
                <div class="export-motivacional">✨ Continue crescendo! Compartilhe seu sucesso. ✨</div>
                <div class="export-footer">Feito com <span class="icon">💜</span> por Bruna | bruCalculo</div>
            </div>
            `;
            document.body.appendChild(exportDiv);
            await new Promise(r => setTimeout(r, 100));
            await html2canvas(exportDiv, {
                backgroundColor: "#fff",
                scale: 3,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                let data = new Date();
                let dataStr = data.toISOString().slice(0,10);
                let link = document.createElement('a');
                link.download = `relatorio-vendas-${dataStr}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.98);
                link.click();
            }).catch(() => {
                alert('Erro ao gerar imagem.');
            });
            document.body.removeChild(overlay);
            document.body.removeChild(exportDiv);
        });
        btnImg._eventBound = true;
    }
}

    // Modal de perfil
    const avatar = document.querySelector('.user-avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', () => {
            let modal = document.createElement('div');
            modal.className = 'modal-perfil';
            modal.innerHTML = `<div class='modal-content'><h2>Perfil</h2><p>Usuária: <b>Bruna</b></p><button class='btn-glass close-modal'>Fechar</button></div>`;
            Object.assign(modal.style, {position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999});
            modal.querySelector('.close-modal').onclick = () => document.body.removeChild(modal);
            document.body.appendChild(modal);
        });
    }
});

// Renderizar lista de produtos na aba Produtos
function renderizarProdutosProdutos() {
    const lista = document.getElementById('produtos-lista-produtos');
    if (!lista) return;
    if (produtos.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:#b96bb8;">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    lista.innerHTML = '';
    produtos.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="info">
                <strong>${p.nome}</strong>
                <span>Data: <b>${formatarDataBR(p.data)}</b></span>
                <span>Custo: <b>${formatarMoeda(p.custo)}</b></span>
                <span>Venda: <b>${formatarMoeda(p.venda)}</b></span>
                <span>Qtd: <b>${p.quantidade}</b></span>
                <span>Lucro/un: <b>${formatarMoeda(p.lucroUnidade)}</b></span>
                <span>Lucro total: <b>${formatarMoeda(p.lucroTotal)}</b></span>
                <span>Margem: <b>${p.porcentagemLucro}%</b></span>
            </div>
        `;
        lista.appendChild(card);
    });
}
// script.js
// Controle de Lucro de Produtos - Mobile First, Glassmorphism, Chart.js

// Utilidades de máscara e formatação
function mascaraMoeda(valor) {
    valor = valor.replace(/\D/g, "");
    valor = (parseInt(valor, 10) / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return valor;
}
function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
function parseMoeda(valor) {
    if (!valor) return 0;
    return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
}

// DOM Elements
const form = document.getElementById('product-form');
const nomeInput = document.getElementById('nome');
const dataInput = document.getElementById('data');
const custoInput = document.getElementById('custo');
const vendaInput = document.getElementById('venda');
const quantidadeInput = document.getElementById('quantidade');
const produtosLista = document.getElementById('produtos-lista');
const totalInvestido = document.getElementById('total-investido');
const totalVendido = document.getElementById('total-vendido');
const lucroTotal = document.getElementById('lucro-total');
const btnPDF = document.getElementById('btn-pdf');
let lucroChart;

// Estado
let produtos = [];

// Carregar do localStorage
function carregarProdutos() {
    const dados = localStorage.getItem('produtosLucro');
    produtos = dados ? JSON.parse(dados) : [];
}
function salvarProdutos() {
    localStorage.setItem('produtosLucro', JSON.stringify(produtos));
}

// Atualizar Dashboard
function atualizarDashboard() {
    let investido = 0, vendido = 0, lucro = 0;
    produtos.forEach(p => {
        investido += p.custo * p.quantidade;
        vendido += p.venda * p.quantidade;
        lucro += (p.venda - p.custo) * p.quantidade;
    });
    totalInvestido.textContent = formatarMoeda(investido);
    totalVendido.textContent = formatarMoeda(vendido);
    lucroTotal.textContent = formatarMoeda(lucro);
}

// Renderizar Lista de Produtos
function renderizarProdutos() {
    produtosLista.innerHTML = '';
    const insightsDiv = document.getElementById('insights');
    if (insightsDiv) insightsDiv.innerHTML = '';
    if (produtos.length === 0) {
        produtosLista.innerHTML = '<p style="text-align:center;color:#b96bb8;">Nenhum produto cadastrado ainda.</p>';
        if (insightsDiv) insightsDiv.innerHTML = '<div class="insight-card"><span class="icon">💡</span>Adicione produtos para ver insights automáticos!</div>';
        atualizarGrafico();
        return;
    }
    let totalLucro = 0, totalVendas = 0, maiorLucro = -Infinity, topProduto = '', vendasRecentes = 0, ticketMedio = 0, datas = [];
    produtos.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <button class="remove-btn" title="Remover" onclick="removerProduto(${idx})">✖</button>
            <div class="info">
                <strong>${p.nome}</strong>
                <span>Data: <b>${formatarDataBR(p.data)}</b></span>
                <span>Custo: <b>${formatarMoeda(p.custo)}</b></span>
                <span>Venda: <b>${formatarMoeda(p.venda)}</b></span>
                <span>Qtd: <b>${p.quantidade}</b></span>
                <span>Lucro/un: <b>${formatarMoeda(p.lucroUnidade)}</b></span>
                <span>Lucro total: <b>${formatarMoeda(p.lucroTotal)}</b></span>
                <span>Margem: <b>${p.porcentagemLucro}%</b></span>
            </div>
        `;
        card.style.animationDelay = (idx * 0.07) + 's';
        produtosLista.appendChild(card);
        totalLucro += p.lucroTotal;
        totalVendas += p.quantidade;
        if (p.lucroTotal > maiorLucro) {
            maiorLucro = p.lucroTotal;
            topProduto = p.nome;
        }
        datas.push(p.data);
    });
    // Insights inteligentes
    if (insightsDiv) {
        let cards = [];
        // Top produto
        cards.push(`<div class='insight-card'><span class='icon'>🏆</span>Top produto: <b>${topProduto}</b> (${formatarMoeda(maiorLucro)})</div>`);
        // Ticket médio
        ticketMedio = totalLucro / totalVendas;
        cards.push(`<div class='insight-card'><span class='icon'>💳</span>Ticket médio: <b>${formatarMoeda(ticketMedio)}</b></div>`);
        // Vendas recentes (últimos 7 dias)
        const hoje = new Date();
        vendasRecentes = produtos.filter(p => {
            if (!p.data) return false;
            const dataVenda = new Date(p.data);
            return (hoje - dataVenda) / (1000*60*60*24) <= 7;
        }).length;
        cards.push(`<div class='insight-card'><span class='icon'>⏱️</span>Vendas nos últimos 7 dias: <b>${vendasRecentes}</b></div>`);
        // Crescimento (comparação entre primeira e última venda)
        datas.sort();
        let crescimento = '-';
        if (datas.length > 1) {
            const primeira = new Date(datas[0]);
            const ultima = new Date(datas[datas.length-1]);
            const dias = (ultima-primeira)/(1000*60*60*24);
            crescimento = dias > 0 ? ((totalLucro/dias).toFixed(2)) : '-';
        }
        cards.push(`<div class='insight-card'><span class='icon'>📈</span>Crescimento médio diário: <b>${crescimento === '-' ? '-' : formatarMoeda(crescimento)}</b></div>`);
        insightsDiv.innerHTML = cards.join('');
    }
    atualizarGrafico();
}

// Remover Produto
window.removerProduto = function(idx) {
    produtos.splice(idx, 1);
    salvarProdutos();
    atualizarDashboard();
    renderizarProdutos();
};

// Atualizar Gráfico
function atualizarGrafico() {
    const ctx = document.getElementById('lucroChart').getContext('2d');
    if (lucroChart) lucroChart.destroy();
    lucroChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: produtos.map(p => p.nome),
            datasets: [{
                label: 'Lucro Total',
                data: produtos.map(p => p.lucroTotal),
                backgroundColor: 'rgba(185, 107, 184, 0.35)',
                borderColor: 'rgba(185, 107, 184, 0.7)',
                borderWidth: 2,
                borderRadius: 12,
                hoverBackgroundColor: 'rgba(233, 182, 210, 0.6)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatarMoeda(ctx.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatarMoeda(value)
                    }
                }
            },
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Máscara de moeda
function aplicarMascaraMoeda(input) {
    input.addEventListener('input', function(e) {
        let v = this.value.replace(/\D/g, '');
        v = (parseInt(v, 10) / 100).toFixed(2) + '';
        v = v.replace('.', ',');
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        this.value = v;
    });
}
aplicarMascaraMoeda(custoInput);
aplicarMascaraMoeda(vendaInput);

// Formatação automática ao sair do campo
function formatarAoSair(input) {
    input.addEventListener('blur', function() {
        let valor = parseMoeda(this.value);
        this.value = mascaraMoeda(String(Math.round(valor * 100)));
    });
}
formatarAoSair(custoInput);
formatarAoSair(vendaInput);

// Validação
function validarCampos(nome, data, custo, venda, quantidade) {
    if (!nome.trim()) return 'Informe o nome do produto';
    if (!data) return 'Informe a data da venda';
    if (custo <= 0) return 'Custo deve ser maior que zero';
    if (venda <= 0) return 'Valor de venda deve ser maior que zero';
    if (quantidade < 1) return 'Quantidade deve ser pelo menos 1';
    if (venda < custo) return 'Valor de venda não pode ser menor que o custo';
    return null;
}

// Submissão do Formulário
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const data = dataInput.value;
    const custo = parseMoeda(custoInput.value);
    const venda = parseMoeda(vendaInput.value);
    const quantidade = parseInt(quantidadeInput.value, 10);
    const erro = validarCampos(nome, data, custo, venda, quantidade);
    if (erro) {
        alert(erro);
        return;
    }
    const lucroUnidade = venda - custo;
    const lucroTotal = lucroUnidade * quantidade;
    const porcentagemLucro = custo > 0 ? ((lucroUnidade / custo) * 100).toFixed(1) : '0.0';
    produtos.push({
        nome,
        data,
        custo,
        venda,
        quantidade,
        lucroUnidade,
        lucroTotal,
        porcentagemLucro
    });
    salvarProdutos();
    atualizarDashboard();
    renderizarProdutos();
    form.reset();
    custoInput.value = '';
    vendaInput.value = '';
    quantidadeInput.value = 1;
    nomeInput.focus();
});

// Formatar data para BR
function formatarDataBR(dataISO) {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}


// Salvar como Imagem (html2canvas)
const btnImg = document.getElementById('btn-img');
if (btnImg) {
        btnImg.addEventListener('click', async function() {
                // Overlay de loading
                let overlay = document.createElement('div');
                overlay.id = 'img-loading-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.background = 'rgba(255,255,255,0.7)';
                overlay.style.display = 'flex';
                overlay.style.alignItems = 'center';
                overlay.style.justifyContent = 'center';
                overlay.style.zIndex = 9999;
                overlay.innerHTML = '<div style="background:rgba(255,255,255,0.9);padding:24px 32px;border-radius:18px;box-shadow:0 4px 24px 0 rgba(180,120,200,0.13);font-size:1.2rem;color:#b96bb8;display:flex;align-items:center;gap:10px;"><span class="loader" style="width:24px;height:24px;border:3px solid #e9b6d2;border-top:3px solid #b96bb8;border-radius:50%;display:inline-block;animation:spin 1s linear infinite;"></span>Gerando imagem premium...</div>';
                document.body.appendChild(overlay);

                // Dados para exportação
                const dashboard = document.getElementById('dashboard');
                const produtosLista = document.getElementById('produtos-lista');
                const chartCanvas = document.getElementById('lucroChart');
                if (!dashboard || !produtosLista || !chartCanvas) {
                        document.body.removeChild(overlay);
                        alert('Não foi possível capturar os dados.');
                        return;
                }

                // Dados de resumo
                let totalInvestido = document.getElementById('total-investido').textContent;
                let totalVendido = document.getElementById('total-vendido').textContent;
                let lucroTotal = document.getElementById('lucro-total').textContent;
                let qtdVendas = 0;
                let topProduto = '';
                let maiorLucro = -Infinity;
                let produtos = [];
                produtosLista.querySelectorAll('.card').forEach(card => {
                        let nome = card.querySelector('strong')?.textContent || '';
                        let lucro = 0;
                        card.querySelectorAll('span').forEach(span => {
                                if (span.textContent.toLowerCase().includes('lucro total')) {
                                        let val = span.querySelector('b')?.textContent?.replace(/[^\d,.-]/g, '').replace(',', '.') || '0';
                                        lucro = parseFloat(val);
                                }
                        });
                        produtos.push({ nome, lucro });
                        if (lucro > maiorLucro) {
                                maiorLucro = lucro;
                                topProduto = nome;
                        }
                        qtdVendas++;
                });

                // Clonar gráfico como imagem
                let chartImg = chartCanvas.toDataURL('image/png', 1.0);

                // Data atual
                let dataAtual = new Date();
                let dataStr = dataAtual.toLocaleDateString('pt-BR');

                // Criar container premium para exportação
                const exportDiv = document.createElement('div');
                exportDiv.id = 'export-image';
                exportDiv.innerHTML = `
                <div class="export-gradient">
                    <div class="export-header">
                        <div class="export-title"><span class="icon">📊</span> Relatório de Vendas</div>
                        <div class="export-subtitle">Resumo financeiro do período</div>
                        <div class="export-date">${dataStr}</div>
                    </div>
                    <div class="export-dashboard">
                        <div class="export-card">
                            <span class="icon">💰</span>
                            <span>Total Investido</span>
                            <strong>${totalInvestido}</strong>
                        </div>
                        <div class="export-card">
                            <span class="icon">🛒</span>
                            <span>Total Vendido</span>
                            <strong>${totalVendido}</strong>
                        </div>
                        <div class="export-card">
                            <span class="icon">📈</span>
                            <span>Lucro Total</span>
                            <strong>${lucroTotal}</strong>
                        </div>
                        <div class="export-card">
                            <span class="icon">🏆</span>
                            <span>Top Produto</span>
                            <strong>${topProduto || '-'}</strong>
                        </div>
                    </div>
                    <div class="export-section">
                        <div class="export-section-title">Gráfico de Lucro</div>
                        <img src="${chartImg}" class="export-chart-img" alt="Gráfico de Lucro" />
                    </div>
                    <div class="export-section">
                        <div class="export-section-title">Histórico de Vendas</div>
                        <div class="export-historico">
                            ${produtos.length > 0 ? produtos.map(p => `<div class='export-produto'><span class='icon'>📦</span> <b>${p.nome}</b> <span class='lucro'>${p.lucro.toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}</span></div>`).join('') : '<div class="export-vazio">Nenhuma venda registrada.</div>'}
                        </div>
                    </div>
                    <div class="export-resumo">
                        <div><span class="icon">🔢</span> Total de vendas realizadas: <b>${qtdVendas}</b></div>
                        <div><span class="icon">💡</span> Margem de lucro: <b>${lucroTotal && totalInvestido && totalInvestido !== 'R$ 0,00' ? ((parseFloat(lucroTotal.replace(/[^\d,.-]/g, '').replace(',', '.')) / parseFloat(totalInvestido.replace(/[^\d,.-]/g, '').replace(',', '.')) * 100).toFixed(1) : '0.0'}%</b></div>
                    </div>
                    <div class="export-motivacional">✨ Continue crescendo! Compartilhe seu sucesso. ✨</div>
                    <div class="export-footer">Feito com <span class="icon">💜</span> por Bruna | bruCalculo</div>
                </div>
                `;
                document.body.appendChild(exportDiv);

                // Esperar renderização
                await new Promise(r => setTimeout(r, 100));

                await html2canvas(exportDiv, {
                        backgroundColor: "#fff",
                        scale: 3,
                        useCORS: true,
                        allowTaint: true
                }).then(canvas => {
                        let data = new Date();
                        let dataStr = data.toISOString().slice(0,10);
                        let link = document.createElement('a');
                        link.download = `relatorio-vendas-${dataStr}.jpg`;
                        link.href = canvas.toDataURL('image/jpeg', 0.98);
                        link.click();
                }).catch(() => {
                        alert('Erro ao gerar imagem.');
                });

                // Remover overlay e container temporário
                document.body.removeChild(overlay);
                document.body.removeChild(exportDiv);
        });
}

// Loader animado
const style = document.createElement('style');
style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
document.head.appendChild(style);

function formatarDataHoraBR(date) {
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Inicialização
function init() {
    carregarProdutos();
    atualizarDashboard();
    renderizarProdutos();
}
init();
