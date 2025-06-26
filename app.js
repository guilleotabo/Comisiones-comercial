
        // Datos del sistema V2 con Recuperados
        const niveles = ['Capilla', 'Junior', 'Senior A', 'Senior B', 'Máster', 'Genio'];
        const iconos = ['🏠', '👤', '⭐', '💎', '👑', '🏆'];
        
        const metas = {
            montoInterno: [600000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
            montoExterno: [50000000, 100000000, 150000000, 200000000, 300000000, 400000000],
            montoRecuperado: [40000000, 60000000, 80000000, 100000000, 120000000, 150000000],
            cantidad: [6, 8, 9, 10, 12, 13]
        };
        
        const pagos = {
            base: 3000000,
            carrera: [0, 0, 500000, 1000000, 1500000, 2000000],
            montoInterno: [500000, 600000, 1000000, 1400000, 2000000, 2500000],
            montoExterno: [800000, 1000000, 1500000, 2000000, 2500000, 3300000],
            montoRecuperado: [300000, 400000, 500000, 600000, 800000, 1000000],
            cantidad: [0, 400000, 600000, 700000, 1000000, 1200000],
            equipo: [0, 0, 0, 500000, 800000, 1000000],
            penalizacionMora: [10000, 20000, 30000, 40000, 50000, 60000]
        };
        
        // Máximo posible para la barra de subtotal (con recuperados)
        const MAXIMO_SUBTOTAL = 14000000;
        
        // Datos de multiplicadores
        const multiplicadores = {
            conversion: [
                {min: 10, mult: 1.1, text: '10%+'},
                {min: 8, mult: 1.0, text: '8%'},
                {min: 7, mult: 0.8, text: '7%'},
                {min: 6, mult: 0.7, text: '6%'},
                {min: 5, mult: 0.6, text: '5%'},
                {min: 4, mult: 0.5, text: '4%'},
                {min: 0, mult: 0.3, text: '<4%'}
            ],
            empatia: [
                {min: 96, mult: 1.0, text: '96%+'},
                {min: 90, mult: 0.9, text: '90%'},
                {min: 80, mult: 0.5, text: '80%'},
                {min: 70, mult: 0.3, text: '70%'},
                {min: 0, mult: 0, text: '<70%'}
            ],
            proceso: [
                {min: 95, mult: 1.0, text: '95%+'},
                {min: 90, mult: 0.95, text: '90%'},
                {min: 85, mult: 0.8, text: '85%'},
                {min: 70, mult: 0.3, text: '70%'},
                {min: 0, mult: 0, text: '<70%'}
            ]
        };
        
        let isCalculating = false;
        
        // Formatear número
        function formatNumber(num) {
            return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        
        // Remover formato
        function removeFormat(input) {
            if (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado') {
                input.value = input.value.replace(/\./g, '');
            }
        }
        
        // Aplicar formato
        function applyFormat(input) {
            if (input.value && (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado')) {
                const num = parseInt(input.value.replace(/\./g, '')) || 0;
                input.value = formatNumber(num);
            }
        }
        
        // Formatear y calcular
        function formatAndCalculate(input) {
            if (isCalculating) return;
            isCalculating = true;
            
            let value = input.value.replace(/[^0-9]/g, '');
            
            if (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado') {
                const cursorPos = input.selectionStart;
                const oldLength = input.value.length;
                
                if (value) {
                    input.value = formatNumber(parseInt(value));
                } else {
                    input.value = '';
                }
                
                const newLength = input.value.length;
                const diff = newLength - oldLength;
                const newPos = Math.max(0, cursorPos + diff);
                input.setSelectionRange(newPos, newPos);
            } else {
                input.value = value;
            }
            
            if (input.classList.contains('required')) {
                if (input.value) {
                    input.classList.add('filled');
                    input.classList.remove('empty');
                } else {
                    input.classList.remove('filled');
                    input.classList.add('empty');
                }
            }

            if (input.id === 'menorSemana') {
                if (input.value) {
                    input.classList.add('filled');
                    input.classList.remove('empty');
                } else {
                    input.classList.remove('filled');
                    input.classList.add('empty');
                }
            }

            if (input.id === 'clientesMora') {
                const valNum = parseInt(input.value) || 0;
                if (valNum > 0) {
                    input.classList.add('filled');
                    input.classList.remove('invalid');
                } else {
                    input.classList.remove('filled');
                    input.classList.add('invalid');
                }
            }
            
            isCalculating = false;
            updateCalculations();
        }
        
        // Verificar campos completos
        function checkRequiredFields() {
            const required = document.querySelectorAll('.required');
            for (let field of required) {
                if (!field.value) return false;
            }
            return true;
        }
        
        // Obtener valor numérico
        function getNumericValue(id) {
            const input = document.getElementById(id);
            if (!input.value) return 0;
            return parseInt(input.value.replace(/\./g, '')) || 0;
        }
        
        // Calcular multiplicador
        function calcularMultiplicador(tipo, valor) {
            const tabla = multiplicadores[tipo];
            if (!tabla) return 0;
            for (let item of tabla) {
                if (valor >= item.min) return item.mult;
            }
            return 0;
        }
        
        // Actualizar barra de progreso clickeable
        function updateProgressBar(tipo, valor, containerId, infoId) {
            const container = document.getElementById(containerId);
            const info = document.getElementById(infoId);
            
            let metas_array, pagos_array, maxMeta;
            if (tipo === 'interno') {
                metas_array = metas.montoInterno;
                pagos_array = pagos.montoInterno;
                maxMeta = 1200000000;
            } else if (tipo === 'externo') {
                metas_array = metas.montoExterno;
                pagos_array = pagos.montoExterno;
                maxMeta = 400000000;
            } else if (tipo === 'recuperado') {
                metas_array = metas.montoRecuperado;
                pagos_array = pagos.montoRecuperado;
                maxMeta = 150000000;
            } else if (tipo === 'cantidad') {
                metas_array = metas.cantidad;
                pagos_array = pagos.cantidad;
                maxMeta = 13;
            }
            
            // Crear segmentos clickeables
            let html = '<div class="progress-segments">';
            let nivelAlcanzado = -1;
            
            for (let i = 0; i < niveles.length; i++) {
                const alcanzado = valor >= metas_array[i];
                if (alcanzado) nivelAlcanzado = i;
                
                let className = 'progress-segment';
                if (alcanzado) className += ' reached';
                if (i === nivelAlcanzado) className += ' current';
                
                const metaTexto = tipo === 'cantidad' ? metas_array[i] : formatNumber(metas_array[i]/1000000) + 'M';
                const premioTexto = formatNumber(pagos_array[i]);
                
                html += `<div class="${className}" onclick="cargarValor('${tipo}', ${metas_array[i]})" 
                         title="Click para cargar ${metaTexto}">
                    <div class="level">${niveles[i]}</div>
                    <div class="meta">Meta: ${metaTexto}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const progreso = Math.round((valor / maxMeta) * 100);
            const nivelTexto = nivelAlcanzado >= 0 ? niveles[nivelAlcanzado] : 'Ninguno';
            const premioTexto = nivelAlcanzado >= 0 ? formatNumber(pagos_array[nivelAlcanzado]) : '0';
            
            info.innerHTML = `Progreso total: ${tipo === 'cantidad' ? valor : formatNumber(valor)} de ${tipo === 'cantidad' ? maxMeta : formatNumber(maxMeta)} (${progreso}%)<br>
                             Nivel alcanzado: <strong>${nivelTexto}</strong> | Premio: <strong>${premioTexto} Gs</strong>`;
            
            return nivelAlcanzado;
        }
        
        // Cargar valor al hacer click
        function cargarValor(tipo, valor) {
            if (tipo === 'interno') {
                document.getElementById('montoInterno').value = formatNumber(valor);
                document.getElementById('montoInterno').classList.add('filled');
                document.getElementById('montoInterno').classList.remove('empty');
            } else if (tipo === 'externo') {
                document.getElementById('montoExterno').value = formatNumber(valor);
            } else if (tipo === 'recuperado') {
                document.getElementById('montoRecuperado').value = formatNumber(valor);
            } else if (tipo === 'cantidad') {
                document.getElementById('cantidadDesembolsos').value = valor;
                document.getElementById('cantidadDesembolsos').classList.add('filled');
                document.getElementById('cantidadDesembolsos').classList.remove('empty');
            }
            updateCalculations();
        }
        
        // Actualizar barra de carrera
        function updateCarreraBar(nivelCarrera) {
            const container = document.getElementById('barraCarrera');
            const info = document.getElementById('infoCarrera');
            
            // Crear segmentos
            let html = '<div class="progress-segments">';
            
            for (let i = 0; i < niveles.length; i++) {
                let className = 'progress-segment';
                
                // Marcar nivel actual y anteriores
                if (i <= nivelCarrera && nivelCarrera >= 0) {
                    className += ' reached';
                }
                if (i === nivelCarrera) {
                    className += ' current';
                }
                
                const premio = pagos.carrera[i];
                const premioTexto = premio > 0 ? formatNumber(premio) : '0';
                
                html += `<div class="${className}" style="${i < 2 ? 'opacity: 0.5;' : ''}">
                    <div class="level">${niveles[i]}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const nivelTexto = nivelCarrera >= 0 ? niveles[nivelCarrera] : 'Sin carrera';
            const premioCarrera = nivelCarrera >= 0 ? pagos.carrera[nivelCarrera] : 0;
            
            info.innerHTML = `Tu nivel de carrera: <strong>${nivelTexto}</strong> | 
                             Premio: <strong>${formatNumber(premioCarrera)} Gs</strong><br>
                             <span class="text-muted">Definido por el menor nivel de los últimos 2 meses</span>`;
            
            return premioCarrera;
        }
        
        // Actualizar tabla de multiplicadores clickeable
        function updateMultiplicadorTables() {
            const conversion = parseFloat(document.getElementById('conversion').value) || 0;
            const empatia = parseFloat(document.getElementById('empatia').value) || 0;
            const proceso = parseFloat(document.getElementById('proceso').value) || 0;
            
            const container = document.getElementById('multiplicadorTables');
            let html = '';
            
            // Tabla Conversión
            const multConv = calcularMultiplicador('conversion', conversion);
            let classConv = 'multiplier-table';
            if (multConv >= 0.9) classConv += ' good';
            else if (multConv >= 0.7) classConv += ' warning';
            else if (multConv > 0) classConv += ' danger';
            
            html += `<div class="${classConv}">
                <div class="multiplier-title">Conversión</div>`;
            
            for (let item of multiplicadores.conversion) {
                const active = conversion >= item.min && (item.min === 10 || conversion < multiplicadores.conversion[multiplicadores.conversion.indexOf(item) - 1].min);
                html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                         onclick="cargarMultiplicador('conversion', ${item.min === 0 ? 3 : item.min})"
                         title="Click para cargar ${item.min === 0 ? 3 : item.min}%">
                    <span>${item.text}</span>
                    <span>→ ${Math.round(item.mult * 100)}%</span>
                </div>`;
            }
            html += `<div class="multiplier-current">Tu valor: ${conversion || '-'}%</div>
            </div>`;
            
            // Tabla Empatía
            const multEmp = calcularMultiplicador('empatia', empatia);
            let classEmp = 'multiplier-table';
            if (multEmp >= 0.9) classEmp += ' good';
            else if (multEmp >= 0.7) classEmp += ' warning';
            else if (multEmp > 0) classEmp += ' danger';
            
            html += `<div class="${classEmp}">
                <div class="multiplier-title">Empatía</div>`;
            
            for (let item of multiplicadores.empatia) {
                const active = empatia >= item.min && (item.min === 96 || empatia < multiplicadores.empatia[multiplicadores.empatia.indexOf(item) - 1].min);
                html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                         onclick="cargarMultiplicador('empatia', ${item.min === 0 ? 69 : item.min})"
                         title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
                    <span>${item.text}</span>
                    <span>→ ${Math.round(item.mult * 100)}%</span>
                </div>`;
            }
            html += `<div class="multiplier-current">Tu valor: ${empatia || '-'}%</div>
            </div>`;
            
            // Tabla Proceso
            const multProc = calcularMultiplicador('proceso', proceso);
            let classProc = 'multiplier-table';
            if (multProc >= 0.9) classProc += ' good';
            else if (multProc >= 0.7) classProc += ' warning';
            else if (multProc > 0) classProc += ' danger';
            
            html += `<div class="${classProc}">
                <div class="multiplier-title">Proceso</div>`;
            
            for (let item of multiplicadores.proceso) {
                const active = proceso >= item.min && (item.min === 95 || proceso < multiplicadores.proceso[multiplicadores.proceso.indexOf(item) - 1].min);
                html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                         onclick="cargarMultiplicador('proceso', ${item.min === 0 ? 69 : item.min})"
                         title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
                    <span>${item.text}</span>
                    <span>→ ${Math.round(item.mult * 100)}%</span>
                </div>`;
            }
            html += `<div class="multiplier-current">Tu valor: ${proceso || '-'}%</div>
            </div>`;
            
            container.innerHTML = html;
            
            // Actualizar cálculo
            const totalMult = multConv * multEmp * multProc;
            document.getElementById('multiplicadorCalc').textContent = 
                conversion && empatia && proceso ? 
                `Cálculo: ${multConv.toFixed(2)} × ${multEmp.toFixed(2)} × ${multProc.toFixed(2)} = ${(totalMult*100).toFixed(1)}%` :
                'Completa todos los campos de calidad';
            
            return totalMult;
        }
        
        // Cargar multiplicador al hacer click
        function cargarMultiplicador(tipo, valor) {
            const input = document.getElementById(tipo);
            input.value = valor;
            input.classList.add('filled');
            input.classList.remove('empty');
            updateCalculations();
        }
        
        // Actualizar llave de cantidad - SIMPLIFICADO
        function updateCantidadConLlave(cantidad, menorSemana) {
            const nivelCantidad = updateProgressBar('cantidad', cantidad, 'barraCantidad', 'infoCantidad');
            
            let nivelLimitado = nivelCantidad;
            let mensajeLlave = '';
            
            if (menorSemana < 2) {
                nivelLimitado = -1;
                mensajeLlave = '❌ Sin premio (requiere 2/sem)';
            } else {
                // Con 2/sem ya no hay límites
                mensajeLlave = '✅ Premio habilitado (2/sem cumplido)';
            }
            
            const info = document.getElementById('infoCantidad');
            if (mensajeLlave) {
                info.innerHTML += `<br><span class="${menorSemana >= 2 ? 'text-success' : 'text-warning'}">${mensajeLlave}</span>`;
            }
            
            return nivelLimitado;
        }
        
        // Generar sugerencias mejoradas
        function generarSugerencias(datos) {
            const container = document.getElementById('sugerencias');
            let html = '';
            
            // 1. PRIORIDAD ALTA - Tu limitante principal
            const limitantes = [];
            if (datos.nivelInterno >= 0) limitantes.push({tipo: 'Monto Interno', nivel: datos.nivelInterno});
            if (datos.nivelExterno >= 0) limitantes.push({tipo: 'Monto Externo', nivel: datos.nivelExterno});
            if (datos.nivelRecuperado >= 0) limitantes.push({tipo: 'Recuperados', nivel: datos.nivelRecuperado});
            if (datos.nivelCantidadReal >= 0) limitantes.push({tipo: 'Cantidad', nivel: datos.nivelCantidadReal});
            
            if (limitantes.length > 0) {
                const limitante = limitantes.reduce((min, curr) => curr.nivel < min.nivel ? curr : min);
                if (limitante.nivel < 5) {
                    const siguienteNivel = niveles[limitante.nivel + 1];
                    const diferenciaPremio = pagos.carrera[limitante.nivel + 1] - pagos.carrera[limitante.nivel];
                    
                    html += `<div class="suggestion-category high-priority">
                        <div class="suggestion-category-title">🚨 Tu Limitante Principal</div>
                        <div class="suggestion-item">Tu ${limitante.tipo} (${niveles[limitante.nivel]}) limita tu carrera. 
                        Alcanzando ${siguienteNivel} en este indicador sumarías ${formatNumber(diferenciaPremio)} Gs en premio carrera.</div>
                    </div>`;
                }
            }
            
            // 2. OPORTUNIDADES RÁPIDAS
            const oportunidades = [];
            
            // Monto Interno
            if (datos.nivelInterno < 5) {
                const falta = metas.montoInterno[datos.nivelInterno + 1] - datos.montoInterno;
                const porcentaje = (falta / metas.montoInterno[datos.nivelInterno + 1]) * 100;
                if (porcentaje <= 20) {
                    const bonusExtra = pagos.montoInterno[datos.nivelInterno + 1] - pagos.montoInterno[datos.nivelInterno];
                    oportunidades.push(`¡Estás a solo ${formatNumber(falta)} de ${niveles[datos.nivelInterno + 1]} en Interno! (+${formatNumber(bonusExtra)} Gs)`);
                }
            }
            
            // Cantidad
            if (datos.nivelCantidadReal < 5) {
                const falta = metas.cantidad[datos.nivelCantidadReal + 1] - datos.cantidad;
                if (falta <= 2) {
                    const bonusExtra = pagos.cantidad[datos.nivelCantidadReal + 1] - pagos.cantidad[datos.nivelCantidadReal];
                    oportunidades.push(`¡Estás a solo ${falta} desembolsos de ${niveles[datos.nivelCantidadReal + 1]}! (+${formatNumber(bonusExtra)} Gs)`);
                }
            }
            
            if (oportunidades.length > 0) {
                html += `<div class="suggestion-category quick-wins">
                    <div class="suggestion-category-title">💰 Oportunidades Rápidas</div>`;
                oportunidades.forEach(op => {
                    html += `<div class="suggestion-item">${op}</div>`;
                });
                html += `</div>`;
            }
            
            // 3. MEJORAS DE MULTIPLICADORES
            const multiplicadoresData = [
                {tipo: 'conversion', valor: datos.conversion, mult: datos.multiConversion, objetivo: 8, nombre: 'Conversión'},
                {tipo: 'empatia', valor: datos.empatia, mult: datos.multiEmpatia, objetivo: 96, nombre: 'Empatía'},
                {tipo: 'proceso', valor: datos.proceso, mult: datos.multiProceso, objetivo: 95, nombre: 'Proceso'}
            ];
            
            // Encontrar el multiplicador más bajo
            const peorMultiplicador = multiplicadoresData.reduce((min, curr) => 
                curr.mult < min.mult ? curr : min
            );
            
            if (peorMultiplicador.mult < 1) {
                const multObjetivo = calcularMultiplicador(peorMultiplicador.tipo, peorMultiplicador.objetivo);
                const mejora = Math.round(datos.subtotal * (multObjetivo - peorMultiplicador.mult) * 
                    (peorMultiplicador.tipo === 'conversion' ? datos.multiEmpatia * datos.multiProceso :
                     peorMultiplicador.tipo === 'empatia' ? datos.multiConversion * datos.multiProceso :
                     datos.multiConversion * datos.multiEmpatia));
                
                html += `<div class="suggestion-category multipliers">
                    <div class="suggestion-category-title">⚡ Mejora de Multiplicadores</div>
                    <div class="suggestion-item">Tu ${peorMultiplicador.nombre} (${peorMultiplicador.valor}%) es tu punto débil. 
                    Subirla a ${peorMultiplicador.objetivo}% aumentaría tu comisión en ${formatNumber(mejora)} Gs.</div>
                </div>`;
            }
            
            // 4. OBJETIVOS MOTIVACIONALES
            const objetivos = [];
            
            // Proyección de carrera
            if (datos.nivelCarreraActualMes > datos.nivelCarrera) {
                const diferencia = pagos.carrera[datos.nivelCarreraActualMes] - pagos.carrera[datos.nivelCarrera];
                objetivos.push(`Si mantenés ${niveles[datos.nivelCarreraActualMes]} por 2 meses → +${formatNumber(diferencia)} Gs en carrera el próximo mes`);
            }
            
            // Proyección de nivel completo
            const nivelObjetivo = Math.min(datos.nivelCarrera + 1, 5);
            if (nivelObjetivo > datos.nivelCarrera) {
                const totalObjetivo = pagos.base + pagos.carrera[nivelObjetivo] + 
                    pagos.montoInterno[nivelObjetivo] + pagos.montoExterno[nivelObjetivo] + 
                    pagos.montoRecuperado[nivelObjetivo] + pagos.cantidad[nivelObjetivo] + 
                    (nivelObjetivo >= 3 ? pagos.equipo[nivelObjetivo] : 0);
                objetivos.push(`Alcanzando todos los ${niveles[nivelObjetivo]} este mes = ${formatNumber(totalObjetivo)} Gs de comisión base`);
            }
            
            if (objetivos.length > 0) {
                html += `<div class="suggestion-category goals">
                    <div class="suggestion-category-title">🎯 Objetivos Motivacionales</div>`;
                objetivos.forEach(obj => {
                    html += `<div class="suggestion-item">${obj}</div>`;
                });
                html += `</div>`;
            }
            
            // 5. ALERTAS
            const alertas = [];
            
            // Llave semanal
            if (datos.menorSemana < 2 && datos.cantidad >= 6) {
                alertas.push(`Sin 2/sem no cobrás premio cantidad (perdés ${formatNumber(datos.bonusCantidadPotencial)} Gs)`);
            }
            
            // Llave monto interno
            if (!datos.cumpleLlaveMonto && datos.nivelInterno >= 0) {
                alertas.push(`Te faltan ${6 - datos.cantidad} desembolsos para activar premio interno (${formatNumber(pagos.montoInterno[datos.nivelInterno])} Gs)`);
            }
            
            if (alertas.length > 0) {
                html += `<div class="suggestion-category alerts">
                    <div class="suggestion-category-title">⚠️ Alertas</div>`;
                alertas.forEach(alerta => {
                    html += `<div class="suggestion-item">${alerta}</div>`;
                });
                html += `</div>`;
            }
            
            container.innerHTML = html || '<div class="suggestion-item">¡Excelente trabajo! Estás optimizando todos tus indicadores.</div>';
        }
        
        // Actualizar barra de equipo
        function updateEquipoBar(nivelEquipo, nivelCarrera) {
            const container = document.getElementById('barraEquipo');
            const info = document.getElementById('infoEquipo');
            const requisitos = document.getElementById('equipoRequisitos');
            
            // Crear segmentos
            let html = '<div class="progress-segments">';
            
            for (let i = 0; i < niveles.length; i++) {
                let className = 'progress-segment';
                
                // Marcar el nivel del equipo
                if (i === nivelEquipo) {
                    className += ' current';
                }
                
                // Los primeros 3 niveles no tienen premio
                const premio = pagos.equipo[i];
                const premioTexto = premio > 0 ? formatNumber(premio) : '0';
                
                html += `<div class="${className}" style="${i < 3 ? 'opacity: 0.5;' : ''}">
                    <div class="level">${niveles[i]}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const equipoTexto = niveles[nivelEquipo];
            const cumpleRequisito = nivelCarrera >= 3 && nivelEquipo >= 3;
            const bonusEquipo = cumpleRequisito ? pagos.equipo[nivelEquipo] : 0;
            
            info.innerHTML = `Menor nivel del equipo: <strong>${equipoTexto}</strong> | 
                             Tu nivel: <strong>${niveles[nivelCarrera]}</strong> | 
                             Premio: <strong>${formatNumber(bonusEquipo)} Gs</strong>`;
            
            // Actualizar mensaje de requisitos
            if (nivelCarrera < 3) {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '⚠️ Necesitas estar en Senior B+ para cobrar premio equipo';
                requisitos.style.background = '#FFF3E0';
            } else if (nivelEquipo < 3) {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '⚠️ El equipo necesita estar en Senior B+ para activar premio';
                requisitos.style.background = '#FFF3E0';
            } else {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '✅ Premio equipo activado';
                requisitos.style.background = '#E8F5E9';
                requisitos.style.color = '#2E7D32';
            }
            
            return bonusEquipo;
        }
        
        // Actualizar barra de subtotal
        function updateSubtotalBar(subtotal) {
            const fill = document.getElementById('subtotalFill');
            const montoText = document.getElementById('subtotalMonto');
            
            const porcentaje = Math.min((subtotal / MAXIMO_SUBTOTAL) * 100, 100);
            
            // Definir el gradiente según el porcentaje
            let gradiente;
            if (porcentaje < 25) {
                gradiente = 'linear-gradient(90deg, #F44336 0%, #FF9800 100%)';
            } else if (porcentaje < 50) {
                gradiente = 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)';
            } else if (porcentaje < 75) {
                gradiente = 'linear-gradient(90deg, #FFC107 0%, #8BC34A 100%)';
            } else {
                gradiente = 'linear-gradient(90deg, #8BC34A 0%, #4CAF50 100%)';
            }
            
            fill.style.width = porcentaje + '%';
            fill.style.background = gradiente;
            fill.innerHTML = `<span style="font-size: 16px;">${porcentaje.toFixed(1)}%</span>`;
            
            montoText.textContent = formatNumber(subtotal) + ' Gs';
            const statSubtotal = document.getElementById('statSubtotal');
            if (statSubtotal) statSubtotal.textContent = formatNumber(subtotal) + ' Gs';
        }

        function toggleSidebar() {
            const panel = document.querySelector('.left-panel');
            const btn = document.getElementById('toggleSidebarBtn');
            if (panel.classList.contains('collapsed')) {
                panel.classList.remove('collapsed');
                btn.textContent = '⬅️ Ocultar';
            } else {
                panel.classList.add('collapsed');
                btn.textContent = '➡️ Mostrar';
            }
        }
        
        // Función para mostrar/ocultar tabla de mora
        function toggleTablaMora(event) {
            const tabla = document.getElementById('tablaMora');
            const texto = event.target;
            if (tabla.style.display === 'none' || !tabla.style.display) {
                tabla.style.display = 'block';
                texto.textContent = '▲ Ocultar tabla de penalizaciones';
            } else {
                tabla.style.display = 'none';
                texto.textContent = '▼ Ver tabla de penalizaciones';
            }
        }
        
        // Actualizar tabla de mora con nivel actual
        function actualizarTablaMora(nivelActual, clientesMora) {
            // Resetear estilos de todas las filas
            const rows = document.querySelectorAll('#tablaMora tr');
            rows.forEach((row, index) => {
                if (index > 0) { // Skip header
                    row.style.background = 'transparent';
                    row.style.fontWeight = 'normal';
                }
            });
            
            // Marcar el nivel actual
            const nivelRow = document.querySelectorAll('#tablaMora tr')[nivelActual + 2]; // +2 por header y índice
            if (nivelRow) {
                nivelRow.style.background = '#E3F2FD';
                nivelRow.style.fontWeight = '600';
                
                // Agregar indicador
                const firstCell = nivelRow.cells[0];
                if (!firstCell.textContent.includes('→')) {
                    firstCell.innerHTML = '→ ' + firstCell.innerHTML;
                }
            }
            
            // Actualizar cálculo
            const penalizacion = pagos.penalizacionMora[nivelActual];
            const total = clientesMora * penalizacion;
            document.getElementById('calculoMora').textContent = 
                `Tu penalización: ${clientesMora} × ${formatNumber(penalizacion)} = -${formatNumber(total)} Gs`;
        }
        
        // Cálculo principal
        function updateCalculations() {
            const nivelAnterior = parseInt(document.getElementById('nivelAnterior').value);
            const montoInterno = getNumericValue('montoInterno');
            const montoExterno = getNumericValue('montoExterno');
            const montoRecuperado = getNumericValue('montoRecuperado');
            const cantidad = getNumericValue('cantidadDesembolsos');
            const menorSemana = getNumericValue('menorSemana');
            const conversion = parseFloat(document.getElementById('conversion').value) || 0;
            const empatia = parseFloat(document.getElementById('empatia').value) || 0;
            const proceso = parseFloat(document.getElementById('proceso').value) || 0;
            const clientesMora = getNumericValue('clientesMora');
            const nivelEquipo = parseInt(document.getElementById('nivelEquipo').value);

            const menorSemanaInput = document.getElementById('menorSemana');
            if (menorSemanaInput.value) {
                menorSemanaInput.classList.add('filled');
                menorSemanaInput.classList.remove('empty');
            } else {
                menorSemanaInput.classList.remove('filled');
                menorSemanaInput.classList.add('empty');
            }

            const moraInput = document.getElementById('clientesMora');
            if (clientesMora > 0) {
                moraInput.classList.add('filled');
                moraInput.classList.remove('invalid');
            } else {
                moraInput.classList.remove('filled');
                moraInput.classList.add('invalid');
            }
            
            // Actualizar barras
            const nivelInterno = updateProgressBar('interno', montoInterno, 'barraInterno', 'infoInterno');
            const nivelExterno = updateProgressBar('externo', montoExterno, 'barraExterno', 'infoExterno');
            const nivelRecuperado = updateProgressBar('recuperado', montoRecuperado, 'barraRecuperado', 'infoRecuperado');
            const nivelCantidadReal = updateProgressBar('cantidad', cantidad, 'barraCantidad', 'infoCantidad');
            const nivelCantidadLimitado = updateCantidadConLlave(cantidad, menorSemana);
            
            // Calcular nivel actual (menor entre los alcanzados) - Ahora incluye recuperados
            let nivelesAlcanzadosActual = [];
            if (nivelInterno >= 0) nivelesAlcanzadosActual.push(nivelInterno);
            if (nivelExterno >= 0) nivelesAlcanzadosActual.push(nivelExterno);
            if (nivelRecuperado >= 0) nivelesAlcanzadosActual.push(nivelRecuperado);
            if (nivelCantidadReal >= 0) nivelesAlcanzadosActual.push(nivelCantidadReal);
            
            let nivelActualMes = nivelesAlcanzadosActual.length > 0 ? Math.min(...nivelesAlcanzadosActual) : 0;
            
            // El nivel real es el menor entre el actual y el anterior
            const nivelActual = Math.min(nivelActualMes, nivelAnterior);
            document.getElementById('statNivel').textContent = niveles[nivelActual];
            
            // Actualizar tabla de mora con nivel actual
            actualizarTablaMora(nivelActual, clientesMora);
            
            // Actualizar multiplicadores
            const multiplicadorTotal = updateMultiplicadorTables();
            
            // Actualizar llave de monto
            const cumpleLlaveMonto = cantidad >= 6;
            document.getElementById('internoLlave').textContent = cumpleLlaveMonto ? 'Llave: ✓ 6 desem.' : 'Llave: ❌ Min 6 desem.';
            document.getElementById('internoLlave').className = cumpleLlaveMonto ? 'llave text-success' : 'llave text-danger';
            
            // Actualizar status
            document.getElementById('internoStatus').textContent = nivelInterno >= 0 ? `✓ Nivel: ${niveles[nivelInterno]}` : '';
            document.getElementById('cantidadStatus').textContent = cantidad >= metas.cantidad[nivelActual] ? `✓ ${cantidad} > meta ${metas.cantidad[nivelActual]}` : `${cantidad}/${metas.cantidad[nivelActual]}`;
            
            // Calcular carrera ANTES de usarla en updateEquipoBar
            let nivelesAlcanzados = [];
            if (nivelInterno >= 0) nivelesAlcanzados.push(nivelInterno);
            if (nivelExterno >= 0) nivelesAlcanzados.push(nivelExterno);
            if (nivelRecuperado >= 0) nivelesAlcanzados.push(nivelRecuperado);
            if (nivelCantidadReal >= 0) nivelesAlcanzados.push(nivelCantidadReal);
            
            let nivelCarreraActualMes = nivelesAlcanzados.length > 0 ? Math.min(...nivelesAlcanzados) : -1;
            let nivelCarrera = Math.min(nivelCarreraActualMes, nivelAnterior);
            
            // Actualizar barra de carrera
            const bonusCarrera = updateCarreraBar(nivelCarrera);
            
            // Actualizar barra de equipo con nivelCarrera ya calculado
            const bonusEquipoCalculado = updateEquipoBar(nivelEquipo, nivelCarrera);
            
            // CAMBIO: Calcular componentes aunque falten campos requeridos
            // Calcular componentes disponibles
            const base = pagos.base;
            const bonusInterno = (nivelInterno >= 0 && cumpleLlaveMonto) ? pagos.montoInterno[nivelInterno] : 0;
            const bonusExterno = nivelExterno >= 0 ? pagos.montoExterno[nivelExterno] : 0;
            const bonusRecuperado = nivelRecuperado >= 0 ? pagos.montoRecuperado[nivelRecuperado] : 0;
            const bonusCantidad = nivelCantidadLimitado >= 0 ? pagos.cantidad[nivelCantidadLimitado] : 0;
            
            let bonusEquipo = 0;
            if (nivelCarrera >= 3 && nivelEquipo >= 3) {
                bonusEquipo = pagos.equipo[nivelEquipo];
            }
            
            const penalizacionMora = clientesMora * pagos.penalizacionMora[nivelActual];
            
            const subtotal = base + bonusCarrera + bonusInterno + bonusExterno + bonusRecuperado + bonusCantidad + bonusEquipo - penalizacionMora;
            
            // SIEMPRE actualizar barra de subtotal con lo que haya
            updateSubtotalBar(subtotal);
            
            // Si faltan campos requeridos, mostrar parciales pero sin multiplicadores
            if (!checkRequiredFields()) {
                document.getElementById('statMulti').textContent = '0%';
                document.getElementById('statComision').textContent = formatNumber(subtotal) + ' Gs (parcial)';
                
                document.getElementById('calcBase').textContent = formatNumber(base) + ' Gs';
                document.getElementById('calcCarrera').textContent = formatNumber(bonusCarrera) + ' Gs';
                document.getElementById('calcInterno').textContent = formatNumber(bonusInterno) + ' Gs';
                document.getElementById('calcExterno').textContent = formatNumber(bonusExterno) + ' Gs';
                document.getElementById('calcRecuperado').textContent = formatNumber(bonusRecuperado) + ' Gs';
                document.getElementById('calcCantidad').textContent = formatNumber(bonusCantidad) + ' Gs';
                document.getElementById('calcEquipo').textContent = formatNumber(bonusEquipo) + ' Gs';
                document.getElementById('calcMora').textContent = '-' + formatNumber(penalizacionMora) + ' Gs';
                document.getElementById('calcSubtotal').textContent = formatNumber(subtotal) + ' Gs';
                document.getElementById('calcMultiplicador').textContent = '0% (faltan campos)';
                document.getElementById('totalComision').textContent = formatNumber(subtotal) + ' Gs';
                
                // Generar sugerencias parciales
                const multiConversion = calcularMultiplicador('conversion', conversion);
                const multiEmpatia = calcularMultiplicador('empatia', empatia);
                const multiProceso = calcularMultiplicador('proceso', proceso);
                
                generarSugerencias({
                    montoInterno,
                    nivelInterno,
                    nivelExterno,
                    nivelRecuperado,
                    nivelCantidad: nivelCantidadReal,
                    nivelCantidadLimitado,
                    nivelCarrera,
                    nivelCarreraActualMes,
                    menorSemana,
                    cantidad,
                    conversion,
                    empatia,
                    proceso,
                    multiConversion,
                    multiEmpatia,
                    multiProceso,
                    cumpleLlaveMonto,
                    bonusCantidadPotencial: nivelCantidadReal >= 0 ? pagos.cantidad[nivelCantidadReal] : 0,
                    subtotal
                });
                
                return;
            }
            
            // Con todos los campos completos, calcular con multiplicadores
            const totalVariable = Math.round((subtotal - base) * multiplicadorTotal);
            const total = base + totalVariable;
            
            // Actualizar UI
            document.getElementById('calcBase').textContent = formatNumber(base) + ' Gs';
            document.getElementById('calcCarrera').textContent = formatNumber(bonusCarrera) + ' Gs';
            document.getElementById('calcInterno').textContent = formatNumber(bonusInterno) + ' Gs';
            document.getElementById('calcExterno').textContent = formatNumber(bonusExterno) + ' Gs';
            document.getElementById('calcRecuperado').textContent = formatNumber(bonusRecuperado) + ' Gs';
            document.getElementById('calcCantidad').textContent = formatNumber(bonusCantidad) + ' Gs';
            document.getElementById('calcEquipo').textContent = formatNumber(bonusEquipo) + ' Gs';
            document.getElementById('calcMora').textContent = '-' + formatNumber(penalizacionMora) + ' Gs';
            document.getElementById('calcSubtotal').textContent = formatNumber(subtotal) + ' Gs';
            document.getElementById('calcMultiplicador').textContent = (multiplicadorTotal * 100).toFixed(1) + '%';
            document.getElementById('totalComision').textContent = formatNumber(total) + ' Gs';
            
            if (nivelCantidadLimitado < nivelCantidadReal && menorSemana < 2) {
                document.getElementById('cantidadLlaveInfo').innerHTML = '<span class="tooltip" data-tip="Sin premio por llave semanal">⚠️</span>';
            } else {
                document.getElementById('cantidadLlaveInfo').textContent = '';
            }
            
            document.getElementById('statMulti').textContent = (multiplicadorTotal * 100).toFixed(1) + '%';
            document.getElementById('statComision').textContent = formatNumber(total) + ' Gs';
            
            // Calcular multiplicadores individuales para sugerencias
            const multiConversion = calcularMultiplicador('conversion', conversion);
            const multiEmpatia = calcularMultiplicador('empatia', empatia);
            const multiProceso = calcularMultiplicador('proceso', proceso);
            
            generarSugerencias({
                montoInterno,
                nivelInterno,
                nivelExterno,
                nivelRecuperado,
                nivelCantidad: nivelCantidadReal,
                nivelCantidadLimitado,
                nivelCarrera,
                nivelCarreraActualMes,
                menorSemana,
                cantidad,
                conversion,
                empatia,
                proceso,
                multiConversion,
                multiEmpatia,
                multiProceso,
                cumpleLlaveMonto,
                bonusCantidadPotencial: nivelCantidadReal >= 0 ? pagos.cantidad[nivelCantidadReal] : 0,
                subtotal
            });
        }
        
        // Limpiar todo
        function limpiarTodo() {
            if (confirm('¿Seguro que querés limpiar todos los datos?')) {
                document.querySelectorAll('input').forEach(input => {
                    input.value = '';
                    if (input.classList.contains('required')) {
                        input.classList.remove('filled');
                        input.classList.add('empty');
                    }
                    if (input.id === 'clientesMora') {
                        input.classList.remove('filled');
                        input.classList.add('invalid');
                    }
                });
                document.getElementById('nivelAnterior').value = '2';
                document.getElementById('nivelEquipo').value = '2';
                updateCalculations();
            }
        }
        
        // Descargar PDF
        function descargarPDF() {
            // Guardar valores actuales
            const comisionTotal = document.getElementById('totalComision').textContent;
            const nivel = document.getElementById('statNivel').textContent;
            const fecha = new Date().toLocaleDateString('es-PY');
            
            // Crear ventana con resumen para imprimir
            const ventana = window.open('', '_blank');
            ventana.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Comisión ${fecha}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #006D77; border-bottom: 2px solid #006D77; padding-bottom: 10px; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
                        .row { display: flex; justify-content: space-between; padding: 5px 0; }
                        .total { font-size: 24px; font-weight: bold; color: #006D77; text-align: center; 
                                 margin: 20px 0; padding: 20px; border: 2px solid #006D77; border-radius: 5px; }
                        @media print { body { padding: 10px; } }
                    </style>
                </head>
                <body>
                    <h1>Sistema de Comisiones Comerciales - SERSA SAECA</h1>
                    
                    <div class="header">
                        <div><strong>Fecha:</strong> ${fecha}</div>
                        <div><strong>Asesor:</strong> ${nivel}</div>
                    </div>
                    
                    <div class="section">
                        <h3>Resumen de Volumen</h3>
                        <div class="row">
                            <span>Monto Interno:</span>
                            <span>${document.getElementById('montoInterno').value || '0'}</span>
                        </div>
                        <div class="row">
                            <span>Monto Externo:</span>
                            <span>${document.getElementById('montoExterno').value || '0'}</span>
                        </div>
                        <div class="row">
                            <span>Recuperados +3M:</span>
                            <span>${document.getElementById('montoRecuperado').value || '0'}</span>
                        </div>
                        <div class="row">
                            <span>Cantidad Desembolsos:</span>
                            <span>${document.getElementById('cantidadDesembolsos').value || '0'}</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>Indicadores de Calidad</h3>
                        <div class="row">
                            <span>Conversión:</span>
                            <span>${document.getElementById('conversion').value || '0'}%</span>
                        </div>
                        <div class="row">
                            <span>Empatía/Mystery:</span>
                            <span>${document.getElementById('empatia').value || '0'}%</span>
                        </div>
                        <div class="row">
                            <span>Proceso:</span>
                            <span>${document.getElementById('proceso').value || '0'}%</span>
                        </div>
                        <div class="row">
                            <span><strong>Multiplicador Final:</strong></span>
                            <span><strong>${document.getElementById('statMulti').textContent}</strong></span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>Detalle de Comisión</h3>
                        <div class="row">
                            <span>Base fija:</span>
                            <span>${document.getElementById('calcBase').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Premio carrera:</span>
                            <span>${document.getElementById('calcCarrera').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Monto Interno:</span>
                            <span>${document.getElementById('calcInterno').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Monto Externo:</span>
                            <span>${document.getElementById('calcExterno').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Recuperados:</span>
                            <span>${document.getElementById('calcRecuperado').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Cantidad:</span>
                            <span>${document.getElementById('calcCantidad').textContent}</span>
                        </div>
                        <div class="row">
                            <span>Equipo:</span>
                            <span>${document.getElementById('calcEquipo').textContent}</span>
                        </div>
                        <div class="row" style="color: #F44336;">
                            <span>Penalización:</span>
                            <span>${document.getElementById('calcMora').textContent}</span>
                        </div>
                    </div>
                    
                    <div class="total">
                        COMISIÓN TOTAL: ${comisionTotal}
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
                        <p>Este documento es un resumen de la comisión calculada en el Sistema de Comisiones Comerciales de SERSA SAECA.</p>
                    </div>
                </body>
                </html>
            `);
            
            ventana.document.close();
            
            // Esperar un momento y luego abrir diálogo de impresión
            setTimeout(() => {
                ventana.print();
            }, 500);
        }
        
        // Inicializar
        window.onload = function() {
            document.querySelectorAll('.required').forEach(field => {
                field.classList.add('empty');
            });
            updateCalculations();
        };
    

/* --- Added by AI 2025-06-26 --- */
(function(){
    function restoreDraft(){
        try{
            const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
            Object.entries(draft).forEach(([id,val])=>{
               const el = document.getElementById(id);
               if(!el) return;
               if(el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA'){
                  el.value = val;
                  // trigger any event that updates calculations
                  el.dispatchEvent(new Event('input', {bubbles:true}));
               }
            });
        }catch(e){console.warn('No draft to restore', e);}
    }
    function autosave(e){
        const el = e.target;
        if(!el.id) return;
        const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
        draft[el.id] = el.value;
        localStorage.setItem('draftCommission', JSON.stringify(draft));
    }
    document.addEventListener('DOMContentLoaded', function(){
        restoreDraft();
        document.querySelectorAll('input, select, textarea').forEach(function(el){
            el.addEventListener('input', autosave);
        });
    });
})();
