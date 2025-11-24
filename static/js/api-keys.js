// API Key Management
let userApiKey = localStorage.getItem('openrouter_api_key') || '';

function setApiKey(key) {
    userApiKey = key;
    localStorage.setItem('openrouter_api_key', key);
}

function getApiKey() {
    return userApiKey;
}

export { setApiKey, getApiKey };