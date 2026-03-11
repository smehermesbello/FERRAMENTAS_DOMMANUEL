function gerarEtiquetas() {
    const input = document.getElementById('upload-fotos');
    const grid = document.getElementById('etiquetas-grid');
    const turno = document.getElementById('turno').value;
    
    if (input.files.length === 0) {
        alert("Selecione fotos primeiro!");
        return;
    }

    grid.innerHTML = ""; // Limpa a folha
    
    // Limite de 8 fotos
    const numFotos = Math.min(input.files.length, 8);

    for (let i = 0; i < numFotos; i++) {
        const file = input.files[i];
        const reader = new FileReader();

        reader.onload = function(e) {
            // Remove a extensão do nome do arquivo
            const nomeArquivo = file.name.replace(/\.[^/.]+$/, "");
            
            const etiquetaHtml = `
                <div class="etiqueta">
                    <div class="topo-etiqueta">
                        <img src="LOGO.jpg" class="escola-logo">
                        <div class="escola-nome">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div class="corpo-etiqueta">
                        <img src="${e.target.result}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                        <div class="nome-aluno" contenteditable="true">${nomeArquivo}</div>
                    </div>
                    <div style="font-size: 8pt; color: gray; text-align:center;">(Clique no nome para editar)</div>
                </div>
            `;
            grid.innerHTML += etiquetaHtml;
        };
        reader.readAsDataURL(file);
    }
}

function imprimirPDF() {
    const element = document.getElementById('folha-a4');
    const opt = {
        margin: 0,
        filename: 'etiquetas_escolares.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

function showSection(sectionId) {
    // No futuro, aqui você alterna entre etiquetas, carômetros, etc.
    alert("Abrindo seção de " + sectionId);
}
