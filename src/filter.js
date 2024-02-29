const AVOIDED_COUNTRY_CODES = [
  "AE",
  "JP",
  "AR",
  "PK",
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

const OPTIONAL_COUNTRY_CODES = [
  "PH",
  "TH",
]

const AVOIDED_USERNAMES = [
  "princess",
  "queen",
  "money",
  "trans",
  "bitch",
  "420",
  "Baby",
  "sex",
  "cum",
  "ladyboy",
  "femboy"
];

console.log({ AVOIDED_USERNAMES, AVOIDED_COUNTRY_CODES });

let allowOptionalCountries = false;

const alterUi = () =>
{
  const avoidedCountryCodes = AVOIDED_COUNTRY_CODES.map(v => v.toUpperCase());
  const optionalCountryCodes = OPTIONAL_COUNTRY_CODES.map(v => v.toUpperCase());
  const avoidedUsernames = AVOIDED_USERNAMES.map(v => v.toUpperCase());
  const cardContainer = document.querySelector("ul.tiles.small-tiles");
  
  const updateHud = ({total, available}) => {
    const hudContainer = document.querySelector("#points-purchase-offer-banner-wrapper");
    if(!hudContainer) {
      return;
    }
    const percentage = Math.round(available / total * 100);

    hudContainer.parentElement.style.pointerEvents = "none";

    hudContainer.style.backgroundColor = "rgb(0, 73, 119)";
    const numberContainer = document.createElement("div");
    numberContainer.style.zIndex = "1";
    numberContainer.innerText = `${available}/${total} ${percentage}%`;
    
    const progressBar = document.createElement("div");
    progressBar.style.position = "absolute";
    progressBar.style.left = "0px";
    progressBar.style.top = "0px";
    progressBar.style.bottom = "0px";
    progressBar.style.backgroundColor = "#003600";
    progressBar.style.width = `${percentage}%`;
    
    const optionalCountriesSwitch = document.createElement("button");
    optionalCountriesSwitch.onclick = (e) =>
    {
      e.preventDefault();
      e.stopPropagation();
      allowOptionalCountries = !allowOptionalCountries;
      alterUi();
    } 
    optionalCountriesSwitch.innerText = allowOptionalCountries ? "Lax" : "Strict";
    optionalCountriesSwitch.style.position = "absolute"
    optionalCountriesSwitch.style.right = "8px";
    optionalCountriesSwitch.style.pointerEvents = "all";
    
    hudContainer.innerHTML = "";
    hudContainer.style.display = "flex";
    hudContainer.style.alignItems = "center";
    hudContainer.style.justifyContent = "center";
    hudContainer.style.overflow = "hidden";
    
    hudContainer.appendChild(progressBar);
    hudContainer.appendChild(numberContainer);
    hudContainer.appendChild(optionalCountriesSwitch);
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
    const avoidSet = new Set();
    cards.forEach((card) => { 
      card.style.opacity = 1;

      const [ usernameRaw, ageRaw ] = card.querySelector("p.name").innerText.split(", ");
      const age = +ageRaw;
      const username = usernameRaw.toUpperCase();
      const [ city, countryCodeRaw ] = card.querySelector("p.location.text-ellipsis").innerText.split(", ");
      const countryCode = countryCodeRaw.toUpperCase();
      if(avoidedCountryCodes.includes(countryCode)) {
        avoidSet.add(card);
      }
      if (!allowOptionalCountries) {
        if(optionalCountryCodes.includes(countryCode)) {
          avoidSet.add(card);
        }
      }
      if(avoidedUsernames.some((avoided) => username.includes(avoided))) {
        avoidSet.add(card);
      }
    });
     
    updateHud({
      total: cards.length,
      available: cards.length - avoidSet.size,
    });
    
  }

  for(const unwanted of avoidSet) {
    unwanted.style.opacity = 0.1;
  }
  
  evaluateCards();
  observeMutations(evaluateCards);
}

setTimeout(alterUi, 2000);
