// Variável para controlar qual ferramenta o usuário abriu
let currentMode = 'etiqueta';

// 1. FUNÇÕES DE NAVEGAÇÃO
function showScreen(id) {
    // Esconde todas as telas
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    // Mostra a tela desejada
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    const title = document.getElementById('config-title');
    
    // Altera o título da tela de configuração dependendo da escolha
    if (mode === 'etiqueta') {
        title.innerText = "GERADOR DE ETIQUETAS";
    } else {
        title.innerText = "GERADOR DE CARÔMETRO";
    }
    
    showScreen('screen-config');
}

// 2. FUNÇÃO QUE DECIDE O QUE GERAR
async function startGeneration() {
    const input = document.getElementById('file-input');
    if (!input.files.length) {
        return alert("POR FAVOR, SELECIONE AS FOTOS PRIMEIRO!");
    }
    
    // Mostra a tela de preview imediatamente
    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; text-align:center;'>PROCESSANDO... AGUARDE.</h2>";

    // Decide qual função rodar
    if (currentMode === 'etiqueta') {
        await generateEtiquetas();
    } else {
        await generateCarometro();
    }
}

// 3. AUXILIAR: CARREGAR IMAGEM COM SEGURANÇA (Evita PDF em branco)
function getBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// 4. MÓDULO DE ETIQUETAS (O código que já funcionava)
async function generateEtiquetas() {
    const files = Array.from(document.getElementById('file-input').files);
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    
    const molduraClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';
    const corLinha = turno === 'manha' ? '#4A5D23' : '#003399';

    setupDownloadButtons(['pdf']); // Só PDF para etiquetas
    area.innerHTML = "";

    // Lógica de 8 por página (A4)
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
                            <img src="${imgSrc}" class="foto-aluno" style="width:100%; height:100%; object-fit:cover;">
                            <div class="moldura-overlay ${molduraClass}"></div>
                        </div>
                        <div class="nome-aluno" style="font-size:16pt; flex:1; font-family:'SFT-Round';">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

// 5. MÓDULO DE CARÔMETRO (Widescreen - 1 por página)
async function generateCarometro() {
    const files = Array.from(document.getElementById('file-input').files);
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');
    
    const bgClass = turno === 'manha' ? 'bg-manha' : 'bg-tarde';
    const molduraClass = turno === 'manha' ? 'moldura-verde' : 'moldura-azul';

    setupDownloadButtons(['pdf', 'ppt']); // PDF e PPT para carômetro
    area.innerHTML = "";

    for (const file of files) {
        const imgSrc = await getBase64(file);
        const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
        
        const page = document.createElement('div');
        page.className = `page-widescreen ${bgClass}`;
        page.innerHTML = `
            <div class="container-foto" style="width:9cm; height:12cm;">
                <img src="${imgSrc}" class="foto-aluno" style="width:100%; height:100%; object-fit:cover;">
                <div class="moldura-overlay ${molduraClass}"></div>
            </div>
            <div class="nome-aluno" style="font-size:42pt; margin-top:30px; width:85%; font-family:'SFT-Round';">${nome}</div>`;
        area.appendChild(page);
    }
}

// 6. CONTROLE DE BOTÕES DE DOWNLOAD
function setupDownloadButtons(types) {
    const container = document.getElementById('download-buttons');
    container.innerHTML = "";
    
    if (types.includes('pdf')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPDF()" style="background:#27ae60">BAIXAR PDF</button>`;
    }
    if (types.includes('ppt')) {
        container.innerHTML += `<button class="btn-download" onclick="downloadPPT()" style="background:#d35400">BAIXAR POWERPOINT</button>`;
    }
}

// 7. EXPORTAÇÃO PDF
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const isCaro = currentMode === 'carometro';
    
    const opt = {
        margin: 0,
        filename: currentMode === 'etiqueta' ? 'ETIQUETAS.pdf' : 'CAROMETRO.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { 
            unit: 'cm', 
            format: isCaro ? [33.867, 19.05] : 'a4', 
            orientation: isCaro ? 'landscape' : 'portrait' 
        }
    };
    html2pdf().set(opt).from(element).save();
}

// 8. EXPORTAÇÃO POWERPOINT (PPTX)
async function downloadPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE';

    const turno = document.querySelector('input[name="turno"]:checked').value;
    const fundo = turno === 'manha' ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const corBorda = turno === 'manha' ? '4A5D23' : '003399';

    const pages = document.querySelectorAll('.page-widescreen');
    
    pages.forEach(page => {
        let slide = pptx.addSlide();
        slide.background = { path: fundo };
        const imgSrc = page.querySelector('.foto-aluno').src;
        const nome = page.querySelector('.nome-aluno').innerText;

        slide.addImage({ data: imgSrc, x: 4.6, y: 0.5, w: 4.1, h: 5.4, line: {color: corBorda, pt: 2} });
        slide.addText(nome, { x: 0, y: 6.2, w: '100%', align: 'center', fontFace: 'Arial', fontSize: 40, bold: true });
    });
    
    pptx.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
