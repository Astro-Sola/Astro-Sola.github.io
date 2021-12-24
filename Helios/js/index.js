window.onload = function () {
    main();
}
function main(){
    // constants parameter
    const SB_const = 5.670374419e-8;
    // import
    const mass = document.getElementById("mass").value;
    if( mass < 0.2 ){
        window.alert("too low mass! it can't get Earth like planet!");
        document.getElementById("mass").value = 1;
    }
    if( mass > 20 ){
        window.alert("too high mass! it can't get Earth like planet!");
        document.getElementById("mass").value = 1;
    }

    // calcuation star mass
    let mass_mks = mass * 1.9884e+30;
    // calcuation star luminosity
    let luminosity = calcLuminosity(mass);
    let luminosity_mks = mass * 3.839e+26;
    // calcuation star radius
    let radius = Math.pow(mass, 0.78);
    let radius_mks = radius * 6.960e+8;
    // calcuation star temperature
    let temperature = Math.pow(luminosity_mks / (4 * Math.PI * SB_const * Math.pow(radius_mks, 2)), 0.25);
    let temperature_c = temperature - 273.15;
    // calcuation

    // output
    output("mass_mks", mass_mks);
    output("luminosity", luminosity, 1);
    output("luminosity_mks", luminosity_mks);
    output("radius", radius, 1);
    output("radius_mks", radius_mks);
    output("temperature", temperature, 1);
    output("temperature_c", temperature_c, 1);
}
function calcLuminosity(mass) {
    let luminosity;
    if(mass >= 0.2 && mass < 0.85){
        let lum_exp = -141.7 * Math.pow(mass,4) + 232.4 * Math.pow(mass,3) -129.1 * Math.pow(mass,2) + 33.29 * mass + 0.125;
        luminosity = Math.pow(mass, lum_exp);
        console.log(luminosity);
    }
    if(mass >= 0.85 && mass < 2.0){
        luminosity = Math.pow(mass, 4);
    }
    if(mass >= 2 && mass < 20){
        luminosity = Math.pow(mass, 3.5) * 1.4;
    }
    return luminosity;

}
function output(Id, param, mode) {
    switch(mode){
        case 1 :document.getElementById(Id).innerHTML = Number(param).toFixed(2);break;
        default :document.getElementById(Id).innerHTML = Number(param).toExponential(2);
    }
}