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

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='font-family:\"Baloo 2\",sans-serif; color:#4B4B4B; margin-top:100px;'>PREPARANDO TUDO... 🦉</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else if (currentMode === 'listagem') renderListagem(filesData);
        else renderCarometro(filesData);
    }, 500);
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#58CC02' : '#1CB0F6';
    area.innerHTML = "";
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="border: 6pt solid ${cor}; border-radius:22px; padding:3px; background:white;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; width:90%; text-align:center; word-break:break-word; overflow-wrap:break-word;" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turno = (document.querySelector('input[name="turno"]:checked').value === 'manha') ? 'MANHÃ' : 'TARDE';
    const cor = (turno === 'MANHÃ') ? '#58CC02' : '#1CB0F6';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1pt solid #ddd; border-radius:0; display:flex; background:white; position:relative; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; display:flex; align-items:center; padding:4px 6px; border-bottom:1pt solid #eee;">
                            <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                            <div style="text-align:center; flex:1;">
                                <div style="font-family:'Baloo 2',sans-serif; font-size:8pt; font-weight:bold;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                                <div style="font-family:'Nunito',sans-serif; font-size:7pt;">Fone: 3262-1627 / (41) 9107-9242</div>
                            </div>
                        </div>
                        <div style="flex:1; display:flex; align-items:center; padding:6px; gap:8px;">
                            <img src="${item.url}" style="width:28mm; height:34mm; object-fit:cover; border-radius:10px; border:2.5pt solid ${cor};">
                            <div style="flex:1; text-align:center;">
                                <div style="font-family:'SFT-Round'; font-size:15pt;" contenteditable="true">${item.nome}</div>
                                <div style="font-family:'Nunito',sans-serif; font-size:9pt; color:#777;">${turma} - ${turno}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderListagem(data) {
    const area = document.getElementById('pdf-area');
    const turno = (document.querySelector('input[name="turno"]:checked').value === 'manha') ? 'MANHÃ' : 'TARDE';
    const cor = (turno === 'MANHÃ') ? '#58CC02' : '#1CB0F6';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 16) {
        const page = document.createElement('div');
        page.className = 'page-listagem';

        const header = document.createElement('div');
        header.className = 'listagem-header';
        header.style.background = cor;
        header.innerText = `${turma} - ${turno}`;
        page.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'listagem-grid';
        data.slice(i, i + 16).forEach(item => {
            grid.innerHTML += `
                <div class="listagem-item">
                    <img src="${item.url}" class="listagem-foto" style="border:2pt solid ${cor};">
                    <div style="flex:1; overflow:hidden;">
                        <div style="font-family:'SFT-Round'; font-size:9pt; line-height:1.15;" contenteditable="true">${item.nome}</div>
                        <div style="font-family:'Nunito',sans-serif; font-size:7.5pt; color:#777; margin-top:2px;">${turma}</div>
                    </div>
                </div>`;
        });
        page.appendChild(grid);

        const footer = document.createElement('div');
        footer.className = 'listagem-footer';
        footer.innerHTML = `<img src="LOGO.png">`;
        page.appendChild(footer);

        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#58CC02' : '#1CB0F6';
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1pt solid #ddd; border-radius:0; display:flex; background:white; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; border-bottom:1pt solid #eee; display:flex; align-items:center; padding:4px 6px;">
                            <img src="LOGO.png" style="height:11mm; margin-right:5px;">
                            <span style="font-family:'Baloo 2',sans-serif; font-size:8.5pt; font-weight:bold; color:black; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                        </div>
                        <div style="flex:1; display:flex; align-items:center; padding:8px; gap:8px;">
                            <img src="${item.url}" style="width:30mm; height:40mm; border-radius:10px; border:2.5pt solid ${cor}; object-fit:cover;">
                            <div style="font-family:'SFT-Round'; font-size:15pt; color:black; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                        </div>
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
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:#58CC02; color:white; border-bottom-color:#46A302;">PDF</button>`;
}

function gerarNomeArquivo() {
    const tipoMap = { etiqueta: 'ETIQUETAS', cracha: 'CRACHÁ', carometro: 'CARÔMETRO', listagem: 'LISTAGEM' };
    const tipo = tipoMap[currentMode] || 'DOCUMENTO';
    const turno = document.querySelector('input[name="turno"]:checked').value === 'manha' ? 'MANHÃ' : 'TARDE';
    const turmaRaw = document.getElementById('input-turma').value.toUpperCase();
    const turma = turmaRaw.replace(/[^\p{L}\p{N}]/gu, '') || 'SEMTURMA';
    return `${tipo}_${turma}_${turno}`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "GERANDO...";
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: gerarNomeArquivo() + '.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = "PDF");
}
