let currentMode = 'etiqueta';

document.getElementById('file-input').addEventListener('change', function(e) {
    const status = document.getElementById('file-status');
    status.innerText = e.target.files.length > 0 ? `✅ ${e.target.files.length} arquivos prontos` : "Nenhum arquivo selecionado";
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files.length) return alert("Selecione as fotos!");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:100px;'>CONFIGURANDO LAYOUT...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        area.innerHTML = "";
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else if (currentMode === 'carometro') renderCarometro(filesData);
    }, 600);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:0.5pt solid black; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2.5pt dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm;">
                        <span style="font-size:9pt; font-weight:bold; flex:1; text-align:center; line-height:1.1;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <img src="${item.url}" style="width:32mm; height:42mm; border:2.5pt solid ${cor}; object-fit:cover;">
                        <div style="font-family:'SFT-Round'; font-size:16pt; text-align:center; flex:1; line-height:1.2;">${item.nome}</div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turma = document.getElementById('input-turma').value.toUpperCase() || "TURMA";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1px solid #000; display:flex; flex-direction:column; background:white;">
                    <div style="height:18mm; display:flex; align-items:center; padding:5px; border-bottom:1px solid #ddd;">
                        <img src="LOGO.png" style="height:14mm;">
                        <div style="text-align:center; flex:1; font-size:8pt; font-weight:bold; line-height:1.2;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <img src="${item.url}" style="width:30mm; height:35mm; object-fit:cover; border-radius:5px;">
                        <div style="flex:1; text-align:center;">
                            <div style="font-family:'SFT-Round'; font-size:15pt; line-height:1.2;">${item.nome}</div>
                            <div style="font-size:10pt; color:#666; margin-top:5px;">${turma}</div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center;">
                <div style="border: 6pt solid ${cor}; border-radius:20px; padding:3px; background:white;">
                    <img src="${item.url}" class="foto-carometro">
                </div>
                <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; line-height:1;">${item.nome}</div>
            </div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4);">💾 PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 PPTX</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'DomManuel_Export.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}
