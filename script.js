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
    area.innerHTML = `<div style="color:white; text-align:center; margin-top:100px;">
                        <h2>⚙️ PROCESSANDO...</h2>
                        <p>A organizar layout para evitar travamentos.</p>
                      </div>`;

    const data = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    area.innerHTML = "";
    
    // Processamento por lotes (Chunking) para estabilidade total
    const chunkSize = (currentMode === 'carometro') ? 1 : 8; 

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        // Pequena pausa para o navegador não "congelar" a tela
        await new Promise(r => setTimeout(r, 100)); 

        if (currentMode === 'cracha') renderCrachaPage(chunk);
        else if (currentMode === 'etiqueta') renderEtiquetaPage(chunk);
        else if (currentMode === 'carometro') renderCarometroPage(chunk[0]);
    }
    
    setupBtns(['pdf']);
}

function renderCrachaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const turma = document.getElementById('input-turma').value.toUpperCase() || "TURMA NÃO INFORMADA";
    
    const page = document.createElement('div');
    page.className = 'page-a4';
    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-cracha">
            <div class="header-cracha">
                <img src="LOGO.png" style="height:12mm;">
                <div style="flex:1; text-align:center;">
                    <div class="titulo-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D'ELBOUX</div>
                    <div class="fone-escola">Fone: 3262-1627 / (41) 9107-9242</div>
                </div>
            </div>
            <div class="body-cracha">
                <img src="${item.url}" class="foto-estudante">
                <div class="info-estudante">
                    <div class="nome-estudante-cracha" contenteditable="true">${item.nome}</div>
                    <div class="turma-turno-cracha">${turma}<br>${isTarde?'TARDE':'MANHÃ'}</div>
                </div>
            </div>
        </div>`;
    });
    area.appendChild(page);
}

function renderEtiquetaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const cor = isTarde ? '#003399' : '#4A5D23';
    
    const page = document.createElement('div');
    page.className = 'page-a4';
    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-etiqueta">
            <div style="border-bottom:2.5pt dotted ${cor}; padding-bottom:5px; margin-bottom:10px; display:flex; align-items:center; gap:10px;">
                <img src="LOGO.png" style="height:11mm;">
                <span class="titulo-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D'ELBOUX</span>
            </div>
            <div style="flex:1; display:flex; align-items:center; gap:15px;">
                <img src="${item.url}" style="width:34mm; height:42mm; object-fit:cover; border:2.5pt solid ${cor}; border-radius:5px;">
                <div class="nome-estudante-etiqueta" contenteditable="true">${item.nome}</div>
            </div>
        </div>`;
    });
    area.appendChild(page);
}

function renderCarometroPage(item) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const bg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';
    
    const page = document.createElement('div');
    page.className = 'page-widescreen';
    page.style.background = `url(${bg})`;
    page.innerHTML = `
        <img src="${item.url}" class="foto-carometro">
        <div class="nome-carometro" contenteditable="true">${item.nome}</div>
    `;
    area.appendChild(page);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) {
        div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="height:40px; width:140px; font-size:10pt; background:#c0392b; color:white; margin:0;">BAIXAR PDF</button>`;
    }
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'DomManuel_Documento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
