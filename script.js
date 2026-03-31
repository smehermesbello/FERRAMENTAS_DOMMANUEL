let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
} [cite: 111, 112, 113]

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
} [cite: 115, 117, 118]

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:50px;'>GERANDO...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    })); [cite: 126, 127, 128]

    if (currentMode === 'etiqueta') renderEtiquetas(filesData);
    else if (currentMode === 'cracha') renderCrachas(filesData);
    else if (currentMode === 'carometro') renderCarometro(filesData);
} [cite: 130, 131, 132]

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.getElementById('turno-toggle').checked ? 'TARDE' : 'MANHÃ';
    area.innerHTML = "";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
            <div style="width:92mm; height:60mm; border:1px solid #000; background:white; display:flex; flex-direction:column;">
                <div style="height:15mm; border-bottom:1px solid #ddd; display:flex; align-items:center; padding:5px;">
                    <img src="LOGO.png" style="height:12mm;">
                    <span style="font-size:7pt; font-weight:bold; margin-left:5px;">EM DOM MANUEL D'ELBOUX</span>
                </div>
                <div style="flex:1; display:flex; align-items:center; padding:5px; gap:10px;">
                    <img src="${item.url}" style="width:30mm; height:35mm; object-fit:cover; border-radius:8px;">
                    <div style="text-align:center; flex:1;">
                        <div style="font-family:'SFT-Round'; font-size:14pt;" contenteditable="true">🪪 ${item.nome}</div>
                        <div style="font-size:9pt;">${turno}</div>
                    </div>
                </div>
            </div>`;
        }); [cite: 163, 164, 165, 172, 174, 175]
        area.appendChild(page);
    }
    setupBtns(['pdf']);
} [cite: 180, 182]

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-execute">BAIXAR PDF</button>`;
} [cite: 209, 210, 212]

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'DomManuel.pdf',
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    }; [cite: 220, 222, 224, 225]
    html2pdf().set(opt).from(element).save();
} [cite: 228]
