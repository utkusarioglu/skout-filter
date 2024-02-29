const AVOIDED_USER_IDS = [
  "191277021",
  "207481255",
  "191605086",
  "198041585"
]

const AVOIDED_COUNTRY_CODES = [
  "SG",
  "CN",
  "KH",
  "MY",
  "JO",
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
  "femboy",
  "naughty",
  "exotic",
];

const DARK_GREEN = "#003600";
const GRAY = "#202324";
const LIGHT_GREEN = "rgb(37, 132, 37)";

console.log({
  AVOIDED_USERNAMES,
  AVOIDED_COUNTRY_CODES,
  OPTIONAL_COUNTRY_CODES,
  AVOIDED_USER_IDS,
});

let filterMode = "strict";

const filterButtonsCommon = (e, newFilterMode) => {
  e.preventDefault();
  e.stopPropagation();
  filterMode = newFilterMode;
  alterUi();
};

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
    progressBar.style.backgroundColor = DARK_GREEN;
    progressBar.style.width = `${percentage}%`;

    const filterButtons = document.createElement("div");
    const filterNone = document.createElement("button");
    const filterLax = document.createElement("button");
    const filterStrict = document.createElement("button");
    filterButtons.appendChild(filterNone);
    filterButtons.appendChild(filterLax);
    filterButtons.appendChild(filterStrict);

    filterButtons.style.position = "absolute"
    filterButtons.style.right = "8px";
    filterButtons.style.pointerEvents = "all";
    filterButtons.style.overflow = "hidden";
    filterButtons.style.borderRadius = "7px";
    
    filterNone.innerText = "N";
    filterNone.style.border = "0px";
    filterNone.style.paddingLeft = "7px";
    filterNone.style.background = filterMode == "none" ? LIGHT_GREEN : GRAY;
    filterNone.onclick = (e) => filterButtonsCommon(e, "none");

    filterLax.innerText = "L";
    filterLax.style.border = "0px";
    filterLax.style.background = filterMode == "lax" ? LIGHT_GREEN : GRAY;
    filterLax.onclick = (e) => filterButtonsCommon(e, "lax");
    filterStrict.innerText = "S";
    filterStrict.style.border = "0px";
    filterStrict.style.paddingRight = "7px";
    filterStrict.style.background = filterMode == "strict" ? LIGHT_GREEN : GRAY;
    filterStrict.onclick = (e) => filterButtonsCommon(e, "strict");
    
    hudContainer.innerHTML = "";
    hudContainer.style.display = "flex";
    hudContainer.style.alignItems = "center";
    hudContainer.style.justifyContent = "center";
    hudContainer.style.overflow = "hidden";
    
    hudContainer.appendChild(progressBar);
    hudContainer.appendChild(numberContainer);
    hudContainer.appendChild(filterButtons);
  }

  const observeMutations= (onMutation) => {
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
    const avoidList = [];
    avoidList.compareAndPush = function (newElement, newReason, props)
    {
      const index = avoidList.findIndex(({ element }) => element === newElement);
      if (index === -1) {
        avoidList.push({
          element: newElement,
          reasons: [newReason],
          props
        });
      } else {
        avoidList[index] = {
          ...avoidList[index],
          reasons: {
            ...avoidList[index].reasons,
            newReason
          },
        }
      }
    }
    
    cards.forEach((element) => { 
      element.style.opacity = 1;

      const [ usernameRaw, ageRaw ] = element.querySelector("p.name").innerText.split(", ");
      const age = +ageRaw;
      const username = usernameRaw.toUpperCase();
      const [ city, countryCodeRaw ] = element.querySelector("p.location.text-ellipsis").innerText.split(", ");
      const countryCode = countryCodeRaw.toUpperCase();
      const profileId = element.querySelector("a").href.split("/").at(-1);
      const props = { username, age, city, countryCode };

      if (AVOIDED_USER_IDS.includes(profileId)) {
        avoidList.compareAndPush(element, "UserId", props);
      }
      if(filterMode !== "none" && avoidedCountryCodes.includes(countryCode)) {
        avoidList.compareAndPush(element, "CountryCode", props);
      }
      if(filterMode === "strict" &&  optionalCountryCodes.includes(countryCode)) {
        avoidList.compareAndPush(element, "OptionalCountry", props);
      }
      if(avoidedUsernames.some((avoided) => username.includes(avoided))) {
        avoidList.compareAndPush(element, "Username", props);
      }
    });

    for(const {element} of avoidList) {
      element.style.opacity = 0.1;
    }
     
    updateHud({
      total: cards.length,
      available: cards.length - avoidList.length,
    });

    console.log(
      filterMode,
      avoidList.map(({ reasons, props }) => ({ reasons, ...props }))
    );
  }
  
  evaluateCards();
  observeMutations(evaluateCards);
}


const mainElem = document.querySelector("div.container.main-content.app");
const mainObserver = new MutationObserver(function(mutations) {
  // console.log(mutations);
  // onMutation();
  alterUi();
});
mainObserver.observe(mainElem, {
  attributes: false,
  characterData: false,
  childList: true,
  subtree: false,
  attributeOldValue: false,
  characterDataOldValue: false
});

// setTimeout(alterUi, 2000);
