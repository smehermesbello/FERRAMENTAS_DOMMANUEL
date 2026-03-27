let currentMode = 'etiqueta';

// Feedback Visual Moderno para Seleção de Arquivos
document.getElementById('file-input').addEventListener('change', function(e) {
    const status = document.getElementById('file-status');
    const files = e.target.files.length;
    if (files > 0) {
        status.innerText = `✅ ${files} arquivos selecionados`;
        status.style.color = "#27ae60";
    } else {
        status.innerText = "Nenhum arquivo selecionado";
        status.style.color = "#444";
    }
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
    if (!input.files.length) return alert("Selecione os arquivos primeiro!");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:100px;'>CARREGANDO FERRAMENTAS...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        area.innerHTML = "";
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 600);
}

// ... Funções de renderização permanecem com a lógica anterior ...

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4); margin-right:10px;">💾 PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 PPTX</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'Sistema_Dom_Manuel.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
