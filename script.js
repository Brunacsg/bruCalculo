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


// Salvar como Imagem (html2canvas)
const btnImg = document.getElementById('btn-img');
if (btnImg) {
    btnImg.addEventListener('click', async function() {
        // Elemento a capturar: container principal
        const container = document.querySelector('.container');
        if (!container) return;

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
        overlay.innerHTML = '<div style="background:rgba(255,255,255,0.9);padding:24px 32px;border-radius:18px;box-shadow:0 4px 24px 0 rgba(180,120,200,0.13);font-size:1.2rem;color:#b96bb8;display:flex;align-items:center;gap:10px;"><span class="loader" style="width:24px;height:24px;border:3px solid #e9b6d2;border-top:3px solid #b96bb8;border-radius:50%;display:inline-block;animation:spin 1s linear infinite;"></span>Gerando imagem...</div>';
        document.body.appendChild(overlay);

        // Captura apenas dashboard e cards de produtos
        const dashboard = document.getElementById('dashboard');
        const produtosLista = document.getElementById('produtos-lista');
        if (!dashboard || !produtosLista) {
            document.body.removeChild(overlay);
            alert('Não foi possível capturar os dados.');
            return;
        }

        // Criar wrapper temporário para exportação
        const exportWrapper = document.createElement('div');
        exportWrapper.style.background = '#f8e1f4';
        exportWrapper.style.padding = '24px 8px';
        exportWrapper.style.borderRadius = '24px';
        exportWrapper.style.maxWidth = '430px';
        exportWrapper.style.margin = '0 auto';
        exportWrapper.style.display = 'flex';
        exportWrapper.style.flexDirection = 'column';
        exportWrapper.style.gap = '18px';
        exportWrapper.style.boxShadow = '0 8px 48px 0 rgba(180,120,200,0.18)';

        // Clonar dashboard e cards de produtos
        exportWrapper.appendChild(dashboard.cloneNode(true));
        if (produtosLista.childElementCount > 0) {
            const cardsClone = produtosLista.cloneNode(true);
            exportWrapper.appendChild(cardsClone);
        }

        document.body.appendChild(exportWrapper);

        await html2canvas(exportWrapper, {
            backgroundColor: '#f8e1f4',
            scale: window.devicePixelRatio || 2,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY
        }).then(canvas => {
            let data = new Date();
            let dataStr = data.toISOString().slice(0,10);
            let link = document.createElement('a');
            link.download = `resultado-vendas-${dataStr}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        }).catch(() => {
            alert('Erro ao gerar imagem.');
        });

        // Remover overlay e wrapper temporário
        document.body.removeChild(overlay);
        document.body.removeChild(exportWrapper);
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
