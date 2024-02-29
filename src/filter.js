const AVOIDED_USER_IDS = [
  "191277021",
  "207481255"
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
  "femboy"
];

console.log({
  AVOIDED_USERNAMES,
  AVOIDED_COUNTRY_CODES,
  OPTIONAL_COUNTRY_CODES,
  AVOIDED_USER_IDS,
});

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
    const avoidList = [];
    avoidList.compareAndPush = function (newElement, newReason, props)
    {
      const index = avoidList.findIndex(({ element }) => element === newElement);
      if (index === -1) {
        avoidList.push({
          element: newElement,
          reason: newReason,
          props
        });
      } else {
        avoidList[index] = {
          ...avoidList[index],
          reason: {
            ...avoidList[index].reason,
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

      if(avoidedCountryCodes.includes(countryCode)) {
        avoidList.compareAndPush(element, "CountryCode", props);
      }
      if (!allowOptionalCountries) {
        if(optionalCountryCodes.includes(countryCode)) {
          avoidList.compareAndPush(element, "OptionalCountry", props);
        }
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
      available: cards.length - avoidSet.size,
    });

    console.log(avoidList.map(({reason, props}) => ({reason, ...props})));
  }
  
  evaluateCards();
  observeMutations(evaluateCards);
}

setTimeout(alterUi, 2000);
