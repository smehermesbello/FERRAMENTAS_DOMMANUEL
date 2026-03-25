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
    area.innerHTML = "<h2 style='color:white'>A PREPARAR PRÉVIA...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    if (currentMode === 'etiqueta') renderEtiquetas(filesData);
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
                <div style="width:90mm; height:63mm; border:0.5pt solid #eee; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2.5pt dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                        <span style="font-size:9pt; font-weight:bold; color:black; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div style="width:32mm; height:42mm; border:2.5pt solid ${cor}; overflow:hidden;">
                            <img src="${item.url}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:16pt; color:black; flex:1; text-align:center;">${item.nome}</div>
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
            <div class="container-carometro" style="border-width:5pt; border-color:${cor}; border-style:solid;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold;">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-execute">BAIXAR PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-execute" style="background:orange; margin-left:10px;">PPTX</button>`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerText;
    btn.innerText = "A GERAR...";
    
    // Esperar todas as imagens e a LOGO carregarem
    const images = Array.from(document.querySelectorAll('#pdf-area img'));
    await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { img.onload = res; img.onerror = res; });
    }));

    const element = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    const opt = {
        margin: 0,
        filename: isW ? 'Carometro.pdf' : 'Etiquetas.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = originalText;
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
        const nome = p.querySelector('div:last-child').innerText;
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true, color:'000000' });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
