function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

async function generatePreview() {
    const input = document.getElementById('file-input');
    const turnoRadio = document.querySelector('input[name="turno"]:checked');
    const area = document.getElementById('pdf-area');

    if (!input.files.length) return alert("Selecione as fotos!");
    
    const turno = turnoRadio.value;
    await document.fonts.ready;
    area.innerHTML = "";
    showScreen('screen-preview');

    const files = Array.from(input.files);
    
    // Processa 8 etiquetas por folha A4
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        
        const lote = files.slice(i, i + 8);
        for (const file of lote) {
            const src = await new Promise(res => {
                const r = new FileReader();
                r.onload = e => res(e.target.result);
                r.readAsDataURL(file);
            });

            const nome = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
            const etiq = document.createElement('div');
            etiq.className = 'etiqueta';
            etiq.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${src}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true">${nome}</div>
                </div>
            `;
            page.appendChild(etiq);
        }
        area.appendChild(page);
    }
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btn = document.querySelector('.btn-download');
    
    btn.innerText = "GERANDO...";
    
    const opt = {
        margin: 0,
        filename: 'etiquetas_dom_manuel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            letterRendering: true
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', after: '.page-a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = "BAIXAR PDF";
    });
}
