let currentMode = 'etiqueta';

// Troca de telas
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const screen = document.getElementById(id);
    if(screen) screen.classList.remove('hidden');
}

// Abre config e define se é Etiqueta ou Carômetro
function openConfig(mode) {
    currentMode = mode;
    const title = document.getElementById('config-title');
    title.innerText = mode === 'etiqueta' ? "GERADOR DE ETIQUETAS" : "GERADOR DE CARÔMETRO";
    showScreen('screen-config');
}

// Inicia a geração baseada no modo escolhido
async function startGeneration() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) return alert("Selecione as fotos antes de continuar!");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>Gerando arquivos... Por favor, aguarde.</h2>";

    if (currentMode === 'etiqueta') {
        await generateEtiquetas();
    } else {
        await generateCarometro();
    }
}

// Converte arquivo para Base64 (evita PDFs em branco)
function getBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// GERAÇÃO: ETIQUETAS (8 POR PÁGINA A4)
async function generateEtiquetas() {
    const files = Array.from(document.getElementById('file-input').files);
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    
    const molduraClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';
    const corLinha = turno === 'manha' ? '#4A5D23' : '#003399';

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
                            <img src="${imgSrc}" class="foto-aluno" style="width:100%; height:100%;">
                            <div class="moldura-overlay ${molduraClass}"></div>
                        </div>
                        <div class="nome-aluno" style="font-size:16pt; flex:1;">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

// GERAÇÃO: CARÔMETRO (1 POR PÁGINA WIDESCREEN)
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
                <img src="${imgSrc}" class="foto-aluno" style="width:100%; height:100%;">
                <div class="moldura-overlay ${molduraClass}"></div>
            </div>
            <div class="nome-aluno" style="font-size:42pt; margin-top:30px; width:85%;">${nome}</div>`;
        area.appendChild(page);
    }
}

// Configura botões de download dinamicamente
function setupDownloadButtons(types) {
    const container = document.getElementById('download-buttons');
    container.innerHTML = "";
    if (types.includes('pdf')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPDF()" style="background:#27ae60; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">BAIXAR PDF</button>`;
    }
    if (types.includes('ppt')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPPT()" style="background:#d35400; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; margin-left:10px;">BAIXAR POWERPOINT</button>`;
    }
}

// Download PDF
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const isCaro = currentMode === 'carometro';
    const opt = {
        margin: 0,
        filename: 'DOM_MANUEL_DOC.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: isCaro ? [33.867, 19.05] : 'a4', orientation: isCaro ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save();
}

// Download PowerPoint
function downloadPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE';

    const turno = document.querySelector('input[name="turno"]:checked').value;
    const fundo = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const corBorda = (turno === 'manha') ? '4A5D23' : '003399';

    document.querySelectorAll('.page-widescreen').forEach(page => {
        let slide = pptx.addSlide();
        slide.background = { path: fundo };
        const imgSrc = page.querySelector('.foto-aluno').src;
        const nome = page.querySelector('.nome-aluno').innerText;

        slide.addImage({ data: imgSrc, x: 4.6, y: 0.5, w: 4.1, h: 5.4, line: {color: corBorda, pt: 2} });
        slide.addText(nome, { x: 0, y: 6.2, w: '100%', align: 'center', fontSize: 40, bold: true, color: '000000' });
    });
    pptx.writeFile({ fileName: "CAROMETRO.pptx" });
}
