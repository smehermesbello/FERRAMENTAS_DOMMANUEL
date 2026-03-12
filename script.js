/**
 * Navegação entre as telas do sistema
 */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.add('hidden');
        s.style.opacity = '0';
    });

    const active = document.getElementById(screenId);
    active.classList.remove('hidden');
    
    // Pequeno delay para animação de fade
    setTimeout(() => {
        active.style.opacity = '1';
        active.style.transition = 'opacity 0.4s ease';
    }, 50);
}

/**
 * Processa as imagens e gera o preview das etiquetas
 */
async function generatePreview() {
    const fileInput = document.getElementById('file-input');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const pdfArea = document.getElementById('pdf-area');

    if (fileInput.files.length === 0) {
        alert("Por favor, selecione as fotos dos alunos antes de gerar.");
        return;
    }

    pdfArea.innerHTML = ""; // Limpa visualização anterior
    showScreen('screen-preview');

    const files = Array.from(fileInput.files);
    const total = files.length;
    const porPagina = 8; // Limite por folha A4

    for (let i = 0; i < total; i += porPagina) {
        const page = document.createElement('div');
        page.className = 'page-a4';

        const lote = files.slice(i, i + porPagina);

        for (let file of lote) {
            const imgSrc = await lerArquivo(file);
            
            // Tratamento do nome: remove extensão e substitui caracteres estranhos
            let nomeLimpo = file.name.replace(/\.[^/.]+$/, "")
                                     .replace(/[_-]/g, " ")
                                     .toUpperCase();

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

/**
 * Converte arquivo de imagem para Base64 para exibição no navegador
 */
function lerArquivo(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

/**
 * Captura o conteúdo gerado e exporta como PDF de alta qualidade
 */
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btin = document.querySelector('.btn-download');
    
    btin.innerText = "⏳ PROCESSANDO...";
    btin.disabled = true;

    // Aguarda um momento para garantir que as fontes externas do Google foram renderizadas
    setTimeout(() => {
        const opt = {
            margin: 0,
            filename: 'Etiquetas_Alunos_Dom_Manuel.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, // Necessário para carregar fontes do Google e imagens locais
                letterRendering: false,
                backgroundColor: "#FFFFFF"
            },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            btin.innerText = "BAIXAR PDF FINAL";
            btin.disabled = false;
        });
    }, 1000); // 1 segundo de espera para segurança das fontes
}
