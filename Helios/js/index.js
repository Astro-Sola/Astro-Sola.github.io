window.onload = function () {
    main();
}
function main(){
    const mass = document.getElementById("mass");
    let mass_sol = document.getElementById("mass_sol");
    let radius = document.getElementById("radius");
    mass_sol.innerHTML = mass.value / 1.9884e+30;
    radius.innerHTML = mass.value;
}