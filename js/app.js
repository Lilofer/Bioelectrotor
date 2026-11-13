document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadPersistedData();
    setupEventListeners();
    updateDashboard();
});

function loadPersistedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            relavesData = JSON.parse(saved);
        } catch (e) {
            console.error("Error al cargar localStorage:", e);
            relavesData = [...INITIAL_RELAVES_DATA];
        }
    } else {
        relavesData = [...INITIAL_RELAVES_DATA];
    }
    saveToStorage();
    populateSelect();
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relavesData));
}

function resetStorage() {
    if (confirm("¿Deseas restablecer la base de datos a los valores base de SERNAGEOMIN?")) {
        localStorage.removeItem(STORAGE_KEY);
        currentRelave = null;
        loadPersistedData();
        updateDashboard();
    }
}

// FUNCIÓN DE ELIMINACIÓN DE DEPÓSITO SINCRONIZADA
function deleteRelave(id) {
    const target = relavesData.find(r => r.id === id);
    if (!target) return;

    if (!confirm(`¿Estás seguro de eliminar el depósito "${target.nombre}" (${target.id})?`)) {
        return;
    }

    relavesData = relavesData.filter(r => r.id !== id);
    saveToStorage();

    if (currentRelave && currentRelave.id === id) {
        currentRelave = relavesData.length > 0 ? relavesData[0] : null;
    }

    populateSelect();
    updateDashboard();
}

function populateSelect() {
    const select = document.getElementById('relave-select');
    const filterTipo = document.getElementById('filter-tipologia').value;
    const filterRiesgo = document.getElementById('filter-riesgo').value;

    select.innerHTML = '';

    const filtered = relavesData.filter(r => {
        const matchesTipo = (filterTipo === 'TODAS' || r.tipologia === filterTipo);
        const matchesRiesgo = (filterRiesgo === 'TODOS' || r.riesgoEstructural === filterRiesgo);
        return matchesTipo && matchesRiesgo;
    });

    document.getElementById('catastro-count').textContent = `Mostrando ${filtered.length} de ${relavesData.length} depósitos`;

    if (filtered.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "-- Sin relaves disponibles --";
        select.appendChild(opt);
        currentRelave = null;
        return;
    }

    filtered.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.nombre} [${item.tipologia || 'Tranque'}] - ${item.region}`;
        select.appendChild(option);
    });

    if (!currentRelave || !filtered.some(r => r.id === currentRelave.id)) {
        currentRelave = filtered[0];
    }
    select.value = currentRelave.id;
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'text-cyan-400', 'border-cyan-400');
                b.classList.add('text-slate-400', 'border-transparent');
            });
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            const targetBtn = e.currentTarget;
            targetBtn.classList.add('active', 'text-cyan-400', 'border-cyan-400');
            targetBtn.classList.remove('text-slate-400', 'border-transparent');

            const tabId = targetBtn.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');

            if (tabId === 'tab-riesgos') {
                renderMatrizSocial();
            }
        });
    });

    document.getElementById('relave-select').addEventListener('change', (e) => {
        currentRelave = relavesData.find(r => r.id === e.target.value);
        updateDashboard();
    });

    // Botón eliminar depósito actualmente seleccionado
    const btnDeleteSelected = document.getElementById('btn-delete-selected');
    if (btnDeleteSelected) {
        btnDeleteSelected.addEventListener('click', () => {
            if (currentRelave) {
                deleteRelave(currentRelave.id);
            } else {
                alert("No hay ningún depósito seleccionado para eliminar.");
            }
        });
    }

    document.getElementById('filter-tipologia').addEventListener('change', () => {
        populateSelect();
        updateDashboard();
    });

    document.getElementById('filter-riesgo').addEventListener('change', () => {
        populateSelect();
        updateDashboard();
    });

    document.getElementById('btn-reset-storage').addEventListener('click', resetStorage);

    const sliders = ['conductividad', 'eh', 'corriente', 'agua'];
    sliders.forEach(id => {
        const el = document.getElementById(`slider-${id}`);
        if (el) {
            el.addEventListener('input', (e) => {
                let suffix = '';
                if (id === 'conductividad') suffix = ' mS/cm';
                if (id === 'eh') suffix = ' mV';
                if (id === 'corriente') suffix = ' A/m²';
                if (id === 'agua') suffix = '%';

                document.getElementById(`val-${id}`).textContent = `${e.target.value}${suffix}`;
                updateDashboard();
            });
        }
    });

    document.getElementById('select-energia').addEventListener('change', updateDashboard);

    const modal = document.getElementById('modal-agregar');
    const openModalBtn = document.getElementById('btn-open-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        });
    }

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    document.getElementById('form-nuevo-relave').addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoRelave = {
            id: document.getElementById('add-id').value,
            nombre: document.getElementById('add-nombre').value,
            region: document.getElementById('add-region').value,
            estado: "Activo",
            tipologia: document.getElementById('add-tipologia').value,
            riesgoEstructural: document.getElementById('add-riesgo').value,
            tonelajeMt: parseFloat(document.getElementById('add-tonelaje').value),
            solidosPercent: parseFloat(document.getElementById('add-solidos').value),
            densidadPulpa: parseFloat(document.getElementById('add-densidad').value),
            ph: 7.5,
            leyCu: parseFloat(document.getElementById('add-ley-cu').value),
            leyFe: parseFloat(document.getElementById('add-ley-fe').value),
            leyAu: parseFloat(document.getElementById('add-ley-au').value),
            baseEnergia: parseFloat(document.getElementById('add-energia').value),
            comunidades: document.getElementById('add-comunidades').value,
            riesgosSociales: [
                { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 2, prob: 2, mitigacion: "Uso de EPP y extracción.", responsable: "Prevención" },
                { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10)", severidad: 3, prob: 3, mitigacion: "Supresión de polvo.", responsable: "Operaciones" },
                { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 3, prob: 2, mitigacion: "Mesas de diálogo y sin sopladores.", responsable: "Comunidades" },
                { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 3, prob: 3, mitigacion: "Recirculación hídrica.", responsable: "Procesos" }
            ]
        };

        relavesData.push(nuevoRelave);
        saveToStorage();
        populateSelect();
        currentRelave = nuevoRelave;
        document.getElementById('relave-select').value = nuevoRelave.id;
        
        updateDashboard();
        closeModal();
        e.target.reset();
    });

    document.getElementById('input-excel-sernageomin').addEventListener('change', importSernageominExcel);
    document.getElementById('btn-export-excel').addEventListener('click', exportMultiSheetExcel);
    document.getElementById('btn-export-pdf').addEventListener('click', generatePDFReport);
}

function updateDashboard() {
    const tipoEnergia = document.getElementById('select-energia').value;

    // Manejo seguro si se eliminan todos los depósitos
    if (!currentRelave) {
        document.getElementById('kpi-energia').innerHTML = `0.0 <span class="text-xs text-slate-400 font-normal">kWh/t</span>`;
        document.getElementById('kpi-agua').innerHTML = `0.00 <span class="text-xs text-slate-400 font-normal">m³/t</span>`;
        document.getElementById('kpi-co2').innerHTML = `0.0 <span class="text-xs text-slate-400 font-normal">kg/t</span>`;
        document.getElementById('kpi-ahorro').innerHTML = `0%`;
        document.getElementById('badge-region').textContent = `Sin selección`;
        ['m-estado', 'm-tonelaje', 'm-solidos', 'm-densidad', 'm-ph', 'm-leyes'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
        document.getElementById('tabla-matriz-social-body').innerHTML = '';
        document.getElementById('tabla-comparacion-body').innerHTML = '';
        renderTable(tipoEnergia);
        return;
    }

    const conductividad = parseFloat(document.getElementById('slider-conductividad').value);
    const eh = parseFloat(document.getElementById('slider-eh').value);
    const densidadJ = parseFloat(document.getElementById('slider-corriente').value);
    const recircAgua = parseFloat(document.getElementById('slider-agua').value);

    const vTermodinamico = 1.8 + (eh / 1000) * 0.5;
    const sobrepotencialOhmico = (densidadJ / (conductividad * 10));
    const voltajeCelda = (vTermodinamico + sobrepotencialOhmico).toFixed(2);

    const masaMolarCarbon = 12.011; 
    const faraday = 96485; 
    const fEfectividad = 0.85;
    const desgasteCarbonKg = ((densidadJ * masaMolarCarbon * 3600 * 5) / (4 * faraday * 1000 * fEfectividad)).toFixed(2);

    const consumoEnergiaTotal = (currentRelave.baseEnergia * (voltajeCelda / 2.2) * (1 + (100 - recircAgua) / 250)).toFixed(1);
    const consumoAguaFresca = ((1 - (recircAgua / 100)) * 0.85).toFixed(2);
    const emisionesCO2 = (consumoEnergiaTotal * EMISIONES_FACTOR[tipoEnergia]).toFixed(1);

    const energiaConvencional = (currentRelave.baseEnergia * 1.45).toFixed(1);
    const aguaConvencional = 0.65;
    const co2Convencional = (energiaConvencional * 0.45).toFixed(1);

    const diffEnergia = ((consumoEnergiaTotal - energiaConvencional) / energiaConvencional) * 100;
    const diffAgua = ((consumoAguaFresca - aguaConvencional) / aguaConvencional) * 100;
    const diffCO2 = ((emisionesCO2 - co2Convencional) / co2Convencional) * 100;

    const desempenoGlobal = Math.abs((diffEnergia + diffAgua + diffCO2) / 3).toFixed(0);

    document.getElementById('kpi-energia').innerHTML = `${consumoEnergiaTotal} <span class="text-xs text-slate-400 font-normal">kWh/t</span>`;
    document.getElementById('kpi-agua').innerHTML = `${consumoAguaFresca} <span class="text-xs text-slate-400 font-normal">m³/t</span>`;
    document.getElementById('kpi-co2').innerHTML = `${emisionesCO2} <span class="text-xs text-slate-400 font-normal">kg CO₂/t</span>`;
    document.getElementById('kpi-ahorro').innerHTML = `+${desempenoGlobal}% <span class="text-xs text-slate-400 font-normal">eficiencia global</span>`;

    document.getElementById('badge-region').textContent = `Región de ${currentRelave.region}`;
    document.getElementById('m-estado').textContent = `${currentRelave.estado} (${currentRelave.tipologia || 'Tranque'})`;
    document.getElementById('m-tonelaje').textContent = `${currentRelave.tonelajeMt} Mt`;
    document.getElementById('m-solidos').textContent = `${currentRelave.solidosPercent}%`;
    document.getElementById('m-densidad').textContent = `${currentRelave.densidadPulpa} t/m³`;
    document.getElementById('m-ph').textContent = currentRelave.ph;
    document.getElementById('m-leyes').textContent = `${currentRelave.leyCu}% Cu | ${currentRelave.leyFe}% Fe | ${currentRelave.leyAu} g/t Au`;

    document.getElementById('p-electrodo').textContent = `${desgasteCarbonKg} kg/t`;
    document.getElementById('p-voltaje').textContent = `${voltajeCelda} V`;
    document.getElementById('p-ef-agua').textContent = `${recircAgua}%`;
    
    document.getElementById('bar-electrodo').style.width = `${Math.min(desgasteCarbonKg * 25, 100)}%`;
    document.getElementById('bar-agua').style.width = `${recircAgua}%`;

    renderMatrizSocial();
    renderTablaComparativa(consumoEnergiaTotal, consumoAguaFresca, emisionesCO2);

    chartLeyes.data.datasets[0].data = [currentRelave.leyCu, currentRelave.leyFe, currentRelave.leyAu * 10];
    chartLeyes.update();

    chartProcesos.data.datasets[0].data = [consumoEnergiaTotal, consumoAguaFresca * 10, emisionesCO2];
    chartProcesos.update();

    chartRadar.data.datasets[0].data = [
        currentRelave.riesgoEstructural === 'Alto' ? 5 : (currentRelave.riesgoEstructural === 'Medio' ? 3 : 2),
        Math.abs(7.5 - currentRelave.ph) + 1,
        currentRelave.riesgosSociales ? currentRelave.riesgosSociales[2].severidad : 3,
        currentRelave.riesgosSociales ? currentRelave.riesgosSociales[1].severidad : 3,
        100 - recircAgua > 40 ? 4 : 2
    ];
    chartRadar.update();

    renderTable(tipoEnergia);
}

function renderMatrizSocial() {
    if (!currentRelave || !currentRelave.riesgosSociales) return;

    const tbody = document.getElementById('tabla-matriz-social-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const recircAgua = parseFloat(document.getElementById('slider-agua').value) || 85;
    const densidadJ = parseFloat(document.getElementById('slider-corriente').value) || 120;
    const ehVal = parseFloat(document.getElementById('slider-eh').value) || 450;
    const tipoEnergia = document.getElementById('select-energia').value || 'red';

    currentRelave.riesgosSociales.forEach(item => {
        let probDinamica = item.prob;
        let sevDinamica = item.severidad;
        let aspectoTexto = item.aspecto;
        let mitigacionTexto = item.mitigacion;

        if (item.aspecto.includes("estrés hídrico") && recircAgua >= 85) {
            probDinamica = Math.max(1, item.prob - 1);
            aspectoTexto += ` (Optimizado: Recirculación ${recircAgua}%)`;
        }

        if (item.aspecto.includes("vapores y aerosoles ácidos")) {
            if (densidadJ > 200 || ehVal > 600) {
                sevDinamica = Math.min(4, item.severidad + 1);
                aspectoTexto += " [Alta Exigencia Cinética]";
                mitigacionTexto += " Reforzar extracción forzada y EPP avanzado.";
            } else {
                aspectoTexto += " [Operación Estándar]";
            }
        }

        if (item.aspecto.includes("Aceptabilidad comunitaria")) {
            if (tipoEnergia === 'solar') {
                probDinamica = Math.max(1, item.prob - 1);
                aspectoTexto += " [ERNC 100% Solar: Alta Aceptabilidad ESG]";
                mitigacionTexto += " Alimentación solar elimina rechazo por emisiones.";
            } else if (tipoEnergia === 'hibrida') {
                probDinamica = Math.max(1, item.prob - 0.5); 
                aspectoTexto += " [Matriz Híbrida: Mitigación ESG]";
                mitigacionTexto += " Combinación de renovables disminuye huella indirecta.";
            }
        }

        const pis = sevDinamica * probDinamica;
        let badgeClass = "bg-emerald-950 text-emerald-300 border-emerald-800";
        let textoRiesgo = "Bajo";
        if (pis >= 6 && pis <= 9) {
            badgeClass = "bg-amber-950 text-amber-300 border-amber-800";
            textoRiesgo = "Medio";
        } else if (pis >= 12) {
            badgeClass = "bg-rose-950 text-rose-300 border-rose-800";
            textoRiesgo = "Alto";
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = `
            <td class="p-2.5 font-semibold text-cyan-400">${item.grupo}</td>
            <td class="p-2.5 text-slate-200">${aspectoTexto}</td>
            <td class="p-2.5 text-center font-mono">${sevDinamica}</td>
            <td class="p-2.5 text-center font-mono">${Number.isInteger(probDinamica) ? probDinamica : probDinamica.toFixed(1)}</td>
            <td class="p-2.5 text-center font-bold">
                <span class="px-2 py-0.5 rounded border text-[10px] ${badgeClass}">${pis.toFixed(1)} (${textoRiesgo})</span>
            </td>
            <td class="p-2.5 text-slate-300">${mitigacionTexto}</td>
            <td class="p-2.5 text-slate-400 text-[11px]">${item.responsable}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTablaComparativa(consumoEnergia, consumoAgua, emisionesCO) {
    if (!currentRelave) return;

    const tbody = document.getElementById('tabla-comparacion-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const baseEnergiaConv = (currentRelave.baseEnergia * 1.45).toFixed(1);
    const baseAguaConv = 0.65; 
    const baseCO2Conv = (baseEnergiaConv * 0.45).toFixed(1); 

    const bioEnergia = parseFloat(consumoEnergia);
    const bioAgua = parseFloat(consumoAgua);
    const bioCO2 = parseFloat(emisionesCO);

    const diffEnergia = (((bioEnergia - baseEnergiaConv) / baseEnergiaConv) * 100).toFixed(1);
    const diffAgua = (((bioAgua - baseAguaConv) / baseAguaConv) * 100).toFixed(1);
    const diffCO2 = (((bioCO2 - baseCO2Conv) / baseCO2Conv) * 100).toFixed(1);

    const desempenoGlobal = Math.abs((parseFloat(diffEnergia) + parseFloat(diffAgua) + parseFloat(diffCO2)) / 3).toFixed(0);

    const badgeGlobal = document.getElementById('badge-global-rendimiento');
    if (badgeGlobal) {
        badgeGlobal.textContent = `Desempeño Global: +${desempenoGlobal}% Eficiencia Superior`;
    }

    const filasComparativas = [
        {
            metrica: "Consumo Energético Específico",
            convencional: `${baseEnergiaConv} kWh/t`,
            bio: `${bioEnergia} kWh/t`,
            diff: `${diffEnergia}%`,
            impacto: "Eliminación de etapas de molienda y sopladores mecánicos.",
            esMejora: bioEnergia < baseEnergiaConv
        },
        {
            metrica: "Consumo de Agua Fresca",
            convencional: `${baseAguaConv} m³/t`,
            bio: `${bioAgua} m³/t`,
            diff: `${diffAgua}%`,
            impacto: "Maximización de recirculación hídrica en pulpa.",
            esMejora: bioAgua < baseAguaConv
        },
        {
            metrica: "Emisiones de CO₂ Operacionales",
            convencional: `${baseCO2Conv} kg CO₂/t`,
            bio: `${bioCO2} kg CO₂/t`,
            diff: `${diffCO2}%`,
            impacto: "Uso de ERNC (Solar/Híbrida) y optimización eléctrica.",
            esMejora: bioCO2 < baseCO2Conv
        },
        {
            metrica: "Contaminación Acústica Perimetral",
            convencional: "Alto (Sopladores mecánicos)",
            bio: "Bajo (Sin sopladores)",
            diff: "Mitigado",
            impacto: "Cumplimiento con la normativa ambiental vigente.",
            esMejora: true
        },
        {
            metrica: "Riesgo Social y Aceptabilidad (PIS)",
            convencional: "Medio-Alto (Conflictos de cuenca)",
            bio: "Bajo-Controlado (Matriz S x P)",
            diff: "Optimizado",
            impacto: "Transparencia y menor presión sobre recursos hídricos.",
            esMejora: true
        }
    ];

    filasComparativas.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = `
            <td class="p-2.5 font-semibold text-cyan-400">${row.metrica}</td>
            <td class="p-2.5 text-center font-mono text-slate-400">${row.convencional}</td>
            <td class="p-2.5 text-center font-mono text-white font-bold">${row.bio}</td>
            <td class="p-2.5 text-center font-mono font-bold ${row.esMejora ? 'text-emerald-400' : 'text-rose-400'}">${row.diff}</td>
            <td class="p-2.5 text-slate-300 text-[11px]">${row.impacto}</td>
        `;
        tbody.appendChild(tr);
    });
}

// RENDER TABLA CATASTRO CON BOTÓN ELIMINAR POR FILA
function renderTable(tipoEnergia) {
    const tbody = document.getElementById('tabla-catastro-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    relavesData.forEach(r => {
        const co2 = (r.baseEnergia * EMISIONES_FACTOR[tipoEnergia]).toFixed(1);
        const tr = document.createElement('tr');
        tr.className = (currentRelave && r.id === currentRelave.id) ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-800/40';
        tr.innerHTML = `
            <td class="p-2.5 font-mono text-cyan-400">${r.id}</td>
            <td class="p-2.5 font-semibold text-slate-200">${r.nombre}</td>
            <td class="p-2.5">${r.region}</td>
            <td class="p-2.5">${r.tipologia || 'Tranque'}</td>
            <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] ${r.riesgoEstructural === 'Alto' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-700 text-slate-300'}">${r.riesgoEstructural || 'Bajo'}</span></td>
            <td class="p-2.5">${r.tonelajeMt}</td>
            <td class="p-2.5 font-bold">${r.leyCu}%</td>
            <td class="p-2.5 text-emerald-400">${co2}</td>
            <td class="p-2.5 text-center">
                <button onclick="deleteRelave('${r.id}')" title="Eliminar ${r.nombre}" class="text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 p-1.5 rounded transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function importSernageominExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const json = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                alert("El archivo CSV/Excel subido no contiene registros válidos.");
                return;
            }

            const importedRelaves = json.map((row, idx) => ({
                id: row['ID'] || row['id'] || row['ID Catastro'] || `CSV-${idx + 100}`,
                nombre: row['NOMBRE_INSTALACION'] || row['Nombre'] || row['Nombre Depósito'] || row['NOMBRE_FAENA'] || `Relave CSV ${idx+1}`,
                region: row['REGION'] || row['Region'] || row['Región'] || "Metropolitana",
                estado: "Activo",
                tipologia: row['TIPO_DEPOSITO'] || row['Tipologia'] || row['Tipología'] || "Tranque",
                riesgoEstructural: row['Riesgo'] || row['Riesgo Estructural'] || "Medio",
                tonelajeMt: parseFloat(row['TONELAJE_ACTUAL'] || row['Tonelaje (Mt)'] || row['Ton'] || 150.0),
                solidosPercent: parseFloat(row['Sólidos (%Cp)'] || row['solidos'] || 65.0),
                densidadPulpa: parseFloat(row['Densidad'] || 1.65),
                ph: parseFloat(row['pH'] || 7.5),
                leyCu: parseFloat(row['Ley Cu (%)'] || row['leyCu'] || 0.25),
                leyFe: parseFloat(row['Ley Fe (%)'] || row['leyFe'] || 12.0),
                leyAu: parseFloat(row['Ley Au (g/t)'] || row['leyAu'] || 0.10),
                baseEnergia: parseFloat(row['Energía Base'] || row['baseEnergia'] || 14.0),
                comunidades: row['Comunidades'] || "Comunidad Local Adyacente",
                riesgosSociales: [
                    { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 2, prob: 2, mitigacion: "Uso de EPP y extracción.", responsable: "Prevención" },
                    { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10)", severidad: 3, prob: 3, mitigacion: "Supresión de polvo.", responsable: "Operaciones" },
                    { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 3, prob: 2, mitigacion: "Mesas de diálogo y sin sopladores.", responsable: "Comunidades" },
                    { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 3, prob: 3, mitigacion: "Recirculación hídrica.", responsable: "Procesos" }
                ]
            }));

            relavesData = importedRelaves;
            saveToStorage();
            populateSelect();
            if (relavesData.length > 0) {
                currentRelave = relavesData[0];
                document.getElementById('relave-select').value = currentRelave.id;
            }
            updateDashboard();
            alert(`¡Importación CSV/Excel exitosa! Se cargaron ${importedRelaves.length} depósitos sincronizados.`);
        } catch (err) {
            console.error("Error al procesar archivo:", err);
            alert("No se pudo leer el archivo. Asegúrate de que tenga el formato correcto.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function exportMultiSheetExcel() {
    const tipoEnergia = document.getElementById('select-energia').value;
    const dataMinas = relavesData.map(r => ({
        "ID Catastro": r.id, "Nombre Depósito": r.nombre, "Región": r.region, "Tipología": r.tipologia || 'Tranque', "Tonelaje (Mt)": r.tonelajeMt, "Sólidos (%Cp)": r.solidosPercent, "Densidad": r.densidadPulpa, "pH": r.ph, "Ley Cu (%)": r.leyCu
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(dataMinas), "1. Catastro Minas");
    XLSX.writeFile(workbook, `BioElectroTor_Informe_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function generatePDFReport() {
    if (!currentRelave) return;
    document.getElementById('pdf-date').textContent = new Date().toLocaleDateString('es-CL');
    document.getElementById('pdf-relave-nombre').textContent = currentRelave.nombre;
    document.getElementById('pdf-relave-region').textContent = `Región de ${currentRelave.region}`;
    document.getElementById('pdf-relave-tonelaje').textContent = `${currentRelave.tonelajeMt} Mt (${currentRelave.solidosPercent}% sól.)`;
    document.getElementById('pdf-relave-tipo').textContent = `${currentRelave.tipologia || 'Tranque'} / ${currentRelave.estado}`;

    document.getElementById('pdf-minas-text').textContent = `El depósito ${currentRelave.nombre} presenta un tonelaje de ${currentRelave.tonelajeMt} Mt, con ley de Cu del ${currentRelave.leyCu}%, Fe del ${currentRelave.leyFe}% y pH de ${currentRelave.ph}.`;
    document.getElementById('pdf-procesos-text').textContent = `Bajo el modelo BioElectroTor, se proyecta un consumo energético de ${document.getElementById('kpi-energia').textContent}, con emisiones de ${document.getElementById('kpi-co2').textContent} y agua fresca de ${document.getElementById('kpi-agua').textContent}.`;
    document.getElementById('pdf-social-text').textContent = `La matriz social evaluada mediante metodología PIS (Severidad x Probabilidad) establece planes de mitigación específicos para comunidades (${currentRelave.comunidades}) y control de material particulado (MP10).`;

    const element = document.getElementById('pdf-report-template');
    element.classList.remove('hidden');
    const opt = { margin: 0.5, filename: `Informe_Ejecutivo_${currentRelave.id}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(element).save().then(() => { element.classList.add('hidden'); });
}