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
    area.innerHTML = "<h2 style='color:white; margin-top:100px;'>PREPARANDO LIQUID GLASS...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 500);
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
        page.innerHTML = `
            <div style="border: 6pt solid ${cor}; border-radius:18px; padding:3px;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold;" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turno = (document.querySelector('input[name="turno"]:checked').value === 'manha') ? 'MANHÃ' : 'TARDE';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1pt solid black; display:flex; flex-direction:column; background:white; position:relative; overflow:hidden;">
                    <div style="height:18mm; display:flex; align-items:center; padding:5px; border-bottom:1px solid #ddd;">
                        <img src="LOGO.png" style="height:14mm; margin-right:5px;">
                        <div style="text-align:center; flex:1;">
                            <div style="font-size:8pt; font-weight:bold;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                            <div style="font-size:7pt;">Fone: 3262-1627 / (41) 9107-9242</div>
                        </div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:5px; gap:10px;">
                        <img src="${item.url}" style="width:30mm; height:35mm; object-fit:cover; border-radius:10px; border:1px solid #ccc;">
                        <div style="flex:1; text-align:center;">
                            <div style="font-family:'SFT-Round'; font-size:16pt;" contenteditable="true">${item.nome}</div>
                            <div style="font-size:10pt; color:#666;">${turma} - ${turno}</div>
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
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:0.5pt solid black; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2.5pt dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                        <span style="font-size:9pt; font-weight:bold; color:black; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <img src="${item.url}" style="width:32mm; height:42mm; border:2.5pt solid ${cor}; object-fit:cover;">
                        <div style="font-family:'SFT-Round'; font-size:16pt; color:black; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
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
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4);">PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4); margin-left:10px;">PPTX</button>`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "GERANDO...";
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: 'Documento_DomManuel.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = "PDF");
}

function doPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name:'WIDE', width:13.33, height:7.5 });
    pptx.layout = 'WIDE';
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
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
