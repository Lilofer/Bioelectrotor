const STORAGE_KEY = 'bioelectrotor_relaves_db';
const EMISIONES_FACTOR = { red: 0.45, solar: 0.05, hibrida: 0.22 };

const INITIAL_RELAVES_DATA = [
    {
        id: "REL-001",
        nombre: "Relave El Mauro",
        region: "Coquimbo",
        estado: "Activo",
        tipologia: "Tranque",
        riesgoEstructural: "Bajo",
        tonelajeMt: 1700.0,
        solidosPercent: 68.5,
        densidadPulpa: 1.72,
        ph: 7.8,
        leyCu: 0.28,
        leyFe: 14.2,
        leyAu: 0.12,
        baseEnergia: 15.4,
        comunidades: "Caimanes, Los Vilos",
        seguridadHidrica: "Alta Vigilancia",
        riesgosSociales: [
            { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 2, prob: 2, mitigacion: "Uso obligatorio de EPP respiratorio y sistemas de extracción forzada.", responsable: "Prevencionista de Riesgos" },
            { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10) por polvo en suspensión", severidad: 3, prob: 3, mitigacion: "Aplicación de polímeros aglutinantes y riego por aspersión controlada.", responsable: "Área de Operaciones" },
            { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 3, prob: 2, mitigacion: "Eliminación de sopladores mecánicos ruidosos y mesas de diálogo.", responsable: "Relacionamiento Comunitario" },
            { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 3, prob: 3, mitigacion: "Maximización de la tasa de recirculación de agua (>85%).", responsable: "Ingeniería de Procesos" }
        ]
    },
    {
        id: "REL-002",
        nombre: "Relave Ovejería",
        region: "Valparaíso",
        estado: "Activo",
        tipologia: "Embalse",
        riesgoEstructural: "Medio",
        tonelajeMt: 850.0,
        solidosPercent: 62.0,
        densidadPulpa: 1.61,
        ph: 8.1,
        leyCu: 0.22,
        leyFe: 11.5,
        leyAu: 0.08,
        baseEnergia: 13.8,
        comunidades: "Huechún, Tiltil",
        seguridadHidrica: "Monitoreado",
        riesgosSociales: [
            { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 2, prob: 3, mitigacion: "Capacitación en manejo de reactivos y control de tiempos de exposición.", responsable: "Prevencionista de Riesgos" },
            { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10) por polvo en suspensión", severidad: 4, prob: 3, mitigacion: "Cortinas corta-viento vegetales y sellado de taludes con biocostras.", responsable: "Área de Medio Ambiente" },
            { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 4, prob: 3, mitigacion: "Monitoreo participativo de calidad del aire y compensación territorial.", responsable: "Relacionamiento Comunitario" },
            { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 4, prob: 4, mitigacion: "Auditoría hídrica estricta y optimización de recirculación.", responsable: "Gerencia de Operaciones" }
        ]
    },
    {
        id: "REL-003",
        nombre: "Relave Talabre",
        region: "Antofagasta",
        estado: "Activo",
        tipologia: "Tranque",
        riesgoEstructural: "Bajo",
        tonelajeMt: 2100.0,
        solidosPercent: 70.0,
        densidadPulpa: 1.78,
        ph: 7.5,
        leyCu: 0.35,
        leyFe: 16.8,
        leyAu: 0.15,
        baseEnergia: 17.2,
        comunidades: "Calama, Chiu Chiu",
        seguridadHidrica: "Protegido",
        riesgosSociales: [
            { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 2, prob: 2, mitigacion: "Rotación de turnos y sistemas automatizados de control.", responsable: "Prevencionista de Riesgos" },
            { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10) por polvo en suspensión", severidad: 3, prob: 4, mitigacion: "Supresión química de polvo en caminos y coronamiento de tranque.", responsable: "Área de Operaciones" },
            { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 2, prob: 2, mitigacion: "Convenios de desarrollo local y fondos concursables comunales.", responsable: "Relacionamiento Comunitario" },
            { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 4, prob: 3, mitigacion: "Uso de agua de mar desalada y recirculación avanzada.", responsable: "Ingeniería de Procesos" }
        ]
    },
    {
        id: "REL-004",
        nombre: "Relave Cauquenes",
        region: "O'Higgins",
        estado: "Inactivo",
        tipologia: "Filtrado",
        riesgoEstructural: "Alto",
        tonelajeMt: 320.0,
        solidosPercent: 58.0,
        densidadPulpa: 1.55,
        ph: 6.9,
        leyCu: 0.19,
        leyFe: 9.8,
        leyAu: 0.05,
        baseEnergia: 11.5,
        comunidades: "Rancagua, Requínoa",
        seguridadHidrica: "Sin Riesgo Crítico",
        riesgosSociales: [
            { grupo: "Trabajadores", aspecto: "Exposición a vapores y aerosoles ácidos", severidad: 1, prob: 1, mitigacion: "Operación remota en depósitos inactivos de relave filtrado.", responsable: "Prevencionista de Riesgos" },
            { grupo: "Comunidad Local", aspecto: "Material Particulado (MP10) por polvo en suspensión", severidad: 2, prob: 2, mitigacion: "Cobertura inerte de material estéril sobre tortas filtradas.", responsable: "Área de Medio Ambiente" },
            { grupo: "Comunidad Local", aspecto: "Aceptabilidad comunitaria y ruido perimetral", severidad: 2, prob: 1, mitigacion: "Información pública transparente sobre planes de cierre.", responsable: "Relacionamiento Comunitario" },
            { grupo: "Entorno Hídrico", aspecto: "Competencia y estrés hídrico en la cuenca local", severidad: 2, prob: 2, mitigacion: "Drenaje controlado y monitoreo de napas subterráneas.", responsable: "Geotecnia y Medio Ambiente" }
        ]
    }
];

let relavesData = [];
let currentRelave = null;