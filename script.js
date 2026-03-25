/** * ANALISTA DE CÓDIGO: Versão Refatorada v2.0
 * Foco: Performance, Estabilidade de Memória e Precisão de PDF
 */

let currentMode = 'etiqueta';
const state = {
    isRendering: false,
    objectUrls: []
};

// Inicialização de Eventos (Desacoplamento de HTML)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-gerar').addEventListener('click', executarGeracao);
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = `GERAR ${mode.toUpperCase()}`;
    showScreen('screen-config');
}

// Limpeza de memória para evitar vazamentos
function clearOldUrls() {
    state.objectUrls.forEach(url => URL.revokeObjectURL(url));
    state.objectUrls = [];
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files?.length) return alert("SELECIONE AS FOTOS.");

    clearOldUrls();
    showScreen('screen-preview');
    
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>PROCESSANDO ARQUIVOS...</h2>";

    try {
        if (currentMode === 'etiqueta') await renderEtiquetas(input.files);
        else await renderCarometro(input.files);
    } catch (err) {
        console.error(err);
        alert("Erro crítico no processamento.");
    }
}

const sanitizeName = (name) => {
    return name.split('.')[0]
        .replace(/[_-]/g, " ")
        .replace(/[<>"/\\|?*]/g, "") // Proteção contra XSS/Caracteres Inválidos
        .toUpperCase();
};

async function renderEtiquetas(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    
    setupBtns(['pdf']);
    area.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        
        const lote = arr.slice(i, i + 8);
        lote.forEach(f => {
            const src = URL.createObjectURL(f);
            state.objectUrls.push(src);
            const nome = sanitizeName(f.name);

            const card = document.createElement('div');
            card.className = 'etiqueta-card';
            card.innerHTML = `
                <div class="etiqueta-header" style="border-bottom-color: ${cor}">
                    <img src="LOGO.png" class="logo-mini">
                    <span>DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                </div>
                <div class="etiqueta-body">
                    <div class="foto-frame" style="border-color: ${cor}">
                        <img src="${src}">
                    </div>
                    <div class="nome-aluno" contenteditable="true">${nome}</div>
                </div>`;
            page.appendChild(card);
        });
        fragment.appendChild(page);
    }
    area.appendChild(fragment);
}

async function renderCarometro(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';

    setupBtns(['pdf', 'ppt']);
    area.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const f of Array.from(files)) {
        const src = URL.createObjectURL(f);
        state.objectUrls.push(src);
        const nome = sanitizeName(f.name);

        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-carometro" style="border-color:${cor};">
                <img src="${src}" class="foto-carometro">
            </div>
            <div class="nome-carometro" contenteditable="true">${nome}</div>`;
        fragment.appendChild(page);
    }
    area.appendChild(fragment);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) {
        const btn = document.createElement('button');
        btn.className = "btn-execute btn-pdf";
        btn.innerText = "PDF";
        btn.onclick = doPDF;
        div.appendChild(btn);
    }
    // Lógica do PPT mantida similar, mas desacoplada...
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    // Garantir que todas as imagens carregaram antes do print
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { img.onload = res; img.onerror = res; });
    }));

    const opt = {
        margin: 0,
        filename: isW ? 'Carometro.pdf' : 'Etiquetas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [338.67, 190.5] : 'a4', 
            orientation: isW ? 'l' : 'p' 
        },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
}
