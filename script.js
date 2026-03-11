function showEtiquetas() {
    document.getElementById('etiquetas-controls').classList.remove('hidden');
}

async function gerarEtiquetas() {
    const files = document.getElementById('upload-fotos').files;
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const container = document.getElementById('pdf-content');
    
    container.innerHTML = ""; // Limpa anterior

    if (files.length === 0) return alert("Selecione as fotos!");

    let currentPage;
    let grid;

    for (let i = 0; i < files.length; i++) {
        // Cria nova página A4 a cada 8 fotos
        if (i % 8 === 0) {
            currentPage = document.createElement('div');
            currentPage.className = 'page-a4';
            container.appendChild(currentPage);
        }

        const file = files[i];
        const nomeAlun = file.name.split('.')[0]; // Pega nome do arquivo
        const imgSrc = await readFileAsDataURL(file);

        const etiqueta = document.createElement('div');
        etiqueta.className = 'etiqueta';
        etiqueta.innerHTML = `
            <div class="topo-etiqueta">
                <img src="LOGO.jpg" class="logo-etiqueta">
                <div class="titulo-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
            </div>
            <div class="conteudo-etiqueta">
                <img src="${imgSrc}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                <div class="nome-aluno" contenteditable="true">${nomeAlun.toUpperCase()}</div>
            </div>
        `;
        currentPage.appendChild(etiqueta);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function imprimirPDF() {
    const element = document.getElementById('pdf-content');
    const opt = {
        margin: 0,
        filename: 'etiquetas_alunos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}
