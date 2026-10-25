addEventListener("beforeunload", (event) => {
    clearTeam();
    updateCookies();
})

function loadCookies(){
    if(getCookie("save") == ""){
        setCookie("save","",400);
    }else{
        
    }
    let save = getCookie("save").split("|");
    
    for(let i = 0; i < save.length-1; i++){
        deactivate(save[i]);
    }
}

function updateCookies(){
    let save = "";
    characters.filter((character) => !character.enabled).forEach(
        disabledCharacter => {save += disabledCharacter.id +"|"});

    setCookie("save",save.toString(),400);
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}