// Generador de PDF para Sistema de Comisiones
function generarPDFMejorado() {
    // Función auxiliar para escapar HTML
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Función para obtener valor
    function getValue(id, prop = 'value') {
        const el = document.getElementById(id);
        return escapeHTML(el ? el[prop] : '');
    }

    // Obtener datos
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-PY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const mesActual = fecha.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });
    const horaActual = fecha.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    
    // Datos del asesor
    const nivelActual = getValue('statNivel', 'textContent');
    const comisionTotal = getValue('totalComision', 'textContent');
    const nivelAnterior = document.getElementById('nivelAnterior').selectedOptions[0].text;
    
    // Obtener valores numéricos para cálculos
    const montoInterno = parseInt(getValue('montoInterno').replace(/\./g, '') || '0');
    const montoExterno = parseInt(getValue('montoExterno').replace(/\./g, '') || '0');
    const montoRecuperado = parseInt(getValue('montoRecuperado').replace(/\./g, '') || '0');
    const totalDesembolsado = montoInterno + montoExterno + montoRecuperado;
    
    // Crear ventana de impresión
    const ventana = window.open('', '_blank');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Liquidación de Comisión - ${mesActual}</title>
            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                /* Header */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 0;
                    border-bottom: 3px solid #006D77;
                    margin-bottom: 30px;
                }
                
                .company-info h1 {
                    margin: 0;
                    color: #006D77;
                    font-size: 24px;
                }
                
                .company-info p {
                    margin: 5px 0;
                    color: #666;
                    font-size: 14px;
                }
                
                .doc-info {
                    text-align: right;
                }
                
                .doc-info h2 {
                    margin: 0;
                    color: #006D77;
                    font-size: 18px;
                }
                
                .doc-info p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                
                /* Información del Asesor */
                .advisor-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                }
                
                .advisor-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #555;
                }
                
                .info-value {
                    color: #006D77;
                    font-weight: 500;
                }
                
                /* Tablas */
                .section {
                    margin-bottom: 30px;
                }
                
                .section-title {
                    background: #006D77;
                    color: white;
                    padding: 10px 15px;
                    margin: 0 0 0 0;
                    font-size: 16px;
                    border-radius: 5px 5px 0 0;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                th {
                    background: #f0f0f0;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    border-bottom: 2px solid #ddd;
                }
                
                td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #eee;
                }
                
                tr:last-child td {
                    border-bottom: none;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                /* Destacados */
                .highlight-row {
                    background: #e8f5e9;
                    font-weight: 600;
                }
                
                .negative {
                    color: #d32f2f;
                }
                
                .positive {
                    color: #2e7d32;
                }
                
                /* Resumen final */
                .summary-box {
                    background: #006D77;
                    color: white;
                    padding: 25px;
                    border-radius: 8px;
                    margin: 30px 0;
                    text-align: center;
                }
                
                .total-label {
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                
                .total-amount {
                    font-size: 36px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                
                /* Footer */
                .footer {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 2px solid #e0e0e0;
                }
                
                .signature-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 50px;
                    margin-top: 50px;
                }
                
                .signature-box {
                    text-align: center;
                }
                
                .signature-line {
                    border-bottom: 1px solid #333;
                    margin-bottom: 5px;
                    height: 40px;
                }
                
                .signature-label {
                    font-size: 12px;
                    color: #666;
                }
                
                .notes {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #856404;
                }
                
                /* Utilidades */
                .mb-2 { margin-bottom: 10px; }
                .mb-3 { margin-bottom: 15px; }
                .mt-3 { margin-top: 15px; }
                
                /* Print specific */
                @media print {
                    body { 
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="company-info">
                        <h1>SERSA SAECA</h1>
                        <p>Sistema de Comisiones Comerciales</p>
                        <p>RUC: 80016875-9</p>
                    </div>
                    <div class="doc-info">
                        <h2>LIQUIDACIÓN DE COMISIÓN</h2>
                        <p><strong>Período:</strong> ${mesActual}</p>
                        <p><strong>Fecha emisión:</strong> ${fechaFormateada}</p>
                        <p><strong>Hora:</strong> ${horaActual}</p>
                    </div>
                </div>
                
                <!-- Información del Asesor -->
                <div class="advisor-section">
                    <h3 style="margin-top: 0;">DATOS DEL ASESOR COMERCIAL</h3>
                    <div class="advisor-grid">
                        <div class="info-item">
                            <span class="info-label">Nivel Actual:</span>
                            <span class="info-value">${nivelActual}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nivel Mes Anterior:</span>
                            <span class="info-value">${nivelAnterior}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Cédula:</span>
                            <span class="info-value">_____________________</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nombre Completo:</span>
                            <span class="info-value">_____________________</span>
                        </div>
                    </div>
                </div>
                
                <!-- Volumen Desembolsado -->
                <div class="section">
                    <h3 class="section-title">VOLUMEN DESEMBOLSADO</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th class="text-right">Monto (Gs)</th>
                                <th class="text-center">Meta Alcanzada</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Monto Interno</td>
                                <td class="text-right">${getValue('montoInterno') || '0'}</td>
                                <td class="text-center">${getValue('internoStatus', 'textContent') || '-'}</td>
                            </tr>
                            <tr>
                                <td>Monto Externo/Referenciado</td>
                                <td class="text-right">${getValue('montoExterno') || '0'}</td>
                                <td class="text-center">${montoExterno > 0 ? '✓' : '-'}</td>
                            </tr>
                            <tr>
                                <td>Recuperados +3 meses</td>
                                <td class="text-right">${getValue('montoRecuperado') || '0'}</td>
                                <td class="text-center">${montoRecuperado > 0 ? '✓' : '-'}</td>
                            </tr>
                            <tr class="highlight-row">
                                <td><strong>TOTAL DESEMBOLSADO</strong></td>
                                <td class="text-right"><strong>${formatNumber(totalDesembolsado)}</strong></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Cantidad y Llaves -->
                <div class="section">
                    <h3 class="section-title">CANTIDAD Y REQUISITOS</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th class="text-center">Valor</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Cantidad de Desembolsos</td>
                                <td class="text-center">${getValue('cantidadDesembolsos') || '0'}</td>
                                <td class="text-center">${getValue('cantidadStatus', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Menor Desembolso Semanal</td>
                                <td class="text-center">${getValue('menorSemana') || '0'}</td>
                                <td class="text-center ${parseInt(getValue('menorSemana')) >= 2 ? 'positive' : 'negative'}">
                                    ${parseInt(getValue('menorSemana')) >= 2 ? '✓ Llave habilitada' : '✗ Sin llave semanal'}
                                </td>
                            </tr>
                            <tr>
                                <td>Llave Montos (6 desembolsos)</td>
                                <td class="text-center">${getValue('cantidadDesembolsos') || '0'}/6</td>
                                <td class="text-center ${parseInt(getValue('cantidadDesembolsos')) >= 6 ? 'positive' : 'negative'}">
                                    ${parseInt(getValue('cantidadDesembolsos')) >= 6 ? '✓ Habilitada' : '✗ No cumple'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Indicadores de Calidad -->
                <div class="section">
                    <h3 class="section-title">INDICADORES DE CALIDAD</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Indicador</th>
                                <th class="text-center">Valor Alcanzado</th>
                                <th class="text-center">Multiplicador</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Conversión</td>
                                <td class="text-center">${getValue('conversion') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('conversion', getValue('conversion'))}</td>
                            </tr>
                            <tr>
                                <td>Empatía/Mystery Shopper</td>
                                <td class="text-center">${getValue('empatia') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('empatia', getValue('empatia'))}</td>
                            </tr>
                            <tr>
                                <td>Proceso/CRM</td>
                                <td class="text-center">${getValue('proceso') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('proceso', getValue('proceso'))}</td>
                            </tr>
                            <tr>
                                <td>Mora</td>
                                <td class="text-center">${getValue('mora') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('mora', getValue('mora'))}</td>
                            </tr>
                            <tr class="highlight-row">
                                <td colspan="2"><strong>MULTIPLICADOR FINAL</strong></td>
                                <td class="text-center"><strong>${getValue('statMulti', 'textContent')}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Detalle de Comisión -->
                <div class="section">
                    <h3 class="section-title">DETALLE DE COMISIÓN</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th class="text-right">Monto (Gs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Base Fija</td>
                                <td class="text-right">${getValue('calcBase', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Carrera (${nivelActual})</td>
                                <td class="text-right">${getValue('calcCarrera', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Monto Interno</td>
                                <td class="text-right">${getValue('calcInterno', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Monto Externo</td>
                                <td class="text-right">${getValue('calcExterno', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Recuperados</td>
                                <td class="text-right">${getValue('calcRecuperado', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Cantidad</td>
                                <td class="text-right">${getValue('calcCantidad', 'textContent')}</td>
                            </tr>
                            <tr>
                                <td>Premio Equipo</td>
                                <td class="text-right">${getValue('calcEquipo', 'textContent')}</td>
                            </tr>
                            <tr class="highlight-row">
                                <td><strong>SUBTOTAL (antes de multiplicadores)</strong></td>
                                <td class="text-right"><strong>${getValue('calcSubtotal', 'textContent')}</strong></td>
                            </tr>
                            <tr>
                                <td>Multiplicador Aplicado</td>
                                <td class="text-right">${getValue('calcMultiplicador', 'textContent')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Total -->
                <div class="summary-box">
                    <div class="total-label">COMISIÓN TOTAL A LIQUIDAR</div>
                    <div class="total-amount">${comisionTotal}</div>
                    <div style="font-size: 14px; margin-top: 10px;">
                        ${numeroALetras(parseInt(comisionTotal.replace(/[^0-9]/g, '')))} GUARANÍES
                    </div>
                </div>
                
                <!-- Observaciones -->
                <div class="notes">
                    <strong>OBSERVACIONES:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Esta liquidación está sujeta a verificación posterior de los datos ingresados.</li>
                        <li>Los montos están expresados en Guaraníes (Gs) sin céntimos.</li>
                        <li>Para reclamos o consultas, dirigirse al Departamento de RRHH dentro de los 5 días hábiles.</li>
                    </ul>
                </div>
                
                <!-- Firmas -->
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">
                            <p style="margin: 0;"><strong>Asesor Comercial</strong></p>
                            <p style="margin: 0;">C.I.: _________________</p>
                        </div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">
                            <p style="margin: 0;"><strong>Recursos Humanos</strong></p>
                            <p style="margin: 0;">Fecha: _______________</p>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p style="text-align: center; font-size: 11px; color: #666;">
                        Documento generado por el Sistema de Comisiones Comerciales - SERSA SAECA<br>
                        ${fechaFormateada} a las ${horaActual}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
    
    ventana.document.close();
    
    // Esperar y abrir diálogo de impresión
    setTimeout(() => {
        ventana.print();
    }, 500);
}

// Función auxiliar para calcular texto del multiplicador
function calcularMultiplicadorTexto(tipo, valor) {
    const config = getConfig();
    const valorNum = parseFloat(valor) || 0;
    const tabla = config.multiplicadores[tipo];
    
    if (!tabla) return '-';
    
    let multiplicador = 0;
    if (tipo === 'mora') {
        for (let i = tabla.length - 1; i >= 0; i--) {
            if (valorNum >= tabla[i].min) {
                multiplicador = tabla[i].mult;
                break;
            }
        }
    } else {
        for (let item of tabla) {
            if (valorNum >= item.min) {
                multiplicador = item.mult;
                break;
            }
        }
    }
    
    return `${(multiplicador * 100).toFixed(0)}%`;
}

// Función para convertir número a letras
function numeroALetras(numero) {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = {
        11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
        16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
        21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
        25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
    };
    
    if (numero === 0) return 'CERO';
    if (numero > 999999999) return 'NÚMERO DEMASIADO GRANDE';
    
    let resultado = '';
    
    // Millones
    const millones = Math.floor(numero / 1000000);
    if (millones > 0) {
        if (millones === 1) {
            resultado += 'UN MILLÓN ';
        } else {
            resultado += convertirCentenas(millones) + ' MILLONES ';
        }
        numero %= 1000000;
    }
    
    // Miles
    const miles = Math.floor(numero / 1000);
    if (miles > 0) {
        if (miles === 1) {
            resultado += 'MIL ';
        } else {
            resultado += convertirCentenas(miles) + ' MIL ';
        }
        numero %= 1000;
    }
    
    // Centenas
    if (numero > 0) {
        resultado += convertirCentenas(numero);
    }
    
    return resultado.trim();
    
    function convertirCentenas(n) {
        const centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 
                         'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
        
        if (n === 100) return 'CIEN';
        
        let r = '';
        const c = Math.floor(n / 100);
        if (c > 0) {
            r += centenas[c] + ' ';
            n %= 100;
        }
        
        if (especiales[n]) {
            r += especiales[n];
        } else {
            const d = Math.floor(n / 10);
            const u = n % 10;
            
            if (d > 0) {
                r += decenas[d];
                if (u > 0) r += ' Y ' + unidades[u];
            } else if (u > 0) {
                r += unidades[u];
            }
        }
        
        return r.trim();
    }
}