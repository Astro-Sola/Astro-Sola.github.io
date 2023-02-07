function openPage(pageName, element, color){
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("contents-tabcontent");
    for(i=0; i < tabcontent.length; i++){
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("contents-tablink");
    for(i=0; i < tabcontent.length; i++){
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    element.style.backgroundColor = color;
}
document.getElementById("defaultOpen").click();