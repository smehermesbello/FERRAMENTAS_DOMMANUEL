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
    if (!input.files || input.files.length === 0) return alert("SELECIONE AS FOTOS.");

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
    setupBtns();
}

function renderCrachaPage(chunk) {
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
                    <div class="turma-turno-cracha">${turma}<br>${isTarde?'TARDE':'MANHÃ'}</div>
                </div>
            </div>
        </div>`;
    });
    document.getElementById('pdf-area').appendChild(page);
}

function renderEtiquetaPage(chunk) {
    const page = document.createElement('div');
    page.className = 'page-a4';
    const isTarde = document.getElementById('turno-checkbox').checked;
    const cor = isTarde ? '#003399' : '#4A5D23';
    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-etiqueta">
            <div style="border-bottom:2pt dotted ${cor}; margin-bottom:5px; display:flex; align-items:center;">
                <img src="LOGO.png" style="height:8mm; margin-right:5px;"> ESCOLA DOM MANUEL
            </div>
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <img src="${item.url}" style="width:30mm; height:40mm; object-fit:cover; border:2pt solid ${cor};">
                <div class="nome-estudante-etiqueta">${item.nome}</div>
            </div>
        </div>`;
    });
    document.getElementById('pdf-area').appendChild(page);
}

function renderCarometroPage(item) {
    const page = document.createElement('div');
    page.className = 'page-widescreen';
    const isTarde = document.getElementById('turno-checkbox').checked;
    const bgImg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';
    
    // Layout Robusto: Imagem de fundo real para evitar falhas de captura do html2canvas
    page.innerHTML = `
        <img src="${bgImg}" class="carometro-bg">
        <div class="carometro-content">
            <img src="${item.url}" class="foto-carometro">
            <div class="nome-carometro">${item.nome}</div>
        </div>
    `;
    document.getElementById('pdf-area').appendChild(page);
}

function setupBtns() {
    const div = document.getElementById('download-buttons');
    div.innerHTML = `<button onclick="doPDF()" class="btn-execute" style="height:40px; width:140px; background:#c0392b; color:white; margin:0;">BAIXAR PDF</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    
    const opt = {
        margin: 0,
        filename: `Sistema_Dom_Manuel_${currentMode}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [338, 190] : 'a4', 
            orientation: isW ? 'l' : 'p' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: isW ? '.page-widescreen' : '.page-a4' }
    };

    // Gera o PDF
    html2pdf().set(opt).from(element).save();
}
