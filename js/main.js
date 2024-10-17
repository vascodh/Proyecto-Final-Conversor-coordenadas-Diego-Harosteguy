import {calculoGeodesicasAplanas, gmsAgrados} from "./funcionesconversion.js"

/// Utilizacion de los mapas abiertos de IGN(Instituto geografico Nacional)
/// Documentación https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC/Leaflet

let mimapa = L.map('mapa').setView([-40, -59], 3);
L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_topo@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
    attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
      minZoom: 3,
      maxZoom: 18
}).addTo(mimapa);


//marcador.bindPopup("¡Hola mundo!").openPopup();

async function dataRamsac() {
    try {
        let res = await fetch('.//assets/ramsac.json'),
        dataJson = await res.json();
        console.log(dataJson.features)
    //    dataJson.properties.array.forEach(el => {
    //  });
    dataJson.features.forEach(el => {
        console.log(el.properties.codigo_estacion + ' ' + el.geometry.coordinates[0])
        L.marker([el.geometry.coordinates[1], el.geometry.coordinates[0]], {
            title: `${el.properties.codigo_estacion}`,   
        }).addTo(mimapa);

    });   
    
   
    
        }
    catch(err) {

    }
    finally {

    }
}

dataRamsac()
/*
async function getInfo(lat,long) {
    try {
        let res = await fetch(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${long}`),
        dataJson = await res.json();
        console.log(dataJson);
        console.log(dataJson.ubicacion.municipio.nombre)
        L.marker([lat, long]).addTo(mimapa);
        return json
        }
    catch(err) {

    }
    finally {

    }
}

getInfo(-34.65,-59.427)
*/
/*   
fetch('https://apis.datos.gob.ar/georef/api/ubicacion?lat=-30.21&lon=-67.55')
  .then((res) => (res.ok ? res.json() : Promise.reject(res))) 
  .then(data => {
    info = data 
    console.log(info.ubicacion.municipio.nombre)
    return info})
  .catch((error) => {
    console.log(error)
    let mensaje = error.statusText || 'Falló la consulta a la API, revise su conexión'
    Swal.fire({
        icon: 'error',        
        text: `${error.status}, ${mensaje}`,
        confirmButtonText: 'Entendido!'
      }) }
    );
*/

let lista_coord = []

let i = 1

/// Si hay calculos guardados en el localstorage lo recupera y muesta en el TextArea

let $areacoordplanas = document.querySelector("#areacoordplanas")

if (localStorage.length > 0) {
    i = localStorage.length/2 + 1
    
    for (let j = 1; j <= localStorage.length/2; j++) {
        let coord_x = localStorage.getItem(`x${j}`)
        let coord_y = localStorage.getItem(`y${j}`)    
        $areacoordplanas.value = $areacoordplanas.value  + `${j}) X = ${parseFloat(coord_x).toFixed(3)}   Y = ${parseFloat(coord_y).toFixed(3)} \n`
    }
}

function validarEntrada (g_lat,m_lat,s_lat,g_long,m_long,s_long) {
    const limiteLat = [21.781111,55.05583333]
    const limiteLong = [53.6375,73.566666]
    let lat =  -gmsAgrados(g_lat,m_lat,s_lat)
    let long = -gmsAgrados(g_long,m_long,s_long)
    if (m_lat >= 0 && m_lat <= 60) 
        if (s_lat >= 0 && s_lat <= 60) 
            if (m_long >= 0 && m_long <= 60) 
                if (s_long >= 0 && s_long <= 60) 
                    if ((lat >= limiteLat[0] && lat <= limiteLat[1]) && (long >= limiteLong[0] && long <= limiteLong[1])) {
        return true
    }
    else 
        return false  
}

/// Captura el ingreso de coordenadas
/// Llama a la funcion de calculo
/// Muestra el resultado en el TextArea
/// Guarda los resultados en el local storage


let $btnconvert = document.querySelector("#btn-convert")

$btnconvert.addEventListener("click",(e)=> {
    let g_lat = document.querySelector("#LatGrados").value
    let m_lat = document.querySelector("#LatMinutos").value
    let s_lat = document.querySelector("#LatSegundos").value
    let g_long = document.querySelector("#LongGrados").value
    let m_long = document.querySelector("#LongMinutos").value
    let s_long = document.querySelector("#LongSegundos").value
    if (validarEntrada (g_lat,m_lat,s_lat,g_long,m_long,s_long)) {
        let coord_planas = calculoGeodesicasAplanas(g_lat,m_lat,s_lat,g_long,m_long,s_long)
        lista_coord.push(coord_planas)
        $areacoordplanas.value = $areacoordplanas.value + `${i}) ` + 'X = ' + coord_planas[0].toFixed(3) + '   Y = ' + coord_planas[1].toFixed(3) + '\n' 
        localStorage.setItem(`x${i}`,coord_planas[0])
        localStorage.setItem(`y${i}`,coord_planas[1])
        i = i + 1
    }
    else {
        Swal.fire({
        title: 'Coordenadas inválidas!',
        text: `Asegurarse de no dejar 
               las coordendas vacías y 
               dentro de los rangos admitidos`,
        icon: 'warning',
        confirmButtonText: 'Entendido!'
        })
    }

})

// Sección de AYUDA que aparece en ASIDE

let $btnayuda = document.querySelector("#help");
let $ayudaconversor = document.querySelector("#ayuda")

$btnayuda.addEventListener("mouseover",(e)=>{
    $ayudaconversor.className = "ayuda active";
})
$btnayuda.addEventListener("mouseout", (e)=>{
    $ayudaconversor.className = "ayuda inactive"
})

// Colocación de fechas en el FOOTER

let DateTime = luxon.DateTime;

let fechahoy = DateTime.now()
let $mostrarfecha = document.querySelector("#fecha");
$mostrarfecha.innerText = fechahoy.toLocaleString();


