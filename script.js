/**
 * Função para alternar entre as telas do sistema
 */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
}

/**
 * Função principal para gerar o preview das etiquetas
 */
async function generatePreview() {
    const input = document.getElementById('file-input');
    const turnoRadio = document.querySelector('input[name="turno"]:checked');
    const area = document.getElementById('pdf-area');

    if (!input.files.length) {
        return alert("POR FAVOR, SELECIONE AS FOTOS DOS ALUNOS.");
    }
    
    const turno = turnoRadio.value;
    
    // Define as classes dinâmicas com base no turno selecionado
    const classeLinha = (turno === 'manha') ? 'linha-manha' : 'linha-tarde';
    const classeBordaFoto = (turno === 'manha') ? 'borda-manha' : 'borda-tarde';

    // Garante que a fonte customizada foi carregada antes de gerar
    await document.fonts.ready;
    
    area.innerHTML = "";
    showScreen('screen-preview');

    const files = Array.from(input.files);
    
    // Agrupa arquivos em lotes de 8 (máximo por página A4)
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

            // Limpa o nome do arquivo para usar como nome do aluno
            const nomeAluno = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toUpperCase();
            
            // Monta a estrutura da etiqueta com as classes de turno
            page.innerHTML += `
                <div class="etiqueta">
                    <div class="etiqueta-topo ${classeLinha}">
                        <img src="LOGO.jpg" class="etiqueta-logo">
                        <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div class="etiqueta-corpo">
                        <img src="${src}" class="foto-aluno ${classeBordaFoto}">
                        <div class="nome-aluno" contenteditable="true">${nomeAluno}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

/**
 * Função para converter a área de preview em um arquivo PDF
 */
function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btn = document.querySelector('.btn-download');
    
    const originalText = btn.innerText;
    btn.innerText = "⏳ PROCESSANDO...";
    btn.disabled = true;

    const opt = {
        margin: 0,
        filename: 'ETIQUETAS_DOM_MANUEL.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0, 
            backgroundColor: '#ffffff' 
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    }).catch(err => {
        console.error("Erro ao gerar PDF:", err);
        btn.innerText = "ERRO AO GERAR";
        btn.disabled = false;
    });
}
