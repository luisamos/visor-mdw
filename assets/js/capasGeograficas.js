import { direccionServicioWMS, formatoPNG, formatoJPEG, direccionServicioMapCache } from './configuracion.js';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';

//Capas base
global.osm = new TileLayer({source: new OSM(), type: 'base', visible: true});
global.sector07 = new TileLayer({source: new TileWMS({url: direccionServicioMapCache, params: {'LAYERS': 'mdw-sector07', 'TILED': true, 'FORMAT': formatoJPEG,}, serverType: 'mapserver', transition: 0}), visible: false});
global.osm.set('id', 'osm');
global.sector07.set('id', 'sector07');

//Capas geográficas
let provincias= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'provincias', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: true,}),
distritos= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'distritos', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
sectores= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'sectores', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: true,}),
manzanas= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'manzanas', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
lotes= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'lotes', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
habilitacionesUrbanas= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'habilitacionesUrbanas', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
serviciosBasicos= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'serviciosBasicos', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
clasificacionPredios= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'clasificacionPredios', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
tiposPersonas= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'tiposPersonas', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
puertas= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'puertas', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
areasInvadidas= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'areasInvadidas', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
parques= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'parques', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
ejeVias= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'ejeVias', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,}),
predios= new ImageLayer({source: new ImageWMS({url: direccionServicioWMS, params: {'LAYERS': 'predios', 'FORMAT': formatoPNG, 'TRANSPARENT': true,}, ratio: 1,}), visible: false,});


provincias.set('id', 'provincias');
distritos.set('id', 'distritos');
sectores.set('id', 'sectores');
manzanas.set('id', 'manzanas');
lotes.set('id', 'lotes');
habilitacionesUrbanas.set('id', 'habilitacionesUrbanas');
serviciosBasicos.set('id', 'serviciosBasicos');
clasificacionPredios.set('id', 'clasificacionPredios');
tiposPersonas.set('id', 'tiposPersonas');
puertas.set('id', 'puertas');
areasInvadidas.set('id', 'areasInvadidas');
parques.set('id', 'parques');
ejeVias.set('id', 'ejeVias');
predios.set('id', 'predios');

export let capasGeograficas= [global.osm, global.sector07, 
    provincias, distritos,
    sectores, manzanas, lotes, habilitacionesUrbanas, serviciosBasicos, clasificacionPredios, tiposPersonas, puertas, areasInvadidas, parques, ejeVias, predios];