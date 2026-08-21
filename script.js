pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentMode = 'etiqueta';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

function openCardapioConfig() {
    currentMode = 'cardapio';
    showScreen('screen-cardapio-config');
}

function voltarDaPrevia() {
    if (currentMode === 'cardapio') {
        showScreen('screen-cardapio-config');
    } else {
        showScreen('screen-config');
    }
}

/* ========================================================
   1. EXTRAÇÃO E LEITURA DOS PDFs DA PREFEITURA
   ======================================================== */

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tokenProps = await page.getTextContent();
        const pageText = tokenProps.items.map(item => item.str).join(" ");
        fullText += " " + pageText;
    }
    return fullText;
}

/* Parse das refeições por data (Ex: Segunda-Feira, 03/08) */
function parseMenuText(text) {
    const menuByDate = {};
    // Procura por datas no formato DD/MM (ex: 03/08, 14/08)
    const dateRegex = /(\d{2}\/\d{2})/g;
    const matches = [...text.matchAll(dateRegex)];

    // Dividir blocos por dia da semana encontrados no texto
    const days = text.split(/(?=Segunda-Feira|Terça-Feira|Quarta-Feira|Quinta-Feira|Sexta-Feira)/i);

    days.forEach(dayText => {
        const dateMatch = dayText.match(/(\d{2}\/\d{2})/);
        if (dateMatch) {
            const dateStr = dateMatch[1]; // ex: "03/08"
            
            // Limpa o texto retirando metadados de tabelas nutricionais
            let cleanText = dayText
                .replace(/Tabela Nutricional.*/gi, "")
                .replace(/Cálculo Semanal.*/gi, "")
                .replace(/Proteína.*/gi, "")
                .replace(/Gerência de Alimentação.*/gi, "");

            // Pega itens marcados por bolinhas/bullets
            const items = cleanText
                .split(/•|\*/)
                .map(i => i.trim())
                .filter(i => i.length > 2 && !i.includes("/") && !i.includes("Segunda") && !i.includes("Terça"));

            if (!menuByDate[dateStr]) menuByDate[dateStr] = [];
            menuByDate[dateStr] = menuByDate[dateStr].concat(items);
        }
    });

    return menuByDate;
}

/* Processamento do Cardápio ao clicar no Botão */
async function processarCardapio() {
    const fileAlmoco = document.getElementById('pdf-almoco').files[0];
    const fileLanche = document.getElementById('pdf-lanche').files[0];

    if (!fileAlmoco && !fileLanche) {
        return alert("POR FAVOR, SELECIONE PELO MENOS UM ARQUIVO PDF.");
    }

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='font-family:\"Baloo 2\",sans-serif; color:#4B4B4B; margin-top:100px;'>REFORMULANDO O CARDÁPIO... 🍎✨</h2>";

    let almocoData = {};
    let lancheData = {};

    if (fileAlmoco) {
        const rawAlmoco = await extractTextFromPDF(fileAlmoco);
        almocoData = parseMenuText(rawAlmoco);
    }

    if (fileLanche) {
        const rawLanche = await extractTextFromPDF(fileLanche);
        lancheData = parseMenuText(rawLanche);
    }

    renderCardapioCalendario(almocoData, lancheData);
}

/* ========================================================
   2. RENDERIZAÇÃO ESTÉTICA DO CALENDÁRIO
   ======================================================== */

function renderCardapioCalendario(almocoData, lancheData) {
    const area = document.getElementById('pdf-area');
    const mesAno = document.getElementById('input-mes-ano').value.toUpperCase();

    // Reúne todas as datas únicas identificadas (ex: "03/08", "04/08")
    const datesSet = new Set([...Object.keys(almocoData), ...Object.keys(lancheData)]);
    const sortedDates = Array.from(datesSet).sort();

    area.innerHTML = "";

    const calendarPage = document.createElement('div');
    calendarPage.className = 'page-calendar-landscape';
    calendarPage.id = 'calendar-node';

    // Cabeçalho do Calendário
    calendarPage.innerHTML = `
        <div class="calendar-header">
            <div>
                <h1>🍎 CARDÁPIO ESCOLAR - ${mesAno}</h1>
                <div style="font-family:'Nunito'; font-size:10pt;">Escola Municipal Dom Manuel d'Elboux</div>
            </div>
            <div class="school-info">
                <img src="LOGO.png" style="height:14mm; filter: brightness(0) invert(1);">
            </div>
        </div>

        <div class="calendar-grid-header">
            <div class="day-name-header">SEG</div>
            <div class="day-name-header">TER</div>
            <div class="day-name-header">QUA</div>
            <div class="day-name-header">QUI</div>
            <div class="day-name-header">SEX</div>
        </div>

        <div class="calendar-grid-days" id="grid-days"></div>
    `;

    area.appendChild(calendarPage);

    const gridDays = calendarPage.querySelector('#grid-days');

    if (sortedDates.length === 0) {
        gridDays.innerHTML = `<p style="grid-column: span 5; text-align:center; padding: 20px;">Não foi possível extrair datas automaticamente dos PDFs. Verifique se os arquivos estão corretos.</p>`;
    } else {
        sortedDates.forEach(dateStr => {
            const almocoItems = almocoData[dateStr] || [];
            const lancheItems = lancheData[dateStr] || [];

            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';

            dayCard.innerHTML = `
                <div class="day-number-badge">${dateStr}</div>
                ${almocoItems.length > 0 ? `
                    <div class="meal-block block-almoco">
                        <div class="meal-label">🍲 ALMOÇO</div>
                        <div class="meal-text">${almocoItems.slice(0, 4).join(', ')}</div>
                    </div>
                ` : ''}
                ${lancheItems.length > 0 ? `
                    <div class="meal-block block-lanche">
                        <div class="meal-label">🥛 LANCHE</div>
                        <div class="meal-text">${lancheItems.slice(0, 3).join(', ')}</div>
                    </div>
                ` : ''}
            `;
            gridDays.appendChild(dayCard);
        });
    }

    setupBtns(['jpg', 'pdf']);
}

/* ========================================================
   3. BOTÕES E EXPORTAÇÃO EM JPG / PDF
   ======================================================== */

function setupBtns(types) {
    const div = document.getElementById('download-buttons');
    div.innerHTML = "";

    if (types.includes('jpg')) {
        div.innerHTML += `<button id="btn-jpg" onclick="doJPG()" class="btn-liquid-small" style="background:#FF9600; color:white; border-bottom-color:#E08400; margin-right: 8px;">🖼️ BAIXAR JPG</button>`;
    }
    if (types.includes('pdf')) {
        div.innerHTML += `<button id="btn-pdf" onclick="doPDF()" class="btn-liquid-small" style="background:#58CC02; color:white; border-bottom-color:#46A302;">📄 BAIXAR PDF</button>`;
    }
}

async function doJPG() {
    const btn = document.getElementById('btn-jpg');
    btn.innerText = "GERANDO JPG...";

    const element = document.getElementById('calendar-node') || document.getElementById('pdf-area');

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF'
    });

    const link = document.createElement('a');
    link.download = `CARDAPIO_${document.getElementById('input-mes-ano').value.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();

    btn.innerText = "🖼️ BAIXAR JPG";
}

/* Mantém as funções existentes do seu sistema (Etiquetas, Crachás, etc.) */
async function executarGeracao() {
    const input = document.getElementById('file-input');
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
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
            <div style="font-family:'SFT-Round'; font-size:44pt; margin-top:20px; color:black; font-weight:bold; width:90%; text-align:center; word-break:break-word; overflow-wrap:break-word;" contenteditable="true">${item.nome}</div>`;
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
                <div style="width:92mm; height:60mm; border:1pt solid #ddd; border-radius:0; display:flex; background:white; position:relative; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; display:flex; align-items:center; padding:4px 6px; border-bottom:1pt solid #eee;">
                            <img src="LOGO.png" style="height:12mm; margin-right:5px;">
                            <div style="text-align:center; flex:1;">
                                <div style="font-family:'Baloo 2',sans-serif; font-size:8pt; font-weight:bold;">ESCOLA MUNICIPAL DOM MANUEL D’ELBOUX</div>
                                <div style="font-family:'Nunito',sans-serif; font-size:7pt;">Fone: 3262-1627 / (41) 9107-9242</div>
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

        const header = document.createElement('div');
        header.className = 'listagem-header';
        header.style.background = cor;
        header.innerText = `${turma} - ${turno}`;
        page.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'listagem-grid';
        data.slice(i, i + 16).forEach(item => {
            grid.innerHTML += `
                <div class="listagem-item">
                    <img src="${item.url}" class="listagem-foto" style="border:2pt solid ${cor};">
                    <div style="flex:1; overflow:hidden; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
                        <div style="font-family:'SFT-Round'; font-size:12pt; line-height:1.15;" contenteditable="true">${item.nome}</div>
                        <div style="font-family:'Nunito',sans-serif; font-size:9pt; color:#777; margin-top:3px;">${turma}</div>
                    </div>
                </div>`;
        });
        page.appendChild(grid);

        const footer = document.createElement('div');
        footer.className = 'listagem-footer';
        footer.innerHTML = `<img src="LOGO.png">`;
        page.appendChild(footer);

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
                <div style="width:90mm; height:63mm; border:1pt solid #ddd; border-radius:0; display:flex; background:white; overflow:hidden;">
                    <div style="width:8mm; background:${cor}; flex-shrink:0;"></div>
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="height:16mm; border-bottom:1pt solid #eee; display:flex; align-items:center; padding:4px 6px;">
                            <img src="LOGO.png" style="height:11mm; margin-right:5px;">
                            <span style="font-family:'Baloo 2',sans-serif; font-size:8.5pt; font-weight:bold; color:black; flex:1; text-align:center;">DOM MANUEL DA SILVEIRA D’ELBOUX</span>
                        </div>
                        <div style="flex:1; display:flex; align-items:center; padding:8px; gap:8px;">
                            <img src="${item.url}" style="width:30mm; height:40mm; border-radius:10px; border:2.5pt solid ${cor}; object-fit:cover;">
                            <div style="font-family:'SFT-Round'; font-size:15pt; color:black; flex:1; text-align:center;" contenteditable="true">${item.nome}</div>
                        </div>
                    </div>
                </div>`;
        });
        area.appendChild(page);
    }
    setupBtns(['pdf']);
}

function gerarNomeArquivo() {
    const tipoMap = { etiqueta: 'ETIQUETAS', cracha: 'CRACHÁ', carometro: 'CARÔMETRO', listagem: 'LISTAGEM', cardapio: 'CARDAPIO' };
    const tipo = tipoMap[currentMode] || 'DOCUMENTO';
    const turno = document.querySelector('input[name="turno"]:checked') ? (document.querySelector('input[name="turno"]:checked').value === 'manha' ? 'MANHÃ' : 'TARDE') : '';
    const turmaRaw = document.getElementById('input-turma') ? document.getElementById('input-turma').value.toUpperCase() : '';
    const turma = turmaRaw.replace(/[^\p{L}\p{N}]/gu, '') || '';
    return `${tipo}_${turma}_${turno}`;
}

async function doPDF() {
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "GERANDO...";
    const element = document.getElementById('pdf-area');
    const isW = (currentMode === 'carometro' || currentMode === 'cardapio');
    const opt = {
        margin: 0,
        filename: gerarNomeArquivo() + '.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: isW ? [297, 210] : 'a4', orientation: isW ? 'l' : 'p' },
        pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(element).save().then(() => btn.innerText = "📄 BAIXAR PDF");
}
