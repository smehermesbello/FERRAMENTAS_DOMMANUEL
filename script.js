let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = mode.toUpperCase();
    showScreen('screen-config');
}

async function startGeneration() {
    const files = document.getElementById('file-input').files;
    if (!files.length) return alert("Selecione as fotos!");
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "Processando...";

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
    const cor = turno === 'manha' ? '#4A5D23' : '#003399';
    const mClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';
    
    setupBtns(['pdf']);
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
                <div style="width:90mm; height:63mm; border:1px solid #000; display:flex; flex-direction:column; box-sizing:border-box; background:#fff;">
                    <div style="height:18mm; border-bottom:3px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.jpg" style="height:12mm; margin-right:5px;">
                        <span style="font-size:7pt; font-weight:bold; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div class="container-foto ${mClass}" style="width:32mm; height:42mm;">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="nome-aluno" style="font-size:14pt; flex:1;">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

async function renderCarometro(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = turno === 'manha' ? 'bg-manha' : 'bg-tarde';
    const mClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';

    setupBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const src = await toBase64(f);
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = `page-widescreen ${bg}`;
        page.innerHTML = `
            <div class="container-foto ${mClass}" style="width:10cm; height:13cm;">
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="nome-aluno" style="font-size:42pt; margin-top:20px;">${nome}</div>`;
        area.appendChild(page);
    }
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="baixarPDF()" style="background:green; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="baixarPPT()" style="background:orange; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; margin-left:10px;">POWERPOINT</button>`;
}

function baixarPDF() {
    const area = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    // CORREÇÃO DO CORTE: Forçamos a largura do elemento antes de capturar
    const originalWidth = area.style.width;
    area.style.width = isW ? "1280px" : "800px";

    const opt = {
        margin: 0,
        filename: 'Documento.pdf',
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };

    html2pdf().set(opt).from(area).save().then(() => {
        area.style.width = originalWidth; // Restaura após baixar
    });
}

function baixarPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name:'WIDE', width:13.33, height:7.5 });
    pptx.layout = 'WIDE';
    
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = turno === 'manha' ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = turno === 'manha' ? '4A5D23' : '003399';

    document.querySelectorAll('.page-widescreen').forEach(p => {
        const slide = pptx.addSlide();
        slide.background = { path: bg };
        const img = p.querySelector('img').src;
        const nome = p.querySelector('.nome-aluno').innerText;
        
        // Centralização exata no Slide
        slide.addImage({ data:img, x:4.6, y:0.5, w:4, h:5.3, line:{color:cor, pt:2} });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:40, bold:true, fontFace: 'Arial Black' });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
