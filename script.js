let currentMode = 'etiqueta';

// 1. NAVEGAÇÃO ENTRE TELAS
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function openConfig(mode) {
    currentMode = mode;
    document.getElementById('config-title').innerText = "GERAR " + mode.toUpperCase();
    showScreen('screen-config');
}

// 2. PROCESSAMENTO DE DADOS
async function executarGeracao() {
    const input = document.getElementById('file-input');
    const turma = document.getElementById('input-turma').value.toUpperCase();
    
    if (!input.files || input.files.length === 0) return alert("POR FAVOR, SELECIONE AS FOTOS.");

    showScreen('screen-preview');
    const area = document.getElementById('pdf-area');
    area.innerHTML = "<h2 style='color:white; margin-top:100px;'>PREPARANDO AMBIENTE PROFISSIONAL...</h2>";

    const filesData = Array.from(input.files).map(f => ({
        url: URL.createObjectURL(f),
        nome: f.name.split('.')[0].replace(/[_-]/g, " ").toUpperCase(),
        turma: turma || "TURMA NÃO DEFINIDA"
    }));

    setTimeout(() => {
        if (currentMode === 'etiqueta') renderEtiquetas(filesData);
        else if (currentMode === 'cracha') renderCrachas(filesData);
        else renderCarometro(filesData);
    }, 500);
}

// 3. RENDERIZAÇÃO DO CARÔMETRO (WIDESCREEN)
function renderCarometro(data) {
    const area = document.getElementById('pdf-area');
    const turno = document.querySelector('input[name="turno"]:checked').value;
    const bg = (turno === 'manha') ? 'FUNDOMANHA.jpg' : 'FUNDOTARDE.jpg';
    const cor = (turno === 'manha') ? '#4A5D23' : '#003399';
    
    area.innerHTML = "";
    data.forEach(item => {
        const page = document.createElement('div');
        page.className = 'page-widescreen';
        page.style.backgroundImage = `url('${bg}')`;
        page.innerHTML = `
            <div style="border: 6pt solid ${cor}; border-radius:18px; padding:3px; background:white; display:inline-block;">
                <img src="${item.url}" class="foto-carometro">
            </div>
            <div class="nome-carometro" contenteditable="true">${item.nome}</div>
        `;
        area.appendChild(page);
    });
    setupBtns(['pdf', 'ppt']);
}

// 4. RENDERIZAÇÃO DE CRACHÁS (A4 - 8 POR PÁGINA)
function renderCrachas(data) {
    const area = document.getElementById('pdf-area');
    area.innerHTML = "";
    for (let i = 0; i < data.length; i += 8) {
        const page = document.createElement('div');
        page.className = 'page-a4';
        data.slice(i, i + 8).forEach(item => {
            page.innerHTML += `
                <div style="width:92mm; height:60mm; border:0.5pt solid #ccc; display:flex; flex-direction:column; background:white; overflow:hidden;">
                    <div style="height:15mm; border-bottom:1px solid #eee; display:flex; align-items:center; padding:5px;">
                        <img src="LOGO.png" style="height:12mm;">
                        <div style="flex:1; text-align:center; font-size:7pt; font-weight:bold;">E.M. DOM MANUEL D'ELBOUX</div>
                    </div>
                    <div style="flex:1; display:flex; align-items:center; padding:8px; gap:10px;">
                        <img
