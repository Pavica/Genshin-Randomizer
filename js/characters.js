const API_URL = "https://api.hakush.in/gi/"
const PICK_SLOTS = 3;
const TEAM_SLOTS = 8;
let characters = [];
let teamCharacters = []

let selectedElement;

async function fetchCharacter(id){
    let response = await fetch(`${API_URL}data/en/character/10000${id}.json`);

    if(!response.ok){
        alert("Server error: " + response.status);
        return;
    }

    return await response.json();
}

async function fetchAllCharacters(){
    let response = await fetch(`${API_URL}data/character.json`);

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
        if(character.EN != "Manekin" && character.EN != "Manekina" && character.EN != "Traveler"){
            characters.push(new Character(id++, character.EN, character.element, character.rank, character.icon));
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
    for(let i = 0; i < PICK_SLOTS; i ++){
        displayEmptyTeamCharacter(container);
    }
}

function displayTeams(){
    let container = $("#teamContainer")[0];
    container.innerHTML = "";
    for(let i = 0; i < TEAM_SLOTS; i ++){
        if(i % 4 == 0){
            container.innerHTML+=`<span class="break"></span>`;
        }
        displayEmptyCharacter(container);
    }
}

function randomize(){
    let container = $("#pickerContainer")[0];
    container.innerHTML = "";

    filteredCharacters = characters.filter((character) => character.enabled);
    shuffleArray(filteredCharacters);

    for(let i = 0; i < PICK_SLOTS; i ++){
        if(i >= filteredCharacters.length){
            displayEmptyTeamCharacter(container);
        }else{
            displayAbyssCharacter(container, filteredCharacters[i].id); 
        }
    }

    enableContainerClicks("pickerContainer");
    disableContainerClicks("characterContainer");
    disableButton("disableButton");
    disableButton("enableButton");
}

function checkIfFinished(){
     if(characters.filter((character) => character.enabled) <= 0 || teamCharacters.length == TEAM_SLOTS){
        disableButton("randomizeButton");
        enableContainerClicks("teamContainer");
        disableContainerClicks("pickerContainer");
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
        <div class="card m-2 rounded-4" onclick="deactivate(this)" id ="${i}">
            <img src="https://api.hakush.in/gi/UI/${characters[id].icon}.webp" class="card-img-top rounded-4"  style="background-color:${characters[id].rank == "QUALITY_ORANGE" ? "#985f2d" : "#6a5d92" };">
            <img src="https://api.hakush.in/gi/UI/${characters[id].element}.webp" class="element-icon">
            <div class="">
                <div class="card-title text-center fw-bold">${characters[id].name}</div>
            </div>
        </div>
        `;
}

function displayAbyssCharacter(container, id){
    container.innerHTML += `
        <div class="card m-2 rounded-4 enabledCard" onclick="setCurrentPick(this)" id ="${id}">
            <img src="https://api.hakush.in/gi/UI/${characters[id].icon}.webp" class="card-img-top rounded-4"  style="background-color:${characters[id].rank == "QUALITY_ORANGE" ? "#985f2d" : "#6a5d92" };">
            <img src="https://api.hakush.in/gi/UI/${characters[id].element}.webp" class="element-icon">
            <div class="">
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
            <div class="">
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
            <div class="">
                <div class="card-title text-center fw-bold"></div>
            </div>
        </div>
        `;
}

function getColorFromElement(element){
    console.log(element);
    switch(element){
        case "Hydro": return "#08e2ff";
        case "Pyro": return "#ef7a35";
        case "Electro": return "#b08fc2";
        case "Anemo": return "#75c2aa";
        case "Cryo": return "#a0d7e4";
        case "Dendro": return "#b1e929";
        case "Geo": return "#f2d669";
    }
}

/*
function deleteSelf(element){
    element.remove();
}
*/

function deactivate(element){
    characters[element.id].enabled = !characters[element.id].enabled;
    if(characters[element.id].enabled){
        addClassRemoveClass(element.id,'enabledCard','disabledCard');
    }else{
        addClassRemoveClass(element.id,'disabledCard','enabledCard');
    }
}

function clearState(){
    displayTeams();
    displayPicker();
    clearTeam();
    
    enableButton("disableButton");
    enableButton("enableButton");
    enableButton("randomizeButton");

    enableContainerClicks("characterContainer");
    disableContainerClicks("teamContainer");
    disableContainerClicks("pickerContainer");
}

async function initPage(){
    await obtainCharacters();
     displayCharacters();
    clearState();
}
