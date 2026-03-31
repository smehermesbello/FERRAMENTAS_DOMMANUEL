let currentMode = 'etiqueta';
let objectUrls = [];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = mode.toUpperCase();
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
    area.innerHTML = `<div style="color:white; text-align:center; margin-top:80px;">
                        <h2 id="prog-txt">Iniciando Processamento...</h2>
                        <div style="width:200px; height:4px; background:#444; margin:20px auto; border-radius:2px; overflow:hidden;">
                            <div id="bar" style="width:0%; height:100%; background:#27ae60; transition:0.3s;"></div>
                        </div>
                      </div>`;

    // Limpeza de memória anterior
    objectUrls.forEach(url => URL.revokeObjectURL(url));
    objectUrls = [];

    const files = Array.from(input.files);
    const data = files.map(f => {
        const url = URL.createObjectURL(f);
        objectUrls.push(url);
        return { url, nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase() };
    });

    // Renderização por Lotes (Chunking) para evitar travamento
    const chunkSize = 8;
    area.innerHTML = ""; 

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        // Atualiza interface antes de renderizar lote
        await new Promise(r => setTimeout(r, 50)); 
        
        if (currentMode === 'etiqueta') renderEtiquetaPage(chunk);
        else if (currentMode === 'cracha') renderCrachaPage(chunk);
    }
    
    setupBtns(['pdf']);
}

function renderCrachaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const turma = document.getElementById('input-turma').value || "TURMA NÃO DEFINIDA";
    
    const page = document.createElement('div');
    page.className = 'page-a4';
    chunk.forEach(item => {
        page.innerHTML += `
        <div style="width:92mm; height:60mm; border:1px solid #555; background:white; display:flex; flex-direction:column; margin:2mm;">
            <div style="height:14mm; border-bottom:1px solid #eee; display:flex; align-items:center; padding:5px;">
                <img src="LOGO.png" style="height:11mm;">
                <div style="flex:1; text-align:center; font-size:7pt; font-weight:bold; line-height:1.1;">EM DOM MANUEL D'ELBOUX</div>
            </div>
            <div style="flex:1; display:flex; align-items:center; padding:10px; gap:12px;">
                <img src="${item.url}" style="width:30mm; height:36mm; object-fit:cover; border-radius:5px; border:1px solid #ddd;">
                <div style="text-align:center; flex:1;">
                    <div style="font-family:'SFT-Round'; font-size:13pt; color:#1a1a1a;" contenteditable="true">🎫 ${item.nome}</div>
                    <div style="font-size:8.5pt; color:#666; margin-top:8px; font-weight:600;">${turma}<br>TURNO: ${isTarde?'TARDE':'MANHÃ'}</div>
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
        <div style="width:92mm; height:65mm; border:1px solid #ccc; display:flex; flex-direction:column; padding:3mm;">
            <div style="border-bottom:2.5pt dotted ${cor}; padding-bottom:6px; margin-bottom:10px; display:flex; align-items:center;">
                <img src="LOGO.png" style="height:11mm; margin-right:12px;">
                <span style="font-size:8.5pt; font-weight:700; color:#333;">DOM MANUEL D'ELBOUX</span>
            </div>
            <div style="flex:1; display:flex; align-items:center; gap:15px;">
                <img src="${item.url}" style="width:34mm; height:42mm; object-fit:cover; border:2.5pt solid ${cor}; border-radius:5px;">
                <div style="font-family:'SFT-Round'; font-size:16pt; flex:1; text-align:center; font-weight:900;" contenteditable="true">${item.nome}</div>
            </div>
        </div>`;
    });
    area.appendChild(page);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) {
        div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="height:42px; width:150px; font-size:10pt; background:#e74c3c; color:white; margin:0;">BAIXAR PDF</button>`;
    }
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'Sistema_DomManuel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
