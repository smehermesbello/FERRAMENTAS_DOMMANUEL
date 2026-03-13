function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); [cite: 10]
    const target = document.getElementById(id); [cite: 10]
    if(target) target.classList.remove('hidden'); [cite: 10, 11]
}

// LÓGICA DE ETIQUETAS (Original mantida) [cite: 12]
async function generatePreview() {
    const input = document.getElementById('file-input');
    const turnoRadio = document.querySelector('input[name="turno"]:checked');
    const area = document.getElementById('pdf-area');
    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS."); [cite: 12]
    
    const turno = turnoRadio.value;
    const classeLinha = (turno === 'manha') ? 'linha-manha' : 'linha-tarde'; [cite: 13]
    const classeMoldura = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul'; [cite: 13]

    await document.fonts.ready;
    area.innerHTML = "";
    showScreen('screen-preview'); [cite: 14]

    const files = Array.from(input.files);
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4'; [cite: 15]
        const lote = files.slice(i, i + 8); [cite: 15]
        for (const file of lote) {
            const src = await new Promise(res => {
                const r = new FileReader();
                r.onload = e => res(e.target.result);
                r.readAsDataURL(file); [cite: 16]
            });
            const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase(); [cite: 17]
            page.innerHTML += `
                <div class="etiqueta">
                    <div class="etiqueta-topo ${classeLinha}">
                        <img src="LOGO.jpg" style="width:1.1cm; margin-right:8px;">
                        <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div> [cite: 18]
                    </div>
                    <div class="etiqueta-corpo">
                        <div class="container-foto">
                            <img src="${src}" class="foto-aluno"> [cite: 19]
                            <div class="moldura-overlay ${classeMoldura}"></div>
                        </div>
                        <div class="nome-aluno" contenteditable="true">${nome}</div> [cite: 19, 20]
                    </div>
                </div>`; [cite: 20]
        }
        area.appendChild(page); [cite: 21]
    }
}

// LÓGICA DO CARÔMETRO (Nova)
async function generateCarometro() {
    const input = document.getElementById('file-input-caro');
    const turnoRadio = document.querySelector('input[name="turno-caro"]:checked');
    const area = document.getElementById('pdf-area-caro');
    
    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS.");
    
    const turno = turnoRadio.value;
    const fundoClass = (turno === 'manha') ? 'fundo-manha-caro' : 'fundo-tarde-caro';

    area.innerHTML = "";
    showScreen('screen-preview-caro');

    const files = Array.from(input.files);
    for (const file of files) {
        const src = await new Promise(res => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.readAsDataURL(file);
        });

        const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
        
        const page = document.createElement('div');
        page.className = `page-carometro ${fundoClass}`;
        page.innerHTML = `
            <img src="${src}" class="foto-caro-display">
            <div class="nome-caro-display">${nome}</div>
        `;
        area.appendChild(page);
    }
}

// DOWNLOADS
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'ETIQUETAS_DOM_MANUEL.pdf', [cite: 22]
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, [cite: 23]
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' } [cite: 23]
    };
    html2pdf().set(opt).from(element).save(); [cite: 24]
}

function downloadCarometroPDF() {
    const element = document.getElementById('pdf-area-caro');
    const opt = {
        margin: 0,
        filename: 'CAROMETRO_DOM_MANUEL.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: [33.867, 19.05], orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

function downloadCarometroPPT() {
    let pres = new PptxGenJS();
    const paginas = document.querySelectorAll('.page-carometro');
    const turno = document.querySelector('input[name="turno-caro"]:checked').value;
    const backgroundPath = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';

    paginas.forEach(pag => {
        let slide = pres.addSlide();
        slide.background = { path: backgroundPath };
        const imgData = pag.querySelector('img').src;
        const nomeText = pag.querySelector('.nome-caro-display').innerText;

        slide.addImage({ data: imgData, x: '30%', y: '15%', w: '40%', h: '55%', sizing: { type: 'contain' } });
        slide.addText(nomeText, { x: 0, y: '75%', w: '100%', align: 'center', fontFace: 'Arial', fontSize: 36, color: 'FFFFFF', bold: true });
    });
    pres.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
