// =======================
// BANCO LOCAL (SALVA NO NAVEGADOR)
// =======================

/* ===== STORAGE IOS FIX ===== */

const STORAGE_KEY = 'painel_vendas_app';

let storage = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || {
  produtos: [],
  vendas: [],
  metaValor: 30000
};

var produtos = storage.produtos;
var vendas = storage.vendas;
var metaValor = storage.metaValor;

var vendaSel = {};

// =======================
// HELPERS
// =======================

function salvarDados(){

  storage = {
    produtos,
    vendas,
    metaValor
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(storage)
  );
}

function fmt(v) {
  return (
    'R$ ' +
    parseFloat(v || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}

function hideAllScreens() {
  document.querySelectorAll('.screen')
    .forEach(s => s.classList.remove('active'));
}

function setNav(id) {
  document.querySelectorAll('.nav-item')
    .forEach(x => x.classList.remove('active'));

  const el = document.getElementById(id);

  if (el) {
    el.classList.add('active');
  }
}

// =======================
// HOME
// =======================

function refreshHome() {

  var faturamento = 0;
  var lucro = 0;
  var investimento = 0;
  var vendidos = 0;
  var vendidosHoje = 0;
  var estoqueValor = 0;
  var estoqueItens = 0;
  var lucroEstoque = 0;

  var hoje = new Date().toDateString();

  vendas.forEach(v => {

    faturamento += v.total;
    lucro += v.lucro;
    vendidos += v.qty;

    if(new Date(v.ts).toDateString() === hoje){
      vendidosHoje += v.qty;
    }
  });

  produtos.forEach(p => {

  investimento += p.custo * p.estoque;
  estoqueValor += p.custo * p.estoque;
  estoqueItens += p.estoque;

  // lucro estimado do estoque
  lucroEstoque +=
    (p.preco - p.custo) *
    p.estoque;

});

  // cards principais
  if(document.getElementById('h-fat'))
    document.getElementById('h-fat').textContent =
      fmt(faturamento);

  if(document.getElementById('h-lucro'))
    document.getElementById('h-lucro').textContent =
      fmt(lucro);

  if(document.getElementById('h-inv'))
    document.getElementById('h-inv').textContent =
      fmt(investimento);

  if(document.getElementById('h-vend'))
    document.getElementById('h-vend').textContent =
      vendidos + ' unidades';

  if(document.getElementById('h-vend-hoje'))
    document.getElementById('h-vend-hoje').textContent =
      vendidosHoje + ' hoje';

  if(document.getElementById('h-estq'))
    document.getElementById('h-estq').textContent =
      fmt(estoqueValor);

  if(document.getElementById('h-estq-itens'))
    document.getElementById('h-estq-itens').textContent =
      estoqueItens + ' itens';
  if(document.getElementById('h-lucest'))
  document.getElementById('h-lucest').textContent =
    fmt(lucroEstoque);

  // meta
  var pct = Math.min(
    100,
    Math.round((faturamento / metaValor) * 100)
  );

  if(document.getElementById('meta-fill'))
    document.getElementById('meta-fill').style.width =
      pct + '%';

  if(document.getElementById('meta-cur-lbl'))
    document.getElementById('meta-cur-lbl').textContent =
      fmt(faturamento) + ' alcançados';

  if(document.getElementById('meta-goal-lbl'))
    document.getElementById('meta-goal-lbl').textContent =
      'de ' + fmt(metaValor) + ' de meta';

  if(document.getElementById('meta-pct-lbl'))
    document.getElementById('meta-pct-lbl').textContent =
      pct + '%';

  renderTopProdutos();
  renderHistoricoRecente();
}

// =======================
// NAVEGAÇÃO
// =======================

function goHome() {

  hideAllScreens();

  document.getElementById('screen-home')
    .classList.add('active');

  setNav('nav-home');

  refreshHome();
}

function goTo(id) {

  hideAllScreens();

  document.getElementById(id)
    .classList.add('active');

  if(id === 'screen-produtos'){
    setNav('nav-prods');
    renderProdutos();
  }

  if(id === 'screen-venda'){
    renderVenda();
  }

  if(id === 'screen-historico'){
    setNav('nav-hist');
    renderHistorico();
  }
}

// =======================
// PRODUTOS
// =======================

function renderProdutos(){

  const wrap =
    document.getElementById(
      'prod-list-wrap'
    );

  if(!wrap) return;

  wrap.innerHTML = `
    <div class="prod-list-card">

      ${produtos.map((p,index)=>{

        const lucro =
          p.preco - p.custo;

        return `

          <div class="prod-list-row">

            <div class="prod-top">

              <div class="prod-left">

                <div class="pli-name">
                  ${p.nome}
                </div>

                <div class="pli-sub">
                  ${p.categoria}
                </div>

                <div class="stock-badge">
                  ${p.estoque} disponíveis
                </div>

              </div>

            </div>

            <div class="prod-prices">

              <div class="price-box">

                <div class="price-label">
                  Investimento
                </div>

                <div class="price-value">
                  ${fmt(p.custo)}
                </div>

              </div>

              <div class="price-box">

                <div class="price-label">
                  Venda
                </div>

                <div class="price-value">
                  ${fmt(p.preco)}
                </div>

              </div>

              <div class="price-box lucro-box">

                <div class="price-label">
                  Lucro
                </div>

                <div class="price-value">
                  ${fmt(lucro)}
                </div>

              </div>

            </div>

            <div class="prod-actions">

              <button
                class="action-btn sell-btn"
                onclick="venderProduto('${p.id}')"
              >
                🛒
              </button>

              <button
  class="action-btn edit-btn-prod"
  onclick="editarProduto(${index})"
>
  ✏️
</button>

              <button
                class="action-btn delete-btn-prod"
                onclick="apagarProduto(${index})"
              >
                🗑️
              </button>

            </div>

          </div>
        `;
      }).join('')}

    </div>
  `;
}


// =======================
// VENDA
// =======================

function vender(id){

  vendaSel[id] = (vendaSel[id] || 0) + 1;

  updateResumoVenda();
}

function renderVenda(){

  var el =
    document.getElementById('venda-list');

  if(!el) return;

  el.innerHTML = `
    <div class="prod-list-card">
      ${produtos.map(p => `
        <div class="prod-list-row">

          <div style="flex:1">
            <div class="pli-name">
              ${p.nome}
            </div>

            <div class="pli-sub">
              estoque ${p.estoque}
            </div>
          </div>

          <button class="btn-primary"
            style="width:auto;padding:10px 14px"
            onclick="vender('${p.id}')">

            vender
          </button>

        </div>
      `).join('')}
    </div>
  `;

  updateResumoVenda();
}

function updateResumoVenda(){

  var total = 0;
  var lucro = 0;

  Object.keys(vendaSel).forEach(id => {

    var p = produtos.find(x => x.id === id);

    if(!p) return;

    total += p.preco * vendaSel[id];

    lucro +=
      (p.preco - p.custo)
      * vendaSel[id];
  });

  if(document.getElementById('ss-total'))
    document.getElementById('ss-total')
      .textContent = fmt(total);

  if(document.getElementById('ss-lucro'))
    document.getElementById('ss-lucro')
      .textContent = fmt(lucro);
}

function confirmarVenda(){

  Object.keys(vendaSel).forEach(id => {

    var qty = vendaSel[id];

    if(qty <= 0) return;

    var p =
      produtos.find(x => x.id === id);

    if(!p) return;

    vendas.push({
      prodId:id,
      nomeProd:p.nome,
      qty,
      total:p.preco * qty,
      custo:p.custo * qty,
      lucro:(p.preco - p.custo) * qty,
      ts:Date.now()
    });

    p.estoque -= qty;
  });

  vendaSel = {};

  salvarDados();

  alert('Venda registrada!');

  goHome();
}

// =======================
// HISTÓRICO
// =======================

function renderHistorico(){

  var wrap =
    document.getElementById(
      'hist-full-wrap'
    );

  if(!wrap) return;

  if(vendas.length === 0){

    wrap.innerHTML = `
      <div class="prod-list-card">
        <div style="padding:20px">
          Nenhuma venda registrada
        </div>
      </div>
    `;

    return;
  }

  wrap.innerHTML = `
    <div class="prod-list-card">
      ${vendas
  .slice()
  .reverse()
  .map((v,index)=>`
        <div class="prod-list-row">

          <div style="flex:1">
            <div class="pli-name">
              ${v.nomeProd}
            </div>

            <div class="pli-sub">
              ${v.qty}x
            </div>
          </div>

          <div class="hist-actions">

  <div style="text-align:right">

    <div class="pli-price">
      ${fmt(v.total)}
    </div>

    <div class="pli-sub">
      +${fmt(v.lucro)}
    </div>

  </div>

  <button
    class="delete-sale-btn"
    onclick="excluirVenda(
      vendas.length - 1 - ${index}
    )"
  >
    🗑️
  </button>

</div>

        </div>
      `).join('')}
    </div>
  `;
}

// =======================
// HOME EXTRA
// =======================

function renderTopProdutos(){

  const el =
    document.getElementById(
      'top-prods'
    );

  if(!el) return;

  let vendasPorProduto = {};

  vendas.forEach(v => {

    if(!vendasPorProduto[v.prodId]){
      vendasPorProduto[v.prodId] = {
        qty:0,
        total:0,
        lucro:0
      };
    }

    vendasPorProduto[v.prodId].qty += v.qty;
    vendasPorProduto[v.prodId].total += v.total;
    vendasPorProduto[v.prodId].lucro += v.lucro;
  });

  const ranking =
    Object.entries(vendasPorProduto)
      .sort((a,b)=>
        b[1].qty - a[1].qty
      )
      .slice(0,5);

  if(ranking.length === 0){

    el.innerHTML = `
      <div class="empty-state">
        Nenhuma venda ainda
      </div>
    `;

    return;
  }

  el.innerHTML =
    ranking.map((item,index)=>{

      const produto =
        produtos.find(
          p => p.id === item[0]
        );

      if(!produto) return '';

      const dados = item[1];

      return `
        <div class="top-row premium-top-row">

          <div class="rank-badge">
            #${index + 1}
          </div>

          <div class="prod-info">

            <div class="prod-name">
              ${produto.nome}
            </div>

            <div class="prod-cat">
              ${dados.qty} venda(s)
            </div>

            <div class="prod-lucro">
              lucro ${fmt(dados.lucro)}
            </div>

          </div>

          <div class="prod-right">

            <div class="prod-total-label">
              total vendido
            </div>

            <div class="prod-total">
              ${fmt(dados.total)}
            </div>

          </div>

        </div>
      `;
    }).join('');
}

function renderHistoricoRecente(){

  const el =
    document.getElementById(
      'hist-recent'
    );

  if(!el) return;

  const recentes =
    vendas
      .slice()
      .reverse()
      .slice(0,4);

  if(recentes.length === 0){

    el.innerHTML = `
      <div class="empty-state">
        Nenhuma venda registrada
      </div>
    `;

    return;
  }

  el.innerHTML =
  recentes.map(v => `

      <div class="hist-row premium-hist-row">

        <div class="hist-left">

          <div class="hist-date">
            ${new Date(v.ts)
              .toLocaleDateString('pt-BR')}
          </div>

          <div class="hist-prod">
            ${v.nomeProd}
          </div>

          <div class="hist-meta">
            ${v.qty} unidade(s)
          </div>

        </div>

        <div class="hist-right">

          <div class="hist-price">
            ${fmt(v.total)}
          </div>

          <div class="hist-lucro">
            +${fmt(v.lucro)}
          </div>

        </div>

      </div>

    `).join('');
}

// =======================
// INIT
// =======================

document.addEventListener(
  'DOMContentLoaded',
  function(){

    refreshHome();

    document.getElementById(
      'today-date'
    ).textContent =
      new Date().toLocaleDateString(
        'pt-BR',
        {
          weekday:'long',
          day:'numeric',
          month:'long'
        }
      );

    goHome();
  }
);
function apagarProduto(index){

  const confirmar = confirm(
    'Deseja apagar este produto?'
  );

  if(!confirmar) return;

  produtos.splice(index, 1);

  salvarDados();

  renderProdutos();

  refreshHome();
}
function calcularLucro(){

  const custo =
    Number(
      document.getElementById(
        'p-custo'
      ).value
    ) || 0;

  const preco =
    Number(
      document.getElementById(
        'p-preco'
      ).value
    ) || 0;

  const lucro =
    preco - custo;

  document.getElementById(
    'p-lucro'
  ).textContent =
    fmt(lucro);
}

function salvarProduto(){

  const nome =
    document.getElementById('p-nome').value;

  const categoria =
    document.getElementById('p-cat').value;

  const descricao =
    document.getElementById('p-desc').value;

  const custo =
    Number(
      document.getElementById('p-custo').value
    );

  const preco =
    Number(
      document.getElementById('p-preco').value
    );

  const estoque =
    Number(
      document.getElementById('p-estoque').value
    );

  if(!nome){
    alert('Digite o nome do produto');
    return;
  }

  produtos.push({
    id: Date.now().toString(),
    nome,
    categoria,
    descricao,
    custo,
    preco,
    estoque
  });

  salvarDados();

  alert('Produto criado!');

  goTo('screen-produtos');

  renderProdutos();
}

function venderProduto(id){

  const p =
    produtos.find(x => x.id === id);

  if(!p) return;

  const qtd = parseInt(
    prompt(
      `Quantas unidades de "${p.nome}" foram vendidas?`
    )
  );

  if(!qtd || qtd <= 0){
    return;
  }

  if(qtd > p.estoque){
    alert(
      'Estoque insuficiente!'
    );
    return;
  }

  const venda = {
    prodId:id,
    nomeProd:p.nome,
    qty:qtd,
    total:p.preco * qtd,
    custo:p.custo * qtd,
    lucro:(p.preco - p.custo) * qtd,
    ts:Date.now()
  };

  vendas.push(venda);

  p.estoque -= qtd;

  salvarDados();

  renderProdutos();

  refreshHome();

  alert(
    'Venda registrada com sucesso!'
  );
}
function openMeta(){

  const valorAtual = prompt(
    'Digite a nova meta do mês (R$)',
    metaValor
  );

  if(
    valorAtual === null ||
    valorAtual === ''
  ){
    return;
  }

  metaValor = Number(valorAtual);

  salvarDados();

  refreshHome();

  alert('Meta atualizada!');
}
function excluirVenda(index){

  const confirmar = confirm(
    'Deseja excluir esta venda?'
  );

  if(!confirmar){
    return;
  }

  const venda =
    vendas[index];

  if(!venda){
    return;
  }

  // devolve estoque
  const produto =
    produtos.find(
      p => p.id === venda.prodId
    );

  if(produto){
    produto.estoque += venda.qty;
  }

  vendas.splice(index, 1);

  salvarDados();

  renderHistorico();

  refreshHome();

  alert('Venda removida!');
}
function limparHistorico(){

  const confirmar = confirm(
    'Deseja apagar todo histórico?'
  );

  if(!confirmar){
    return;
  }

  vendas = [];

  salvarDados();

  renderHistorico();

  refreshHome();

  alert(
    'Histórico apagado!'
  );
}
function editarProduto(index){

  const p = produtos[index];

  if(!p) return;

  const nome = prompt(
    'Nome do produto:',
    p.nome
  );

  if(nome === null) return;

  const categoria = prompt(
    'Categoria:',
    p.categoria
  );

  if(categoria === null) return;

  const custo = Number(
    prompt(
      'Preço investido:',
      p.custo
    )
  );

  const preco = Number(
    prompt(
      'Preço de venda:',
      p.preco
    )
  );

  const estoque = Number(
    prompt(
      'Quantidade em estoque:',
      p.estoque
    )
  );

  p.nome = nome;
  p.categoria = categoria;
  p.custo = custo;
  p.preco = preco;
  p.estoque = estoque;

  salvarDados();

  renderProdutos();

  refreshHome();

  alert('Produto atualizado!');

}
function renderProdList(){
  renderProdutos();
}

function renderVendaList(){
  renderVenda();
}
