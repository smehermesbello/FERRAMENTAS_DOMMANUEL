let currentMode = 'etiqueta'; // Controla o modo ativo

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
}

// Configura a tela de acordo com o botão clicado no menu
function openConfig(mode) {
    currentMode = mode;
    const title = document.getElementById('config-title');
    const downloadActions = document.getElementById('download-actions');
    
    // Limpa botões extras de download
    downloadActions.innerHTML = '<button class="btn-download" onclick="downloadPDF()">BAIXAR PDF</button>';

    if(mode === 'carometro') {
        title.innerText = "GERADOR DE CARÔMETRO";
        // Adiciona botão PPT apenas para carômetro
        const btnPPT = document.createElement('button');
        btnPPT.className = "btn-download";
        btnPPT.style.backgroundColor = "#e67e22";
        btnPPT.style.marginLeft = "10px";
        btnPPT.innerText = "BAIXAR PPT";
        btnPPT.onclick = downloadPPT;
        downloadActions.appendChild(btnPPT);
    } else {
        title.innerText = "GERADOR DE ETIQUETAS";
    }
    
    showScreen('screen-config');
}

async function startGeneration() {
    if(currentMode === 'etiqueta') {
        await generateEtiquetas();
    } else {
        await generateCarometro();
    }
}

// --- LÓGICA DE ETIQUETAS (Original mantida) ---
async function generateEtiquetas() {
    const input = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');

    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS.");
    
    const classeLinha = (turno === 'manha') ? 'linha-manha' : 'linha-tarde';
    const classeMoldura = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    area.innerHTML = "";
    showScreen('screen-preview');
    const files = Array.from(input.files);

    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = files.slice(i, i + 8);

        for (const file of lote) {
            const src = await readFile(file);
            const nome = formatName(file.name);
            page.innerHTML += `
                <div class="etiqueta">
                    <div class="etiqueta-topo ${classeLinha}">
                        <img src="LOGO.jpg" style="width:1.1cm; margin-right:8px;">
                        <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div class="etiqueta-corpo">
                        <div class="container-foto">
                            <img src="${src}" class="foto-aluno">
                            <div class="moldura-overlay ${classeMoldura}"></div>
                        </div>
                        <div class="nome-aluno">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

// --- LÓGICA DE CARÔMETRO (Nova) ---
async function generateCarometro() {
    const input = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const area = document.getElementById('pdf-area');

    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS.");
    
    const bgClass = (turno === 'manha') ? 'bg-manha' : 'bg-tarde';
    const molduraClass = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    area.innerHTML = "";
    showScreen('screen-preview');
    const files = Array.from(input.files);

    for (const file of files) {
        const src = await readFile(file);
        const nome = formatName(file.name);
        
        const page = document.createElement('div');
        page.className = `page-widescreen ${bgClass}`;
        page.innerHTML = `
            <div class="carometro-foto-container container-foto">
                <img src="${src}" class="foto-aluno">
                <div class="moldura-overlay ${molduraClass}"></div>
            </div>
            <div class="nome-aluno-carometro">${nome}</div>
        `;
        area.appendChild(page);
    }
}

// Auxiliares
function readFile(file) {
    return new Promise(res => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsDataURL(file);
    });
}

function formatName(fileName) {
    return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
}

// DOWNLOAD PDF
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const isCarometro = currentMode === 'carometro';
    
    const opt = {
        margin: 0,
        filename: `${currentMode.toUpperCase()}_DOM_MANUEL.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { 
            unit: 'cm', 
            format: isCarometro ? [33.867, 19.05] : 'a4', 
            orientation: isCarometro ? 'landscape' : 'portrait' 
        }
    };
    html2pdf().set(opt).from(element).save();
}

// DOWNLOAD PPT (PowerPoint)
function downloadPPT() {
    let pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
    pptx.layout = 'WIDE';

    const pages = document.querySelectorAll('.page-widescreen');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const fundo = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const corBorda = (turno === 'manha') ? '4A5D23' : '003399';

    pages.forEach(page => {
        let slide = pptx.addSlide();
        slide.background = { path: fundo };
        
        const imgSrc = page.querySelector('.foto-aluno').src;
        const nomeAlu = page.querySelector('.nome-aluno-carometro').innerText;

        // Foto centralizada
        slide.addImage({ 
            data: imgSrc, x: 4.6, y: 0.8, w: 4, h: 5.1,
            line: { color: corBorda, pt: 2 } 
        });

        // Nome centralizado abaixo
        slide.addText(nomeAlu, { 
            x: 0, y: 6.2, w: '100%', align: 'center',
            fontFace: 'Arial', fontSize: 36, bold: true, color: '000000'
        });
    });

    pptx.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
