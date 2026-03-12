function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

async function generatePreview() {
    const fileInput = document.getElementById('file-input');
    const turnoSelect = document.querySelector('input[name="turno"]:checked');
    const pdfArea = document.getElementById('pdf-area');

    if (fileInput.files.length === 0) return alert("Por favor, selecione as fotos.");
    if (!turnoSelect) return alert("Selecione o turno.");

    const turno = turnoSelect.value;

    // Aguarda o navegador processar as fontes
    await document.fonts.ready;

    pdfArea.innerHTML = ""; 
    showScreen('screen-preview');

    const files = Array.from(fileInput.files);
    
    // Processa 8 etiquetas por página A4
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = files.slice(i, i + 8);

        for (let file of lote) {
            const imgSrc = await lerArquivo(file);
            // Remove a extensão e caracteres especiais do nome do arquivo
            let nomeLimpo = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
            const etiqueta = document.createElement('div');
            etiqueta.className = 'etiqueta';
            etiqueta.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${imgSrc}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true">${nomeLimpo}</div>
                </div>
            `;
            page.appendChild(etiqueta);
        }
        pdfArea.appendChild(page);
    }
}

function lerArquivo(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btn = document.querySelector('.btn-download');
    const originalText = btn.innerText;
    
    btn.innerText = "⏳ GERANDO ARQUIVO...";
    btn.disabled = true;
    
    const opt = {
        margin: 0,
        filename: 'Etiquetas_Dom_Manuel_Final.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true 
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error(err);
        btn.innerText = "ERRO AO GERAR";
        btn.disabled = false;
    });
}
