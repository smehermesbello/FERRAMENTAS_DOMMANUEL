let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

function toggleTurno() {
    const sw = document.getElementById('sw-element');
    const cb = document.getElementById('turno-checkbox');
    sw.classList.toggle('active');
    cb.checked = sw.classList.contains('active');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    const area = document.getElementById('pdf-area');
    
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    area.innerHTML = `<div style="color:white; text-align:center; margin-top:100px;"><h2>⚙️ PROCESSANDO...</h2></div>`;

    const data = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    area.innerHTML = "";
    const chunkSize = (currentMode === 'carometro') ? 1 : 8; 

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (currentMode === 'cracha') renderCrachaPage(chunk);
        else if (currentMode === 'etiqueta') renderEtiquetaPage(chunk);
        else if (currentMode === 'carometro') renderCarometroPage(chunk[0]);
    }
    setupBtns(['pdf']);
}

function renderCarometroPage(item) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const bg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';
    
    const page = document.createElement('div');
    page.className = 'page-widescreen';
    // Estética original mantida, mas fundo injetado de forma mais estável
    page.style.backgroundImage = `url(${bg})`;
    page.innerHTML = `
        <img src="${item.url}" class="foto-carometro">
        <div class="nome-carometro">${item.nome}</div>
    `;
    area.appendChild(page);
}

function renderCrachaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const page = document.createElement('div');
    page.className = 'page-a4';
    const isTarde = document.getElementById('turno-checkbox').checked;
    const turma = document.getElementById('input-turma').value || "TURMA";

    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-cracha">
            <div class="header-cracha"><img src="LOGO.png" style="height:10mm;"> <span>DOM MANUEL</span></div>
            <div class="body-cracha">
                <img src="${item.url}" class="foto-estudante">
                <div class="info-estudante">
                    <div class="nome-estudante-cracha">${item.nome}</div>
                    <div class="turma-turno-cracha">${turma}<br>${isTarde ? 'TARDE' : 'MANHÃ'}</div>
                </div>
            </div>
        </div>`;
    });
    area.appendChild(page);
}

function renderEtiquetaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const page = document.createElement('div');
    page.className = 'page-a4';
    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-etiqueta">
            <div class="nome-estudante-etiqueta">${item.nome}</div>
        </div>`;
    });
    area.appendChild(page);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = `<button onclick="doPDF()" class="btn-execute" style="height:40px; width:140px; background:#c0392b; color:white; margin:0;">BAIXAR PDF</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    
    const opt = {
        margin: 0,
        filename: `Sistema_Dom_Manuel.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [339, 191] : 'a4', // O Buffer de 1mm resolve a página branca
            orientation: isW ? 'l' : 'p' 
        },
        pagebreak: { mode: 'avoid-all', before: isW ? '.page-widescreen' : '.page-a4' }
    };

    html2pdf().set(opt).from(element).save();
}
