let currentMode = 'etiqueta';

// 1. GESTÃO DE INTERFACE E FLUIDEZ
function showScreen(id) {
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(20px)';
        setTimeout(() => s.classList.add('hidden'), 300);
    });

    setTimeout(() => {
        const target = document.getElementById(id);
        target.classList.remove('hidden');
        // Pequeno delay para permitir que o navegador processe o remove('hidden') antes da animação
        setTimeout(() => {
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

function openConfig(mode) {
    currentMode = mode;
    const titles = {
        'etiqueta': '🏷️ CONFIGURAR ETIQUETAS',
        'carometro': '📸 CONFIGURAR CARÔMETRO',
        'cracha': '🎫 CONFIGURAR CRACHÁ'
    };
    document.getElementById('config-title').innerText = titles[mode] || "CONFIGURAÇÃO";
    showScreen('screen-config');
}

// 2. FEEDBACK DO BOTÃO DE FICHEIRO MODERNO
document.getElementById('file-input').addEventListener('change', function(e) {
    const status = document.getElementById('file-status');
    const numFiles = e.target.files.length;
    if (numFiles > 0) {
        status.innerText = `✅ ${numFiles} foto(s) selecionada(s)`;
        status.style.color = "#27ae60";
    } else {
        status.innerText = "Nenhum arquivo selecionado";
        status.style.color = "#555";
    }
});

// 3. LÓGICA DE GERAÇÃO DE CONTEÚDO
async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) {
        return alert("POR FAVOR, SELECIONE AS FOTOS DOS ALUNOS.");
    }

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<div style='color:white; margin-top:100px; text-align:center;'><h2>✨ ESTILIZANDO DOCUMENTOS...</h2></div>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
    }));

    // Simula um pequeno carregamento para suavidade visual
    setTimeout(() => {
        area.innerHTML = "";
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else if (currentMode === 'carometro') renderCarometro(filesData);
    }, 800);
}

// 4. RENDERS (CONTEÚDO CENTRALIZADO)

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';

    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <div style="border: 6pt solid ${cor}; border-radius:20px; padding:4px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <img src="${item.url}" class="foto-carometro">
                </div>
                <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:25px; color:black; font-weight:bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);" contenteditable="true">
                    ${item.nome}
                </div>
            </div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turnoVal = document.querySelector('input[name="turno"]:checked').value;
    const turnoTexto = (turnoVal === 'manha') ? 'MANHÃ' : 'TARDE';
    const turma = document.getElementById('input-turma').value.toUpperCase() || "TURMA NÃO DEFINIDA";

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1px solid #000; display:flex; flex-direction:column; background:white; position:relative; overflow:hidden;">
                    <div style="height:18mm; display:flex; align-items:center; padding:5px; border-bottom:1px solid #eee;">
                        <img src="LOGO.png" style="height:14mm; margin-right:8px;">
                        <div style="text-align:center; flex:1;">
                            <div style="font-size:8pt; font-weight:bold; line-height:1.1;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                            <div style="font-size:6.5pt; color:#444;">Fone: 3262-1627 / (41) 9107-9242</div>
                        </div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:8px; gap:10px; justify-content: center;">
                        <img src="${item.url}" style="width:30mm; height:35mm; object-fit:cover; border-radius:8px; border:1px solid #ccc;">
                        <div style="flex:1; text-align:center;">
                            <div style="font-family:'SFT-Round'; font-size:16pt; line-height:1.2; color:#000;" contenteditable="true">${item.nome}</div>
                            <div style="font-size:10pt; margin-top:5px; color:#555; font-weight:bold;">${turma}</div>
                            <div style="font-size:9pt; color:#777;">PERÍODO: ${turnoTexto}</div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';

    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:0.5pt solid #333; display:flex; flex-direction:column; background:white; margin:1mm;">
                    <div style="height:17.5mm; border-bottom:2.5pt dotted ${cor}; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm; margin-right:8px;">
                        <span style="font-size:9pt; font-weight:bold; flex:1; text-align:center; line-height:1.1;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:10px; gap:12px; justify-content: center;">
                        <img src="${item.url}" style="width:32mm; height:42mm; border:2.5pt solid ${cor}; border-radius:5px; object-fit:cover;">
                        <div style="font-family:'SFT-Round'; font-size:17pt; flex:1; text-align:center; color:black;" contenteditable="true">${item.nome}</div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

// 5. EXPORTAÇÃO E BOTÕES (TOOLBAR À ESQUERDA)
function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    
    if (types.includes('pdf')) {
        div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:rgba(39, 174, 96, 0.4);">💾 BAIXAR PDF</button>`;
    }
    if (types.includes('ppt') && currentMode === 'carometro') {
        div.innerHTML += `<button onclick="doPPT()" class="btn-liquid-small" style="background:rgba(230, 126, 34, 0.4);">📊 BAIXAR PPTX</button>`;
    }
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerText;
    btn.innerText = "⏳ A GERAR...";
    
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    
    const opt = {
        margin: 0,
        filename: `DomManuel_${currentMode}_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { 
            unit: 'mm', 
            format: isW ? [338.67, 190.5] : 'a4', 
            orientation: isW ? 'l' : 'p' 
        },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = originalText;
    });
}

function doPPT() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name:'WIDE', width:13.33, height:7.5 });
    pptx.layout = 'WIDE';
    
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';

    document.querySelectorAll('.page-widescreen').forEach(p => {
        const slide = pptx.addSlide();
        slide.background = { path: bg };
        
        const img = p.querySelector('img').src;
        const nome = p.querySelector('div[contenteditable]').innerText;
        
        slide.addImage({ data:img, x:4.6, y:0.5, w:4.1, h:5.3 });
        slide.addText(nome, { 
            x:0, y:6.2, w:'100%', 
            align:'center', fontSize:42, bold:true, 
            color:'000000', fontFace: 'Arial' 
        });
    });

    pptx.writeFile({ fileName: `Carometro_DomManuel_${new Date().getTime()}.pptx` });
}
