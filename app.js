// Auth0 setup
let auth0 = null;

const configureClient = async () => {
    auth0 = await createAuth0Client({
        domain: 'dev-3cjcbsqgkhxf7umj.us.auth0.com',
        client_id: 'K2ejYNi5yXHfvnj4GvCQD20IyXK9mmHv',
        redirect_uri: 'https://app.orchidmedia.io/'
    });
};

window.onload = async () => {
    await configureClient();
    
    const isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {
            await auth0.handleRedirectCallback();
            window.history.replaceState({}, document.title, "/");
        }
        await updateUI();
    }
};

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
        document.body.style.display = 'none';
        auth0.loginWithRedirect();
    }
};

const logout = () => {
    auth0.logout({
        returnTo: 'https://app.orchidmedia.io'
    });
};

//AI image generation code
const submitBtn = document.querySelector("#submit-btn");
const inputElement = document.querySelector("input");
const apiKeyInput = document.querySelector("#api-key-input"); 
const imageSection = document.querySelector(".images-section");
const loader = document.querySelector(".loader");
const logoutButton = document.querySelector("#logout-btn");
const saveBtn = document.querySelector("#save-btn");
const editBtn = document.querySelector("#edit-btn");
const deleteBtn = document.querySelector("#delete-btn");

saveBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    if(apiKey) {
        localStorage.setItem("OpenAI_API_Key", apiKey);
        alert("API Key saved successfully.");
        apiKeyInput.setAttribute('disabled', true); // Disable input after saving
    } else {
        alert("Please enter a valid API Key.");
    }
});

editBtn.addEventListener("click", () => {
    apiKeyInput.removeAttribute('disabled');
    apiKeyInput.focus();
});

deleteBtn.addEventListener("click", () => {
    localStorage.removeItem("OpenAI_API_Key");
    apiKeyInput.value = "";
    apiKeyInput.removeAttribute('disabled');
    alert("API Key deleted successfully.");
});

// When the page loads
document.addEventListener("DOMContentLoaded", () => {
    const storedAPIKey = localStorage.getItem("OpenAI_API_Key");
    if(storedAPIKey) {
        apiKeyInput.value = storedAPIKey;
        apiKeyInput.setAttribute('disabled', true);
    }
});

const getImages = async () => {
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
        alert("Please enter your OpenAI API Key.");
        return;
    }

    const token = await auth0.getIdTokenClaims();

    const options = {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Auth0-Token': token.__raw,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            prompt: inputElement.value,
            n: 4,
            size: "512x512"
        })
    };

    loader.style.display = 'block';  // This displays the loader before async operation

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", options); 
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();      
        data?.data.forEach(ImageObject => {
            const imageContainer = document.createElement("div");
            imageContainer.classList.add('image-container');
            const imageElement =  document.createElement("img");
            imageElement.setAttribute("src", ImageObject.url);
            imageContainer.append(imageElement);
            imageSection.append(imageContainer);
        });

    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = 'none'; 
    }
}

submitBtn.addEventListener("click", getImages);
logoutButton.addEventListener("click", logout);