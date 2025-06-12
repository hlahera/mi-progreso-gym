// Datos
let ejercicios = JSON.parse(localStorage.getItem('ejercicios')) || [];
let pesos = JSON.parse(localStorage.getItem('pesos')) || [];

// Función para generar ID único
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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
        id: generarId(),
        dia: document.getElementById('diaEntrenamiento').value,
        nombre: document.getElementById('nombreEjercicio').value.trim(),
        series: parseInt(document.getElementById('series').value),
        peso: parseFloat(document.getElementById('pesoLevantado').value),
        unidad: document.getElementById('unidadPeso').value,
        repMin: parseInt(document.getElementById('repMin').value),
        repMax: parseInt(document.getElementById('repMax').value),
        fecha: new Date().toISOString().split('T')[0]
    };
    
    if (!validarEjercicio(ejercicio)) return;
    
    ejercicios.push(ejercicio);
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
    
    forms.ejercicio.reset();
    cargarRutinaSemanal();
    mostrarNotificacion('Ejercicio guardado correctamente');
}

function guardarPeso(e) {
    e.preventDefault();
    
    const registro = {
        id: generarId(),
        peso: parseFloat(document.getElementById('pesoActual').value),
        unidad: document.getElementById('unidadPesoActual').value,
        fecha: new Date().toISOString().split('T')[0]
    };
    
    if (isNaN(registro.peso)) {
        mostrarNotificacion('Ingresa un peso válido', 'error');
        return;
    }
    
    pesos.push(registro);
    localStorage.setItem('pesos', JSON.stringify(pesos));
    
    forms.peso.reset();
    cargarHistorialPeso();
    mostrarNotificacion('Peso guardado correctamente');
}

function validarEjercicio(ej) {
    if (!ej.dia || !ej.nombre || isNaN(ej.series) || isNaN(ej.peso) || 
        isNaN(ej.repMin) || isNaN(ej.repMax) || ej.repMin > ej.repMax) {
        mostrarNotificacion('Completa todos los campos correctamente', 'error');
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
        diaElement.innerHTML = `<h3><i class="fas fa-calendar-day"></i> ${dia}</h3>`;
        
        ejerciciosDia.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const ejerciciosUnicos = [];
        const nombresVistos = new Set();
        
        ejerciciosDia.forEach(ej => {
            if (!nombresVistos.has(ej.nombre)) {
                nombresVistos.add(ej.nombre);
                ejerciciosUnicos.push(ej);
            }
        });
        
        ejerciciosUnicos.forEach(ej => {
            const ejercicioElement = document.createElement('div');
            ejercicioElement.className = 'ejercicio-item';
            ejercicioElement.innerHTML = `
                <h4><i class="fas fa-dumbbell"></i> ${ej.nombre}</h4>
                <p><i class="fas fa-layer-group"></i> ${ej.series} series</p>
                <p><i class="fas fa-weight-hanging"></i> ${ej.peso} ${ej.unidad} × ${ej.repMin}-${ej.repMax} repes</p>
                <p><i class="fas fa-calendar"></i> ${formatFecha(ej.fecha)}</p>
            `;
            
            const botones = document.createElement('div');
            botones.className = 'botones-edicion';
            botones.innerHTML = `
                <button onclick="editarEjercicio('${ej.id}')"><i class="fas fa-edit"></i></button>
                <button onclick="eliminarEjercicio('${ej.id}')"><i class="fas fa-trash"></i></button>
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
    
    pesos.forEach(p => {
        const registroElement = document.createElement('div');
        registroElement.className = 'registro-peso';
        registroElement.innerHTML = `
            <div class="info-peso">
                <span class="peso"><i class="fas fa-weight-hanging"></i> ${p.peso} ${p.unidad}</span>
                <span class="fecha"><i class="fas fa-calendar"></i> ${formatFecha(p.fecha)}</span>
            </div>
        `;
        
        historialPeso.appendChild(registroElement);
    });
}

function editarEjercicio(id) {
    const ej = ejercicios.find(e => e.id === id);
    if (!ej) return;
    
    document.getElementById('diaEntrenamiento').value = ej.dia;
    document.getElementById('nombreEjercicio').value = ej.nombre;
    document.getElementById('series').value = ej.series;
    document.getElementById('pesoLevantado').value = ej.peso;
    document.getElementById('unidadPeso').value = ej.unidad;
    document.getElementById('repMin').value = ej.repMin;
    document.getElementById('repMax').value = ej.repMax;
    
    ejercicios = ejercicios.filter(e => e.id !== id);
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
    cargarRutinaSemanal();
    mostrarNotificacion('Ejercicio cargado para editar');
}

function eliminarEjercicio(id) {
    if (confirm('¿Eliminar este ejercicio?')) {
        ejercicios = ejercicios.filter(e => e.id !== id);
        localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
        cargarRutinaSemanal();
        mostrarNotificacion('Ejercicio eliminado');
    }
}

function formatFecha(fechaStr) {
    const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `<i class="fas fa-${tipo === 'exito' ? 'check-circle' : 'exclamation-circle'}"></i> ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// Hacer funciones accesibles globalmente (solo las de ejercicios)
window.editarEjercicio = editarEjercicio;
window.eliminarEjercicio = eliminarEjercicio;
