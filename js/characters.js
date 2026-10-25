const API_URL = "https://api.lunaris.moe/data/7.1.53"
let pickSlots = 3;
let teamSlots = 8;
let rollCount = 1;
let rollCounter = 0;

let characters = [];
let teamCharacters = [];

let selectedElement;

function setRollCount(amount){
    rollCount = amount;
    updateRollCounter();
}

function setPickSlots(amount){
    pickSlots = amount;
    displayPicker();
}

function setTeamSlots(amount){
    teamSlots = amount;
    displayTeams();
}


document.addEventListener('hide.bs.modal', function (event) {
    // Remove the focus from the active element on the modal. Otherwise this could cause issues for assistive tech users
    if (document.activeElement) {
    document.activeElement.blur();
    }
});

async function fetchCharacter(id){
    let response = await fetch(`${API_URL}data/en/character/10000${id}.json`);

    if(!response.ok){
        alert("Server error: " + response.status);
        return;
    }

    return await response.json();
}

async function fetchAllCharacters(){
    let response = await fetch(`${API_URL}/charlist.json`);

    if(!response.ok){
        alert("Server error: " + response.status);
        return;
    }

    return await response.json();
}

async function obtainCharacters(){

    let charactersRaw = await fetchAllCharacters();
    let id = 0;
    Object.values(charactersRaw).forEach(character => {
        if(character.enName == "Manekin" || character.enName == "Manekina" ||
            character.enName == "Traveler"  && (character.CardImg != "UI_Gacha_AvatarIcon_PlayerGirl" || character.element != "Cryo")){

        }else{
            characters.push(new Character(id++, character.enName, character.element.toLowerCase(), character.qualityType,
             "UI"+character.CardImg.slice(8,character.CardImg.length)));
        }
    });
}

function displayCharacters(){
    let container = $("#characterContainer")[0];
    container.innerHTML = "";
    for(i = 0; i < characters.length; i++){
        displayCharacter(container, i);
    }
}

function displayOneCharacter(elementId, characterId){
    let container = $("#"+elementId)[0];
    displayCharacter(container, characterId);
}

function displayPicker(){
    let container = $("#pickerContainer")[0];
    container.innerHTML = "";
    for(let i = 0; i < pickSlots; i ++){
        displayEmptyTeamCharacter(container);
    }
}

function displayTeams(){
    let container = $("#teamContainer")[0];
    container.innerHTML = "";
    for(let i = 0; i < teamSlots; i ++){
        if(i % 4 == 0){
            container.innerHTML+=`<span class="break"></span>`;
        }
        displayEmptyCharacter(container);
    }
}

function updateRollCounter(){
    if(rollCount != -1){
        $("#randomRollCount")[0].innerHTML = rollCount-rollCounter;
    }else{
        $("#randomRollCount")[0].innerHTML = "∞";
    }
}

function randomRoll(){
    rollCounter++;
    updateRollCounter();
    let container = $("#pickerContainer")[0];
    container.innerHTML = "";

    let filteredCharacters = characters.filter((character) => character.enabled);
    shuffleArray(filteredCharacters);

    for(let i = 0; i < pickSlots; i ++){
        if(i >= filteredCharacters.length){
            displayEmptyTeamCharacter(container);
        }else{
            displayAbyssCharacter(container, filteredCharacters[i].id); 
        }
    }

    enableContainerClicks("pickerContainer");
    disableContainerClicks("characterContainer");
    disableButton("settingsButton");
    disableButton("disableButton");
    disableButton("enableButton");
    if(rollCounter >= rollCount && rollCount !=-1){
        disableButton("randomRollButton");
    }
}

function checkIfFinished(){
    rollCounter = 0;
    updateRollCounter();

     if(characters.filter((character) => character.enabled) <= 0 || teamCharacters.length == teamSlots){
        disableButton("randomRollButton");
        enableContainerClicks("teamContainer");
        disableContainerClicks("pickerContainer");
    }else{
        enableButton("randomRollButton");
    }
}

function setCurrentPick(element){
    selectedElement = element;
    enableContainerClicks("teamContainer");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function swapNodes(a, b) {
    var aparent = a.parentNode;
    var asibling = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, asibling);

    //please do this more elegantly 
    disableContainerClicks("pickerContainer");
    disableContainerClicks("teamContainer");
    teamCharacters.push(characters[b.id]);
    b.style["pointer-events"] = "none";
    selectedElement = null;
    characters[b.id].enabled = false;

    checkIfFinished();
}

function clearTeam(){
    for(let i = 0; i < teamCharacters.length; i++){
        teamCharacters[i].enabled = true;
    }
    teamCharacters = [];
}

function enableAll(){
    for(let i = 0; i < characters.length; i++){
        characters[i].enabled = true;
        addClassRemoveClass(i, 'enabledCard', 'disabledCard');
    }
}

function disableAll(){
    for(let i = 0; i < characters.length; i++){
        characters[i].enabled = false;
        addClassRemoveClass(i, 'disabledCard', 'enabledCard');
    }
}

function disableButton(elementId){
    addClassRemoveClass(elementId, 'disabled', 'enabled');
}

function enableButton(elementId){
    addClassRemoveClass(elementId, 'enabled', 'disabled');
}

function enableContainerClicks(elementId){
    addClassRemoveClass(elementId, "pointersEnabled", "pointersDisabled");
}

function disableContainerClicks(elementId){
    addClassRemoveClass(elementId, "pointersDisabled", "pointersEnabled");
}

function addClassRemoveClass(elementId, addedClass, removedClass){
    $("#"+elementId).removeClass(removedClass);
    $("#"+elementId).addClass(addedClass);
}

function displayCharacter(container, id){
    container.innerHTML += `
        <div class="card m-2 rounded-4" onclick="deactivate(this.id)" id ="${i}">
            <img src="https://api.lunaris.moe/data/assets/avataricon/${characters[id].icon}.webp" class="card-img-top rounded-4"  
            style="background-color:${characters[id].rank == "QUALITY_ORANGE" ? "#985f2d" : "#6a5d92" };">
            <img src="images/${characters[id].element}.png" class="element-icon">
            <div class="my-auto">
                <div class="card-title text-center fw-bold">${characters[id].name}</div>
            </div>
        </div>
        `;
}

function displayAbyssCharacter(container, id){
    container.innerHTML += `
        <div class="card m-2 rounded-4 enabledCard" onclick="setCurrentPick(this)" id ="${id}">
            <img src="https://api.lunaris.moe/data/assets/avataricon/${characters[id].icon}.webp" class="card-img-top rounded-4"  
            style="background-color:${characters[id].rank == "QUALITY_ORANGE" ? "#985f2d" : "#6a5d92" };">
            <img src="images/${characters[id].element}.png" class="element-icon">
            <div class="my-auto">
                <div class="card-title text-center fw-bold">${characters[id].name}</div>
            </div>
        </div>
        `;
}

function displayEmptyCharacter(container){
    container.innerHTML += `
        <div class="card m-2 rounded-4" onclick="swapNodes(this, selectedElement)">
            <img src="" class="card-img-top rounded-4">
            <img src="" class="element-icon">
            <div class="my-auto">
                <div class="card-title text-center fw-bold"></div>
            </div>
        </div>
        `;
}

function displayEmptyTeamCharacter(container){
    container.innerHTML += `
        <div class="card m-2 rounded-4">
            <img src="" class="card-img-top rounded-4">
            <img src="" class="element-icon">
            <div class="my-auto">
                <div class="card-title text-center fw-bold"></div>
            </div>
        </div>
        `;
}

function getColorFromElement(element){
    console.log(element);
    switch(element){
        case "hydro": return "#08e2ff";
        case "pyro": return "#ef7a35";
        case "electro": return "#b08fc2";
        case "anemo": return "#75c2aa";
        case "cryo": return "#a0d7e4";
        case "dendro": return "#b1e929";
        case "geo": return "#f2d669";
    }
}

/*
function deleteSelf(element){
    element.remove();
}
*/

function deactivate(id){
    characters[id].enabled = !characters[id].enabled;
    if(characters[id].enabled){
        addClassRemoveClass(id,'enabledCard','disabledCard');
    }else{
        addClassRemoveClass(id,'disabledCard','enabledCard');
    }
}

function clearState(){
    rollCounter = 0;
    updateRollCounter();

    displayTeams();
    displayPicker();
    clearTeam();
    
    enableButton("disableButton");
    enableButton("enableButton");
    enableButton("randomRollButton");
    enableButton("settingsButton");

    enableContainerClicks("characterContainer");
    disableContainerClicks("teamContainer");
    disableContainerClicks("pickerContainer");
}

async function initPage(){
    await obtainCharacters();
    displayCharacters();
    clearState();
    loadCookies();
}
