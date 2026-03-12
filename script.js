function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

async function generatePreview() {
    const input = document.getElementById('file-input');
    const turnoRadio = document.querySelector('input[name="turno"]:checked');
    const area = document.getElementById('pdf-area');

    if (!input.files.length) return alert("Por favor, selecione as fotos.");
    
    const turno = turnoRadio.value;
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
            
            const etiq = document.createElement('div');
            etiq.className = 'etiqueta';
            etiq.innerHTML = `
                <div class="etiqueta-topo">
                    <img src="LOGO.jpg" class="etiqueta-logo">
                    <div class="etiqueta-escola">ESCOLA MUNICIPAL DOM MANUEL DA SILVEIRA D’ELBOUX</div>
                </div>
                <div class="etiqueta-corpo">
                    <img src="${src}" class="foto-aluno ${turno === 'manha' ? 'borda-manha' : 'borda-tarde'}">
                    <div class="nome-aluno" contenteditable="true">${nome}</div>
                </div>
            `;
            page.appendChild(etiq);
        }
        area.appendChild(page);
    }
}

function downloadPDF() {
    const element = document.getElementById('pdf-area');
    const btn = document.querySelector('.btn-download');
    
    btn.innerText = "✨ PROCESSANDO...";
    btn.disabled = true;

    // Ajuste fino para o html2pdf não capturar o fundo da tela
    const opt = {
        margin: 0,
        filename: 'Etiquetas_Dom_Manuel.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            letterRendering: true,
            backgroundColor: null // Evita que o fundo cinza da tela seja capturado
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = "BAIXAR PDF";
        btn.disabled = false;
    });
}
