import './style.css';
import 'bootstrap';

import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import Overlay from 'ol/Overlay.js';

import { proyeccion3857, centroide3857 } from './assets/js/configuracion';
import { capasGeograficas } from './assets/js/capasGeograficas';

// 0. Configuración global
global.cubrir = new Overlay({ element: document.getElementById('popup'), autoPan: { animation: { duration: 250, }, }, });
const controles = defaultControls({ zoom: true, attribution: false, rotate: true });
global.vista = new View({ projection: proyeccion3857, center: centroide3857, zoom: 14 });
global.mapa = new Map({ target: 'map', layers: capasGeograficas, view: global.vista, controls: controles, overlays: [cubrir], });
window.addEventListener('resize', () => { global.mapa.updateSize(); });

// 1. Barra de controles
import './assets/js/barraControles';

// 2. Control de las capas y control Propiedades (Gráfico, identificar, filtro, descargar)
import { obtenerInformacion } from './assets/js/controlCapas';
global.mapa.on('singleclick', function (e) { obtenerInformacion(e); });
const cerrar = document.getElementById('popup-closer');
cerrar.onclick = function () {
    global.cubrir.setPosition(undefined); cerrar.blur(); return false;
};

// 3. Mouse posición y escala
import { mousePosicion, actualizarEscala } from './assets/js/controlMousePosicionEscala';
global.mapa.on('pointermove', mousePosicion);
global.mapa.getView().on('change:resolution', actualizarEscala);
global.mapa.once('rendercomplete', function () { actualizarEscala(); });

// 4. Cargar archivos local
import './assets/js/controlCargarDatos';