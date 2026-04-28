const EUR_TO_ZAR_RATE = Number(process.env.EUR_TO_ZAR_RATE ?? process.env.VITE_EUR_TO_ZAR_RATE ?? 18);

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function eurToZar(eur) {
  return roundMoney(Number(eur) * EUR_TO_ZAR_RATE);
}

function zarToEur(zar) {
  return roundMoney(Number(zar) / EUR_TO_ZAR_RATE);
}

function formatZar(amount) {
  return `R ${roundMoney(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

module.exports = { EUR_TO_ZAR_RATE, roundMoney, eurToZar, zarToEur, formatZar };
