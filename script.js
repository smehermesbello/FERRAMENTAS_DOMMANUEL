function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));
    
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.classList.remove('hidden');
    }
}

async function generatePreview() {
    const fileInput = document.getElementById('file-input');
    const turnoSelect = document.querySelector('input[name="turno"]:checked');
    const pdfArea = document.getElementById('pdf-area');

    if (!fileInput || fileInput.files.length === 0) {
        alert("Por favor, selecione as fotos dos alunos.");
        return;
    }
    if (!turnoSelect) {
        alert("Selecione o turno.");
        return;
    }

    const turno = turnoSelect.value;
    await document.fonts.ready;

    pdfArea.innerHTML = ""; 
    showScreen('screen-preview');

    const files = Array.from(fileInput.files);
    
    for (let i = 0; i < files.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        
        const lote = files.slice(i, i + 8);

        for (const file of lote) {
            const imgSrc = await lerArquivo(file);
            const nomeLimpo = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
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
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btn = document.querySelector('.btn-download');
    
    if (!element || element.innerHTML === "") {
        alert("Não há conteúdo.");
        return;
    }

    const originalText = btn.innerText;
    btn.innerText = "⏳ GERANDO PDF...";
    btn.disabled = true;

    const opt = {
        margin: 0,
        filename: 'Etiquetas_Dom_Manuel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            windowWidth: 1200 // Força uma largura estável para o cálculo
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css', after: '.page-a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error(err);
        btn.innerText = "ERRO";
        btn.disabled = false;
    });
}
