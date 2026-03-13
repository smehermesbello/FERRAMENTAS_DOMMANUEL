/* MANTER FUNÇÕES ORIGINAIS: showScreen, generatePreview, downloadPDF */
/* ... (Inserir aqui o conteúdo original do seu script.txt) ... */

// --- NOVAS FUNÇÕES DO CARÔMETRO ---

async function generateCarometro() {
    const input = document.getElementById('file-input-caro');
    const turnoRadio = document.querySelector('input[name="turno-caro"]:checked');
    const area = document.getElementById('pdf-area-caro');
    
    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS.");
    
    const turno = turnoRadio.value;
    const classeFundo = (turno === 'manha') ? 'fundo-manha-caro' : 'fundo-tarde-caro';

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
        page.className = `page-widescreen ${classeFundo}`;
        
        page.innerHTML = `
            <img src="${src}" class="foto-carometro-display">
            <div class="nome-carometro-display">${nome}</div>
        `;
        area.appendChild(page);
    }
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
    const slidesData = document.querySelectorAll('.page-widescreen');
    const turno = document.querySelector('input[name="turno-caro"]:checked').value;
    const bgPath = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';

    slidesData.forEach(slideDiv => {
        let slide = pres.addSlide();
        slide.background = { path: bgPath };
        
        const imgBase64 = slideDiv.querySelector('img').src;
        const nomeAluno = slideDiv.querySelector('.nome-carometro-display').innerText;

        // Adiciona a foto centralizada
        slide.addImage({ 
            data: imgBase64, 
            x: '30%', y: '15%', w: '40%', h: '55%', 
            sizing: { type: 'contain' } 
        });

        // Adiciona o nome abaixo
        slide.addText(nomeAluno, { 
            x: 0, y: '75%', w: '100%', 
            align: 'center', 
            fontFace: 'Arial', 
            fontSize: 40, 
            color: 'FFFFFF', 
            bold: true 
        });
    });
    
    pres.writeFile({ fileName: "CAROMETRO_DOM_MANUEL.pptx" });
}
