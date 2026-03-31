@font-face {
    font-family: 'SFT-Round';
    src: url('SFTSchriftedRoundTRIAL-Black.ttf') format('truetype');
}

:root { 
    --glass: rgba(255, 255, 255, 0.2);
    --border: rgba(255, 255, 255, 0.4);
    --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
}

* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

body {
    margin: 0; padding: 0; height: 100vh;
    background: url('FUNDO.png') center/cover no-repeat fixed;
    font-family: 'Fredoka', sans-serif;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
}

.main-window {
    background: var(--glass); backdrop-filter: blur(20px);
    width: 95vw; height: 92vh; border-radius: 30px; position: relative;
    border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden;
    box-shadow: var(--shadow);
}

.corner-logo { position: absolute; top: 20px; right: 25px; width: 80px; z-index: 100; pointer-events: none; }

.screen { flex: 1; overflow-y: auto; padding: 40px; display: flex; flex-direction: column; align-items: center; }
.hidden { display: none !important; }

/* GRADE MENU PRINCIPAL */
.button-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; width: 100%; max-width: 900px;
}

/* ESTILO UNIFORME LIQUID GLASS */
.btn-liquid, .btn-execute, .btn-back-small {
    all: unset;
    height: 70px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: #1a1a1a;
    font-weight: 700;
    font-size: 13pt;
    cursor: pointer;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.btn-liquid:hover, .btn-execute:hover, .btn-back-small:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: translateY(-2px);
}

/* BOTÕES INTERNOS PROPORCIONAIS */
.card-header { width: 100%; display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
.btn-back-small { height: 45px; padding: 0 20px; font-size: 10pt; }
.btn-execute { height: 60px; width: 100%; margin-top: 10px; background: rgba(39, 174, 96, 0.2); }

/* TOGGLE SWITCH */
.toggle-switch {
    width: 100%; height: 50px; background: rgba(0,0,0,0.08);
    border-radius: 25px; position: relative; display: flex;
    align-items: center; cursor: pointer; border: 1px solid var(--border);
}
#switch-knob {
    position: absolute; width: calc(50% - 6px); height: 40px;
    background: white; border-radius: 20px; left: 3px;
    transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1;
}
.toggle-switch.active #switch-knob { left: calc(50% + 3px); }
.option { flex: 1; text-align: center; z-index: 2; font-weight: bold; font-size: 9pt; pointer-events: none; }

/* GLASS CARD */
.glass-card {
    background: rgba(255,255,255,0.25); padding: 35px; border-radius: 25px;
    border: 1px solid white; width: 480px; box-shadow: var(--shadow);
}
.field { margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px; }
.input-moderno {
    padding: 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.4); font-family: inherit;
}

/* PRÉVIA A4 */
.preview-toolbar { background: rgba(0,0,0,0.85); width: 100%; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; }
#pdf-area-wrapper { background: #1a1a1a; flex: 1; width: 100%; overflow-y: auto; padding: 30px 0; }
.page-a4 {
    width: 210mm; height: 296mm; background: white !important;
    display: grid; grid-template-columns: repeat(2, 92mm); grid-template-rows: repeat(4, 65mm);
    justify-content: center; align-content: start; gap: 4mm;
    page-break-after: always; margin-bottom: 30px; box-shadow: 0 0 30px rgba(0,0,0,0.5);
}
