

const titleBar = document.getElementById('title-bar');
const closeButton = document.getElementById('close-btn');
const minimizeButton = document.getElementById('minimize-btn');

let keywordsList = [];
let keywordsnames = [];
let servers = [];
let isDragging = false;
let startX, startY, windowStartX, windowStartY;

window.onload = async function () {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    await loadHotkeys()
    await loadConfig()
    await setEventListeners()
    await loadKeywords()
    await loadServers()
};

async function loadKeywords() {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    const result1 = await pywebview.api.get_keywords();

    
    
    if (Array.isArray(result1)) {
        keywordsList = result1;
        updateKeywordsDisplay();
        
    }

}

async function loadServers() {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }

    const result = await pywebview.api.get_servers();
    servers = result
    populateServerList();

}

titleBar.addEventListener('mousedown', async (e) => {
    e.preventDefault(); 
    isDragging = true;
    startX = e.screenX; 
    startY = e.screenY;

    const position = await window.pywebview.api.get_window_position();
    windowStartX = position.x;
    windowStartY = position.y;

});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || isNaN(windowStartX) || isNaN(windowStartY)) return;

    const deltaX = e.screenX - startX;
    const deltaY = e.screenY - startY;
    const newX = windowStartX + deltaX;
    const newY = windowStartY + deltaY;

    window.pywebview.api.move_window(newX, newY);
});

document.addEventListener('mouseup', () => {

    isDragging = false;
});


closeButton.addEventListener("click", function() {
    window.pywebview.api.close_window(); 
});


minimizeButton.addEventListener("click", function() {
    window.pywebview.api.minimize_window(); 
});

async function setEventListeners() {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }

    const elements = [
        { id: 'btn-glitch', setting: 'glitch', label: 'Glitch Sniping' },
        { id: 'btn-dream', setting: 'dream', label: 'Dreamspace Sniping' },
        { id: 'btn-jester', setting: 'jester', label: 'Jester Sniping' },
        { id: 'btn-void', setting: 'voidcoin', label: 'Void Coin Sniping' },
        { id: 'btn-Sniper-Notifications', setting: 'toast', label: 'Sniper Notifications' },
        { id: 'checkbox1', setting: 'checkbox1', label: 'Hotkey1 Sniping' },
        { id: 'checkbox2', setting: 'checkbox2', label: 'Hotkey2 Sniping' }
    ];

    elements.forEach(({ id, setting, label }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', async function () {
                const state = this.checked ? 'True' : 'False';
                console.log(`${label} ${state}`);
                await pywebview.api.toggle_settings(setting, state);
            });
        }
    });
}

const hotkeys = [// why tf does renaming this to "keys" makes the api stop responding ;-;
    { display: "A", value: "a" }, { display: "B", value: "b" }, { display: "C", value: "c" }, { display: "D", value: "d" }, 
    { display: "E", value: "e" }, { display: "F", value: "f" }, { display: "G", value: "g" }, { display: "H", value: "h" }, 
    { display: "I", value: "i" }, { display: "J", value: "j" }, { display: "K", value: "k" }, { display: "L", value: "l" }, 
    { display: "M", value: "m" }, { display: "N", value: "n" }, { display: "O", value: "o" }, { display: "P", value: "p" }, 
    { display: "Q", value: "q" }, { display: "R", value: "r" }, { display: "S", value: "s" }, { display: "T", value: "t" }, 
    { display: "U", value: "u" }, { display: "V", value: "v" }, { display: "W", value: "w" }, { display: "X", value: "x" }, 
    { display: "Y", value: "y" }, { display: "Z", value: "z" },

    { display: "0", value: "0" }, { display: "1", value: "1" }, { display: "2", value: "2" }, { display: "3", value: "3" }, 
    { display: "4", value: "4" }, { display: "5", value: "5" }, { display: "6", value: "6" }, { display: "7", value: "7" }, 
    { display: "8", value: "8" }, { display: "9", value: "9" },

    { display: "F1", value: "Key.f1" }, { display: "F2", value: "Key.f2" }, { display: "F3", value: "Key.f3" }, 
    { display: "F4", value: "Key.f4" }, { display: "F5", value: "Key.f5" }, { display: "F6", value: "Key.f6" }, 
    { display: "F7", value: "Key.f7" }, { display: "F8", value: "Key.f8" }, { display: "F9", value: "Key.f9" }, 
    { display: "F10", value: "Key.f10" }, { display: "F11", value: "Key.f11" }, { display: "F12", value: "Key.f12" },

    { display: "ArrowUp", value: "Key.up" }, { display: "ArrowDown", value: "Key.down" }, 
    { display: "ArrowLeft", value: "Key.left" }, { display: "ArrowRight", value: "Key.right" },

    { display: "Shift", value: "Key.shift" }, {display: "RightShift", value: "Key.shift_r"}, { display: "Ctrl", value: "Key.ctrl" }, { display: "Alt", value: "Key.alt" }, 
    { display: "Tab", value: "Key.tab" }, { display: "CapsLock", value: "Key.caps_lock" }, { display: "Enter", value: "Key.enter" }, 
    { display: "Space", value: "Key.space" }, { display: "Backspace", value: "Key.backspace" }, { display: "Delete", value: "Key.delete" }, 
    { display: "Insert", value: "Key.insert" }, { display: "Home", value: "Key.home" }, { display: "End", value: "Key.end" }, 
    { display: "PageUp", value: "Key.page_up" }, { display: "PageDown", value: "Key.page_down" }, { display: "Esc", value: "Key.esc" },

    { display: "`", value: "Key.grave" }, { display: "-", value: "Key.minus" }, { display: "=", value: "Key.equal" },
    { display: "[", value: "Key.left_bracket" }, { display: "]", value: "Key.right_bracket" }, { display: "\\", value: "Key.backslash" },
    { display: ";", value: "Key.semicolon" }, { display: "'", value: "Key.apostrophe" }, { display: ",", value: "Key.comma" },
    { display: ".", value: "Key.period" }, { display: "/", value: "Key.slash" },

    { display: "PrintScreen", value: "Key.print_screen" }, { display: "ScrollLock", value: "Key.scroll_lock" },
];


const hotkeysMap = new Map(hotkeys.flatMap(({ display, value }) => [[display, value], [value, display]]));

function getHotkeyMapping(input) {
    return hotkeysMap.get(input) || null;
}

function populateDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    hotkeys.forEach(key => {
        let option = document.createElement("option");
        option.value = key.value;
        option.textContent = key.display;
        dropdown.appendChild(option);
    });
}

async function loadConfig() {
    
    
    const snipingConfig = await pywebview.api.send_sniping_config();
    document.getElementById('btn-glitch').checked = snipingConfig.glitchsniping;
    document.getElementById('btn-dream').checked = snipingConfig.dreamsniping;
    document.getElementById('btn-jester').checked = snipingConfig.jestersniping;
    document.getElementById('btn-void').checked = snipingConfig.voidcoinsniping;
    document.getElementById('btn-Sniper-Notifications').checked = snipingConfig.toast_notifications;

    document.getElementById('Token').value = snipingConfig.token;

    document.getElementById('checkbox1').value = snipingConfig.open_roblox_toggle;
    document.getElementById('hotkey1').value = snipingConfig.open_roblox;

    document.getElementById('checkbox2').value = snipingConfig.stop_sniper_toggle;
    document.getElementById('hotkey2').value = snipingConfig.stop_sniper;

};

async function loadHotkeys() {
    populateDropdown("hotkey1");
    populateDropdown("hotkey2");

    function setupHotkeyListener(selectId, hotkeyID) {
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            selectElement.addEventListener("change", async function () {
                await pywebview.api.change_hotkey(hotkeyID, selectElement.value);
            });
        }
    }

    setupHotkeyListener("hotkey1", "hotkey1");
    setupHotkeyListener("hotkey2", "hotkey2");
};

function populateServerList() {
    const serverList = document.getElementById("server-list");
    serverList.innerHTML = "";

    servers.forEach(server => {
        let option = document.createElement("option");
        option.value = server.id;  
        option.textContent = server.name; 
        serverList.appendChild(option);
    });
}

document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", updateResult);
});

document.querySelectorAll("input[type='checkbox']").forEach((checkbox, index) => {
    const dropdown = document.getElementById(`hotkey${index + 1}`);
    checkbox.addEventListener("change", function() {
        dropdown.disabled = !this.checked;
        updateResult();
    });
});

function updateResult() {
    const selectedHotkeys = [];
    document.querySelectorAll(".dropdown-container").forEach((container, index) => {
        const checkbox = container.querySelector("input[type='checkbox']");
        const dropdown = container.querySelector("select");
        if (checkbox.checked) {
            selectedHotkeys.push(dropdown.value);
        }
    });
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

class Server {


    constructor(name, id, channelIds = [], triggers = [], categories = []) {
        this.name = name;
        this.id = id;
        this.channelIds = channelIds;
        this.triggers = triggers;
        this.categories = categories
        this.loadKeywordsInServer(); 
    }

    async loadKeywordsInServer() {
        this.keywords = await pywebview.api.load_all_current_keywords();
    }

    toJSON() {
        return {
            name: this.name,
            id: this.id,
            channelIds: this.channelIds,
            triggers: this.triggers,
            categories: this.categories,
            keywords: this.keywords
        };
    }
}



function showAddServerForm() {
    document.getElementById("add-server-form").style.display = "block"; // hello me from the past this is you from 35 min into the future thank you for placing a random W here and breaking all the code <3
}


function cancelAddServer() {

    document.getElementById("add-server-form").style.display = "none";
    document.getElementById("new-server-name").value = "";
    document.getElementById("new-server-id").value = "";
    document.getElementById("new-channel-ids").value = "";
    document.getElementById("new-trigger-name").value = "";
    document.getElementById("added-triggers-container").innerHTML = "";
    document.getElementById("trigger-ids-container").innerHTML = "";
}


function resetAddServer() {
    document.querySelectorAll("#keyword-container-servers div").forEach(keywordDiv => {
        const keywordButton = keywordDiv.querySelector("button");
        keywordButton.style.backgroundColor = "white";
        keywordButton.textContent = "⬜";
    });
    triggersList = []
}

function addServer() {
    const name = document.getElementById("new-server-name").value;
    const id = document.getElementById("new-server-id").value;
    const channelIds = document.getElementById("new-channel-ids").value.split(",").map(id => id.trim()).filter(id => id);
    const categoryIds = document.getElementById("new-category-ids").value.split(",").map(id => id.trim()).filter(id => id);

    if (!name || !id) {
        alert("Server Name and Server ID are required!");
        return;
    }

    const newServer = new Server(name, id, channelIds,triggersList,categoryIds);
    servers.push(newServer);

    window.pywebview.api.save_server(newServer)

    populateServerList();
    resetAddServer()
    cancelAddServer();
}


let triggersList = [];

function addTrigger() {
    const triggerNameInput = document.getElementById("new-trigger-name");
    const triggerName = triggerNameInput.value.trim();

    if (!triggerName) {
        alert("Please enter a trigger name.");
        return;
    }


    if (triggersList.some(trigger => trigger.name === triggerName)) {
        alert("Trigger name already exists.");
        return;
    }


    triggersList.push({ name: triggerName, ids: [] });


    updateTriggersDisplay();

    triggerNameInput.value = "";
}

function removeTrigger(triggerName) {
    triggersList = triggersList.filter(trigger => trigger.name !== triggerName);
    updateTriggersDisplay();
}

function updateTriggerIDs(triggerName, inputField) {
    const trigger = triggersList.find(t => t.name === triggerName);
    if (trigger) {
        trigger.ids = inputField.value.split(",").map(id => id.trim()).filter(id => id !== "");
    }
}

function updateTriggersDisplay() {
    const container = document.getElementById("added-triggers-container");
    container.innerHTML = ""; 

    triggersList.forEach(trigger => {
        const triggerDiv = document.createElement("div");
        triggerDiv.style.display = "flex";
        triggerDiv.style.alignItems = "center";
        triggerDiv.style.gap = "10px";


        const triggerText = document.createElement("span");
        triggerText.textContent = trigger.name;

        const idsInput = document.createElement("input");
        idsInput.type = "textss";
        idsInput.placeholder = "Enter Triggers";
        idsInput.value = trigger.ids.join(", ");
        idsInput.oninput = () => updateTriggerIDs(trigger.name, idsInput);


        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.className = "button"
        removeButton.onclick = () => removeTrigger(trigger.name);
        

        triggerDiv.appendChild(triggerText);
        triggerDiv.appendChild(idsInput);
        triggerDiv.appendChild(removeButton);
        container.appendChild(triggerDiv);
    });
}

function editServer() {
    cancelAddServer();
    const serverList = document.getElementById("server-list");
    const selectedIndex = serverList.selectedIndex;

    if (selectedIndex === -1) {
        alert("Please select a server to edit.");
        return;
    }

    const selectedServer = servers[selectedIndex];

    document.getElementById("new-server-name").value = selectedServer.name;
    document.getElementById("new-server-id").value = selectedServer.id;
    document.getElementById("new-channel-ids").value = selectedServer.channelIds.join(", ");
    document.getElementById("new-category-ids").value = selectedServer.categories.join(", ");

    triggersList = [...selectedServer.triggers];
    updateTriggersDisplay();

    if (selectedServer.fullkeywords) {
        window.pywebview.api.save_keywords_to_file(selectedServer.fullkeywords);
    }

    document.getElementById("add-server-form").style.display = "block";
    document.getElementById("add-server-form").setAttribute("data-edit-index", selectedIndex);

    const addButton = document.querySelector("#add-server-form button[onclick='addServer()']");
    addButton.textContent = "Update Server";
    addButton.setAttribute("onclick", "saveEditedServer()");
}


function saveEditedServer() {
    const editIndex = document.getElementById("add-server-form").getAttribute("data-edit-index");
    if (editIndex === null) {
        addServer();
        return;
    }
    
    const name = document.getElementById("new-server-name").value;
    const id = document.getElementById("new-server-id").value;
    const channelIds = document.getElementById("new-channel-ids").value.split(",").map(id => id.trim()).filter(id => id);
    const categoryIds = document.getElementById("new-category-ids").value.split(",").map(id => id.trim()).filter(id => id);
    
    
    if (!name || !id) {
        alert("Server Name and Server ID are required!");
        return;
    }
    

    servers.splice(editIndex, 1);
    const updatedServer = new Server(name, id, channelIds, triggersList, categoryIds);
    servers.push(updatedServer);
    

    window.pywebview.api.save_server(updatedServer);
    
    populateServerList();
    resetAddServer();
    cancelAddServer();
    
    const updateButton = document.querySelector("#add-server-form button[onclick='saveEditedServer()']");
    updateButton.textContent = "Add Server";
    updateButton.setAttribute("onclick", "addServer()");
}

function deleteServer() {
    const serverList = document.getElementById("server-list");
    const selectedIndex = serverList.selectedIndex;
    
    if (selectedIndex === -1) {
        alert("Please select a server to delete.");
        return;
    }
    
    const confirmDelete = confirm("Are you sure you want to delete this server?");
    if (!confirmDelete) {
        return;
    }
    
    servers.splice(selectedIndex, 1);
    window.pywebview.api.delete_server(selectedIndex);

    populateServerList();
}

function openKeywordPopup() {
    window.pywebview.api.open_keyword_popup()
}


async function addKeyword() {
    const keywordInput = document.getElementById("new-keyword");
    const keyword = keywordInput.value.trim();

    if (!keyword) {
        alert("Please enter a keyword.");
        return;
    }

    if (keywordsList.some(k => k.name === keyword)) {
        alert("Keyword already exists.");
        return;
    }

    let result = await pywebview.api.add_keyword(keyword);
    if (result.success) {
        keywordsList.push({ name: keyword, ids: [] });
        updateKeywordsDisplay();
        keywordInput.value = "";
    } else {
        alert(result.error);
    }
}

async function removeKeyword(keywordName) {
    let result = await pywebview.api.remove_keyword(keywordName);
    if (result.success) {
        keywordsList = keywordsList.filter(k => k.name !== keywordName);
        updateKeywordsDisplay();
    }
}

async function updateKeywordIDs(keywordName, inputField) {
    const keyword = keywordsList.find(k => k.name === keywordName);
    if (keyword) {
        keyword.ids = inputField.value.split(",").map(id => id.trim()).filter(id => id !== "");
        await pywebview.api.update_keyword_ids(keywordName, keyword.ids);
    }
}

function updateKeywordsDisplay() {
    const container = document.getElementById("added-keywords-container");
    container.innerHTML = ""; 

    keywordsList.forEach(keyword => {
        const keywordDiv = document.createElement("div");
        keywordDiv.style.display = "flex";
        keywordDiv.style.alignItems = "center";
        keywordDiv.style.gap = "10px";

        const keywordText = document.createElement("span");
        keywordText.textContent = keyword.name + ": ";

        const idsInput = document.createElement("input");
        idsInput.type = "textssLONG";
        idsInput.placeholder = "Enter keywords (comma-separated)";
        idsInput.value = keyword.ids.join(", ");
        idsInput.oninput = () => updateKeywordIDs(keyword.name, idsInput);

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.type = "button";
        removeButton.className = "button";
        removeButton.onclick = () => removeKeyword(keyword.name);

        keywordDiv.appendChild(keywordText);
        keywordDiv.appendChild(idsInput);
        keywordDiv.appendChild(removeButton);
        container.appendChild(keywordDiv);
    });
}


async function startSniping() {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    await pywebview.api.set_token(document.getElementById('Token').value)
    await pywebview.api.start_sniping()
}

function openDonate() {
    window.open('https://www.roblox.com/games/14223553469/40-precent-off#!/store', '_blank');// very sgimatic you should click on that link :3
}

function openDiscord() {
    window.open('https://discord.gg/8CZadsbsdk', '_blank');// also very cool link O:
}