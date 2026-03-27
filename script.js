let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    // Mostra/Esconde campo de turma se for carômetro (opcional, aqui deixei visível para etiquetas e crachás)
    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>PREPARANDO PRÉVIA...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    if (currentMode === 'etiqueta') renderEtiquetas(filesData);
    else if (currentMode === 'cracha') renderCrachas(filesData);
    else renderCarometro(filesData);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    area.innerHTML = "";
    
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = data.slice(i, i + 8);
        lote.forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:0.5pt solid black; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2.5pt dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                        <span style="font-size:9pt; font-weight:bold; color:black; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div style="width:32mm; height:42mm; border:2.5pt solid ${cor}; overflow:hidden;">
                            <img src="${item.url}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:16pt; color:black; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turnoVal = document.querySelector('input[name="turno"]:checked').value;
    const turnoTexto = (turnoVal === 'manha') ? 'MANHÃ' : 'TARDE';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        page.style.gridTemplateRows = "repeat(4, 60mm)"; // 4 linhas de 6cm
        const lote = data.slice(i, i + 8);
        lote.forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1.5pt solid black; display:flex; flex-direction:column; background:white; position:relative;">
                    <div style="height:18mm; display:flex; align-items:center; padding:5px; border-bottom:1px solid #eee;">
                        <img src="LOGO.png" style="height:14mm; position:absolute; left:5px; top:2px;">
                        <div style="flex:1; text-align:center; margin-left:18mm;">
                            <div style="font-size:8pt; font-weight:bold; color:black;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                            <div style="font-size:6pt; color:#333;">Fone: 3262-1627 / (41) 9107-9242</div>
                        </div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:8px; gap:10px;">
                        <div style="width:30mm; height:35mm; border-radius:10px; overflow:hidden; border:1px solid #ccc;">
                            <img src="${item.url}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; text-align:center;">
                            <div style="font-family:'SFT-Round'; font-size:18pt; color:black; margin-bottom:5px;" contenteditable="true">${item.nome}</div>
                            <div style="font-size:10pt; color:#555;">${turma} - ${turnoTexto}</div>
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
    area.innerHTML = "";
    
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-carometro" style="border-width:6pt; border-color:${cor}; border-style:solid;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; text-align:center;" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-execute">BAIXAR PDF</button>`;
    if (types.includes('ppt') && currentMode === 'carometro') div.innerHTML += `<button onclick="doPPT()" class="btn-execute" style="background:orange; margin-left:10px;">BAIXAR PPTX</button>`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerText;
    btn.innerText = "GERANDO...";
    
    const images = Array.from(document.querySelectorAll('#pdf-area img'));
    await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { img.onload = res; img.onerror = res; });
    }));

    const element = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    const filename = currentMode === 'cracha' ? 'Crachas_DomManuel.pdf' : (isW ? 'Carometro_DomManuel.pdf' : 'Etiquetas_DomManuel.pdf');
    
    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = originalText);
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
