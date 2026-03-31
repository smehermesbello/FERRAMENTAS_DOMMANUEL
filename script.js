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
    const cb = document.getElementById('turno-toggle');
    cb.checked = !cb.checked;
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:50px;'>PREPARANDO PRÉVIA...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    if (currentMode === 'etiqueta') renderEtiquetas(filesData);
    else if (currentMode === 'cracha') renderCrachas(filesData);
    else if (currentMode === 'carometro') renderCarometro(filesData);
    else area.innerHTML = "<h2 style='color:white;'>FUNCIONALIDADE EM DESENVOLVIMENTO</h2>";
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-toggle').checked;
    const turno = isTarde ? 'TARDE' : 'MANHÃ';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
            <div style="width:92mm; height:60mm; border:1px solid #000; display:flex; flex-direction:column; background:white; position:relative; overflow:hidden;">
                <div style="height:18mm; display:flex; align-items:center; padding:5px; border-bottom:1px solid #eee;">
                    <img src="LOGO.png" style="height:14mm; margin-right:5px;">
                    <div style="text-align:center; flex:1; font-size:7pt; font-weight:bold;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                </div>
                <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                    <img src="${item.url}" style="width:30mm; height:35mm; object-fit:cover; border-radius:10px;">
                    <div style="flex:1; text-align:center;">
                        <div style="font-family:'SFT-Round'; font-size:14pt; margin-bottom:5px;" contenteditable="true">🪪 ${item.nome}</div>
                        <div style="font-size:9pt; color:#666;">${turma} • ${turno}</div>
                    </div>
                </div>
            </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-toggle').checked;
    const cor = isTarde ? '#003399' : '#4A5D23';
    area.innerHTML = "";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
            <div style="width:92mm; height:65mm; border:0.5pt solid #ccc; display:flex; flex-direction:column; padding:2mm;">
                <div style="height:15mm; border-bottom:2pt dotted ${cor}; display:flex; align-items:center; margin-bottom:5px;">
                    <img src="LOGO.png" style="height:10mm; margin-right:10px;">
                    <span style="font-size:8pt; font-weight:bold;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                </div>
                <div style="flex:1; display:flex; align-items:center; gap:10px;">
                    <img src="${item.url}" style="width:32mm; height:40mm; object-fit:cover; border:2pt solid ${cor}; border-radius:5px;">
                    <div style="font-family:'SFT-Round'; font-size:16pt; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                </div>
            </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const isTarde = document.getElementById('turno-toggle').checked;
    const bg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';
    const cor = isTarde ? '#003399' : '#4A5D23';
    area.innerHTML = "";
    
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.style.backgroundSize = "100% 100%";
        page.innerHTML = `
            <div style="border: 4pt solid ${cor}; border-radius:20px; overflow:hidden;">
                <img src="${item.url}" style="width:10.5cm; height:13.5cm; object-fit:cover; display:block;">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold;" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="background:#e74c3c; color:white; font-size:10pt;">BAIXAR PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-execute" style="background:orange; color:white; margin-left:10px; font-size:10pt;">BAIXAR PPTX</button>`;
}

async function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: `Sistema_DomManuel_${currentMode}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}

function doPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name:'WIDE', width:13.33, height:7.5 });
    pptx.layout = 'WIDE';
    const isTarde = document.getElementById('turno-toggle').checked;
    const bg = isTarde ? 'FUNDOTARDE.jpg' : 'FUNDOMANHA.jpg';

    document.querySelectorAll('.page-widescreen').forEach(p => {
        const slide = pptx.addSlide();
        slide.background = { path: bg };
        const img = p.querySelector('img').src;
        const nome = p.querySelector('div[contenteditable]').innerText;
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true, color:'000000' });
    });
    pptx.writeFile({ fileName: 'Carometro_DomManuel.pptx' });
}
