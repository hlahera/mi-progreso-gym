// Datos
let ejercicios = JSON.parse(localStorage.getItem('ejercicios')) || [];
let pesos = JSON.parse(localStorage.getItem('pesos')) || [];

// DOM Elements
const secciones = {
    ejercicios: document.getElementById('seccionEjercicios'),
    peso: document.getElementById('seccionPeso')
};

const botones = {
    ejercicios: document.getElementById('btnEjercicios'),
    peso: document.getElementById('btnPeso')
};

const forms = {
    ejercicio: document.getElementById('formEjercicio'),
    peso: document.getElementById('formPeso')
};

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ SW registrado:', reg.scope))
            .catch(err => console.error('❌ Falló SW:', err));
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('ejercicios');
    cargarRutinaSemanal();
    cargarHistorialPeso();
    
    // Event Listeners
    botones.ejercicios.addEventListener('click', () => mostrarSeccion('ejercicios'));
    botones.peso.addEventListener('click', () => mostrarSeccion('peso'));
    
    forms.ejercicio.addEventListener('submit', guardarEjercicio);
    forms.peso.addEventListener('submit', guardarPeso);
});

// Funciones
function mostrarSeccion(seccion) {
    Object.values(secciones).forEach(sec => sec.classList.remove('active-section'));
    Object.values(botones).forEach(btn => btn.classList.remove('active'));
    
    secciones[seccion].classList.add('active-section');
    botones[seccion].classList.add('active');
}

function guardarEjercicio(e) {
    e.preventDefault();
    
    const ejercicio = {
        dia: document.getElementById('diaEntrenamiento').value,
        nombre: document.getElementById('nombreEjercicio').value.trim(),
        peso: parseFloat(document.getElementById('pesoLevantado').value),
        repeticiones: parseInt(document.getElementById('repeticiones').value),
        fecha: new Date().toISOString().split('T')[0]
    };
    
    if (!validarEjercicio(ejercicio)) return;
    
    ejercicios.push(ejercicio);
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
    
    forms.ejercicio.reset();
    cargarRutinaSemanal();
    alert('✅ Ejercicio guardado');
}

function guardarPeso(e) {
    e.preventDefault();
    
    const registro = {
        peso: parseFloat(document.getElementById('pesoActual').value),
        fecha: new Date().toISOString().split('T')[0]
    };
    
    if (isNaN(registro.peso)) {
        alert('⚠️ Ingresa un peso válido');
        return;
    }
    
    pesos.push(registro);
    localStorage.setItem('pesos', JSON.stringify(pesos));
    
    forms.peso.reset();
    cargarHistorialPeso();
    alert('✅ Peso guardado');
}

function validarEjercicio(ej) {
    if (!ej.dia || !ej.nombre || isNaN(ej.peso) || isNaN(ej.repeticiones)) {
        alert('⚠️ Completa todos los campos');
        return false;
    }
    return true;
}

function cargarRutinaSemanal() {
    const rutinaSemanal = document.getElementById('rutinaSemanal');
    rutinaSemanal.innerHTML = '';
    
    const dias = [
        'Lunes - Espalda',
        'Martes - Pecho',
        'Miércoles - Pierna',
        'Jueves - Espalda',
        'Viernes - Pecho'
    ];
    
    dias.forEach(dia => {
        const ejerciciosDia = ejercicios.filter(ej => ej.dia === dia);
        if (ejerciciosDia.length === 0) return;
        
        const diaElement = document.createElement('div');
        diaElement.className = 'dia-rutina';
        diaElement.innerHTML = `<h3>${dia}</h3>`;
        
        const ejerciciosUnicos = [];
        const nombresVistos = new Set();
        
        ejerciciosDia.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        ejerciciosDia.forEach((ej, index) => {
            if (!nombresVistos.has(ej.nombre)) {
                nombresVistos.add(ej.nombre);
                ejerciciosUnicos.push({...ej, originalIndex: index});
            }
        });
        
        ejerciciosUnicos.forEach(ej => {
            const ejercicioElement = document.createElement('div');
            ejercicioElement.className = 'ejercicio-item';
            ejercicioElement.innerHTML = `
                <h4>${ej.nombre}</h4>
                <p>${ej.peso}kg × ${ej.repeticiones} repes</p>
                <p>${formatFecha(ej.fecha)}</p>
            `;
            
            const botones = document.createElement('div');
            botones.className = 'botones-edicion';
            botones.innerHTML = `
                <button onclick="editarEjercicio(${ej.originalIndex})">✏️</button>
                <button onclick="eliminarEjercicio(${ej.originalIndex})">🗑️</button>
            `;
            
            ejercicioElement.appendChild(botones);
            diaElement.appendChild(ejercicioElement);
        });
        
        rutinaSemanal.appendChild(diaElement);
    });
}

function cargarHistorialPeso() {
    const historialPeso = document.getElementById('historialPeso');
    historialPeso.innerHTML = '';
    
    if (pesos.length === 0) {
        historialPeso.innerHTML = '<p>No hay registros de peso aún.</p>';
        return;
    }
    
    pesos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    pesos.forEach((p, index) => {
        const registroElement = document.createElement('div');
        registroElement.className = 'registro-peso';
        registroElement.innerHTML = `
            <span class="peso">${p.peso} kg</span>
            <span class="fecha">${formatFecha(p.fecha)}</span>
        `;
        
        const botones = document.createElement('div');
        botones.className = 'botones-edicion';
        botones.innerHTML = `
            <button onclick="editarPeso(${index})">✏️</button>
            <button onclick="eliminarPeso(${index})">🗑️</button>
        `;
        
        registroElement.appendChild(botones);
        historialPeso.appendChild(registroElement);
    });
}

function editarEjercicio(index) {
    const ej = ejercicios[index];
    document.getElementById('diaEntrenamiento').value = ej.dia;
    document.getElementById('nombreEjercicio').value = ej.nombre;
    document.getElementById('pesoLevantado').value = ej.peso;
    document.getElementById('repeticiones').value = ej.repeticiones;
    
    ejercicios.splice(index, 1);
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
    cargarRutinaSemanal();
}

function eliminarEjercicio(index) {
    if (confirm('¿Eliminar este ejercicio?')) {
        ejercicios.splice(index, 1);
        localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
        cargarRutinaSemanal();
    }
}

function editarPeso(index) {
    const p = pesos[index];
    document.getElementById('pesoActual').value = p.peso;
    pesos.splice(index, 1);
    localStorage.setItem('pesos', JSON.stringify(pesos));
    cargarHistorialPeso();
}

function eliminarPeso(index) {
    if (confirm('¿Eliminar este registro de peso?')) {
        pesos.splice(index, 1);
        localStorage.setItem('pesos', JSON.stringify(pesos));
        cargarHistorialPeso();
    }
}

function formatFecha(fechaStr) {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
}