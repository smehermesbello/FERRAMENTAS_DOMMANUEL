@font-face {
    font-family: 'SFT-Round';
    src: url('SFTSchriftedRoundTRIAL-Black.ttf') format('truetype');
}
:root { --verde: #4A5D23; --azul: #003399; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

body { 
    margin: 0; padding: 0; height: 100vh;
    background: url('FUNDO.png') center/cover no-repeat fixed;
    font-family: 'Fredoka', sans-serif;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
}

.main-window { 
    background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(25px);
    width: 95vw; height: 92vh; border-radius: 30px; position: relative;
    border: 1px solid rgba(255, 255, 255, 0.4); display: flex; flex-direction: column; overflow: hidden;
}

.corner-logo { position: absolute; top: 20px; right: 25px; width: 85px; z-index: 100; }
.screen { flex: 1; overflow-y: auto; padding: 40px; display: flex; flex-direction: column; align-items: center; }
.hidden { display: none !important; }
.flex-center { align-items: center; justify-content: center; text-align: center; }

.button-grid { 
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; 
    width: 100%; max-width: 900px; margin-top: 20px;
}

.btn-liquid {
    aspect-ratio: 16/10; border-radius: 20px; border: 1px solid rgba(255,255,255,0.5);
    background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px);
    color: #333; font-weight: 700; font-size: 14pt; cursor: pointer; transition: 0.3s;
    display: flex; align-items: center; justify-content: center;
}

.btn-liquid:hover:not(:disabled) { transform: translateY(-3px); background: rgba(255, 255, 255, 0.4); }

.input-liquid { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255, 255, 255, 0.2); text-align: center; }

/* REGRAS RÍGIDAS DE DIMENSÃO PARA PDF */
.page-widescreen { 
    width: 338.67mm; height: 190.5mm; 
    min-width: 338.67mm; min-height: 190.5mm;
    background-size: 100% 100% !important; 
    display: flex; flex-direction: column; align-items: center; justify-content: center; 
    position: relative; flex-shrink: 0; margin: 0; padding: 0;
}

.page-a4 { 
    width: 210mm; min-height: 297mm; background: white !important; 
    display: grid; grid-template-columns: repeat(2, 92mm); 
    justify-content: center; align-content: start; padding-top: 10mm;
}

.foto-carometro { width: 10.5cm; height: 13.5cm; object-fit: cover; border-radius: 15px; }
.nome-carometro { font-family: 'SFT-Round'; font-size: 44pt; margin-top: 20px; color: black; font-weight: bold; text-align: center; width: 100%; }

.modern-switch { position: relative; display: flex; width: 300px; height: 50px; background: rgba(0,0,0,0.1); border-radius: 25px; padding: 5px; margin: 10px 0; }
.modern-switch input { display: none; }
.switch-slider { position: absolute; top: 5px; left: 5px; width: calc(50% - 5px); height: 40px; background: white; border-radius: 20px; transition: 0.3s; z-index: 1; }
#manha:checked ~ .switch-slider { transform: translateX(0); }
#tarde:checked ~ .switch-slider { transform: translateX(100%); }
.switch-option { flex: 1; z-index: 2; text-align: center; line-height: 40px; font-weight: 700; cursor: pointer; }

.preview-toolbar { width: 100%; display: flex; justify-content: space-between; padding: 15px 30px; background: rgba(0,0,0,0.7); z-index: 1000; position: sticky; top: 0; }
#pdf-area-wrapper { background: #333; flex: 1; overflow-y: auto; width: 100%; display: flex; flex-direction: column; align-items: center; padding-bottom: 50px; }
