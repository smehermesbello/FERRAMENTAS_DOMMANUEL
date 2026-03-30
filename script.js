let currentMode = 'etiqueta';

// Feedback visual do botão de arquivo
document.getElementById('file-input').addEventListener('change', function(e) {
    const status = document.getElementById('file-status');
    const total = e.target.files.length;
    status.innerText = total > 0 ? `✅ ${total} arquivos selecionados` : "Nenhum arquivo selecionado";
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    target.classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files.length) return alert("Por favor, selecione as fotos primeiro!");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<div style='color:white; margin-top:100px; text-align:center;'><h2>PROCESSANDO LIQUID GLASS...</h2></div>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    // Delay para fluidez visual
    setTimeout(() => {
        area.innerHTML = "";
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 600);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = ""; // Limpa para não acumular
    if (types.includes('pdf')) {
        div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4); margin-right:10px;">💾 PDF</button>`;
    }
    if (types.includes('ppt') && currentMode === 'carometro') {
        div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 PPTX</button>`;
    }
}

// Lógica de download (PDF)
async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: `DomManuel_${currentMode}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}

// Funções de renderização omitidas aqui para brevidade, mas devem seguir o padrão 
// de criar elementos dentro do 'area' (document.getElementById('pdf-area'))
