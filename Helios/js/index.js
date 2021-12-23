window.onload = function () {
    main();
}
function main(){
    const mass = document.getElementById("mass").value;
    if( mass < 0.1 ){window.alert("too low mass! It can't be star! (mass ≦ 0.1)")}
    let mass_mks = document.getElementById("mass_mks");
    let luminosity = document.getElementById("luminosity");
    let luminosity_mks = document.getElementById("luminosity_mks");
    mass_mks.innerHTML = (mass * 1.9884e+30).toExponential(4);
    luminosity.innerHTML = Math.pow(Number(mass), 3.9).toExponential(4);
    luminosity_mks.innerHTML = (mass * 3.828e+26).toExponential(4);
}