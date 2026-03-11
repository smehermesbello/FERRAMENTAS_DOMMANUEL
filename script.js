function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

async function generatePreview() {
    const input = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const pdfArea = document.getElementById('pdf-area');
    
    if (input.files.length === 0) {
        alert("Por favor, selecione as imagens dos estudantes.");
        return;
    }

    pdfArea.innerHTML = ""; // Limpa preview anterior
    showScreen('screen-preview');

    let files = Array.from(input.files);
    let totalFiles = files.length;
    let itemsPerPage = 8;
    
    for (let i = 0; i < totalFiles; i += itemsPerPage) {
        // Criar uma nova folha A4
        const page = document.createElement('div');
        page.className = 'page-a4';
        
        let chunk = files.slice(i, i + itemsPerPage);
        
        for (let file of chunk) {
            const imgSrc = await readFile(file);
            const nomeAluno = file.name.split('.')[0].toUpperCase();
            
            const etiqueta = document.createElement('div');
            etiqueta.className = 'etiqueta';
            etiqueta.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-titulo">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${imgSrc}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true">${nomeAluno}</div>
                </div>
            `;
            page.appendChild(etiqueta);
        }
        pdfArea.appendChild(page);
    }
}

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'etiquetas-escolares.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}
