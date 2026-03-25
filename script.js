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

// Limpeza de nome para evitar XSS e erros de quebra de linha
function cleanName(fileName) {
    return fileName.split('.')[0]
        .replace(/[_-]/g, " ")
        .replace(/[^\w\s]/gi, '')
        .toUpperCase();
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) {
        alert("POR FAVOR, SELECIONE AS FOTOS.");
        return;
    }

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white'>CONSTRUINDO AMBIENTE SEGURO...</h2>";

    // Criar URLs temporárias em vez de Base64 (Economiza 90% de RAM)
    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: cleanName(f.name)
    }));

    if (currentMode === 'etiqueta') renderEtiquetas(filesData);
    else renderCarometro(filesData);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    area.innerHTML = "";
    
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = data.slice(i, i + 8);
        lote.forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1px solid #eee; display:flex; flex-direction:column; background:white;">
                    <div style="height:17.5mm; border-bottom:2px dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                        <span style="font-size:9pt; font-weight:bold; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:10px;">
                        <div style="width:32mm; height:42mm; border:2.25pt solid ${cor};">
                            <img src="${item.url}" style="width:100%; height:100%; object-fit:cover;" onload="this.setAttribute('data-loaded', 'true')">
                        </div>
                        <div style="font-family:'SFT-Round'; font-size:16pt; flex:1; text-align:center;">${item.nome}</div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    updateButtons(['pdf']);
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    area.innerHTML = "";
    
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="border:3pt solid ${cor}; border-radius:18px; padding:2px;">
                <img src="${item.url}" class="foto-carometro" onload="this.setAttribute('data-loaded', 'true')">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:25px; color:black;">${item.nome}</div>`;
        area.appendChild(page);
    });
    updateButtons(['pdf', 'ppt']);
}

function updateButtons(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button onclick="doPDF()" class="btn-execute">BAIXAR PDF</button>`;
    if (types.includes('ppt')) div.innerHTML += `<button onclick="doPPT()" class="btn-execute" style="background:orange; margin-left:10px;">BAIXAR PPTX</button>`;
}

async function waitImages() {
    const imgs = Array.from(document.querySelectorAll('#pdf-area img'));
    const promises = imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { img.onload = res; img.onerror = res; });
    });
    return Promise.all(promises);
}

async function doPDF() {
    const btn = document.querySelector('.btn-execute');
    btn.innerText = "PROCESSANDO...";
    btn.disabled = true;

    await waitImages(); // TRAVA SÊNIOR: Espera todas as fotos aparecerem no DOM

    const element = document.getElementById('pdf-area');
    const isW = currentMode === 'carometro';
    
    const opt = {
        margin: 0,
        filename: isW ? 'Carometro.pdf' : 'Etiquetas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, logging: false },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = "BAIXAR PDF";
        btn.disabled = false;
    });
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
        const nome = p.querySelector('div:last-child').innerText;
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { x:0, y:6.2, w:'100%', align:'center', fontSize:42, bold:true });
    });
    pptx.writeFile({ fileName: 'Carometro.pptx' });
}
