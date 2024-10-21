import {calculoGeodesicasAplanas, gmsAgrados, gradosAgms} from "./funcionesconversion.js"

/// Utilizacion de los mapas abiertos de IGN(Instituto geografico Nacional)
/// Documentación https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC/Leaflet
/// Se muestra el mapa base

let mimapa = L.map('mapa').setView([-40, -59], 3);

L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_topo@EPSG%3A3857@png/{z}/{x}/{-y}.png', {
    attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | <a href="http://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2" target="_blank">Instituto Geográfico Nacional</a> + <a href="http://www.osm.org/copyright" target="_blank">OpenStreetMap</a>',
      minZoom: 3,
      maxZoom: 18
}).addTo(mimapa);
let pointUser, marker

/// Funcion Fetch + Async Await para cargar datos Json de Provincia y Municipio Argentinos según Latitud y Longitud

async function getInfo(lat,long) {
    try {
        let res = await fetch(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${long}`),
        dataJson = await res.json();

        let  prov = (dataJson.ubicacion.provincia.nombre == null) ? 'Sin datos' : dataJson.ubicacion.provincia.nombre
        let muni = (dataJson.ubicacion.municipio.nombre == null) ? 'Sin datos' : dataJson.ubicacion.provincia.nombre
        
        return {provincia: prov, municipio: muni}
        }
    catch(err) {

    }
    finally {

    }
}



/// Funcion Fetch + Async Await para cargar arhivo GeoJson Local con informacion

async function dataRamsac() {
    let pointName, pointLat, lat, long, pointLong, planas
    try {
        let res = await fetch('.//assets/ramsac.json')
        if(!res.ok) throw {status:res.status}
        let dataJson = await res.json()
        for (let point of dataJson.features) {
            pointName = point.properties.codigo_estacion
            pointLat = point.geometry.coordinates[1]
            pointLong = point.geometry.coordinates[0]
            lat = gradosAgms(pointLat)
            long = gradosAgms(pointLong)
            planas = calculoGeodesicasAplanas(lat[0],lat[1],lat[2],long[0],long[1],long[2])      

            marker = L.marker([pointLat, pointLong], {
                title: `${pointName}`,              
                }).addTo(mimapa).bindPopup(`<b>${pointName}</b><br> 
                    Latitud: ${lat[0]}°${-lat[1]}'${-lat[2]}" S<br>
                    Longitud: ${long[0]}°${-long[1]}'${-long[2]}" O<br>                                               
                    X = ${planas[0].toFixed(2)}<br> 
                    Y = ${planas[1].toFixed(2)}<br>`   
                )
            }      
            for (let point of dataJson.features) {
                pointName = point.properties.codigo_estacion,
                pointLat = point.geometry.coordinates[1],
                pointLong = point.geometry.coordinates[0]
                let info = await getInfo(pointLat,pointLong)
                //console.log(info.provincia + ', ' + info.municipio)
                marker.bindPopup(`
                    <b>${pointName} ???</b><br>
                    <b>${info.provincia} ???</b><br>
                `); 
            }
            console.log('fin carga')
                
    }
    catch(err) {
        let msg = "No se pudieron obtener los datos RAMSAC"
        Swal.fire({
            icon: 'error',        
            text: `Error ${err.status}, ${msg}`,
            confirmButtonText: 'Entendido!'
        }) 
    }
}

dataRamsac()


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

let iconUser = L.icon({
    iconUrl: './/assets/pin.svg',  
    iconSize: [38, 95],            
});

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

        pointUser = L.marker([gmsAgrados(g_lat,m_lat,s_lat), gmsAgrados(g_long,m_long,s_long)], {      
            icon: iconUser,             
        }).addTo(mimapa);
        pointUser.on('click',()=>{
            pointUser.bindPopup(`<b>Punto usuario</b><br>             
                                 X = ${coord_planas[0].toFixed(2)}<br> 
                                 Y = ${coord_planas[1].toFixed(2)}<br>`                                               
                               )
        })
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

// Boton y evento para limpiar textarea y localStorage

let $btndelete = document.querySelector("#btn-delete")

$btndelete.addEventListener("click",(e)=> {
    localStorage.clear();
    $areacoordplanas.value = ''
    i = 1
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


