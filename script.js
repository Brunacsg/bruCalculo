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
    if (produtos.length === 0) {
        produtosLista.innerHTML = '<p style="text-align:center;color:#b96bb8;">Nenhum produto cadastrado ainda.</p>';
        atualizarGrafico();
        return;
    }
    produtos.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <button class="remove-btn" title="Remover" onclick="removerProduto(${idx})">✖</button>
            <div class="info">
                <strong>${p.nome}</strong>
                <span>Data: <b>${p.data ? formatarDataBR(p.data) : '-'}</b></span>
                <span>Custo: <b>${formatarMoeda(p.custo)}</b></span>
                <span>Venda: <b>${formatarMoeda(p.venda)}</b></span>
                <span>Qtd: <b>${p.quantidade}</b></span>
                <span>Lucro/un: <b>${formatarMoeda(p.lucroUnidade)}</b></span>
                <span>Lucro total: <b>${formatarMoeda(p.lucroTotal)}</b></span>
                <span>Margem: <b>${p.porcentagemLucro}%</b></span>
            </div>
        `;
        produtosLista.appendChild(card);
    });
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

// PDF - jsPDF
if (btnPDF) {
    btnPDF.addEventListener('click', function() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('jsPDF não carregado!');
            return;
        }
        const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 16;
        // Título
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Controle de Lucro de Produtos', pageWidth/2, y, { align: 'center' });
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${formatarDataHoraBR(new Date())}`, pageWidth/2, y, { align: 'center' });
        y += 10;
        // Cabeçalho da tabela
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Produto', 10, y);
        doc.text('Data', 50, y);
        doc.text('Custo', 75, y);
        doc.text('Venda', 100, y);
        doc.text('Qtd', 125, y);
        doc.text('Lucro/un', 140, y);
        doc.text('Lucro total', 165, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        // Linhas da tabela
        produtos.forEach((p) => {
            doc.text(p.nome, 10, y);
            doc.text(p.data ? formatarDataBR(p.data) : '-', 50, y);
            doc.text(formatarMoeda(p.custo), 75, y, { align: 'right' });
            doc.text(formatarMoeda(p.venda), 100, y, { align: 'right' });
            doc.text(String(p.quantidade), 125, y, { align: 'right' });
            doc.text(formatarMoeda(p.lucroUnidade), 140, y, { align: 'right' });
            doc.text(formatarMoeda(p.lucroTotal), 165, y, { align: 'right' });
            y += 7;
            if (y > 270) {
                doc.addPage();
                y = 16;
            }
        });
        y += 5;
        // Totais
        let investido = 0, vendido = 0, lucro = 0;
        produtos.forEach(p => {
            investido += p.custo * p.quantidade;
            vendido += p.venda * p.quantidade;
            lucro += (p.venda - p.custo) * p.quantidade;
        });
        doc.setFont('helvetica', 'bold');
        doc.text('Totais:', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Investido: ${formatarMoeda(investido)}`, 40, y);
        doc.text(`Vendido: ${formatarMoeda(vendido)}`, 90, y);
        doc.text(`Lucro: ${formatarMoeda(lucro)}`, 140, y);
        // Download
        doc.save('relatorio_lucro.pdf');
    });
}

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
