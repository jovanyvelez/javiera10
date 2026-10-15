//A. Una función que recibe un dato y devuelve un saludo

function saludar(nombre) {
  return "Hola" + " " + nombre + " Estas son tus tareas:";
}

console.log(saludar("Juan"));

// B. Tus tareas viven en un array (¡cámbialas por las tuyas!)

//recuerda que un array es una lista de datos, separados por comas y encerrados entre corchetes. Por ejemplo:

//const significa que la variable no puede ser reasignada, pero sí puede ser modificada. Por ejemplo, puedes agregar o quitar elementos de un array declarado con const.
const tareas = [
  'Estudiar para el examen de matemáticas',
  'Entregar el trabajo de sociales',
  'Practicar JavaScript 15 minutos'
];

// C. Funciones que agregan y quitan tareas
function agregarTarea(lista, nueva) {
  lista.push(nueva);
}

function quitarUltima(lista) {
  return lista.pop();
}

agregarTarea(tareas, 'Ayudar a lavar los platos');
quitarUltima(tareas);
console.log('Tareas actuales:', tareas);

// D. Buscar una tarea y recorrerlas todas
function buscarTarea(lista, nombre) {
  if (lista.includes(nombre)) {
    return 'La tarea "' + nombre + '" está en el índice ' + lista.indexOf(nombre);
  }
  return 'La tarea "' + nombre + '" no está en la lista.';
}
console.log(buscarTarea(tareas, 'Practicar JavaScript 15 minutos'));

for (const tarea of tareas) {
  console.log('- ' + tarea);
}