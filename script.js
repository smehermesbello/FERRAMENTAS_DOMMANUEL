let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = mode === 'etiqueta' ? 'GERADOR DE ETIQUETAS' : 'GERADOR DE CARÔMETRO';
    showScreen('screen-config');
}

async function startGeneration() {
    const input = document.getElementById('file-input');
    if (!input.files.length) return alert("Por favor, selecione as fotos!");
    
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>Processando imagens... aguarde.</h2>";

    if (currentMode === 'etiqueta') await generateEtiquetas();
    else await generateCarometro();
}

// Promessa para garantir carregamento da imagem
function getBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
    });
}

async function generateEtiquetas() {
    const files = Array.from(document.getElementById('file-input').files);
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    const molduraClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';
    const corLinha = turno === 'manha' ? 'var(--verde)' : 'var(--azul)';

    setupDownloadButtons(['pdf']);
    area.innerHTML = "";

    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = files.slice(i, i + 8);

        for (const file of lote) {
            const imgSrc = await getBase64(file);
            const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
            page.innerHTML += `
                <div class="etiqueta">
                    <div style="height:1.8cm; border-bottom:3px dotted ${corLinha}; display:flex; align-items:center; padding:5px; box-sizing:border-box;">
                        <img src="LOGO.jpg" style="height:1.2cm; margin-right:10px;">
                        <div style="font-size:8pt; font-weight:bold; flex:1; text-align:center;">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px; box-sizing:border-box;">
                        <div class="container-foto" style="width:3.2cm; height:4.2cm;">
                            <img src="${imgSrc}" class="foto-aluno">
                            <div class="moldura-overlay ${molduraClass}"></div>
                        </div>
                        <div class="nome-aluno" style="font-size:14pt; flex:1;">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

async function generateCarometro() {
    const files = Array.from(document.getElementById('file-input').files);
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    const bgClass = turno === 'manha' ? 'bg-manha' : 'bg-tarde';
    const molduraClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';

    setupDownloadButtons(['pdf', 'ppt']);
    area.innerHTML = "";

    for (const file of files) {
        const imgSrc = await getBase64(file);
        const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
        
        const page = document.createElement('div');
        page.className = `page-widescreen ${bgClass}`;
        page.innerHTML = `
            <div class="container-foto" style="width:9cm; height:12cm;">
                <img src="${imgSrc}" class="foto-aluno">
                <div class="moldura-overlay ${molduraClass}"></div>
            </div>
            <div class="nome-aluno" style="font-size:42pt; margin-top:30px; width:85%;">${nome}</div>`;
        area.appendChild(page);
    }
}

function setupDownloadButtons(types) {
    const container = document.getElementById('download-buttons');
    container.innerHTML = "";
    if (types.includes('pdf')) container.innerHTML += `<button class="btn-download" onclick="downloadPDF()" style="background:#27ae60">BAIXAR PDF</button>`;
    if (types.includes('ppt')) container.innerHTML += `<button class="btn-download" onclick="downloadPPT()" style="background:#d35400">BAIXAR PPTX</button>`;
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const isCaro = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'DOM_MANUEL_ARQUIVO.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'cm', format: isCaro ? [33.867, 19.05] : 'a4', orientation: isCaro ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}

async function downloadPPT() {
    let pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE';

    const turno = document.querySelector('input[name="turno"]:checked').value;
    const fundo = turno === 'manha' ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const corBorda = turno === 'manha' ? '4A5D23' : '003399';

    const slides = document.querySelectorAll('.page-widescreen');
    for (let el of slides) {
        let slide = pptx.addSlide();
        slide.background = { path: fundo };
        const imgSrc = el.querySelector('.foto-aluno').src;
        const nome = el.querySelector('.nome-aluno').innerText;

        slide.addImage({ data: imgSrc, x: 4.6, y: 0.5, w: 4.1, h: 5.4, line: {color: corBorda, pt: 2} });
        slide.addText(nome, { x: 0, y: 6.2, w: '100%', align: 'center', fontFace: 'Arial', fontSize: 40, bold: true, color: '000000' });
    }
    pptx.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
