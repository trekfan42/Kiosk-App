/****************************************
 * SELECTORS (Ensure these IDs exist in HTML)
 ****************************************/
const logoEl = document.getElementById("logo");
const mainContentEl = document.getElementById("mainContent");
const cardContainerEl = document.getElementById("cardContainer");

// Lightbox Elements
const lightboxEl = document.getElementById("lightbox");
const closeLightboxBtn = document.getElementById("closeLightboxBtn");
const lbTitleEl = document.getElementById("lbTitle");
const lbVideoContainer = document.getElementById("videoContainer");
const lbDescriptionEl = document.getElementById("lbDescription");

/****************************************
 * DATA STORAGE
 ****************************************/
let currentLogoUrl = "";
let currentBgUrl = "";
let cardsData = [];

/****************************************
 * FETCH JSON URL FROM QUERY PARAMETER
 ****************************************/
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get JSON URL from query or use default
const jsonUrl = "https://gist.githubusercontent.com/trekfan42/3819f088f8a08869d568a1eff5c2ce1f/raw/80436915f5ef476d7cd4645e99036147934b3a47/gistfile1.txt" ;

console.log("Using JSON URL:", jsonUrl); // Debugging log

/****************************************
 * FETCH DATA FROM JSON FILE
 ****************************************/
async function fetchJSONData() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) throw new Error("Failed to fetch JSON file.");
        
        const jsonData = await response.json();
        console.log("JSON Data:", jsonData); // Debugging log

        let newLogoUrl = "";
        let newBgUrl = "";
        let newCardsData = [];

        jsonData.forEach(row => {
            const rowType = row["Title"] || "";

            if (rowType === "LogoURL") {
                newLogoUrl = row["LinkURL"] || "";
            } else if (rowType === "BackgroundURL") {
                newBgUrl = row["LinkURL"] || "";
            } else if (rowType.startsWith("Card")) {
                const title = row["CardTitle"] || "";
                const thumbnail = row["LinkURL"] || "";
                const shortDescription = row["ShortDescription"] || "";
                const fullDescription = row["Description"] || "";
                const embedCode = row["EmbedCode"] || "";

                newCardsData.push({ title, thumbnail, shortDescription, fullDescription, embedCode });
            }
        });

        // Update global variables
        currentLogoUrl = newLogoUrl;
        currentBgUrl = newBgUrl;
        cardsData = newCardsData;

        updateLogoAndBackground();
        renderCards();
    } catch (error) {
        console.error("Error fetching JSON data:", error);
        alert("Failed to load JSON. Please check the URL.");
    }
}

/****************************************
 * WINDOW LOAD: Fetch JSON on Page Load
 ****************************************/
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Fetching JSON data...");

    fetchJSONData().then(() => {
        console.log("JSON successfully loaded.");
    });
});

/****************************************
 * UPDATE LOGO & BACKGROUND
 ****************************************/
function updateLogoAndBackground() {
    console.log("Updating logo and background...");

    if (logoEl) {
        logoEl.src = currentLogoUrl;
    } else {
        console.warn("logoEl is not found in the document.");
    }

    if (mainContentEl) {
        mainContentEl.style.backgroundImage = `url('${currentBgUrl}')`;
    } else {
        console.warn("mainContentEl is not found in the document.");
    }
}

/****************************************
 * RENDER CARDS
 ****************************************/
function renderCards() {
    console.log("Rendering main page cards...");
    cardContainerEl.innerHTML = "";

    cardsData.forEach(card => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        // Thumbnail
        const imgEl = document.createElement("img");
        imgEl.src = card.thumbnail;
        cardDiv.appendChild(imgEl);

        // Content
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");

        const titleEl = document.createElement("div");
        titleEl.classList.add("title");
        titleEl.textContent = card.title;
        contentDiv.appendChild(titleEl);

        // Use `ShortDescription` instead of full description
        const descEl = document.createElement("div");
        descEl.classList.add("description");
        descEl.textContent = card.shortDescription; // Now using ShortDescription

        contentDiv.appendChild(descEl);
        cardDiv.appendChild(contentDiv);

        // Lightbox click (Full description is still in the lightbox)
        cardDiv.addEventListener("click", () => {
            console.log("Opening lightbox for card:", card.title);
            openLightbox(card);
        });

        cardContainerEl.appendChild(cardDiv);
    });
}

/****************************************
 * LIGHTBOX FUNCTIONALITY
 ****************************************/
function openLightbox(card) {
    lbTitleEl.textContent = card.title;
    lbDescriptionEl.textContent = card.fullDescription; // Use Full Description
    lbVideoContainer.innerHTML = card.embedCode || "";

    lightboxEl.classList.remove("hidden");
}

if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener("click", () => {
        if (lightboxEl) {
            lightboxEl.classList.add("hidden");
            console.log("Lightbox hidden.");
        }
        if (lbVideoContainer) {
            lbVideoContainer.innerHTML = ""; // Remove iframe to stop video
        }
    });
}
</script>
