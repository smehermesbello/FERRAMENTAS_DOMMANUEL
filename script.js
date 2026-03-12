function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

async function generatePreview() {
    const fileInput = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const pdfArea = document.getElementById('pdf-area');

    if (fileInput.files.length === 0) return alert("Por favor, selecione as fotos.");

    // Garante que a fonte personalizada foi carregada antes de gerar
    await document.fonts.load('10pt "SFT-Round"');

    pdfArea.innerHTML = ""; 
    showScreen('screen-preview');

    const files = Array.from(fileInput.files);
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        const lote = files.slice(i, i + 8);

        for (let file of lote) {
            const imgSrc = await lerArquivo(file);
            let nomeOriginal = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
            // Lógica de Redução de Fonte para SFT Round Black
            let fontSize = "18pt";
            if (nomeOriginal.length > 15) fontSize = "15pt";
            if (nomeOriginal.length > 22) fontSize = "12pt";
            if (nomeOriginal.length > 30) fontSize = "10pt";

            const etiqueta = document.createElement('div');
            etiqueta.className = 'etiqueta';
            etiqueta.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${imgSrc}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true" style="font-size: ${fontSize}">${nomeOriginal}</div>
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
    const textoOriginal = btn.innerText;
    
    btn.innerText = "⚙️ PROCESSANDO...";
    btn.disabled = true;
    
    const opt = {
        margin: 0,
        filename: 'Etiquetas_Escola_Dom_Manuel.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            logging: false 
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }).catch(err => {
        console.error("Erro no PDF:", err);
        btn.innerText = "ERRO AO GERAR";
        btn.disabled = false;
    });
}
