let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
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
    area.innerHTML = `<div style="color:white; text-align:center; margin-top:80px;"><h2>⚙️ PROCESSANDO...</h2><p>Organizando arquivos para evitar travamentos.</p></div>`;

    const files = Array.from(input.files);
    const data = files.map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    // Chunking: Processa 8 fotos por vez para não congelar o navegador
    area.innerHTML = ""; 
    const chunkSize = 8;
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await new Promise(r => setTimeout(r, 150)); // Pausa para renderização
        
        if (currentMode === 'cracha') renderCrachaPage(chunk);
        else if (currentMode === 'etiqueta') renderEtiquetaPage(chunk);
        else if (currentMode === 'carometro') renderCarometroPage(chunk);
    }
    
    setupBtns(['pdf']);
}

function renderCrachaPage(chunk) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const turma = document.getElementById('input-turma').value.toUpperCase() || "TURMA";
    const turno = isTarde ? 'TARDE' : 'MANHÃ';
    
    const page = document.createElement('div');
    page.className = 'page-a4';
    chunk.forEach(item => {
        page.innerHTML += `
        <div class="item-border" style="width:92mm; height:60mm; display:flex; flex-direction:column;">
            <div style="height:16mm; border-bottom:0.5pt solid #ccc; display:flex; align-items:center; padding:5px; gap:8px;">
                <img src="LOGO.png" style="height:12mm;">
                <div style="flex:1; text-align:center;">
                    <div style="font-family:'SFT-Round'; font-size:8pt; font-weight:900;">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D'ELBOUX</div>
                    <div style="font-size:6.5pt;">Fone: 3262-1627 / (41) 9107-9242</div>
                </div>
            </div>
            <div style="flex:1; display:flex; align-items:center; padding:8px; gap:12px;">
                <img src="${item.url}" style="width:30mm; height:36mm; object-fit:cover; border-radius:8px; border:1px solid #eee;">
                <div style="flex:1; text-align:center; display:flex; flex-direction:column; justify-content:center;">
                    <div style="font-family:'SFT-Round'; font-size:13pt; line-height:1.2;" contenteditable="true">${item.nome}</div>
                    <div style="font-size:9pt; margin-top:8px; color:#444;">${turma} - ${turno}</div>
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
        <div class="item-border" style="width:92mm; height:65mm; display:flex; flex-direction:column; padding:3mm; border: 2pt solid #000;">
            <div style="border-bottom:2.5pt dotted ${cor}; padding-bottom:5px; margin-bottom:10px; display:flex; align-items:center; gap:10px;">
                <img src="LOGO.png" style="height:11mm;">
                <span style="font-family:'SFT-Round'; font-size:8.5pt; font-weight:900;">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D'ELBOUX</span>
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
        div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="height:42px; width:150px; font-size:10pt; background:#c0392b; color:white; margin:0;">BAIXAR PDF</button>`;
    }
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'Documentos_DomManuel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
