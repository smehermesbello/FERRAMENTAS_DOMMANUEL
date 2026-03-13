let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

// ESTA FUNÇÃO PRECISA TER ESSE NOME EXATO
async function startGeneration() {
    const input = document.getElementById('file-input');
    if (!input.files.length) {
        alert("POR FAVOR, SELECIONE AS FOTOS.");
        return;
    }

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>PREPARANDO ARQUIVOS...</h2>";

    if (currentMode === 'etiqueta') {
        await renderEtiquetas(input.files);
    } else {
        await renderCarometro(input.files);
    }
}

function fileToBase64(file) {
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
    
    setBtns(['pdf']);
    area.innerHTML = "";
    const arr = Array.from(files);

    for (let i = 0; i < arr.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = arr.slice(i, i + 8);
        for (const f of lote) {
            const src = await fileToBase64(f);
            const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1px solid #000; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.jpg" style="height:12mm; margin-right:5px;">
                        <span style="font-size:10pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div style="width:32mm; height:42mm; border:2.25pt solid ${cor};">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:16pt; flex:1; text-align:center;" contenteditable="true">${nome}</div>
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

    setBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const src = await fileToBase64(f);
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-foto-carometro" style="border-color:${cor};">
                <img src="${src}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:25px; text-align:center; color:black; width:90%;" contenteditable="true">${nome}</div>`;
        area.appendChild(page);
    }
}

function setBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="downloadPDF()" class="btn-execute" style="width:150px; margin:0; background:#27ae60;">PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="downloadPPT()" class="btn-execute" style="width:150px; margin-left:10px; background:#e67e22;">PPTX</button>`;
}

function downloadPDF() {
    const area = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    const opt = {
        margin: 0,
        filename: currentMode + '_Escolar.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };

    html2pdf().set(opt).from(area).save();
}

function downloadPPT() {
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
    pptx.writeFile({ fileName: 'Carometro_DomManuel.pptx' });
}
