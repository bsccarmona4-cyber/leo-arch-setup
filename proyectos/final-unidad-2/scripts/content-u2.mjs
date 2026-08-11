// ─────────────────────────────────────────────────────────────
// content-u2.mjs — Bloques del reporte FINAL U2 POO.
// Sistema "Gestión de Biblioteca". Tono casual, sin emojis.
// El código se lee de disco para no desincronizarse.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { H, P, B, NB, TABLE, IMG, D } from '../../final-unidad-1/scripts/lib.mjs';

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

// Sube código partido en bloques de <=1900 chars (límite de Notion: 2000)
function pushCode(blocks, text, language = 'java') {
  const MAX = 1900;
  if (text.length <= MAX) {
    blocks.push(CODE(text, language));
    return;
  }
  let rest = text;
  while (rest.length > MAX) {
    // cortar en el salto de línea más cercano antes del límite
    let cut = rest.lastIndexOf('\n', MAX);
    if (cut <= 0) cut = MAX;
    blocks.push(CODE(rest.slice(0, cut), language));
    rest = rest.slice(cut).replace(/^\n/, '');
  }
  if (rest.length > 0) blocks.push(CODE(rest, language));
}

const SRC = '/home/leo/final-unidad-2/biblioteca/src/biblioteca';
const leer = (f) => readFileSync(`${SRC}/${f}`, 'utf8').trimEnd();

// ── Tabla de clases identificadas ────────────────────────────
const CLASES = [
  ['Libro', 'titulo, autor, isbn, anio, estado', 'esDisponible(), marcarPrestado(), marcarDisponible()', 'Clase base del catálogo'],
  ['Usuario', 'nombre, id', 'calcularTiempoPrestamo() (abstracto)', 'Clase base (abstracta)'],
  ['Estudiante', 'hereda de Usuario', 'calcularTiempoPrestamo() = 7 días', 'Herencia de Usuario'],
  ['Docente', 'hereda de Usuario', 'calcularTiempoPrestamo() = 15 días', 'Herencia de Usuario'],
  ['Prestamo', 'libro, usuario, fechas, diasPermitidos', 'devolver(), estaActivo()', 'Asociación con Libro y Usuario'],
  ['Biblioteca', 'libros, usuarios, prestamos', 'registrarLibro(), prestarLibro(), devolverLibro(), reporteLibrosPrestados()', 'Composición: contiene a los demás'],
];

// ── Constructor principal ────────────────────────────────────
export function buildBlocks(urls) {
  const blocks = [];

  // ── Portada ────────────────────────────────────────────────
  blocks.push(P('PROGRAMA EDUCATIVO:'));
  blocks.push(P('INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN'));
  blocks.push(P('E INNOVACIÓN DIGITAL CON TSU* EN DESARROLLO'));
  blocks.push(P('DE SOFTWARE MULTIPLATAFORMA.'));
  blocks.push(P('ASIGNATURA:'));
  blocks.push(P('PROGRAMACION ORIENTADA A OBJETOS'));
  blocks.push(P('NOMBRE DE LA FACILITADORA:'));
  blocks.push(P('MONTES DE OCA HERRERA MARTHA'));
  blocks.push(P('NOMBRE DEL ALUMNO:'));
  blocks.push(P('LEONARDO ARTURO CARMONA VARGAS'));
  blocks.push(P(''));

  // ── Introducción ───────────────────────────────────────────
  blocks.push(H(1, 'Sistema "Gestión de Biblioteca" (Final Unidad 2)'));
  blocks.push(P('Esta es la segunda práctica de la materia y aquí sí se puso bueno: ya no solo diseñamos el sistema, también lo programamos. El reto era hacer un sistema de biblioteca que quedara bien ordenado y que se pudiera reutilizar, aplicando POO de verdad: clases, objetos, encapsulamiento, herencia y polimorfismo. Primero lo diseñé con UML y después lo codifiqué en Java.'));
  blocks.push(D());

  // ── Contexto ───────────────────────────────────────────────
  blocks.push(H(2, 'Contexto'));
  blocks.push(P('Una empresa pidió un sistema modular y escalable para gestionar su biblioteca. En palabras simples: que se puedan registrar libros y usuarios, prestar y devolver libros, y sacar un reporte de lo que está prestado. Lo importante es que el código quede limpio, para que mañana se pueda agregar otra función sin romper todo lo que ya funciona.'));
  blocks.push(D());

  // ── FASE 1 ─────────────────────────────────────────────────
  blocks.push(H(2, 'FASE 1: Análisis y Diseño (UML)'));

  blocks.push(H(3, 'Análisis del problema'));
  blocks.push(P('Antes de escribir una sola línea de código, me senté a pensar qué necesita el sistema: libros con sus datos, usuarios de dos tipos (estudiantes y docentes), préstamos con fecha y días permitidos, y un reporte de lo prestado. De ahí salieron seis clases, cada una con su responsabilidad clara.'));

  blocks.push(H(3, 'Identificación de clases'));
  blocks.push(P('Estas son las clases que identifiqué, qué guarda cada una y qué hace. La tabla fue mi guía para dibujar los diagramas y después para programar.'));
  blocks.push(TABLE(['Clase', 'Qué guarda', 'Qué hace', 'Relación'], CLASES));

  blocks.push(H(3, 'Diagrama de Clases'));
  blocks.push(P('Aquí se ve la estructura completa. Lo importante: Usuario es la clase madre y de ella heredan Estudiante y Docente (herencia). Biblioteca tiene los libros, los usuarios y los préstamos (composición), y Prestamo se relaciona con un Libro y un Usuario (asociación).'));
  blocks.push(IMG(urls.clases, 'Diagrama de clases del sistema'));

  blocks.push(H(3, 'Diagrama de Casos de Uso'));
  blocks.push(P('Los actores son el Bibliotecario, que registra y administra todo, y el Usuario, que pide prestados y devuelve libros.'));
  blocks.push(IMG(urls.casos_de_uso, 'Diagrama de casos de uso'));

  blocks.push(H(3, 'Diagrama de Secuencia: Prestar libro'));
  blocks.push(P('Este diagrama muestra el paso a paso de un préstamo: el bibliotecario lo pide, la biblioteca verifica que el libro exista y esté disponible, le pregunta al usuario cuántos días le tocan (ahí sale el polimorfismo: 7 si es estudiante, 15 si es docente) y crea el préstamo.'));
  blocks.push(IMG(urls.secuencia_prestamo, 'Secuencia del proceso de préstamo'));
  blocks.push(D());

  // ── FASE 2 ─────────────────────────────────────────────────
  blocks.push(H(2, 'FASE 2: Implementación en POO (Java)'));

  blocks.push(H(3, 'Cómo apliqué los principios de POO'));
  blocks.push(PB('Encapsulamiento: ', 'todos los atributos son privados y nadie los toca directo. Para prestar un libro se llama marcarPrestado(), no se cambia la variable a mano. Así evitamos errores tontos, como un libro que dice "disponible" pero en realidad está prestado.'));
  blocks.push(PB('Herencia: ', 'Usuario es la clase madre y es abstracta, o sea que no se puede crear un "usuario genérico": solo existen Estudiante y Docente. Lo que comparten (nombre e ID) vive una sola vez en Usuario y los hijos lo aprovechan.'));
  blocks.push(PB('Polimorfismo: ', 'el método calcularTiempoPrestamo() existe en las tres clases, pero cada una responde distinto: el estudiante devuelve 7 días y el docente 15. Desde Biblioteca llamamos al mismo método y cada objeto decide cuánto le toca. Esa es la magia del polimorfismo.'));
  blocks.push(PB('Colecciones: ', 'la biblioteca guarda libros, usuarios y préstamos en ArrayList, así puede crecer sin límite fijo: hoy 4 libros, mañana 400.'));

  blocks.push(H(3, 'El código'));
  blocks.push(P('El proyecto tiene siete clases en el paquete biblioteca. Aquí está el código completo de cada una.'));

  const files = ['Libro.java', 'Usuario.java', 'Estudiante.java', 'Docente.java', 'Prestamo.java', 'Biblioteca.java', 'Main.java'];
  for (const f of files) {
    blocks.push(H(4, f));
    pushCode(blocks, leer(f));
  }

  blocks.push(H(3, 'Cómo compilar y ejecutar'));
  blocks.push(CODE('cd biblioteca\njavac -d out src/biblioteca/*.java\njava -cp out biblioteca.Main', 'bash'));

  blocks.push(H(3, 'Salida del programa'));
  blocks.push(P('Esta es la salida real: se presta un libro a una estudiante (7 días) y otro a un docente (15 días), se intenta prestar un libro que ya está prestado y el sistema lo impide, se devuelve, y al final queda el reporte con el libro que sigue prestado.'));
  pushCode(blocks, readFileSync('/home/leo/final-unidad-2/biblioteca/salida.txt', 'utf8').trimEnd(), 'plain text');
  blocks.push(D());

  // ── Conclusión ─────────────────────────────────────────────
  blocks.push(H(2, 'Conclusión'));
  blocks.push(P('Me gustó esta práctica porque al final vi el ciclo completo: primero pensar y dibujar, después programar. El diseño UML me ahorró problemas: cuando me senté a codificar ya sabía qué clase hacía qué, y el código salió casi solo.'));
  blocks.push(P('Lo que más me costó fue entender por qué el polimorfismo es útil, pero cuando vi en la consola que el mismo método daba 7 días para la estudiante y 15 para el docente, lo entendí todo: el sistema no necesita saber quién es quién, cada objeto sabe responder por sí mismo.'));
  blocks.push(P('El sistema quedó listo para crecer: agregar otro tipo de usuario, multas por retraso o búsqueda por título sería sumar clases o métodos, sin tocar lo que ya funciona.'));
  blocks.push(D());

  // ── Entregables ────────────────────────────────────────────
  blocks.push(H(2, 'Entregables'));
  blocks.push(B('Reporte en PDF: portada, análisis del problema y los tres diagramas UML.'));
  blocks.push(B('Biblioteca.zip: el código fuente completo en Java.'));
  blocks.push(B('Memoria de trabajo en PDF: conclusiones de la práctica.'));

  return blocks;
}
