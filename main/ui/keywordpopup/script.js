window.onload = async function () {
    while (!window.pywebview) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
    }
    availableKeywords = await pywebview.api.load_keywords_names();
    loadAll();
};


let currentIndex = 0;

function addKeywordList() {
    let container = document.getElementById("full-keywordslist-container");

    let keywordListDiv = document.createElement("div");
    keywordListDiv.classList.add("full-keyword-list");

    keywordListDiv.innerHTML = `
        <div class="toggle-container">

            <div class="toggle-switch" onclick="toggleKeywordList(this)">
                <div class="toggle-handle"></div>
            </div>
            <span class="toggle-label">OFF</span>
        </div>

        <input type="text" class="keyword-list-name" placeholder="Enter list name">
        
        <div class="keyword-list-content">
            <div class="dropdown-container">
                <select class="allowed-keywords-dropdown">
                    ${availableKeywords.map(kw => `<option value="${kw}">${kw}</option>`).join("")}
                </select>
                <button onclick="addKeyword(this, 'allowed')">✅ Add</button>
            </div>
            <div class="allowed-keywords keyword-list"></div>

            <div class="dropdown-container">
                <select class="disallowed-keywords-dropdown">
                    ${availableKeywords.map(kw => `<option value="${kw}">${kw}</option>`).join("")}
                </select>
                <button onclick="addKeyword(this, 'disallowed')">❌ Add</button>
            </div>
            <div class="disallowed-keywords keyword-list"></div>
        </div>

        <button onclick="removeKeywordList(this)">❌ Remove List</button>
    `;

    container.appendChild(keywordListDiv);


    currentIndex = document.getElementsByClassName("full-keyword-list").length - 1;
    updateVisibility();
}


function toggleKeywordList(switchElement) {

    let label = switchElement.nextElementSibling; // alabama

    if (switchElement.classList.contains("active")) {
        switchElement.classList.remove("active");
        label.textContent = "OFF";
    } else {
        switchElement.classList.add("active");
        label.textContent = "ON";
    }
}


function addKeyword(button, category) {
    let parentDiv = button.parentElement;
    let dropdown = parentDiv.querySelector(`.${category}-keywords-dropdown`);
    let keywordListDiv = parentDiv.nextElementSibling;

    let selectedKeyword = dropdown.value;
    if (!selectedKeyword) return;

    let existingKeywords = [...keywordListDiv.children].map(el => el.dataset.keyword);
    if (existingKeywords.includes(selectedKeyword)) return;

    let keywordItem = document.createElement("span");
    keywordItem.classList.add("keyword-item");
    keywordItem.dataset.keyword = selectedKeyword;
    keywordItem.innerHTML = `${selectedKeyword} <button class="remove-btn" onclick="removeKeyword(this)">✖</button>`;

    keywordListDiv.appendChild(keywordItem);
}

function removeKeyword(button) {
    button.parentElement.remove();
}

function removeKeywordList(button) {
    let container = document.getElementById("full-keywordslist-container");
    let lists = container.getElementsByClassName("full-keyword-list");

    button.parentElement.remove();

    if (currentIndex >= lists.length) {
        currentIndex = Math.max(0, lists.length - 1);
    }

    updateVisibility();
}

function navigate(direction) {
    let lists = document.getElementsByClassName("full-keyword-list");
    if (lists.length === 0) return;

    currentIndex = (currentIndex + direction + lists.length) % lists.length;
    updateVisibility();
}

function updateVisibility() {
    let lists = document.getElementsByClassName("full-keyword-list");

    Array.from(lists).forEach((list, index) => {
        list.style.display = index === currentIndex ? "block" : "none";
    });
}

async function saveAll() {
    let lists = document.getElementsByClassName("full-keyword-list");
    let data = [];

    Array.from(lists).forEach(list => {
        let listName = list.querySelector(".keyword-list-name").value.trim();
        let allowedKeywords = Array.from(list.querySelector(".allowed-keywords").children)
            .map(el => el.dataset.keyword);
        let disallowedKeywords = Array.from(list.querySelector(".disallowed-keywords").children)
            .map(el => el.dataset.keyword);
        let toggleSwitch = list.querySelector(".toggle-switch");
        let toggleState = toggleSwitch.classList.contains("active"); 

        if (listName) {
            data.push({ 
                name: listName, 
                allowed: allowedKeywords, 
                disallowed: disallowedKeywords, 
                toggleState: toggleState 
            });
        }
    });

    await pywebview.api.save_all(data);
    alert("Data saved successfully!");
}

async function loadAll() {
    let container = document.getElementById("full-keywordslist-container");
    container.innerHTML = ""; 

    let data = await pywebview.api.load_all();
    data.forEach(listData => {
        let keywordListDiv = document.createElement("div");
        keywordListDiv.classList.add("full-keyword-list");

        let toggleClass = listData.toggleState ? "active" : "";
        let toggleLabel = listData.toggleState ? "ON" : "OFF";

        keywordListDiv.innerHTML = `
            <div class="toggle-container">

                <div class="toggle-switch ${toggleClass}" onclick="toggleKeywordList(this)">
                    <div class="toggle-handle"></div>
                </div>
                <span class="toggle-label">${toggleLabel}</span>
            </div>

            <input type="text" class="keyword-list-name" value="${listData.name}">

            <div class="keyword-list-content">
                <div class="dropdown-container">
                    <select class="allowed-keywords-dropdown">
                        ${availableKeywords.map(kw => `<option value="${kw}">${kw}</option>`).join("")}
                    </select>
                    <button onclick="addKeyword(this, 'allowed')">✅ Add</button>
                </div>
                <div class="allowed-keywords keyword-list">
                    ${listData.allowed.map(kw => `<span class="keyword-item" data-keyword="${kw}">${kw} <button class="remove-btn" onclick="removeKeyword(this)">✖</button></span>`).join("")}
                </div>

                <div class="dropdown-container">
                    <select class="disallowed-keywords-dropdown">
                        ${availableKeywords.map(kw => `<option value="${kw}">${kw}</option>`).join("")}
                    </select>
                    <button onclick="addKeyword(this, 'disallowed')">❌ Add</button>
                </div>
                <div class="disallowed-keywords keyword-list">
                    ${listData.disallowed.map(kw => `<span class="keyword-item" data-keyword="${kw}">${kw} <button class="remove-btn" onclick="removeKeyword(this)">✖</button></span>`).join("")}
                </div>
            </div>

            <button onclick="removeKeywordList(this)">❌ Remove List</button>
        `;

        container.appendChild(keywordListDiv);
    });

    updateVisibility();
}
