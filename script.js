let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERADOR DE " + mode.toUpperCase();
    showScreen('screen-config');
}

async function startGeneration() {
    const files = document.getElementById('file-input').files;
    if (!files.length) return alert("Selecione fotos primeiro!");
    
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>CARREGANDO...</h2>";

    if (currentMode === 'etiqueta') await genEtiquetas(files);
    else await genCarometro(files);
}

function getBase64(file) {
    return new Promise(res => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsDataURL(file);
    });
}

// ETIQUETAS (8 por página)
async function genEtiquetas(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const mClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';
    const corLinha = (turno === 'manha') ? '#4A5D23' : '#003399';

    setupBtns(['pdf']);
    area.innerHTML = "";
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = arr.slice(i, i + 8);
        for (const f of lote) {
            const src = await getBase64(f);
            const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1px solid #000; display:flex; flex-direction:column; background:#fff;">
                    <div style="height:17.5mm; border-bottom:2.5px dotted ${corLinha}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.jpg" style="height:12mm; margin-right:5px;">
                        <span style="font-size:11pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div class="container-foto ${mClass}" style="width:30mm; height:40mm;">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="nome-aluno" contenteditable="true" style="font-size:18pt; flex:1;">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

// CARÔMETRO (Widescreen)
async function genCarometro(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const mClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    setupBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const src = await getBase64(f);
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-foto ${mClass}" style="width:10cm; height:13cm;">
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="nome-aluno" contenteditable="true" style="font-size:42pt; margin-top:20px;">${nome}</div>`;
        area.appendChild(page);
    }
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" style="background:green; color:white; padding:10px 20px; border-radius:5px; border:none; cursor:pointer;">PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" style="background:orange; color:white; padding:10px 20px; border-radius:5px; border:none; cursor:pointer; margin-left:10px;">PPTX</button>`;
}

function doPDF() {
    const el = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'Documento.pdf',
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(el).save();
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
        const nome = p.querySelector('.nome-aluno').innerText;
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true, fontFace:'Arial Black' });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
