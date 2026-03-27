let currentMode = 'etiqueta';

// Feedback de arquivos selecionados
document.getElementById('file-input').addEventListener('change', function(e) {
    const status = document.getElementById('file-status');
    const numFiles = e.target.files.length;
    status.innerText = numFiles > 0 ? `${numFiles} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado";
});

function showScreen(id) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.add('hidden');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    target.style.display = 'flex';
    setTimeout(() => {
        target.classList.remove('hidden');
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
    }, 10);
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:50px;'>ESTILIZANDO...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 600);
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    area.innerHTML = "";
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        // Centralizado horizontalmente e verticalmente
        page.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="border: 6pt solid ${cor}; border-radius:18px; padding:3px; background: white;">
                    <img src="${item.url}" class="foto-carometro">
                </div>
                <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; text-align: center;" contenteditable="true">${item.nome}</div>
            </div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

// ... (renderEtiquetas e renderCrachas mantêm a lógica de A4 anterior, mas centralizados)

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4);">💾 PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 PPTX</button>`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "⏳ GERANDO...";
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'DomManuel_Export.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = "💾 PDF");
}
