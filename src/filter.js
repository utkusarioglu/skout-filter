const AVOIDED_COUNTRY_CODES = [
  "JP",
  "AR",
  "PK",
  "PH",
  "TH",
  "TW",
  "SA",
  "LA",
  "HK",
  "MA",
  "IN",
  "OM",
  "ID",
  "BH",
  "ET",
  "AU",
  "EG",
  "VN",
  "TR",
  "IR",
  "OK",
  "QA",
  "NZ"
];

const AVOIDED_USERNAMES = [
  "trans",
  "bitch",
  "420",
  "Baby",
  "sex",
  "cum",
  "ladyboy"
];

const alterUi = () =>
{
  const avoidedCountryCodes = AVOIDED_COUNTRY_CODES.map(v => v.toUpperCase());
  const avoidedUsernames = AVOIDED_USERNAMES.map(v => v.toUpperCase());
  const cardContainer = document.querySelector("ul.tiles.small-tiles");
  
  const updateHud = ({total, available}) => {
    const hudContainer = document.querySelector("#points-purchase-offer-banner-wrapper");
    if(!hudContainer) {
      return;
    }
    hudContainer.style.backgroundColor = "rgb(0, 73, 119)";
    const numberContainer = document.createElement("span");
    numberContainer.style.zIndex = "1";
    numberContainer.innerText = `${available} of ${total}`;
    
    const progressBar = document.createElement("div");
    progressBar.style.position = "absolute";
    progressBar.style.left = "0px";
    progressBar.style.top = "0px";
    progressBar.style.bottom = "0px";
    progressBar.style.backgroundColor = "#003600";
    progressBar.style.width = `${Math.round(available/total*100)}%`;
    
    hudContainer.innerHTML = "";
    hudContainer.style.display = "flex";
    hudContainer.style.alignItems = "center";
    hudContainer.style.justifyContent = "center";
    hudContainer.style.overflow = "hidden";
    
    hudContainer.appendChild(progressBar);
    hudContainer.appendChild(numberContainer);
  }

  const observeMutations = (onMutation) => {
    const mutationObserver = new MutationObserver(function(mutations) {
      console.log("Mutation happened");
      onMutation();
    });
    mutationObserver.observe(cardContainer, {
      attributes: false,
      characterData: false,
      childList: true,
      subtree: false,
      attributeOldValue: false,
      characterDataOldValue: false
    });
  }
  
  const evaluateCards = () => {
    const cards = cardContainer.querySelectorAll("li");
    const filterSet = new Set();
    cards.forEach((card) => { 
      const [ username, ageRaw ] = card.querySelector("p.name").innerText.split(", ");
      const age = +ageRaw;
      const [ city, countryCode ] = card.querySelector("p.location.text-ellipsis").innerText.split(", ");
      if(avoidedCountryCodes.includes(countryCode.toUpperCase())) {
        filterSet.add(card);
      }
      if(avoidedUsernames.includes(username.toUpperCase())) {
        filterSet.add(card);
      }
    });
     
    updateHud({
      total: cards.length,
      available: cards.length - filterSet.size,
    });
    
    for(const unwanted of filterSet) {
      unwanted.style.opacity = 0.1;
    }
  }
  
  evaluateCards();
  observeMutations(evaluateCards);
}

setTimeout(alterUi, 2000);
