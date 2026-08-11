// ─────────────────────────────────────────────────────────────
// content-u1poo.mjs — Reporte "Sistema de Gestión Académica y
// Tutorías" para la página FINAL U1 POO (v2).
// Lenguaje sencillo, código en inglés, sin emojis, 1a persona.
// ─────────────────────────────────────────────────────────────
import { H, P, B, NB, TABLE, IMG, D } from '../scripts/lib.mjs';

// Párrafo con etiqueta en negrita
const PB = (label, value) => ({
  paragraph: {
    rich_text: [
      { text: { content: label }, annotations: { bold: true } },
      { text: { content: value || '' } },
    ],
  },
});

// Bloque de código
const CODE = (text, language = 'java') => ({
  type: 'code',
  code: { rich_text: [{ text: { content: text } }], language },
});

// ── Matriz de requerimientos funcionales ─────────────────────
const RF = [
  ['RF-01', 'Entrada al sistema', 'El estudiante, el tutor y el administrador entran al sistema con su usuario y su contraseña.'],
  ['RF-02', 'Registro de materias', 'El sistema guarda las materias de la institución y las materias de cada estudiante.'],
  ['RF-03', 'Historial académico', 'El estudiante consulta sus materias, sus calificaciones y su promedio.'],
  ['RF-04', 'Alertas de riesgo', 'El sistema detecta solo a los estudiantes en riesgo y genera una alerta.'],
  ['RF-05', 'Asignación de tutores', 'El administrador asigna un tutor a cada estudiante en riesgo y ve cuántos alumnos atiende cada tutor.'],
  ['RF-06', 'Citas de tutoría', 'El estudiante pide una cita y el tutor la confirma, la cambia o la cancela.'],
  ['RF-07', 'Acuerdos y compromisos', 'Al terminar la tutoría, el tutor anota lo acordado y las fechas para cumplirlo.'],
  ['RF-08', 'Avisos (notificaciones)', 'El sistema avisa sobre alertas, asignaciones, citas y compromisos vencidos.'],
  ['RF-09', 'Seguimiento', 'El tutor registra los avances de cada alumno y el administrador los consulta.'],
  ['RF-10', 'Reportes de gestión', 'El administrador genera reportes de estudiantes en riesgo, tutorías y compromisos pendientes.'],
];

// ── Matriz de requerimientos no funcionales ──────────────────
const RNF = [
  ['RNF-01', 'Rapidez', 'Las consultas y los reportes responden en menos de 3 segundos.'],
  ['RNF-02', 'Seguridad', 'Las contraseñas se guardan cifradas, cada rol ve solo lo suyo y la información viaja protegida.'],
  ['RNF-03', 'Disponibilidad', 'El sistema funciona el 99.5 % del tiempo en horario escolar.'],
  ['RNF-04', 'Crecimiento', 'El sistema soporta más usuarios y materias sin tener que rediseñarlo.'],
  ['RNF-05', 'Facilidad de uso', 'La pantalla es clara y sencilla para estudiantes, tutores y administradores.'],
  ['RNF-06', 'Respaldo de datos', 'El sistema hace respaldos y mantiene consistentes las calificaciones y las citas.'],
  ['RNF-07', 'Registro de cambios', 'El sistema guarda quién hizo cada acción importante: asignar tutor, cambiar calificación o agendar cita.'],
];

// ── Actores ──────────────────────────────────────────────────
const ACTORES = [
  ['Estudiante', 'El alumno: ve su historial, recibe alertas y asiste a tutorías.'],
  ['Tutor', 'El maestro que atiende a los estudiantes asignados, agenda citas y anota los acuerdos.'],
  ['Administrador', 'La persona encargada de usuarios, materias, asignación de tutores y reportes.'],
  ['Sistema', 'El propio sistema: hace tareas automáticas como detectar el riesgo y enviar avisos.'],
];

// ── Bloques de un caso de uso documentado ────────────────────
const usoCaso = (id, titulo, proposito, actor, pre, flujo, alternos, post) => [
  H(4, `${id} ${titulo}`),
  P(proposito),
  PB('Quién participa: ', actor),
  PB('Qué se necesita antes: ', pre),
  PB('Pasos normales: ', ''),
  ...flujo.map((f) => NB(f)),
  PB('Si algo sale diferente: ', ''),
  ...alternos.map((a) => B(a)),
  PB('Qué queda al final: ', post),
];

// ── Constructor principal ────────────────────────────────────
export function buildBlocks(urls) {
  const blocks = [];

  // ── Portada del reporte ────────────────────────────────────
  blocks.push(H(1, 'Sistema de Gestión Académica y Tutorías'));
  blocks.push(P('Este reporte explica cómo modernizar el sistema de Gestión Académica y Tutorías de la institución. Hoy, registrar materias, dar seguimiento a los estudiantes con riesgo de reprobar y asignar tutores se hace casi todo a mano, con hojas de cálculo y mensajes. Eso provoca demoras, pérdida de información y pocas pruebas de que las soluciones ofrecidas a los alumnos funcionaron. Mi propuesta es definir el sistema por partes y documentarlo con diagramas UML, que son dibujos que muestran cómo funcionará el sistema antes de programarlo.'));
  blocks.push(D());

  // ── 1. Identificación de Requisitos y Requerimientos ───────
  blocks.push(H(2, '1. Identificación de Requisitos y Requerimientos mediante UML'));

  blocks.push(H(3, '1.1 Clasificación de Requerimientos'));
  blocks.push(P('Los requerimientos funcionales dicen lo que el sistema debe hacer. Los no funcionales dicen cómo debe comportarse, por ejemplo qué tan rápido, qué tan seguro y qué tan fácil de usar. Conocer ambos es el primer paso para que el sistema cumpla lo que la institución necesita.'));
  blocks.push(H(4, 'Requerimientos funcionales'));
  blocks.push(TABLE(['ID', 'Requerimiento', 'Descripción'], RF));
  blocks.push(H(4, 'Requerimientos no funcionales'));
  blocks.push(TABLE(['ID', 'Requerimiento', 'Descripción'], RNF));
  blocks.push(D());

  // ── 1.2 Casos de uso ───────────────────────────────────────
  blocks.push(H(3, '1.2 Modelado de Casos de Uso'));
  blocks.push(P('Un caso de uso describe una acción que alguien hace con el sistema, por ejemplo consultar calificaciones. Las personas que usan el sistema se llaman actores: el estudiante, el tutor y el administrador. El sistema también cuenta como actor cuando hace tareas por sí solo, como detectar el riesgo.'));
  blocks.push(TABLE(['Actor', 'Descripción'], ACTORES));
  blocks.push(P('El siguiente diagrama muestra las acciones del sistema y quién las realiza. Cada figura ovalada es una acción y cada persona es un actor.'));
  blocks.push(IMG(urls.casos_de_uso, 'Diagrama de casos de uso general'));
  blocks.push(P('Después detallo los casos de uso más importantes: quién participa, qué se necesita antes, los pasos normales, qué pasa si algo sale diferente y qué queda al final.'));

  blocks.push(...usoCaso(
    'CU-01', 'Entrar al sistema (iniciar sesión)',
    'El estudiante, el tutor y el administrador entran al sistema con su usuario y su contraseña. Cada uno ve solo las opciones que le corresponden.',
    'Estudiante, Tutor, Administrador',
    'La persona tiene una cuenta creada por el administrador.',
    [
      'La persona escribe su usuario y su contraseña.',
      'El sistema revisa que los datos sean correctos.',
      'El sistema identifica el tipo de usuario.',
      'El sistema muestra las opciones de ese tipo de usuario.',
    ],
    [
      'Datos incorrectos: el sistema avisa y permite volver a intentarlo; después de tres intentos bloquea el acceso por un momento.',
      'Cuenta desactivada: el sistema no deja entrar y avisa al administrador.',
    ],
    'La persona entra al sistema y solo ve las opciones de su rol.'
  ));

  blocks.push(...usoCaso(
    'CU-02', 'Consultar historial académico',
    'El estudiante consulta las materias que ha cursado, sus calificaciones y su promedio.',
    'Estudiante',
    'El estudiante está dentro del sistema y tiene materias registradas.',
    [
      'El estudiante elige la opción de historial académico.',
      'El sistema busca las materias del estudiante.',
      'El sistema calcula el promedio de cada materia y el promedio general.',
      'El sistema muestra todo en pantalla.',
    ],
    [
      'Sin materias: el sistema muestra un aviso de historial vacío.',
      'Materias en curso: se muestran con la nota "cursando".',
    ],
    'El estudiante ve su historial y puede imprimirlo o guardarlo.'
  ));

  blocks.push(...usoCaso(
    'CU-03', 'Detección automática de riesgo académico',
    'El sistema revisa las calificaciones de todos los estudiantes y avisa por sí solo cuándo alguien está en riesgo de reprobar.',
    'El sistema la inicia; el estudiante, el tutor y el administrador reciben el aviso.',
    'Hay calificaciones cargadas y el administrador definió qué cuenta como riesgo.',
    [
      'El sistema revisa las calificaciones del periodo.',
      'Calcula el promedio de cada materia y el promedio general de cada estudiante.',
      'Compara los resultados con la regla definida.',
      'Si el estudiante cumple la regla, crea una alerta.',
      'Guarda la alerta en el historial del estudiante.',
      'Avisa al tutor y al administrador.',
    ],
    [
      'Sin calificaciones: el sistema no evalúa a ese estudiante y lo anota en el reporte de revisión.',
      'Estudiante sin tutor: el sistema genera la alerta y avisa solo al administrador para que asigne uno.',
    ],
    'La alerta queda guardada en el historial y los responsables fueron avisados.'
  ));

  blocks.push(...usoCaso(
    'CU-04', 'Asignación de tutor a estudiante',
    'El administrador asigna un tutor a cada estudiante en riesgo y puede ver cuántos alumnos atiende cada tutor.',
    'Administrador',
    'El administrador está dentro del sistema, hay estudiantes con alertas y tutores disponibles.',
    [
      'El administrador ve la lista de estudiantes con alertas.',
      'Elige un estudiante y un tutor, tomando en cuenta la especialidad y la carga del tutor.',
      'El sistema revisa que el tutor tenga tiempo disponible.',
      'El sistema guarda la asignación en el historial del estudiante.',
      'El sistema avisa al tutor de su nueva responsabilidad.',
    ],
    [
      'Tutor ocupado: el sistema no permite asignarlo y sugiere otro tutor.',
      'Estudiante ya asignado: el sistema muestra al tutor actual y permite cambiarlo.',
    ],
    'El estudiante queda con un tutor y el tutor recibe el aviso.'
  ));

  blocks.push(...usoCaso(
    'CU-05', 'Agendar y confirmar cita de tutoría',
    'El estudiante pide una cita con su tutor y el tutor la confirma, la cambia o la cancela según su agenda.',
    'Estudiante, Tutor',
    'Ambos están dentro del sistema y el estudiante tiene tutor asignado.',
    [
      'El estudiante pide una cita indicando el motivo, la fecha y la hora.',
      'El sistema revisa la agenda del tutor.',
      'Si hay espacio, el sistema guarda la cita como "pendiente".',
      'El sistema avisa al tutor de la solicitud.',
      'El tutor confirma la cita y el sistema la marca como "confirmada".',
      'El sistema avisa al estudiante de la confirmación.',
    ],
    [
      'Sin espacio: el sistema rechaza la solicitud y sugiere otros horarios.',
      'El tutor cambia la cita: el sistema guarda el nuevo horario y avisa al estudiante.',
      'Cita cancelada: el sistema libera el horario y avisa a ambos.',
    ],
    'La cita queda guardada con su estado, el horario queda reservado y ambos fueron avisados.'
  ));

  blocks.push(...usoCaso(
    'CU-06', 'Registrar acuerdos y compromisos',
    'Al terminar la tutoría, el tutor anota lo acordado y el sistema da seguimiento hasta que se cumpla.',
    'El tutor registra; el estudiante recibe los avisos.',
    'La tutoría ya se realizó y el tutor está dentro del sistema.',
    [
      'El tutor anota los compromisos con su fecha límite.',
      'El sistema los guarda en la cita y en el historial del estudiante.',
      'El sistema avisa al estudiante de los compromisos acordados.',
      'El sistema revisa las fechas límite y recuerda los vencimientos.',
      'El tutor marca cada compromiso como cumplido o pendiente.',
    ],
    [
      'Compromiso vencido: el sistema lo marca como pendiente y avisa al tutor para otra intervención.',
      'Tutoría sin acuerdos: el sistema guarda la sesión sin compromisos y queda visible en el historial.',
    ],
    'Los acuerdos quedan guardados, el estudiante los conoce y el sistema puede reportar su cumplimiento.'
  ));

  blocks.push(D());

  // ── 1.3 Estructura y comportamiento ────────────────────────
  blocks.push(H(3, '1.3 Modelado de Estructura y Comportamiento'));

  blocks.push(H(4, 'Diagrama de Clases'));
  blocks.push(P('Una clase es como una plantilla que agrupa la información y las acciones de una parte del sistema. Por ejemplo, la clase Student guarda los datos del estudiante y sabe calcular su promedio. El diagrama de clases muestra todas las plantillas del sistema y cómo se relacionan.'));
  blocks.push(IMG(urls.clases, 'Diagrama de clases del sistema'));
  blocks.push(P('Cómo leer las relaciones del diagrama: las flechas con triángulo indican herencia, es decir que Student, Tutor y Administrator aprovechan lo que ya tiene la clase User, como entrar al sistema. Los rombos rellenos indican que una parte no existe sin la otra: un Grade (calificación) solo existe dentro de una Enrollment (inscripción). Los rombos vacíos indican que una parte existe por su cuenta: las RiskAlert (alertas) se guardan en el historial y pueden eliminarse sin borrar al estudiante.'));

  blocks.push(H(4, 'Diagrama de Secuencia: canalización de un alumno con su tutor'));
  blocks.push(P('Este diagrama muestra el orden de los pasos cuando un estudiante en riesgo pasa a manos de su tutor: quién habla con quién y en qué momento, desde la alerta hasta el seguimiento de los compromisos.'));
  blocks.push(IMG(urls.secuencia_canalizacion, 'Canalización de un alumno con su tutor'));
  blocks.push(D());

  // ── 2. Soluciones a necesidades específicas ────────────────
  blocks.push(H(2, '2. Desarrollo de Soluciones a Necesidades Específicas Planteadas'));

  // Escenario A
  blocks.push(H(3, '2.1 Escenario A: Detección automática de alumnos en riesgo académico'));
  blocks.push(H(4, 'El problema'));
  blocks.push(P('Hoy el tutor revisa las calificaciones una por una para decidir quién necesita ayuda. Esto es lento, puede dejar casos sin atender y no queda constancia de cómo se tomó la decisión.'));
  blocks.push(H(4, 'Mi solución'));
  blocks.push(P('El sistema hace esa revisión solo, con una regla clara que el administrador puede cambiar cuando quiera. Por ejemplo: promedio menor a 70 o dos materias reprobadas. El proceso es el siguiente:'));
  blocks.push(NB('El sistema toma las inscripciones del periodo actual.'));
  blocks.push(NB('Calcula el promedio de cada materia.'));
  blocks.push(NB('Calcula el promedio general del estudiante.'));
  blocks.push(NB('Compara los resultados con la regla definida.'));
  blocks.push(NB('Si el estudiante cumple la regla, crea una alerta con nivel de riesgo: bajo, medio o alto.'));
  blocks.push(NB('Guarda la alerta en el historial y avisa al tutor y al administrador.'));
  blocks.push(H(4, 'Código del algoritmo'));
  blocks.push(CODE(`// Reglas de riesgo definidas por el administrador
// Ejemplo: promedio menor a 70 o dos materias reprobadas
double minimumAverage = 70;
int maxFailedSubjects = 2;

for (Student student : students) {
    List<Enrollment> enrollments = student.getEnrollments(currentPeriod);
    int failed = 0;

    for (Enrollment enrollment : enrollments) {
        double average = enrollment.calculateAverage();
        if (average < 70) {
            failed++;
        }
    }

    double overallAverage = student.calculateOverallAverage();

    // Si cumple la regla, se crea una alerta y se avisa
    if (overallAverage < minimumAverage || failed >= maxFailedSubjects) {
        RiskAlert alert = new RiskAlert(student, classifyLevel(overallAverage));
        alert.create();
        alert.notify(student.getTutor(), administrator);
    } else {
        monitor(student); // solo se registra la revisión
    }
}`));
  blocks.push(H(4, 'Dibujo del proceso'));
  blocks.push(IMG(urls.actividad_riesgo, 'Camino de la revisión: de las calificaciones al aviso'));
  blocks.push(D());

  // Escenario B
  blocks.push(H(3, '2.2 Escenario B: Asignación y control de citas entre tutores y estudiantes'));
  blocks.push(H(4, 'El problema'));
  blocks.push(P('Las citas se coordinan por mensajes y los acuerdos de cada tutoría no quedan por escrito, así que nadie verifica si se cumplieron.'));
  blocks.push(H(4, 'Mi solución'));
  blocks.push(P('El sistema controla la agenda del tutor y guarda cada acuerdo como un compromiso con fecha límite. Cada cita tiene un estado: pendiente, confirmada, cambiada o cancelada. El proceso es el siguiente:'));
  blocks.push(NB('El estudiante pide una cita con motivo, fecha y hora.'));
  blocks.push(NB('El sistema revisa la agenda del tutor.'));
  blocks.push(NB('Si hay espacio, guarda la cita como "pendiente" y avisa al tutor.'));
  blocks.push(NB('El tutor confirma y la cita queda "confirmada".'));
  blocks.push(NB('El sistema avisa al estudiante de la confirmación.'));
  blocks.push(NB('Al terminar la tutoría, el tutor anota los acuerdos.'));
  blocks.push(NB('El sistema avisa los compromisos, recuerda las fechas límite y registra si se cumplieron.'));
  blocks.push(H(4, 'Código del mecanismo'));
  blocks.push(CODE(`// El estudiante pide una cita con su tutor
Appointment appointment = new Appointment(student, tutor, reason, date, time);

if (appointment.isTutorAvailable()) {
    appointment.setState("pending");
    Notification.send(tutor, "Nueva cita solicitada por " + student.getName());

    if (tutor.confirmAppointment(appointment)) {
        appointment.setState("confirmed");
        Notification.send(student, "Cita confirmada: " + appointment.getDate());

        // Al terminar la tutoría se registran los acuerdos
        Commitment commitment = new Commitment(appointment, description, deadline);
        commitment.save();
        Notification.send(student, "Compromiso registrado: " + commitment.getDescription());
        System.scheduleFollowUp(commitment.getDeadline());
    }
} else {
    Notification.send(student, "El tutor no tiene disponibilidad, elija otro horario");
}`));
  blocks.push(H(4, 'Dibujo del proceso'));
  blocks.push(IMG(urls.secuencia_citas, 'Asignación y control de citas de tutoría'));
  blocks.push(D());

  // ── 2.3 Justificación ──────────────────────────────────────
  blocks.push(H(3, '2.3 Justificación de la Solución'));
  blocks.push(P('Dividir el sistema en partes hace que cada regla quede en un solo lugar: la calificación sabe calcular su promedio y la cita sabe revisar la agenda. Si hay que corregir algo, se corrige una vez y el cambio se aplica en todo el sistema.'));
  blocks.push(P('Lo que comparten los tres tipos de usuario, como entrar al sistema y recibir avisos, se define una sola vez y los tres lo aprovechan. Si la institución agrega un rol nuevo, se adapta sin tocar lo demás.'));
  blocks.push(P('Guardar las calificaciones dentro de la inscripción evita datos sueltos que se pierdan. Las alertas, en cambio, se guardan en el historial aunque el estudiante salga del riesgo, para tener un registro de lo que pasó.'));
  blocks.push(P('En el escenario A, la regla de riesgo no está escrita dentro del código: la define el administrador, así que se puede ajustar sin reprogramar. Cada alerta guarda su fecha y su motivo, y se puede comprobar por qué se generó.'));
  blocks.push(P('En el escenario B, cada cita pasa por estados y cada acuerdo queda registrado con su fecha límite. El sistema avisa y da seguimiento, así ningún compromiso queda olvidado. Esto resuelve directamente la pérdida de información y la falta de seguimiento del problema original.'));
  blocks.push(P('Los diagramas funcionan como un plano: el de clases muestra las piezas del sistema, los de secuencia y actividades muestran cómo trabajan juntas y los casos de uso muestran qué puede hacer cada persona. Con ese plano, cualquier programador puede construir el sistema sin adivinar.'));

  // ── Conclusión ─────────────────────────────────────────────
  blocks.push(D());
  blocks.push(H(2, 'Conclusión'));
  blocks.push(P('Con esta propuesta, la institución deja de depender de procesos a mano: el sistema registra todo, avisa cuando hace falta y da seguimiento real a cada alumno. El diseño queda documentado con UML y listo para programarse en cualquier lenguaje.'));

  return blocks;
}
