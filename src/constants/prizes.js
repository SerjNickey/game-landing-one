export const PRIZES = [
  {
    id: "free-spins",
    primary: "200",
    lines: {
      en: ["FREE SPINS"],
      ru: ["ФРИСПИНОВ"],
    },
    label: {
      en: "200 free spins",
      ru: "200 фриспинов",
    },
  },
  {
    id: "bonus",
    primary: "100%",
    lines: {
      en: ["UP TO $250"],
      ru: ["ДО $250"],
    },
    label: {
      en: "100% up to $250",
      ru: "100% до $250",
    },
  },
  {
    id: "bundle",
    primary: "100%",
    lines: {
      en: ["UP TO $250", "+ 200 FREE SPINS", "+ FREE BET $60"],
      ru: ["ДО $250", "+ 200 ФРИСПИНОВ", "+ ФРИБЕТ $60"],
    },
    label: {
      en: "100% up to $250 + 200 free spins + Free Bet $60",
      ru: "100% до $250 + 200 фриспинов + Фрибет $60",
    },
  },
];

export function getPrize(prizeId) {
  return PRIZES.find((prize) => prize.id === prizeId) ?? PRIZES[0];
}

export function getRandomPrizeId(random = Math.random) {
  return PRIZES[Math.floor(random() * PRIZES.length)].id;
}

export function localizePrize(prize, lang = "en") {
  return {
    ...prize,
    lines: prize.lines[lang] ?? prize.lines.en,
    label: prize.label[lang] ?? prize.label.en,
  };
}
