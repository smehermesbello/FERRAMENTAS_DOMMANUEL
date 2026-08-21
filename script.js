let currentMode = 'etiqueta';
const GEMINI_API_KEY = "SUA_CHAVE_API_AQUI"; // Insira sua chave Gemini aqui

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    
    const fileInput = document.getElementById('file-input');
    const labelFile = document.getElementById('label-file');
    const fieldRefeicoes = document.getElementById('field-refeicoes');
    const fieldTurno = document.getElementById('field-turno');

    if (mode === 'cardapio') {
        labelFile.innerText = "SELECIONAR ARQUIVO PDF DO CARDÁPIO:";
        fileInput.accept = ".pdf";
        fieldRefeicoes.classList.remove('hidden');
        fieldTurno.classList.add('hidden');
    } else {
        labelFile.innerText = "FOTOS DOS ESTUDANTES:";
        fileInput.accept = "image/*";
        fieldRefeicoes.classList.add('hidden');
        fieldTurno.classList.remove('hidden');
    }

    showScreen('screen-config');
}

async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE O ARQUIVO.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    
    if (currentMode === 'cardapio') {
        processarCardapioIA(input.files[0]);
    } else {
        area.innerHTML = "<h2 style='font-family:\"Baloo 2\",sans-serif; color:#4B4B4B; margin-top:100px;'>PREPARANDO TUDO... 🦉</h2>";
        const filesData = Array.from(input.files).map(f => ({
            url: URL.createObjectURL(f),
            nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase()
        }));

        setTimeout(() => {
            if (currentMode === 'etiqueta') renderEtiquetas(filesData);
            else if (currentMode === 'cracha') renderCrachas(filesData);
            else if (currentMode === 'listagem') renderListagem(filesData);
            else renderCarometro(filesData);
        }, 500);
    }
}

/* LEITURA DE PDF E INTEGRAÇÃO IA COM GEMINI */
async function processarCardapioIA(file) {
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='font-family:\"Baloo 2\",sans-serif; color:#4B4B4B; margin-top:100px;'>LENDO O CARDÁPIO COM IA... 🦉</h2>";

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let textoCompleto = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            textoCompleto += textContent.items.map(item => item.str).join(" ") + "\n";
        }

        const tipoRefeicaoSel = document.getElementById('select-refeicao').value;

        const prompt = `Analise este texto de cardápio escolar da prefeitura e extraia os pratos divididos pelos dias da semana (Segunda a Sexta).
        Filtre para extrair as refeições selecionadas: ${tipoRefeicaoSel}.
        Verifique também se existe tabela ou calculo de NUTRIENTES (Calorias, Proteínas, Lipídios, etc.).
        Retorne APENAS um JSON estrito com esta estrutura:
        {
            "temNutrientes": true/false,
            "nutrientes": "Resumo dos nutrientes se houver",
            "dias": [
                {"dia": "SEGUNDA", "lancheManha": "...", "almoco": "...", "lancheTarde": "..."},
                {"dia": "TERÇA", "lancheManha": "...", "almoco": "...", "lancheTarde": "..."},
                {"dia": "QUARTA", "lancheManha": "...", "almoco": "...", "lancheTarde": "..."},
                {"dia": "QUINTA", "lancheManha": "...", "almoco": "...", "lancheTarde": "..."},
                {"dia": "SEXTA", "lancheManha": "...", "almoco": "...", "lancheTarde": "..."}
            ]
        }
        Texto do PDF: ${textoCompleto}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const resData = await res.json();
        const jsonText = resData.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        const menuParsed = JSON.parse(jsonText);

        renderCardapioEstetico(menuParsed);

    } catch (err) {
        alert("Erro ao ler o cardápio com a IA. Verifique se a chave de API está correta ou se o arquivo é válido.");
        showScreen('screen-config');
    }
}

function renderCardapioEstetico(data) {
    const area = document.getElementById('pdf-area');
    const mesOuTurma = document.getElementById('input-turma').value.toUpperCase() || 'MÊS ATUAL';
    const hasNutri = data.temNutrientes;
    const gridCols = hasNutri ? 'cols-6' : 'cols-5';

    area.innerHTML = `
        <div id="cardapio-export-page" class="page-a4-landscape">
            <div class="cardapio-header">
                <span>ESCOLA MUNICIPAL DOM MANUEL D'ELBOUX</span>
                <span>CARDÁPIO - ${mesOuTurma}</span>
                <img src="LOGO.png">
            </div>
            <div class="cardapio-grid ${gridCols}">
                ${data.dias.map(d => `
                    <div class="card-day">
                        <div class="col-header">${d.dia}</div>
                        ${d.lancheManha ? `<div class="meal-box"><div class="meal-title">☀️ Lanche Manhã</div><div class="meal-content" contenteditable="true">${d.lancheManha}</div></div>` : ''}
                        ${d.almoco ? `<div class="meal-box"><div class="meal-title">🍲 Almoço</div><div class="meal-content" contenteditable="true">${d.almoco}</div></div>` : ''}
                        ${d.lancheTarde ? `<div class="meal-box"><div class="meal-title">🌙 Lanche Tarde</div><div class="meal-content" contenteditable="true">${d.lancheTarde}</div></div>` : ''}
                    </div>
                `).join('')}
                ${hasNutri ? `
                    <div class="card-nutri">
                        <div class="col-header">📊 NUTRIENTES</div>
                        <div class="meal-content" contenteditable="true" style="margin-top:10px;">${data.nutrientes || 'Informação nutricional não especificada.'}</div>
                    </div>
                ` : ''}
            </div>
        </div>`;

    setupBtns(['jpg']);
}

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";
    if (types.includes('pdf')) div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:#58CC02; color:white; border-bottom-color:#46A302;">BAIXAR PDF</button>`;
    if (types.includes('jpg')) div.innerHTML += `<button id="btn-jpg" onclick="doJPG()" class="btn-liquid-small" style="background:#1CB0F6; color:white; border-bottom-color:#1899D6;">BAIXAR JPG</button>`;
}

async function doJPG() {
    const btn = document.getElementById('btn-jpg');
    btn.innerText = "GERANDO JPG...";
    const element = document.getElementById('cardapio-export-page');
    
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `CARDAPIO_${document.getElementById('input-turma').value || 'MENSAL'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    
    btn.innerText = "BAIXAR JPG";
}

function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#58CC02' : '#1CB0F6';
    area.innerHTML = "";
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="border: 6pt solid ${cor}; border-radius:22px; padding:3px; background:white;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; width:90%; text-align:center; word-break:break-word;" contenteditable="true">${item.nome}</div>`;
        area.appendChild(page);
    });
    setupBtns(['pdf']);
}

function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    const turno = (document.querySelector('input[name="turno"]:checked').value === 'manha') ? 'MANHÃ' : 'TARDE';
    const cor = (turno === 'MANHÃ') ? '#58CC02' : '#1CB0F6';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:1pt solid #ddd; display:flex; background:white; position:relative; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; display:flex; align-items:center; padding:4px 6px; border-bottom:1pt solid #eee;">
                            <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                            <div style="text-align:center; flex:1;">
                                <div style="font-family:'Baloo 2',sans-serif; font-size:8pt; font-weight:bold;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                            </div>
                        </div>
                        <div style="flex:1; display:flex; align-items:center; padding:6px; gap:8px;">
                            <img src="${item.url}" style="width:28mm; height:34mm; object-fit:cover; border-radius:10px; border:2.5pt solid ${cor};">
                            <div style="flex:1; text-align:center;">
                                <div style="font-family:'SFT-Round'; font-size:15pt;" contenteditable="true">${item.nome}</div>
                                <div style="font-family:'Nunito',sans-serif; font-size:9pt; color:#777;">${turma} - ${turno}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderListagem(data) {
    const area = document.getElementById('pdf-area');
    const turno = (document.querySelector('input[name="turno"]:checked').value === 'manha') ? 'MANHÃ' : 'TARDE';
    const cor = (turno === 'MANHÃ') ? '#58CC02' : '#1CB0F6';
    const turma = document.getElementById('input-turma').value.toUpperCase();
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 16) {
        const page = document.createElement('div');
        page.className = 'page-listagem';
        page.innerHTML = `<div class="listagem-header" style="background:${cor};">${turma} - ${turno}</div>`;
        const grid = document.createElement('div');
        grid.className = 'listagem-grid';
        data.slice(i, i + 16).forEach(item => {
            grid.innerHTML += `
                <div class="listagem-item">
                    <img src="${item.url}" class="listagem-foto" style="border:2pt solid ${cor};">
                    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; text-align:center;">
                        <div style="font-family:'SFT-Round'; font-size:12pt;" contenteditable="true">${item.nome}</div>
                        <div style="font-family:'Nunito',sans-serif; font-size:9pt; color:#777;">${turma}</div>
                    </div>
                </div>`;
        });
        page.appendChild(grid);
        page.innerHTML += `<div class="listagem-footer"><img src="LOGO.png"></div>`;
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function renderEtiquetas(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const cor = (turno === 'manha') ? '#58CC02' : '#1CB0F6';
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:90mm; height:63mm; border:1pt solid #ddd; display:flex; background:white; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; border-bottom:1pt solid #eee; display:flex; align-items:center; padding:4px 6px;">
                            <img src="LOGO.png" style="height:11mm; margin-right:5px;">
                            <span style="font-family:'Baloo 2',sans-serif; font-size:8.5pt; font-weight:bold;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                        </div>
                        <div style="flex:1; display:flex; align-items:center; padding:8px; gap:8px;">
                            <img src="${item.url}" style="width:30mm; height:40mm; border-radius:10px; border:2.5pt solid ${cor}; object-fit:cover;">
                            <div style="font-family:'SFT-Round'; font-size:15pt; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "GERANDO...";
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro');
    const opt = {
        margin: 0,
        filename: `${currentMode.toUpperCase()}_DOCUMENTO.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [338.67, 190.5] : 'a4', orientation: isW ? 'l' : 'p' }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = "BAIXAR PDF");
}
