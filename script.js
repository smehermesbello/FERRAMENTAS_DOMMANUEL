// Navegação entre telas com efeito de transição simples
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.add('hidden');
        s.style.opacity = '0';
    });

    const active = document.getElementById(screenId);
    active.classList.remove('hidden');
    setTimeout(() => {
        active.style.opacity = '1';
        active.style.transition = 'opacity 0.4s ease';
    }, 50);
}

async function generatePreview() {
    const fileInput = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const pdfArea = document.getElementById('pdf-area');

    if (fileInput.files.length === 0) {
        alert("Ops! Você esqueceu de selecionar as fotos dos alunos.");
        return;
    }

    pdfArea.innerHTML = ""; // Limpa visualização anterior
    showScreen('screen-preview');

    const files = Array.from(fileInput.files);
    const total = files.length;
    const porPagina = 8;

    for (let i = 0; i < total; i += porPagina) {
        const page = document.createElement('div');
        page.className = 'page-a4';

        const fotosNoBloco = files.slice(i, i + porPagina);

        for (let file of fotosNoBloco) {
            const imgSrc = await lerImagem(file);
            const nomeSemExtensao = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

            const etiqueta = document.createElement('div');
            etiqueta.className = 'etiqueta';
            etiqueta.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${imgSrc}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true">${nomeSemExtensao}</div>
                </div>
            `;
            page.appendChild(etiqueta);
        }
        pdfArea.appendChild(page);
    }
}

// Promessa para ler o arquivo de imagem
function lerImagem(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Função para baixar o PDF
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btin = document.querySelector('.btn-download');
    btin.innerText = "GERANDO PDF...";
    btin.disabled = true;

    const opt = {
        margin: 0,
        filename: 'Etiquetas_Dom_Manuel.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btin.innerText = "BAIXAR PDF FINAL";
        btin.disabled = false;
    });
}
