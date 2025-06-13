import shp from 'shpjs';

const columnasExcluidas = ["objectid", "globalid", "shape__are", "shape__len"];
const opcionesValidas = ["cod_sector", "cod_mzna", "cod_lote"];
const archivoZip = document.getElementById("archivoZip");
const btnCargarArchivoZip = document.getElementById("btnCargarArchivoZip");
const columnasArchivoShape = document.getElementById("columnasArchivoShape");

btnCargarArchivoZip.addEventListener("click", async () => {
    const file = archivoZip.files[0];
    if (!file) {
        alert("Por favor selecciona un archivo .zip");
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();

        // `shp` puede leer directamente el ZIP como ArrayBuffer
        const geojson = await shp(arrayBuffer);
        const properties = geojson.features[0]?.properties;

        if (!properties) {
            alert("No se encontraron propiedades en el shapefile.");
            return;
        }

        mostrarCampos(Object.keys(properties));
    } catch (error) {
        console.error("Error al procesar el shapefile:", error);
        alert("No se pudo leer el archivo ZIP.");
    }
});

function mostrarCampos(columnas) {
    columnasArchivoShape.innerHTML = "";

    columnas.forEach((col, index) => {
        const colLower = col.toLowerCase();

        if (columnasExcluidas.includes(colLower)) {
            return;
        }

        const seleccion = opcionesValidas.includes(colLower) ? colLower : "ninguna";

        const row = document.createElement("div");
        row.className = "row mb-2 align-items-center";

        row.innerHTML = `
        <div class="col-md-6">
            <input type="text" class="form-control" value="${col}" readonly>
        </div>
        <div class="col-md-6">
            <select class="form-select" name="use_${index}">
            <option value="-1" ${seleccion === "ninguna" ? "selected" : ""}>[Ninguna]</option>
            <option value="cod_sector" ${seleccion === "cod_sector" ? "selected" : ""}>cod_sector</option>
            <option value="cod_mzna" ${seleccion === "cod_mzna" ? "selected" : ""}>cod_mzna</option>
            <option value="cod_lote" ${seleccion === "cod_lote" ? "selected" : ""}>cod_lote</option>
            </select>
        </div>
        `;
        columnasArchivoShape.appendChild(row);
    });
}