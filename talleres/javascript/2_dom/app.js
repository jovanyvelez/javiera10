// A. Selecciona el título y cámbiale el texto
const titulo = document.getElementById('titulo');
titulo.textContent = 'Mis tareas de esta semana';

// B. Tus tareas viven en un array (¡cámbialas por las tuyas!)
const tareas = [
  'Estudiar para el examen de desarrollo de software',
  'Entregar el trabajo de sociales',
  'Practicar JavaScript 15 minutos',
  'Ayudar a lavar los platos'
];


// C. Crea un <li> por cada tarea y agrégalo a la lista
const lista = document.getElementById('lista-tareas');
for (let i = 0; i < tareas.length; i++) {
  const li = document.createElement('li');
  li.textContent = tareas[i];
  lista.append(li);
}

// D. Marca una tarea como completada y cuenta el total
const primera = document.querySelector('#lista-tareas li');
primera.classList.add('completada');

const todas = document.querySelectorAll('#lista-tareas li');
const contador = document.getElementById('contador');
contador.textContent = 'Tienes ' + todas.length + ' tareas en total';