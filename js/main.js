///// CONSTANTES y FORMULAS Y FUNCIONES MATEMATICAS //////

/// ELIPSOIDE WGS84 ////

const a = 6378137;
const f = 0.0033528107;
const b = 6356752.31414028  //a * (1-f);
const k = 1;
const n = f / (2 - f)
const fajas_gk_arg = [
    {faja: 1, mc: -72, fe: 1500000},
    {faja: 2, mc: -69, fe: 2500000},
    {faja: 3, mc: -66, fe: 3500000},
    {faja: 4, mc: -63, fe: 4500000},
    {faja: 5, mc: -60, fe: 5500000},
    {faja: 6, mc: -57, fe: 6500000},
    {faja: 7, mc: -54, fe: 7500000},
];

let alfa = ((a + b) / 2) * (1 + (1/4) * Math.pow(n,2) + (1/64) * Math.pow(n,4))
let beta = -3/2*n + (9/16) * Math.pow(n,3) - 3/32 * Math.pow(n,5)
let gamma = 15/16 * Math.pow(n,2) - (15/32 * Math.pow(n,4))
let delta = -35/48*Math.pow(n,3) + (105/256 * Math.pow(n,4))


const falso_norte = 10001965.7292314806;


function gradosAradianes(grados) {
    return ((grados * Math.PI) / 180);
} 

function meridianoCentral(long) {
    if (long >= -73.5 && long < -70.5) {
        return -72
    }
    else if (long >= -70.5 && long < -67.5) {
        return -69
    }
    else if (long >= -67.5 && long < -64.5) {
        return -66
    }
    else if (long >= -64.5 && long < -61.5) {
        return -63
    }
    else if (long >= -61.5 && long < -58.5) {
        return -60
    }
    else if (long >= -58.5 && long < -55.5) {
        return -57
    }
    else if (long >= -55.5 && long < -52.5) {
        return -54
    }
    else return -1
}

function gmsAgrados(g,m,s) {
    let grados
    grados = s / 3600
    grados = grados + (m / 60)
    grados = grados + Math.abs(g)
    return -grados
}

function gradosAgms(grados) {
    let gms = [];
    gms[0] = Math.trunc(grados);
    gms[1] = Math.trunc((grados - gms[0])*60);
    gms[2] = Math.trunc((((grados - gms[0])*60)-gms[1])*60);
    return gms
}

function falsoEste(mc) {
    let falsoEste
    for (const faja of fajas_gk_arg) {
        if (faja.mc == mc) 
            falsoEste = faja.fe
    }
    return falsoEste
}

///// PROGRAMA /////


function calculoGeodesicasAplanas(g_lat,m_lat,s_lat,g_long,m_long,s_long) {
    let lat = gradosAradianes(gmsAgrados(g_lat,m_lat,s_lat))
    console.log("Latitud " + lat)
    let long = gradosAradianes(gmsAgrados(g_long,m_long,s_long))
    console.log("Longitud " + long);
    let long_mc = gradosAradianes(meridianoCentral(gmsAgrados(g_long,m_long,s_long)))
    console.log("Meridiano central " + long_mc)
    console.log("a: " + a)
    console.log("f: " + f)
    console.log("b: " + b)
    let t = Math.tan(lat);
    let l = long - long_mc;
    console.log("t: " + t)
    console.log("l: " + l)
    console.log("n: " + n)
    console.log("alfa: " + alfa)
    console.log("beta: " + beta)
    console.log("gamma: " + gamma)
    console.log("delta: " + delta)
    let eta2 = ((Math.pow(a,2) - Math.pow(b,2)) / Math.pow(b,2)) * (Math.pow(Math.cos(lat),2))
    console.log("eta2 " + eta2)
    let B = alfa * (lat + beta * Math.sin(2*lat)+gamma*Math.sin(4*lat)+delta*Math.sin(6*lat))
    console.log("B(lat): " + B)
    let N = k * ( a*a /Math.sqrt(((a*a*Math.cos(lat)*Math.cos(lat))+(b*b*Math.sin(lat)*Math.sin(lat)))))
    console.log("N(lat): " + N)
    let X = B + 1/2 * N * Math.cos(lat) * Math.cos(lat) * t * l * l + 1/24 * N * Math.pow(Math.cos(lat),4) * t *(5-t*t + 9*eta2)*Math.pow(l,4) + falso_norte
    let Y = N * Math.cos(lat) * l + 1/6 * N * Math.pow(Math.cos(lat),3)*(1-t*t-eta2)*l*l*l+ 1/120*N*Math.pow(Math.cos(lat),5)*(5-18*t*t+Math.pow(t,4))*Math.pow(l,5) + falsoEste(meridianoCentral(gmsAgrados(g_long,m_long,s_long)))
    let coord = [X, Y]
    return coord
}


let lista_coord = []

let btnconvert = document.getElementById("btn-convert")

btnconvert.addEventListener("click",(e)=> {
    let g_lat = document.getElementById("LatGrados").value
    let m_lat = document.getElementById("LatMinutos").value
    let s_lat = document.getElementById("LatSegundos").value
    let g_long = document.getElementById("LongGrados").value
    let m_long = document.getElementById("LongMinutos").value
    let s_long = document.getElementById("LongSegundos").value
    let areacoordplanas = document.getElementById("areacoordplanas")
    let coord_planas = calculoGeodesicasAplanas(g_lat,m_lat,s_lat,g_long,m_long,s_long)
    lista_coord.push(coord_planas)
    console.log(lista_coord)
    let texto_coord = ""
    texto_coord = 'Lat: ' + g_lat + '° '+ m_lat +  '\" ' + s_lat + '\'  ' + ' Long: ' + g_long + '° '+ m_long +  '\" ' + s_long + '\' ->' + '  X = ' + coord_planas[0].toFixed(3) + '  Y = ' + coord_planas[1].toFixed(3) 
    areacoordplanas.value = areacoordplanas.value + '\n' + texto_coord
})



let btnayuda = document.getElementById("help");
let ayudaconversor = document.getElementById("ayuda")

btnayuda.addEventListener("mouseover",(e)=>{
    ayudaconversor.className = "ayuda active";
})
btnayuda.addEventListener("mouseout", (e)=>{
    ayudaconversor.className = "ayuda inactive"
})

