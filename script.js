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
    if (!input.files || input.files.length === 0) return alert("SELECIONE AS FOTOS.");
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:100px;'>GERANDO...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    setTimeout(() => {
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 400);
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
            <div style="border: 6pt solid ${cor}; border-radius:18px; padding:3px; background:white; display:inline-block;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div class="nome-carometro" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

// ... Funções renderEtiquetas e renderCrachas seguem o padrão A4 já funcional ...
function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1px solid black; display:flex; flex-direction:column; background:white;">
                    <div style="height:15mm; border-bottom:1px solid #ddd; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm;">
                        <span style="font-size:8pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <img src="${item.url}" style="width:25mm; height:32mm; object-fit:cover; border-radius:5px;">
                        <div style="font-family:'SFT-Round'; font-size:14pt;" contenteditable="true">${item.nome}</div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1px solid black; display:flex; flex-direction:column; background:white;">
                    <div style="height:15mm; border-bottom:2px dotted green; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:10mm;">
                        <span style="font-size:9pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <img src="${item.url}" style="width:30mm; height:40mm; object-fit:cover; border:2px solid green;">
                        <div style="font-family:'SFT-Round'; font-size:16pt;" contenteditable="true">${item.nome}</div>
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
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:#27ae60; color:white;">BAIXAR PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:#e67e22; color:white; margin-left:10px;">BAIXAR PPTX</button>`;
}

// SOLUÇÃO ABSOLUTA PARA O PDF
async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "PROCESSANDO...";
    
    const isW = (currentMode === 'carometro');
    const original = document.getElementById('pdf-area');
    
    // CRIAMOS UM CLONE OCULTO FORA DA TELA PARA EVITAR CORTES DO NAVEGADOR
    const worker = document.createElement('div');
    worker.style.position = "absolute";
    worker.style.left = "-9999px";
    worker.style.top = "0";
    worker.style.width = isW ? "338.67mm" : "210mm"; // Força a largura exata
    worker.innerHTML = original.innerHTML;
    document.body.appendChild(worker);

    const opt = {
        margin: 0,
        filename: 'DomManuel_Documento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            windowWidth: isW ? 1400 : 800 
        },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [338.67, 190.5] : 'a4', 
            orientation: isW ? 'l' : 'p' 
        }
    };

    html2pdf().set(opt).from(worker).save().then(() => {
        document.body.removeChild(worker); // Deleta o clone após salvar
        btn.innerText = "BAIXAR PDF";
    });
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
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
