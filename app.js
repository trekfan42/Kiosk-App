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
 * FETCH DATA FROM JSON FILE
 ****************************************/
const jsonUrl = "./data.json"; // Relative path to JSON file

async function fetchJSONData() {
  try {
      const response = await fetch(jsonUrl);
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
    console.log("Full Card Data:", card);

    lbTitleEl.textContent = card.title || "No Title";
    lbDescriptionEl.textContent = card.fullDescription || "No Description Available";

    let videoThumbnail = document.getElementById("videoThumbnail");
    if (card.thumbnail) {
        console.log("Thumbnail URL Set:", card.thumbnail);
        videoThumbnail.src = card.thumbnail;
    } else {
        console.error("No thumbnail found in card data.");
    }

    if (card.embedCode) {
        document.getElementById("thumbnailContainer").dataset.embedCode = card.embedCode;
    } else {
        console.error("No embedCode found in card data.");
    }

    lightboxEl.classList.remove("hidden");

    // 🚀 Disable scrolling and set black background
    document.body.classList.add("no-scroll");
    document.documentElement.style.backgroundColor = "black"; // Fixes iPad white bar issue
}

// Open the Fullscreen Video Modal when the thumbnail is clicked
document.getElementById("thumbnailContainer").addEventListener("click", function () {
    let embedCode = this.dataset.embedCode;
    let videoContainer = document.getElementById("videoContainer");

    if (embedCode) {
        videoContainer.innerHTML = embedCode;
        document.getElementById("videoModal").classList.remove("hidden");
    } else {
        console.error("No embed code found.");
    }
});

// Close Video Modal
document.getElementById("closeVideoModalBtn").addEventListener("click", function () {
    document.getElementById("videoContainer").innerHTML = "";
    document.getElementById("videoModal").classList.add("hidden");
});

// 🚀 Close Lightbox and Restore Scrolling
document.getElementById("closeLightboxBtn").addEventListener("click", function () {
    lightboxEl.classList.add("hidden");


    // Clear video when lightbox closes
    document.getElementById("videoContainer").innerHTML = ""; 

    // 🚀 Re-enable scrolling and remove forced background color
    document.body.classList.remove("no-scroll");
    document.documentElement.style.backgroundColor = ""; // Restore normal background
});

let startX = 0;
let startY = 0;
let isScrollingHorizontally = false;

document.getElementById("cardContainer").addEventListener("touchstart", function (event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    isScrollingHorizontally = false; // Reset flag on touch start
}, { passive: false });

document.getElementById("cardContainer").addEventListener("touchmove", function (event) {
    let deltaX = event.touches[0].clientX - startX;
    let deltaY = event.touches[0].clientY - startY;

    // If user swiped more horizontally than vertically, allow scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        isScrollingHorizontally = true; // User is swiping horizontally
    }

    // If scrolling vertically and NOT swiping horizontally, block the event
    if (!isScrollingHorizontally) {
        event.preventDefault(); // Block vertical scrolling
    }
}, { passive: false });



