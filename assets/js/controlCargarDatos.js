import shp from "shpjs";
import { direccionApiGIS, mostrarToast } from "./configuracion";

const configuracionCapas = {
  "01": {
    path: "sectores",
    campos: [
      { id: "cod_sector", payloadKey: "codigoSector", label: "COD_SECTOR" },
    ],
    columnasResumen: [{ key: "codSector", titulo: "Sector" }],
  },
  "02": {
    path: "manzanas",
    campos: [
      { id: "cod_sector", payloadKey: "codigoSector", label: "COD_SECTOR" },
      { id: "cod_mzna", payloadKey: "codigoManzana", label: "COD_MZNA" },
    ],
    columnasResumen: [
      { key: "codSector", titulo: "Sector" },
      { key: "codManzana", titulo: "Manzana" },
    ],
  },
  "03": {
    path: "lotes",
    campos: [
      { id: "cod_sector", payloadKey: "codigoSector", label: "COD_SECTOR" },
      { id: "cod_mzna", payloadKey: "codigoManzana", label: "COD_MZNA" },
      { id: "cod_lote", payloadKey: "codigoLote", label: "COD_LOTE" },
    ],
    columnasResumen: [
      { key: "codSector", titulo: "Sector" },
      { key: "codManzana", titulo: "Manzana" },
      { key: "codLote", titulo: "Lote" },
    ],
  },
};

const columnasExcluidas = [
  "fid",
  "id",
  "objectid",
  "globalid",
  "shape__are",
  "shape__len",
];
const archivoZip = document.getElementById("archivoZip");
const btnCargarArchivoZip = document.getElementById("btnCargarArchivoZip");
const columnasArchivoShape = document.getElementById("columnasArchivoShape");
const tablasGeograficas = document.getElementById("tablasGeograficas");
const btnConfirmarCarga = document.getElementById("btnConfirmarCarga");
const resultadoValidacion = document.getElementById("resultadoValidacion");
const btnLimpiarArchivo = document.getElementById("limpiarArchivo");

let nombreCarpetaActual = null;

let ultimoPayloadValidacion = null;
let validacionEnCurso = false;

let columnasDisponibles = [];

btnCargarArchivoZip.addEventListener("click", async () => {
  const file = archivoZip.files[0];
  if (!file) {
    mostrarToast("Por favor selecciona un archivo .zip", "error");
    return;
  }

  const configActual = configuracionCapas[tablasGeograficas.value];
  if (!configActual) {
    mostrarToast(
      "La capa seleccionada no está configurada para carga masiva.",
      "warning"
    );
    return;
  }
  btnCargarArchivoZip.disabled = true;
  nombreCarpetaActual = null;
  ultimoPayloadValidacion = null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const geojson = await shp(arrayBuffer);
    const properties = geojson.features[0]?.properties;

    if (!properties) {
      mostrarToast("No se encontraron propiedades en el shapefile.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${direccionApiGIS}${configActual.path}/subir_shapefile`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Error al subir el archivo");

    const data = await response.json();

    if (!data.estado) {
      mostrarToast(`⚠ ${data.mensaje}`, "warning");
      return;
    }

    nombreCarpetaActual = data.nombreCarpeta;
    mostrarToast(`✅ ${data.mensaje}`, "success");

    mostrarCampos(Object.keys(properties));
    resultadoValidacion.innerHTML =
      '<div class="alert alert-secondary">Selecciona las columnas para validar el shapefile.</div>';
    archivoZip.disabled = true;
    tablasGeograficas.disabled = true;
    btnCargarArchivoZip.style.display = "none";

    const selects = columnasArchivoShape.querySelectorAll(
      'select[name^="map_"]'
    );
    if (!selects.length) {
      const { payload } = construirPayloadValidacion();
      const payloadJson = JSON.stringify(payload);
      await ejecutarValidacion(payload, payloadJson);
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarToast("Error al procesar o subir el shapefile", "danger");
    nombreCarpetaActual = null;
  } finally {
    btnCargarArchivoZip.disabled = false;
  }
});

function mostrarCampos(columnas) {
  columnasDisponibles = columnas;

  const columnasFiltradas = columnas.filter(
    (col) => !columnasExcluidas.includes(col.toLowerCase())
  );

  const configActual = configuracionCapas[tablasGeograficas.value];
  const camposFijos = configActual?.campos ?? [];

  columnasArchivoShape.innerHTML = "";
  resultadoValidacion.innerHTML = "";
  btnConfirmarCarga.style.display = "none";

  camposFijos.forEach((campo) => {
    const row = document.createElement("div");
    row.className = "row mb-2 align-items-center";

    const opciones = columnasFiltradas
      .map((col) => {
        const seleccionado = col.toLowerCase() === campo.id.toLowerCase();
        return `<option value="${col}" ${
          seleccionado ? "selected" : ""
        }>${col}</option>`;
      })
      .join("");

    row.innerHTML = `
        <div class="col-md-6">
            <input type="text" class="form-control" value="${campo.label}" readonly>
        </div>
        <div class="col-md-6">
            <select class="form-select" name="map_${campo.id}">
            <option value="">[Elegir]</option>
            ${opciones}
            </select>
        </div>
        `;

    columnasArchivoShape.appendChild(row);
  });

  const selects = columnasArchivoShape.querySelectorAll('select[name^="map_"]');
  const todosSeleccionados =
    selects.length > 0 &&
    Array.from(selects).every((select) => Boolean(select.value));

  if (todosSeleccionados) {
    selects[selects.length - 1].dispatchEvent(
      new Event("change", { bubbles: true })
    );
  }
}

columnasArchivoShape.addEventListener("change", async () => {
  if (!nombreCarpetaActual) return;

  const { payload, completo } = construirPayloadValidacion();

  if (!completo) {
    ultimoPayloadValidacion = null;
    resultadoValidacion.innerHTML =
      '<div class="alert alert-warning">Selecciona una columna para cada campo requerido.</div>';
    btnConfirmarCarga.style.display = "none";
    return;
  }

  const payloadJson = JSON.stringify(payload);
  if (payloadJson === ultimoPayloadValidacion || validacionEnCurso) return;

  await ejecutarValidacion(payload, payloadJson);
});

btnConfirmarCarga.addEventListener("click", async () => {
  if (!nombreCarpetaActual) {
    mostrarToast("No hay datos validados para cargar.", "warning");
    return;
  }

  btnConfirmarCarga.disabled = true;

  try {
    const configActual = configuracionCapas[tablasGeograficas.value];
    if (!configActual) {
      mostrarToast(
        "La capa seleccionada no está configurada para la carga.",
        "warning"
      );
      return;
    }

    const payload = {
      nombreCarpeta: nombreCarpetaActual,
      id_usuario: 1,
    };

    const cargarResp = await fetch(
      `${direccionApiGIS}${configActual.path}/cargar_shapefile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!cargarResp.ok) throw new Error("Error al cargar los datos");

    const cargarData = await cargarResp.json();

    if (cargarData.estado) {
      mostrarToast(`✅ ${cargarData.mensaje}`, "success");
      resultadoValidacion.innerHTML = crearResumenCarga(cargarData);
      limpiarFormulario({ mantenerResultados: true });
    } else {
      mostrarToast(`⚠ ${cargarData.mensaje}`, "warning");
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarToast("❌ Error al cargar los datos", "danger");
  } finally {
    btnConfirmarCarga.disabled = false;
  }
});

function mostrarResultadoValidacion(reporte, configActual) {
  if (!reporte.length) {
    resultadoValidacion.innerHTML =
      '<div class="alert alert-warning">No se encontraron registros válidos.</div>';
    return;
  }

  const total = reporte.reduce(
    (sum, item) => sum + (Number(item.totalRegistros) || 0),
    0
  );

  const columnasResumen = configActual?.columnasResumen || [
    { key: "codSector", titulo: "Sector" },
  ];

  const encabezados = columnasResumen
    .map((columna) => `<th>${columna.titulo}</th>`)
    .join("");

  const filas = reporte
    .map((item) => {
      const celdas = columnasResumen
        .map((columna) => `<td>${item[columna.key] ?? "-"}</td>`)
        .join("");

      return `
        <tr>
            ${celdas}
            <td class="text-end">${item.totalRegistros ?? 0}</td>
        </tr>
    `;
    })
    .join("");

  resultadoValidacion.innerHTML = `
        <div class="alert alert-info">
            Se validaron <strong>${total}</strong> registros correctamente.
        </div>
        <div class="table-responsive">
            <table class="table table-sm mb-0">
                <thead>
                    <tr>
                        ${encabezados}
                        <th class="text-end">Registros válidos</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                </tbody>
            </table>
        </div>
    `;
}

function crearResumenCarga({
  registrosHistorico = 0,
  registrosInsertados = 0,
}) {
  return `
        <div class="alert alert-success mt-2">
            <p class="mb-1">Registros históricos actualizados: <strong>${registrosHistorico}</strong></p>
            <p class="mb-0">Registros insertados: <strong>${registrosInsertados}</strong></p>
        </div>
    `;
}

btnLimpiarArchivo.addEventListener("click", () => {
  limpiarFormulario();
});

function construirPayloadValidacion() {
  const configActual = configuracionCapas[tablasGeograficas.value];
  const payload = {
    nombreCarpeta: nombreCarpetaActual,
  };

  if (!configActual) {
    return { payload, completo: true };
  }

  let completo = true;

  configActual.campos.forEach((campo) => {
    const select = columnasArchivoShape.querySelector(
      `select[name="map_${campo.id}"]`
    );

    if (!select) return;

    payload[campo.payloadKey] = select.value;

    if (!select.value) {
      select.classList.add("is-invalid");
      completo = false;
    } else {
      select.classList.remove("is-invalid");
    }
  });

  return { payload, completo };
}

async function ejecutarValidacion(payload, payloadJson) {
  try {
    validacionEnCurso = true;
    resultadoValidacion.innerHTML =
      '<div class="alert alert-info">Validando shapefile...</div>';
    btnConfirmarCarga.style.display = "none";

    const configActual = configuracionCapas[tablasGeograficas.value];
    if (!configActual) {
      mostrarToast(
        "La capa seleccionada no está configurada para validación.",
        "warning"
      );
      return;
    }

    const validarResp = await fetch(
      `${direccionApiGIS}${configActual.path}/validar_shapefile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!validarResp.ok) throw new Error("Error al validar el archivo");

    const validarData = await validarResp.json();

    if (!validarData.estado) {
      mostrarToast(`⚠ ${validarData.mensaje}`, "warning");
      resultadoValidacion.innerHTML =
        '<div class="alert alert-warning">No se pudo validar el shapefile.</div>';
      ultimoPayloadValidacion = null;
      return;
    }

    ultimoPayloadValidacion = payloadJson;

    mostrarToast(`✅ ${validarData.mensaje}`, "success");
    mostrarResultadoValidacion(
      validarData.reporte || [],
      configuracionCapas[tablasGeograficas.value]
    );
    btnConfirmarCarga.style.display = "block";
    btnConfirmarCarga.disabled = false;
  } catch (error) {
    console.error("Error:", error);
    mostrarToast("❌ Error en la validación", "danger");
    resultadoValidacion.innerHTML =
      '<div class="alert alert-danger">Ocurrió un problema al validar el shapefile.</div>';
    ultimoPayloadValidacion = null;
  } finally {
    validacionEnCurso = false;
  }
}

function limpiarFormulario({ mantenerResultados = false } = {}) {
  archivoZip.value = "";
  archivoZip.disabled = false;
  columnasArchivoShape.innerHTML = "";
  if (!mantenerResultados) {
    resultadoValidacion.innerHTML = "";
  }
  btnConfirmarCarga.style.display = "none";
  btnConfirmarCarga.disabled = false;
  btnCargarArchivoZip.style.display = "";
  btnCargarArchivoZip.disabled = false;
  tablasGeograficas.value = "01";
  tablasGeograficas.disabled = false;
  nombreCarpetaActual = null;
  ultimoPayloadValidacion = null;
  validacionEnCurso = false;
}
