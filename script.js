function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
}

async function generatePreview() {
    const input = document.getElementById('file-input');
    const turnoRadio = document.querySelector('input[name="turno"]:checked');
    const area = document.getElementById('pdf-area');

    if (!input.files.length) return alert("POR FAVOR, SELECIONE AS FOTOS.");
    
    const turno = turnoRadio.value;
    const classeLinha = (turno === 'manha') ? 'linha-manha' : 'linha-tarde';
    const classeMoldura = (turno === 'manha') ? 'moldura-verde' : 'moldura-azul';

    await document.fonts.ready;
    area.innerHTML = "";
    showScreen('screen-preview');

    const files = Array.from(input.files);
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
            
            // Estrutura mudou: Agora temos a foto E uma div de moldura por cima dela
            page.innerHTML += `
                <div class="etiqueta">
                    <div class="etiqueta-topo ${classeLinha}">
                        <img src="LOGO.jpg" style="width:1.1cm; margin-right:8px;">
                        <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                    </div>
                    <div class="etiqueta-corpo">
                        <div class="container-foto">
                            <img src="${src}" class="foto-aluno">
                            <div class="moldura-overlay ${classeMoldura}"></div>
                        </div>
                        <div class="nome-aluno" contenteditable="true">${nome}</div>
                    </div>
                </div>`;
        }
        area.appendChild(page);
    }
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const opt = {
        margin: 0,
        filename: 'ETIQUETAS_DOM_MANUEL.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0, 
            backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save();
}
