/****************************************
 * DATA
 ****************************************/
let currentLogoUrl = "";
let currentBgUrl   = "";
let cardsData = [];

/****************************************
 * FETCH DATA FROM GOOGLE SHEET
 ****************************************/
function fetchSheetData() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4Bt4dWNrC6sqJLEWWO361WZW4zAj1Wfs7ltPZSdxJx5zaNOWu-EfeBqKdvVEOaAkx357tZr3COnAh/pub?gid=0&single=true&output=csv";

  fetch(sheetUrl)
    .then(response => response.text())
    .then(csvText => {
      // Use Papa Parse to handle commas, quotes, newlines
      const parsed = Papa.parse(csvText, {
        skipEmptyLines: true,
      });
      // parsed.data is an array of rows, each row is an array of cells

      let newLogoUrl = "";
      let newBgUrl   = "";
      let newCardsData = [];

      parsed.data.forEach(row => {
        const rowType = row[0] || "";
        if (rowType === "LogoLink") {
          newLogoUrl = row[1] || "";
        } else if (rowType === "BackgroundLink") {
          newBgUrl = row[1] || "";
        } else if (rowType.startsWith("Card")) {
          // columns: [0]CardX, [1]title, [2]thumbnail, [3]embedCode, [4]description
          const title       = row[1] || "";
          const thumbnail   = row[2] || "";
          const embedCode   = row[3] || "";
          const description = row[4] || "";
          newCardsData.push({ title, thumbnail, embedCode, description });
        }
      });

      // Update our kiosk variables
      currentLogoUrl = newLogoUrl;
      currentBgUrl   = newBgUrl;
      cardsData      = newCardsData;

      // Render the UI
      updateLogoAndBackground();
      renderCards();
    })
    .catch(err => {
      console.error("Error fetching or parsing sheet CSV:", err);
    });
}

/****************************************
 * SELECTORS
 ****************************************/
const logoEl          = document.getElementById("logo");
const mainContentEl   = document.getElementById("mainContent");
const cardContainerEl = document.getElementById("cardContainer");

// Lightbox
const lightboxEl       = document.getElementById("lightbox");
const closeLightboxBtn = document.getElementById("closeLightboxBtn");
const lbTitleEl        = document.getElementById("lbTitle");
const lbVideoContainer = document.getElementById("videoContainer");
const lbDescriptionEl  = document.getElementById("lbDescription");

/****************************************
 * KIOSK INIT ON WINDOW LOAD
 ****************************************/
window.addEventListener("load", () => {
  console.log("Window loaded. Fetching sheet data...");
  fetchSheetData(); // after fetch completes, it calls renderCards() etc.
});

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

    const descEl = document.createElement("div");
    descEl.classList.add("description");
    descEl.textContent = card.description;
    contentDiv.appendChild(descEl);

    cardDiv.appendChild(contentDiv);

    // Lightbox click
    cardDiv.addEventListener("click", () => {
      console.log("Opening lightbox for card:", card.title);
      openLightbox(card);
    });

    cardContainerEl.appendChild(cardDiv);
  });
}

/****************************************
 * LIGHTBOX
 ****************************************/
function openLightbox(card) {
  // Set the title & description
  lbTitleEl.textContent       = card.title;
  lbDescriptionEl.textContent = card.description;

  // Put the embed code inside #videoContainer
  lbVideoContainer.innerHTML  = card.embedCode || "";

  // Show the lightbox
  lightboxEl.classList.remove("hidden");
  console.log("Lightbox shown. lightboxEl.classList:", lightboxEl.classList.value);
}

closeLightboxBtn.addEventListener("click", () => {
  console.log("Close Lightbox clicked. Hiding lightbox...");
  lightboxEl.classList.add("hidden");
  lbVideoContainer.innerHTML = ""; // remove iframe to stop video
  console.log("Lightbox hidden. lightboxEl.classList:", lightboxEl.classList.value);
});

/****************************************
 * HELPER: LOGO/BG
 ****************************************/
function updateLogoAndBackground() {
  console.log("Updating logo and background...");
  logoEl.src = currentLogoUrl;
  mainContentEl.style.backgroundImage = `url('${currentBgUrl}')`;
}
