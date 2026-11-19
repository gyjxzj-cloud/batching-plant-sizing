"use strict";
/* Batching-plant sizing. Dependency-free; works in Node and in a browser.

   perHour = daily volume / effective hours
   required = perHour * 1.15   -- the margin covers truck waiting and mix changes, not breakdowns
   model    = the smallest rated output at or above `required`
   loads    = ceil(daily volume / truck capacity)
   cycle    = 6 minutes loading + the round trip at 30 km/h
   trucks   = ceil(loads * cycle / (hours * 60))  -- trucks that must be in rotation all day
*/
const MODELS = require("./data/models.json");
const MARGIN = 1.15;
const LOAD_MINUTES = 6;
const AVG_KMH = 30;

function size({ dailyM3, hours, haulKm = 0, truckM3 = 7 }) {
  if (!(dailyM3 > 0) || !(hours > 0) || !(truckM3 > 0)) {
    throw new Error("dailyM3, hours and truckM3 must be positive numbers");
  }
  const perHour = dailyM3 / hours;
  const required = perHour * MARGIN;
  const model = MODELS.find((m) => m.output >= required) || MODELS[MODELS.length - 1];
  const loadsPerDay = Math.ceil(dailyM3 / truckM3);
  const cycleMinutes = LOAD_MINUTES + ((haulKm * 2) / AVG_KMH) * 60;
  const trucks = Math.ceil((loadsPerDay * cycleMinutes) / (hours * 60));
  return {
    perHour: round(perHour),
    required: round(required),
    model: model.id,
    mixer: model.mixer,
    batcher: model.batcher,
    fobFrom: model.fobFrom,
    loadsPerDay,
    cycleMinutes: round(cycleMinutes),
    trucks,
  };
}

const round = (n) => Math.round(n * 10) / 10;

module.exports = { size, MODELS, MARGIN };
