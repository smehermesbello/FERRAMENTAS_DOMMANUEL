let currentMode = 'etiqueta';

// Feedback para o botão de arquivo personalizado
document.getElementById('file-input').addEventListener('change', function() {
    const status = document.getElementById('file-status');
    const files = this.files.length;
    status.innerText = files > 0 ? `✅ ${files} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado";
});

function showScreen(id) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.add('hidden');
    });
    const target = document.getElementById(id);
    target.classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    const titleMap = {
        'etiqueta': '🏷️ CONFIGURAR ETIQUETAS',
        'carometro': '📸 CONFIGURAR CARÔMETRO',
        'cracha': '🎫 CONFIGURAR CRACHÁ'
    };
    document.getElementById('config-title').innerText = titleMap[mode] || "CONFIGURAÇÃO";
    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:100px; text-align:center;'>ESTILIZANDO DOCUMENTOS...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    // Simulação de delay para fluidez na transição
    setTimeout(() => {
        area.innerHTML = "";
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else if (currentMode === 'carometro') renderCarometro(filesData);
    }, 600);
}

// Funções de download dinâmicas (sempre à esquerda via CSS)
function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    
    if (types.includes('pdf')) {
        div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4);">💾 BAIXAR PDF</button>`;
    }
    if (types.includes('ppt') && currentMode === 'carometro') {
        div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 BAIXAR PPTX</button>`;
    }
}

// ... Restante das funções de render (renderEtiquetas, renderCarometro, renderCrachas) seguem a mesma lógica anterior ...
