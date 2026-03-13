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

async function processImages() {
    const files = document.getElementById('file-input').files;
    if (files.length === 0) return alert("Selecione as fotos!");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>GERANDO PRÉVIA...</h2>";

    if (currentMode === 'etiqueta') await renderEtiquetas(files);
    else await renderCarometro(files);
}

function toBase64(file) {
    return new Promise(res => {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result);
        reader.readAsDataURL(file);
    });
}

async function renderEtiquetas(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    const mClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';
    
    setDownloadBtns(['pdf']);
    area.innerHTML = "";
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = arr.slice(i, i + 8);
        for (const f of lote) {
            const src = await toBase64(f);
            const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1px solid #ddd; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.jpg" style="height:12mm;">
                        <span style="font-size:10pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div style="width:30mm; height:40mm; border:2.25pt solid ${cor};">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:18pt; flex:1; text-align:center;" contenteditable="true">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

async function renderCarometro(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';

    setDownloadBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const src = await toBase64(f);
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="width:10cm; height:13cm; border:2.25pt solid ${cor};">
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="font-family:'SFT-Round'; font-size:42pt; margin-top:20px; text-align:center;" contenteditable="true">${nome}</div>`;
        area.appendChild(page);
    }
}

function setDownloadBtns(types) {
    const container = document.getElementById('action-buttons');
    container.innerHTML = "";
    if (types.includes('pdf')) container.innerHTML += `<button class="btn-execute" onclick="savePDF()" style="width:120px; margin:0;">PDF</button>`;
    if (types.includes('ppt')) container.innerHTML += `<button class="btn-execute" onclick="savePPT()" style="width:120px; margin-left:10px; background:orange;">PPTX</button>`;
}

function savePDF() {
    const el = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'Documento.pdf',
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: isW ? 1400 : 850 },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(el).save();
}

function savePPT() {
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
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true, fontFace:'Arial Black' });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
