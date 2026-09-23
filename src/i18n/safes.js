export const SAFE_COPY = {
  en: {
    safeTitles: {
      common: "COMMON",
      rare: "RARE",
      epic: "EPIC",
    },
    holdToOpen: "HOLD\nTO OPEN",
    stop: "STOP",
    howTitle: "How does it work?",
    prizesTitle: "Prizes",
    showPrizes: "WHAT'S INSIDE?",
    showRules: "BACK TO RULES",
    previousSafe: "Previous safe",
    nextSafe: "Next safe",
    claimLead: "Claim your prize!",
    youWon: "You won",
    claimNow: "CLAIM NOW",
    refresh: "Refresh",
    otherPrizes: "Other possible prizes",
    steps: [
      {
        title: "Press & Hold",
        text: "Press and hold the handle in the center. The dial will start spinning.",
      },
      {
        title: "Watch the zone",
        text: "A highlighted Hot Zone will appear at a random spot on the scale.",
        emphasis: "Hot Zone",
      },
      {
        title: "Time it right",
        text: "Release your finger exactly when the pointer hits the zone!",
      },
    ],
  },
  ru: {
    safeTitles: {
      common: "ОБЫЧНЫЙ",
      rare: "РЕДКИЙ",
      epic: "ЭПИЧЕСКИЙ",
    },
    holdToOpen: "HOLD\nTO OPEN",
    stop: "СТОП",
    howTitle: "Как это работает?",
    prizesTitle: "Призы",
    showPrizes: "ЧТО ВНУТРИ?",
    showRules: "НАЗАД К ПРАВИЛАМ",
    previousSafe: "Предыдущий сейф",
    nextSafe: "Следующий сейф",
    claimLead: "Заберите свой приз!",
    youWon: "Вы выиграли",
    claimNow: "ЗАБРАТЬ",
    refresh: "Начать заново",
    otherPrizes: "Другие возможные призы",
    steps: [
      {
        title: "Нажмите и удерживайте",
        text: "Нажмите и удерживайте ручку в центре. Шкала начнёт заполняться.",
      },
      {
        title: "Следите за зоной",
        text: "Горячая зона появится в случайном месте на шкале.",
        emphasis: "Горячая зона",
      },
      {
        title: "Поймайте момент",
        text: "Отпустите палец точно в тот момент, когда указатель попадёт в зону!",
      },
    ],
  },
};

export function getSafeCopy(lang = "en") {
  return SAFE_COPY[lang] ?? SAFE_COPY.en;
}

export function getSafeTitle(safeId, lang = "en") {
  return getSafeCopy(lang).safeTitles[safeId] ?? safeId;
}
