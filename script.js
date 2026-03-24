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
    if (!input.files || input.files.length === 0) {
        alert("POR FAVOR, SELECIONE AS FOTOS.");
        return;
    }
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>A PREPARAR...</h2>";

    try {
        if (currentMode === 'etiqueta') await renderEtiquetas(input.files);
        else await renderCarometro(input.files);
    } catch (err) {
        alert("Erro ao processar imagens.");
    }
}

const toBase64 = f => new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(f);
});

async function renderEtiquetas(files) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
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
                <div style="width:90mm; height:63mm; border:1px solid #000; display:flex; flex-direction:column; background:white; box-sizing: border-box;">
                    <div style="height:17.5mm; border-bottom:2px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
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
    setupBtns(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const f of Array.from(files)) {
        const src = await toBase64(f);
        const nome = f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase();
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div class="container-carometro" style="border-color:${cor};">
                <img src="${src}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:25px; color:black; text-align:center;" contenteditable="true">${nome}</div>`;
        area.appendChild(page);
    }
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-execute" style="width:120px; margin:0; background:#27ae60;">PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-execute" style="width:120px; margin-left:10px; background:orange;">PPTX</button>`;
}

function doPDF() {
    const area = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    // CONFIGURAÇÃO DE ISOLAMENTO TOTAL
    const opt = {
        margin: 0,
        filename: isW ? 'Carometro.pdf' : 'Etiquetas.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };

    // A mágica: Criamos um clone do conteúdo e limpamos margens de visualização
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = area.innerHTML;
    
    // Removemos qualquer sombra ou margem que exista na visualização para o PDF ser puro
    tempDiv.querySelectorAll('.page-a4, .page-widescreen').forEach(p => {
        p.style.margin = "0";
        p.style.boxShadow = "none";
    });

    html2pdf().set(opt).from(tempDiv).save();
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
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true, fontFace:'Arial Black' });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
