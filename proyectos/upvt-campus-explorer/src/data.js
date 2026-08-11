export const UPVT_DATA = {
  nombreCompleto: "Universidad Politécnica del Valle de Toluca",
  direccion: "Carretera Toluca-Almoloya de Juárez km 5.6, San Lorenzo Cuauhtenco, CP 51355, Almoloya de Juárez, Estado de México",
  telefono: "(722) 276 6060",
  web: "https://upvt.edomex.gob.mx/",
  modeloEducativo: "Basado en competencias profesionales, cuatrimestral, 3 ciclos de 3 cuatrimestres + estadías. Duración total: 10 cuatrimestres (3 años 4 meses) para ingenierías/licenciatura.",
  
  carreras: [
    {
      id: "iti",
      nombre: "Ingeniería en Tecnologías de la Información e Innovación Digital (ITI/ITIID)",
      tsu: "Desarrollo de Software Multiplataforma",
      descripcion: "Forma profesionales capaces de desarrollar soluciones tecnológicas innovadoras, software multi-plataforma, administración de infraestructura TI y seguridad informática.",
      enfoque: "Desarrollo Web y Móvil, IA, Ciberseguridad, Redes, Cloud Computing."
    },
    {
      id: "industrial",
      nombre: "Ingeniería Industrial",
      tsu: "Procesos Productivos",
      descripcion: "Especialistas en optimizar procesos productivos, administración de calidad, cadenas de suministro, logística y sistemas integrales de manufactura.",
      enfoque: "Calidad, Manufactura Esbelta, Logística, Seguridad Industrial."
    },
    {
      id: "automotriz",
      nombre: "Ingeniería Mecánica Automotriz",
      tsu: "Diseño y Manufactura Automotriz",
      descripcion: "Dedicada al diseño, manufactura, diagnóstico y mantenimiento de sistemas automotrices de última generación, incluyendo vehículos híbridos y eléctricos.",
      enfoque: "Diseño Automotriz, Autotrónica, Motores, Sistemas de Transmisión."
    },
    {
      id: "mecatronica",
      nombre: "Ingeniería Mecatrónica",
      tsu: "Automatización",
      descripcion: "Sinergia de mecánica, electrónica y control computarizado para el diseño y automatización de sistemas industriales y robóticos.",
      enfoque: "Robótica, Automatización Industrial, Control Numérico (CNC), Sensores."
    },
    {
      id: "energia",
      nombre: "Ingeniería en Energía y Desarrollo Sostenible",
      tsu: "Energía Turbo-Solar",
      descripcion: "Enfocada en el aprovechamiento de recursos energéticos renovables (solar, eólica, biomasa), eficiencia energética y desarrollo de proyectos ecológicos sustentables.",
      enfoque: "Energía Solar, Eólica, Auditorías Energéticas, Impacto Ambiental."
    },
    {
      id: "biotecnologia",
      nombre: "Ingeniería en Biotecnología",
      tsu: "Biotecnología",
      descripcion: "Aplicación de principios científicos e ingeniería a organismos vivos para la producción de bienes y servicios en los sectores salud, agropecuario e industrial.",
      enfoque: "Biotecnología Médica, Industrial, Alimentaria, Cultivos Celulares."
    },
    {
      id: "comercio",
      nombre: "Licenciatura en Comercio Internacional y Aduanas",
      tsu: "Procesos Logísticos",
      descripcion: "Forma líderes en negociaciones internacionales, normatividad aduanera, logística de distribución global y desarrollo de planes de exportación e importación.",
      enfoque: "Leyes Aduaneras, Logística Internacional, Tratados Comerciales, Finanzas."
    },
    {
      id: "mado",
      nombre: "Maestría en Alta Dirección de las Organizaciones (MADO)",
      tsu: null,
      descripcion: "Posgrado diseñado para desarrollar habilidades gerenciales de alto nivel, toma de decisiones estratégicas, liderazgo organizacional y competitividad global.",
      enfoque: "Planeación Estratégica, Finanzas Corporativas, Liderazgo, Innovación de Negocios."
    }
  ],

  directorio: [
    { puesto: "Rectora", nombre: "Silvia Cristina Manzur Quiroga", oficina: "Edificio Administrativo", contacto: "Rectoría" },
    { puesto: "Subdirectora de Servicios Escolares", nombre: "Laura Manzano Salinas", oficina: "Servicios Escolares", contacto: "Ext. 2057, 2058, 2030" },
    { puesto: "Jefe de Control Escolar", nombre: "Jhovany Israel Romero Clemente", oficina: "Servicios Escolares", contacto: "Ext. 2082–2086" },
    { puesto: "Jefe de TI", nombre: "Juan Luis Vallejo Coyote", oficina: "Edificio Académico - TI", contacto: "Ext. 2029" },
    { puesto: "Director de Planeación, Vinculación e Igualdad", nombre: "Juan Carlos Olmos López", oficina: "Edificio Administrativo", contacto: "Ext. 2028, 2081" },
    { puesto: "Jefe de Vinculación y Extensión", nombre: "Emiliano Eduardo Rivas Fuentes", oficina: "Edificio Administrativo", contacto: "Vinculación" }
  ],

  becas: [
    { nombre: "Beca de Manutención del Estado de México", descripcion: "Apoyo económico mensual para estudiantes inscritos de escasos recursos.", requisito: "Promedio mínimo 8.00" },
    { nombre: "Beca COMECYT Ciencia", descripcion: "Apoyo financiero del Consejo Mexiquense de Ciencia y Tecnología para carreras científicas y tecnológicas.", requisito: "Promedio mínimo 8.00 y ser estudiante regular." },
    { nombre: "Beca COMECYT Educación Dual", descripcion: "Fomenta la incorporación en el sector productivo mediante el modelo dual.", requisito: "Postulación por proyecto dual." },
    { nombre: "Beca COMECYT Mujeres Indígenas/Rurales", descripcion: "Impulsa el desarrollo profesional de mujeres provenientes de zonas vulnerables o etnias mexiquenses.", requisito: "Promedio mínimo 8.00" },
    { nombre: "Descuentos de reinscripción", descripcion: "Convocatorias internas por excelencia académica, deportiva o artística.", requisito: "Varía según convocatoria (típicamente >9.00)" }
  ],

  extracurriculares: {
    deportes: ["Voleibol", "Fútbol", "Basquetbol", "Taekwondo", "Ajedrez"],
    culturales: ["Cine club", "Club de danza", "Talleres de música"],
    idiomas: ["Centro de idiomas (abierto a todo público con 9 niveles de inglés, alemán, francés, chino, japonés, italiano)"],
    certificaciones: ["TOEFL (según carrera)", "Certificaciones de Competencias Laborales (CONOCER)"]
  },

  zonas: {
    A: {
      letra: "A",
      nombre: "Edificios H e I (Complejo Académico Norte)",
      subtitulo: "Aulas Especializadas, Conectividad y Andadores en Doble Planta",
      descripcion: "El Complejo Académico Norte de la UPVT está integrado por los modernos Edificios H e I, conectados por una vialidad de interconexión al aire libre rodeada de extensas áreas verdes. Es un espacio dinámico que integra la teoría académica con la práctica especializada.",
      servicios: [
        "Aulas teóricas para la formación académica y especializada de alto nivel",
        "Pasillos superiores abiertos en doble planta delimitados por barandales blancos (Edificio I)",
        "Fachada acristalada con grandes accesos y vestíbulos con pisos cerámicos claros",
        "Cubiertas ligeras y techados traslúcidos inclinados que resguardan la zona peatonal de la lluvia"
      ],
      directorio: [
        { puesto: "Coordinador de Ingeniería H", nombre: "Docentes de Especialidad", contacto: "Edificio H" },
        { puesto: "Coordinador de Ingeniería I", nombre: "Tutores Académicos", contacto: "Edificio I" }
      ],
      diaAqui: "Los estudiantes caminan entre los Edificios H e I a través del andador de concreto exterior. Las conversaciones en los andadores superiores e interiores se centran en proyectos de innovación tecnológica y sistemas complejos, disfrutando del flujo de aire y la luz natural."
    },
    B: {
      letra: "B",
      nombre: "Edificio B (Aulas y Jardín Central)",
      subtitulo: "Aulas Teóricas y Núcleo de Integración Ecológica",
      descripcion: "El Edificio B es uno de los complejos académicos más dinámicos y concurridos del campus. Es famoso por su diseño arquitectónico abierto y su icónico Jardín Central, diseñado para integrar la naturaleza en el día a día estudiantil.",
      servicios: [
        "Clases teóricas de ciencias básicas y especializadas (fachada naranja claro con ventanas cuadradas)",
        "Espectacular Jardín Central con senderos curvos de concreto y arbustos ornamentales podados",
        "Emblemática fuente decorativa en el centro del jardín con una escultura metálica abstracta",
        "Domo central o cielo abierto que aporta una excelente iluminación natural y frescura al vestíbulo"
      ],
      directorio: [
        { puesto: "Docentes de Tiempo Completo", nombre: "Profesores del Bloque", contacto: "Cubículos Edificio B" },
        { puesto: "Coordinador de Tutorías", nombre: "Tutorías Académicas", contacto: "Edificio B" }
      ],
      diaAqui: "El corazón del Edificio B vibra al ritmo de la fuente central. Entre clases, los alumnos descansan y estudian en los senderos curvos del jardín interior, mientras que la luz del domo ilumina los pasillos de las plantas superiores rodeadas de barandales."
    },
    C: {
      letra: "C",
      nombre: "Centro de Información y Documentación (CID)",
      subtitulo: "Biblioteca Central, Servicios Escolares y Enfermería",
      descripcion: "El CID es el complejo central de dos niveles destinado al apoyo académico, la investigación, la gestión de trámites oficiales y los servicios de salud preventiva para toda la comunidad de la UPVT.",
      servicios: [
        "Biblioteca Central (Planta Alta) con salas de estudio, cubículos de lectura y computadoras de consulta",
        "Oficina de Control Escolar (Planta Baja) para inscripciones, reinscripciones, constancias y boletas oficiales",
        "Área de Enfermería (Planta Baja) para brindar atención médica primaria y orientación en salud",
        "Diseño de vestíbulo con pisos cerámicos claros, excelente luz natural y gran doble altura"
      ],
      directorio: [
        { puesto: "Subdirectora de Servicios Escolares", nombre: "Laura Manzano Salinas", contacto: "Planta Baja - CID (Ext. 2057)" },
        { puesto: "Jefe de Control Escolar", nombre: "Jhovany Israel Romero Clemente", contacto: "Planta Baja - CID (Ext. 2082)" },
        { puesto: "Encargado de Biblioteca", nombre: "Personal de Consulta", contacto: "Planta Alta - Biblioteca CID" }
      ],
      diaAqui: "En el CID conviven el silencio y la actividad administrativa. Mientras en la planta baja los alumnos acuden a Control Escolar por constancias o a Enfermería por chequeos médicos, la planta alta se llena de investigadores concentrados en la Biblioteca Central."
    },
    D: {
      letra: "D",
      nombre: "Edificio D (Laboratorios y Talleres Especializados)",
      subtitulo: "Prácticas Tecnológicas e Infraestructura de Ingeniería",
      descripcion: "El Edificio D es el núcleo tecnológico del campus, donde los alumnos realizan prácticas y proyectos en laboratorios equipados con tecnología de última generación. Su diseño interior está fuertemente enfocado en la seguridad y el flujo de aire.",
      servicios: [
        "Laboratorios y talleres especializados equipados con software científico e instrumental de ingeniería",
        "Entrada principal con puertas de cristal templado, cubierta traslúcida protectora y jardinera de pinos",
        "Pasillo interior amplio con ventanales que aprovechan al máximo la luz natural",
        "Infraestructura completa de Protección Civil: señalizaciones de evacuación, extintores y mapas de ruta"
      ],
      directorio: [
        { puesto: "Jefe de TI e Infraestructura", nombre: "Juan Luis Vallejo Coyote", contacto: "Edificio D - Ext. 2029" },
        { puesto: "Responsable de Laboratorios", nombre: "Ingenieros de Soporte", contacto: "Talleres y Laboratorios Edificio D" }
      ],
      diaAqui: "En el Edificio D se respira innovación y ciberseguridad. Los pasillos albergan a estudiantes cargando prototipos o esperando asesorías de laboratorio en las bancas laterales de estudio, siempre bajo las normas de seguridad vigentes."
    },
    E: {
      letra: "E",
      nombre: "Edificio A (Rectoría y Administración General)",
      subtitulo: "Dirección Institucional, Planeación y Servicios Estudiantiles",
      descripcion: "Ubicado en el imponente Edificio A, este es el portal administrativo de la UPVT. Cuenta con una gran arquitectura caracterizada por columnas de doble altura y fachada acristalada en cuadrícula, sirviendo como núcleo de gestión del campus.",
      servicios: [
        "Oficinas de Rectoría y áreas administrativas de alta planeación estratégica y convenios",
        "Área de Servicios Estudiantiles y atención a trámites de vinculación y estadías duales",
        "Vestíbulo de entrada imponente con columnas circulares de concreto de doble altura y rampa accesible",
        "Infraestructura de atención: casilleros metálicos (lockers), pizarrones informativos y croquis oficial"
      ],
      directorio: [
        { puesto: "Rectora", nombre: "Silvia Cristina Manzur Quiroga", contacto: "Edificio A - Rectoría" },
        { puesto: "Director de Planeación, Vinculación e Igualdad", nombre: "Juan Carlos Olmos López", contacto: "Edificio A - Ext. 2028" },
        { puesto: "Jefe de Vinculación y Extensión", nombre: "Emiliano Eduardo Rivas Fuentes", contacto: "Edificio A - Vinculación" }
      ],
      diaAqui: "El flujo de visitas institucionales y alumnos gestionando estadías duales llena de actividad el Edificio A. El vestíbulo acristalado brilla con luz natural, mientras los estudiantes consultan los pizarrones informativos al lado de los casilleros."
    },
    F: {
      letra: "F",
      nombre: "Edificios F y G (Centro Deportivo y Canchas)",
      subtitulo: "Canchas Multidisciplinarias, Aulas F y Cultura Ecológica",
      descripcion: "La zona deportiva y recreativa de la UPVT es el motor de la formación integral y la sustentabilidad del campus, donde conviven la actividad física, las aulas del Edificio F y el respeto ecológico por el entorno.",
      servicios: [
        "Canchas multidisciplinarias exteriores destinadas a básquetbol, fútbol de salón y voleibol",
        "Jardineras sustentables decorativas construidas creativamente con neumáticos reciclados y pintados",
        "Edificio F de aulas con ventanales corridos que optimizan la luz interior y andador de concreto",
        "Estacionamiento perimetral amplio de superficie mixta (grava y terracería) a un costado del Edificio F"
      ],
      directorio: [
        { puesto: "Coordinador de Actividades Deportivas", nombre: "Entrenadores de Selección", contacto: "Edificio F - Vestidores" },
        { puesto: "Coordinador de Talleres Culturales", nombre: "Promotores Deportivos y de Danza", contacto: "Edificios F y G" }
      ],
      diaAqui: "Los balones rebotan en las canchas de básquetbol rodeadas por el verde césped y las coloridas jardineras de neumáticos. Los andadores conectan la Cafetería con el Edificio F y el estacionamiento de grava, llenando el área de risas y vitalidad."
    },
    G: {
      letra: "G",
      nombre: "Acceso Principal y Plaza de la Identidad",
      subtitulo: "Bienvenida Oficial, Control de Acceso y Explanada Cívica",
      descripcion: "El portal oficial de entrada a la UPVT en el kilómetro 5.6 de la carretera Toluca-Almoloya. Integra el módulo de seguridad principal con la hermosa Plaza de la Identidad, diseñada para ceremonias oficiales y honores a la bandera.",
      servicios: [
        "Caseta de Vigilancia y control peatonal/vehicular con seguridad institucional las 24/7",
        "Plaza de la Identidad: explanada cívica pavimentada con adoquín y concreto texturizado",
        "Monumental Asta Bandera Central como eje e identidad cívica del campus universitario",
        "Parada de autobuses de conexión vial, rampa de acceso universal e información general"
      ],
      directorio: [
        { puesto: "Jefe de Seguridad Institucional", nombre: "Vigilancia y Protección Civil", contacto: "Caseta de Acceso Principal" }
      ],
      diaAqui: "El campus cobra vida desde temprano en el Acceso Principal. Estudiantes entran ordenadamente a pie o en auto, mientras el Asta Bandera de la Plaza de la Identidad ondea orgullosa dando la bienvenida al futuro profesional de la UPVT."
    }
  }
};

export const UPVT_QUIZZES = {
  A: {
    nombre: "Modelo Educativo y Carreras",
    premios: "Sudadera Institucional UPVT",
    itemKey: "sudadera",
    itemIcon: "🧥",
    preguntas: [
      {
        q: "¿Cuánto tiempo dura en total una carrera de ingeniería en el modelo cuatrimestral de la UPVT?",
        options: ["4 años", "3 años 4 meses (10 cuatrimestres)", "5 años"],
        answer: 1
      },
      {
        q: "¿Cuál es el enfoque principal de la carrera de Ingeniería en Tecnologías de la Información e Innovación Digital?",
        options: ["Optimización de cadenas de suministro", "Desarrollo de Software, Ciberseguridad e Inteligencia Artificial", "Diseño de motores de combustión y embragues"],
        answer: 1
      },
      {
        q: "¿Cuál de los siguientes edificios conforma el Complejo Académico Norte de la UPVT junto con el Edificio I?",
        options: ["Edificio B", "Edificio H con aulas especializadas", "Edificio D de talleres"],
        answer: 1
      }
    ]
  },
  B: {
    nombre: "Edificio B y Jardín Central",
    premios: "Chamarra Universitaria UPVT",
    itemKey: "chamarra",
    itemIcon: "🧥",
    preguntas: [
      {
        q: "¿Qué elemento emblemático y artístico se encuentra en el centro del Jardín Central del Edificio B?",
        options: ["Una estatua de bronce de un halcón", "Una fuente decorativa con una escultura metálica abstracta", "Un reloj de sol de concreto"],
        answer: 1
      },
      {
        q: "¿Qué combinación de fachada e iluminación caracteriza el diseño del Edificio B?",
        options: ["Fachada naranja claro con ventanas cuadradas y un gran domo central a cielo abierto", "Fachada roja brillante con ventanales oscurecidos", "Fachada gris industrial con iluminación artificial únicamente"],
        answer: 0
      },
      {
        q: "¿Qué área verde de convivencia está diseñada con senderos curvos en el Edificio B?",
        options: ["El invernadero de biotecnología", "El Jardín Central y patio abierto del edificio", "Las jardineras de neumáticos reciclados"],
        answer: 1
      }
    ]
  },
  C: {
    nombre: "Biblioteca y Consulta CID",
    premios: "Termo Metálico UPVT",
    itemKey: "termo",
    itemIcon: "🍵",
    preguntas: [
      {
        q: "¿Qué significa la sigla 'CID' en la UPVT?",
        options: ["Centro de Idiomas y Deportes", "Centro de Información y Documentación", "Coordinación de Ingeniería Digital"],
        answer: 1
      },
      {
        q: "¿Qué servicios médicos y de gestión escolar se encuentran en la Planta Baja del CID?",
        options: ["Invernadero y Cafetería", "Área de Enfermería y la oficina de Control Escolar", "Canchas deportivas y vestidores"],
        answer: 1
      },
      {
        q: "¿Qué importante servicio se encuentra en la Planta Alta del CID para resguardar el acervo?",
        options: ["La Biblioteca Central y salas de estudio", "La oficina de la Rectora general", "Los laboratorios de Mecatrónica"],
        answer: 0
      }
    ]
  },
  D: {
    nombre: "Laboratorios y Talleres Especializados",
    premios: "Audífonos de Diadema UPVT",
    itemKey: "audifonos",
    itemIcon: "🎧",
    preguntas: [
      {
        q: "¿Qué infraestructura de seguridad y emergencia se visualiza detalladamente en los pasillos del Edificio D?",
        options: ["Un helipuerto de rescate", "Señalizaciones de evacuación, extintores y mapas de rutas de Protección Civil", "Un sistema de alarma con drones"],
        answer: 1
      },
      {
        q: "¿Cómo es el acceso frontal exterior al Edificio D de laboratorios?",
        options: ["Puertas de cristal templado, cubierta traslúcida contra el clima y una jardinera frontal de pinos", "Un puente colgante de madera y concreto", "Un portón metálico corredizo sin áreas verdes"],
        answer: 0
      },
      {
        q: "¿Quién es el encargado de TI con oficina en el área tecnológica del Edificio D?",
        options: ["Juan Luis Vallejo Coyote", "Silvia Cristina Manzur", "Laura Manzano Salinas"],
        answer: 0
      }
    ]
  },
  E: {
    nombre: "Edificio A: Rectoría y Administración",
    premios: "Mochila UPVT",
    itemKey: "mochila",
    itemIcon: "🎒",
    preguntas: [
      {
        q: "¿Qué elementos arquitectónicos de gran altura enmarcan el acceso principal del Edificio A?",
        options: ["Grandes columnas circulares de concreto de doble altura", "Dos torres de ladrillo con gárgolas decorativas", "Un arco de herrería negra"],
        answer: 0
      },
      {
        q: "¿Qué servicios clave de atención institucional y vinculación se encuentran en el Edificio A?",
        options: ["La Cafetería y canchas deportivas", "Las oficinas de Rectoría, Planeación y Servicios Estudiantiles", "El área de enfermería y control escolar"],
        answer: 1
      },
      {
        q: "¿Qué equipamiento de resguardo para pertenencias y comunicación estudiantil hay en el vestíbulo del Edificio A?",
        options: ["Casilleros metálicos (lockers), pizarrones informativos y croquis oficial", "Cajas de seguridad electrónicas y pizarrones digitales", "Un mostrador de equipaje asistido"],
        answer: 0
      }
    ]
  },
  F: {
    nombre: "Deportes y Formación Integral",
    premios: "Gorra Deportiva UPVT",
    itemKey: "gorra",
    itemIcon: "🧢",
    preguntas: [
      {
        q: "¿Qué iniciativa sustentable y ecológica decora las canchas exteriores en la zona deportiva del Edificio G?",
        options: ["Jardineras hechas creativamente con neumáticos reciclados y pintados", "Un huerto escolar orgánico automatizado", "Bases de macetas impresas en 3D"],
        answer: 0
      },
      {
        q: "¿Qué características tiene el Edificio F de aulas colindante con la zona deportiva?",
        options: ["Paredes de cristal templado sin ventilación", "Fachada con andador perimetral de concreto, ventanales corridos y un estacionamiento de grava", "Un diseño subterráneo con domo artificial"],
        answer: 1
      },
      {
        q: "¿Qué deportes oficiales forman parte de las actividades extracurriculares en la UPVT?",
        options: ["Voleibol, Fútbol, Basquetbol, Taekwondo y Ajedrez", "Golf, Tenis y Equitación", "Béisbol, Hockey y Natación"],
        answer: 0
      }
    ]
  },
  G: {
    nombre: "Seguridad y Plaza de la Identidad",
    premios: "Gafas Académicas UPVT",
    itemKey: "gafas",
    itemIcon: "🕶️",
    preguntas: [
      {
        q: "¿Qué monumento cívico y de identidad destaca como eje central en la Plaza de la Identidad de la UPVT?",
        options: ["Una estatua del Halcón en bronce", "Un monumental Asta Bandera Central", "Un obelisco de mármol blanco"],
        answer: 1
      },
      {
        q: "¿En qué kilómetro de la carretera Toluca-Almoloya de Juárez se ubica el Acceso Principal del campus?",
        options: ["Kilómetro 1.2", "Kilómetro 5.6", "Kilómetro 10.4"],
        answer: 1
      },
      {
        answer: 0
      }
    ]
  }
};

