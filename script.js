let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden'); [cite: 10]
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = mode.toUpperCase();
    showScreen('screen-config');
}

async function startGeneration() {
    const files = document.getElementById('file-input').files;
    if (!files.length) return alert("Selecione as fotos!"); [cite: 12]
    
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "Gerando prévia...";

    if (currentMode === 'etiqueta') await genEtiquetas(files);
    else await genCarometro(files);
}

// Renderiza Etiquetas (8 por página A4)
async function genEtiquetas(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    const mClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';
    
    setupBtns(['pdf']);
    area.innerHTML = "";
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4'; [cite: 15]
        const lote = arr.slice(i, i + 8); [cite: 14]
        for (const f of lote) {
            const src = await new Promise(res => {
                const r = new FileReader();
                r.onload = e => res(e.target.result);
                r.readAsDataURL(f);
            });
            const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase(); [cite: 17]
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:0.5pt solid #000; display:flex; flex-direction:column; box-sizing:border-box; background:#fff;">
                    <div style="height:17.5mm; border-bottom:1px solid #ccc; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.jpg" style="height:12mm; margin-right:5px;">
                        <span style="font-family:Calibri; font-size:12pt; flex:1; text-align:center;">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div class="container-foto ${mClass}" style="width:30mm; height:40mm;">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="nome-aluno" contenteditable="true" style="font-size:20pt; flex:1;">${nome}</div>
                    </div>
                </div>`; [cite: 18, 19, 20]
        }
        area.appendChild(page); [cite: 21]
    }
}

// Renderiza Carômetro (1 por página Widescreen)
async function genCarometro(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const mClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    setupBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const reader = new FileReader();
        const src = await new Promise(res => {
            reader.onload = e => res(e.target.result);
            reader.readAsDataURL(f);
        });
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-foto ${mClass}" style="width:10cm; height:13cm;">
                <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="nome-aluno" contenteditable="true" style="font-size:42pt; margin-top:20px; width:90%;">${nome}</div>`;
        area.appendChild(page);
    }
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-download">PDF</button>`; [cite: 8]
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-download" style="background:orange; margin-left:10px;">PPT</button>`;
}

function doPDF() {
    const el = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'Documento.pdf',
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, [cite: 22]
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' } [cite: 23]
    };
    html2pdf().set(opt).from(el).save(); [cite: 24]
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
