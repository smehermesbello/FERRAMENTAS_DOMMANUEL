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
    area.innerHTML = "<h2 style='color:white'>CONSTRUINDO PRÉVIA...</h2>";

    try {
        if (currentMode === 'etiqueta') await renderEtiquetas(input.files);
        else await renderCarometro(input.files);
    } catch (err) {
        alert("Erro no processamento.");
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
    document.getElementById('download-buttons').innerHTML = `<button onclick="doPDF()" class="btn-execute" style="width:150px; background:#27ae60;">BAIXAR PDF</button>`;
    
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
                <div style="width:90mm; height:63mm; border:1px solid #ccc; display:flex; flex-direction:column; background:white; box-sizing: border-box;">
                    <div style="height:17.5mm; border-bottom:2px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                        <span style="font-size:9pt; font-weight:bold; flex:1; text-align:center; color:#333;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:8px; gap:8px;">
                        <div style="width:32mm; height:42mm; border:2pt solid ${cor}; overflow:hidden;">
                            <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:14pt; flex:1; text-align:center; word-wrap: break-word;">${nome}</div>
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
    document.getElementById('download-buttons').innerHTML = `
        <button onclick="doPDF()" class="btn-execute" style="width:120px; background:#27ae60;">PDF</button>
        <button onclick="doPPT()" class="btn-execute" style="width:120px; background:orange; margin-left:10px;">PPTX</button>`;
    
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
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; text-align:center;">${nome}</div>`;
        area.appendChild(page);
    }
}

function doPDF() {
    const element = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    // Configurações de Blindagem contra erros de página em branco
    const opt = {
        margin: 0,
        filename: isW ? 'Carometro.pdf' : 'Etiquetas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0, // Resolve erro de corte se a página tiver scroll
            windowWidth: isW ? 1280 : 800 // Simula uma janela fixa para captura perfeita
        },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [338.67, 190.5] : 'a4', 
            orientation: isW ? 'l' : 'p',
            compress: true 
        },
        pagebreak: { mode: ['css', 'legacy'] } // Força a quebra baseada nas classes CSS
    };

    html2pdf().set(opt).from(element).save();
}

// Função PPT mantida como estava
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
        const nome = p.innerText;
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
