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
    const sw = document.querySelector('.toggle-switch');
    const cb = document.getElementById('turno-checkbox');
    sw.classList.toggle('active');
    cb.checked = sw.classList.contains('active');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    const area = document.getElementById('pdf-area');
    
    if (!input.files || input.files.length === 0) {
        alert("POR FAVOR, SELECIONE AS FOTOS.");
        return;
    }

    showScreen('screen-preview');
    area.innerHTML = "<h2 style='color:white; text-align:center; margin-top:100px;'>PREPARANDO PRÉVIA...</h2>";

    // O setTimeout evita o travamento da interface (Freeze)
    setTimeout(() => {
        const filesData = Array.from(input.files).map(f => ({
            url: URL.createObjectURL(f),
            nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
        }));

        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else if (currentMode === 'carometro') renderCarometro(filesData);
        else area.innerHTML = "<h2 style='color:white;'>EM DESENVOLVIMENTO</h2>";
    }, 300);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const turno = isTarde ? 'TARDE' : 'MANHÃ';
    const turma = document.getElementById('input-turma').value.toUpperCase() || "TURMA NÃO DEFINIDA";
    area.innerHTML = "";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
            <div style="width:92mm; height:60mm; border:1px solid #333; background:white; display:flex; flex-direction:column; margin:2mm;">
                <div style="height:15mm; border-bottom:1px solid #eee; display:flex; align-items:center; padding:5px;">
                    <img src="LOGO.png" style="height:12mm;">
                    <div style="flex:1; text-align:center; font-size:7pt; font-weight:bold;">EM DOM MANUEL D'ELBOUX</div>
                </div>
                <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                    <img src="${item.url}" style="width:30mm; height:38mm; object-fit:cover; border-radius:8px; border:1px solid #ccc;">
                    <div style="text-align:center; flex:1;">
                        <div style="font-family:'SFT-Round'; font-size:14pt; line-height:1.2;" contenteditable="true">🎫 ${item.nome}</div>
                        <div style="font-size:9pt; margin-top:5px; color:#555;">${turma}<br>TURNO: ${turno}</div>
                    </div>
                </div>
            </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-checkbox').checked;
    const cor = isTarde ? '#003399' : '#4A5D23';
    area.innerHTML = "";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
            <div style="width:92mm; height:65mm; border:1px solid #ccc; display:flex; flex-direction:column; padding:3mm;">
                <div style="border-bottom:2pt dotted ${cor}; padding-bottom:5px; margin-bottom:10px; display:flex; align-items:center;">
                    <img src="LOGO.png" style="height:10mm; margin-right:10px;">
                    <span style="font-size:8pt; font-weight:bold;">DOM MANUEL D'ELBOUX</span>
                </div>
                <div style="flex:1; display:flex; align-items:center; gap:15px;">
                    <img src="${item.url}" style="width:32mm; height:40mm; object-fit:cover; border:2pt solid ${cor}; border-radius:5px;">
                    <div style="font-family:'SFT-Round'; font-size:16pt; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                </div>
            </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="height:40px; font-size:10pt; background:#e74c3c; color:white;">BAIXAR PDF</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'Sistema_DomManuel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
