let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = mode === 'etiqueta' ? 'GERADOR DE ETIQUETAS' : 'GERADOR DE CARÔMETRO';
    showScreen('screen-config');
}

function startGeneration() {
    if (currentMode === 'etiqueta') generateEtiquetas();
    else generateCarometro();
}

// --- GERAÇÃO DE ETIQUETAS ---
async function generateEtiquetas() {
    const input = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    if (!input.files.length) return alert("Selecione as fotos.");

    const classeLinha = (turno === 'manha') ? 'linha-manha' : 'linha-tarde';
    const classeMoldura = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    area.innerHTML = "";
    setupDownloadButtons(['pdf']);
    showScreen('screen-preview');

    const files = Array.from(input.files);
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = files.slice(i, i + 8);
        for (const file of lote) {
            const src = await readFile(file);
            const nome = formatName(file.name);
            page.innerHTML += `
                <div class="etiqueta">
                    <div class="etiqueta-topo ${classeLinha}">
                        <img src="LOGO.jpg" style="width:1.1cm; margin-right:8px;">
                        <div style="font-size:9pt; font-weight:bold; flex:1; text-align:center;">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div class="container-foto" style="width:3.2cm; height:4.2cm;">
                            <img src="${src}" class="foto-aluno" style="width:100%; height:100%;">
                            <div class="moldura-overlay ${classeMoldura}"></div>
                        </div>
                        <div class="nome-aluno" style="font-size:16pt; flex:1;">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

// --- GERAÇÃO DE CARÔMETRO ---
async function generateCarometro() {
    const input = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    if (!input.files.length) return alert("Selecione as fotos.");

    const classeFundo = (turno === 'manha') ? 'bg-manha' : 'bg-tarde';
    const classeMoldura = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    area.innerHTML = "";
    setupDownloadButtons(['pdf', 'ppt']);
    showScreen('screen-preview');

    for (const file of Array.from(input.files)) {
        const src = await readFile(file);
        const nome = formatName(file.name);
        const page = document.createElement('div');
        page.className = `page-widescreen ${classeFundo}`;
        page.innerHTML = `
            <div class="container-foto caro-foto">
                <img src="${src}" class="foto-aluno" style="width:100%; height:100%;">
                <div class="moldura-overlay ${classeMoldura}"></div>
            </div>
            <div class="nome-aluno caro-nome">${nome}</div>`;
        area.appendChild(page);
    }
}

// --- AUXILIARES ---
function readFile(file) {
    return new Promise(res => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsDataURL(file);
    });
}

function formatName(fileName) {
    return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
}

function setupDownloadButtons(types) {
    const container = document.getElementById('download-buttons');
    container.innerHTML = "";
    if (types.includes('pdf')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPDF()" style="background:#27ae60">BAIXAR PDF</button>`;
    }
    if (types.includes('ppt')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPPT()" style="background:#d35400">BAIXAR POWERPOINT</button>`;
    }
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const isWidescreen = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'DOM_MANUEL_ARQUIVO.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { 
            unit: 'cm', 
            format: isWidescreen ? [33.867, 19.05] : 'a4', 
            orientation: isWidescreen ? 'landscape' : 'portrait' 
        }
    };
    html2pdf().set(opt).from(element).save();
}

function downloadPPT() {
    let pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const fundo = turno === 'manha' ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const corBorda = turno === 'manha' ? '4A5D23' : '003399';

    document.querySelectorAll('.page-widescreen').forEach(page => {
        let slide = pptx.addSlide();
        slide.background = { path: fundo };
        const imgSrc = page.querySelector('.foto-aluno').src;
        const nome = page.querySelector('.nome-aluno').innerText;

        slide.addImage({ data: imgSrc, x: 3.5, y: 0.5, w: 3.0, h: 4.0, line: {color: corBorda, pt: 2} });
        slide.addText(nome, { x: 0, y: 4.8, w: '100%', align: 'center', fontFace: 'Arial', fontSize: 36, bold: true });
    });
    pptx.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
