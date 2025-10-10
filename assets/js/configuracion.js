import * as bootstrap from "bootstrap";
const IS_DEV = true,
  HOST = "http://127.0.0.2";

global.activoInformacion;
function direccionWeb() {
  const direccion = window.location.hostname;
  if (direccion === "192.168.1.16") return "http://192.168.1.16:80";
  else return "http://209.45.78.210:9100";
}

export const centroide3857 = [-8009512.641541751, -1520541.7489204113],
  proyeccion3857 = "EPSG:3857",
  proyeccion4326 = "EPSG:4326",
  proyeccion32717 = "EPSG:32717",
  proyeccion32718 = "EPSG:32718",
  proyeccion32719 = "EPSG:32719",
  //direccionWeb= 'http://192.168.100.17',
  direccionServicioWMS = (IS_DEV ? HOST : direccionWeb()) + "/servicio/wms?",
  direccionServicioWFS = (IS_DEV ? HOST : direccionWeb()) + "/servicio/wfs?",
  //direccionServicioMapCache= 'http://209.45.78.210:9100/cgi-bin/mapcache/?',
  direccionServicioMapCache = direccionWeb() + "/cgi-bin/mapcache/?",
  direccionApiGIS = IS_DEV
    ? "http://127.0.0.2:5000/"
    : "http://209.45.78.210:9101/",
  formatoPNG = "image/png",
  formatoJPEG = "image/jpeg",
  formatoJson = "application/json",
  formatoGeoJson = "geojson",
  formatoTexto = "text/html",
  colores = [
    {
      id: "provincias",
      texto:
        '<div class="legend-item"><i style="background:#26a69a;"></i> Provincias</div>',
    },
    {
      id: "distritos",
      texto:
        '<div class="legend-item"><i style="background:#26a69a;"></i> Distritos</div>',
    },
    {
      id: "sectores",
      texto:
        '<div class="legend-item"><i style="background:#9900cc;"></i> Sectores</div>',
    },
    {
      id: "manzanas",
      texto:
        '<div class="legend-item"><i style="background:#00ffff;"></i> Manzanas</div>',
    },
    {
      id: "lotes",
      texto: `<div class="legend-item"><strong>Lotes</strong></div>
                        <div class="legend-item2"><i style="background:#646b63;"></i> Con Ficha</div>
                        <div class="legend-item2"><i style="background:#ff6600;"></i> Sin Ficha</div>
                        <div class="legend-item"></div>`,
    },
    {
      id: "habilitacionesUrbanas",
      texto:
        '<div class="legend-item"><i style="background:#0000ff"></i> Habilitaciones Urbanas</div>',
    },
    {
      id: "serviciosBasicos",
      texto: `<div class="legend-item"><strong>Servicios básicos</strong></div>
        <div class="legend-item2"><i style="background:#00aae4"></i> Luz</div>
        <div class="legend-item2"><i style="background:#6ae1ff"></i> Agua</div>
        <div class="legend-item2"><i style="background:#593cc5"></i> Desague</div>
        <div class="legend-item2"><i style="background:#eeeec4"></i> Gas</div>
        <div class="legend-item2"><i style="background:#efeeff"></i> Internet</div>
        <div class="legend-item2"><i style="background:#ff9d44"></i> TvCable</div>
        <div class="legend-item"></div>`,
    },
    {
      id: "clasificacionPredios",
      texto: `<div class="legend-item"><strong>Clasificación de Predios</strong></div>
        <div class="legend-item2"><i style="background:#073763"></i> Casa - Habitación</div>
        <div class="legend-item2"><i style="background:#0b5394"></i> Tienda - Depósito - Almacen</div>
        <div class="legend-item2"><i style="background:#3d85c6"></i> Predios en edificación</div>
        <div class="legend-item2"><i style="background:#9fc5e8"></i> Terreno sin construcción</div>
        <div class="legend-item2"><i style="background:#6fa8dc"></i> Otros</div>
        <div class="legend-item"></div>`,
    },
    {
      id: "tiposPersonas",
      texto: `<div class="legend-item"><strong>Tipos de personas</strong></div>
            <div class="legend-item2"><i style="background:#3bc500"></i> Persona natural</div>
            <div class="legend-item2"><i style="background:#005700"></i> Persona jurídica</div>
            <div class="legend-item"></div>`,
    },
    {
      id: "puertas",
      texto: `<div class="legend-item"><strong>Puertas</strong></div>
                <div class="legend-item2"><i style="background:#000000"></i> P</div>
                <div class="legend-item2"><i style="background:#ff0000"></i> S</div>
                <div class="legend-item2"><i style="background:#ffff00"></i> G</div>
                <div class="legend-item"></div>`,
    },
    {
      id: "areasInvadidas",
      texto:
        '<div class="legend-item"><i style="background:#f44336"></i> Áreas invadidas</div>',
    },
    {
      id: "parques",
      texto:
        '<div class="legend-item"><i style="background:#073763"></i> Parques</div>',
    },
    {
      id: "ejeVias",
      texto:
        '<div class="legend-item"><i style="background:#adadad"></i> Eje de vías</div>',
    },
    {
      id: "predios",
      texto:
        '<div class="legend-item"><i style="background:#9a7051"></i> Predios SBN</div>',
    },
  ];

export function fechaHoy() {
  const fecha = new Date(),
    dia = String(fecha.getDate()).padStart(2, "0"),
    mes = String(fecha.getMonth() + 1).padStart(2, "0"),
    año = fecha.getFullYear();
  return dia + "" + mes + "" + año;
}

export function buscarCapaId(id) {
  return (
    global.mapa
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === id) || null
  );
}

export function mostrarToast(mensaje, color = "primary") {
  const toastEl = document.getElementById("toastNotificacion");
  const toastBody = toastEl.querySelector(".toast-body");

  toastBody.textContent = mensaje;
  toastEl.className = `toast align-items-center text-white bg-${color} border-0`;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
