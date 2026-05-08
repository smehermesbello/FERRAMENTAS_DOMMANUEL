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
    if (!input.files || input.files.length === 0) return alert("Selecione as fotos.");

    showScreen('screen-preview');
    area.innerHTML = "";

    const data = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));
    
    const chunkSize = (currentMode === 'carometro') ? 1 : 8; 

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const page = document.createElement('div');
        page.className = (currentMode === 'carometro') ? 'pdf-page page-landscape' : 'pdf-page page-portrait';
        
        if (currentMode === 'carometro') {
            const isTarde = document.getElementById('turno-checkbox').checked;
            const bgImg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';
            page.innerHTML = `
                <img src="${bgImg}" class="carometro-bg">
                <div class="carometro-content">
                    <img src="${chunk[0].url}" class="foto-principal">
                    <div class="nome-aluno">${chunk[0].nome}</div>
                </div>
            `;
        } else {
            // Renderização unificada para Crachá/Etiqueta
            chunk.forEach(item => {
                page.innerHTML += `
                    <div class="item-${currentMode}">
                        <div class="nome-estudante">${item.nome}</div>
                    </div>`;
            });
        }
        area.appendChild(page);
    }
    setupBtns();
}

function setupBtns() {
    document.getElementById('download-buttons').innerHTML = 
        `<button onclick="doPDF()" class="btn-execute" style="height:40px; width:150px; margin:0; background:#c0392b; color:white;">BAIXAR PDF</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    
    // Configurações inquebráveis
    const opt = {
        margin: 0,
        filename: `Sistema_Dom_Manuel_${currentMode}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            scrollY: 0,
            y: 0
        },
        jsPDF: { 
            unit: 'mm', 
            // O formato do PDF é 1mm maior que o conteúdo HTML para garantir folga
            format: isW ? [339, 191] : 'a4', 
            orientation: isW ? 'l' : 'p' 
        },
        pagebreak: { mode: 'avoid-all', before: '.pdf-page' }
    };

    // Força o scroll para o topo para evitar cortes no canvas
    document.getElementById('pdf-area-wrapper').scrollTop = 0;

    html2pdf().set(opt).from(element).save();
}
