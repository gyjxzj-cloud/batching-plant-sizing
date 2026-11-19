# Batching plant sizing — from a daily pour to a model

A small, dependency-free implementation of the arithmetic a concrete batching plant is actually sized
by. Given a daily pour volume, a working day, a haul distance and a truck size, it answers the three
questions that decide a purchase:

1. what hourly output the pour needs (with a margin for truck waiting),
2. which HZS model covers that output,
3. how many mixer trucks have to be in rotation.

```js
const { size } = require('./calculate');

size({ dailyM3: 420, hours: 8, haulKm: 12, truckM3: 7 });
// {
//   perHour: 52.5,
//   required: 60.375,      // +15% for truck waiting and mix changes
//   model: 'HZS75',
//   loadsPerDay: 60,
//   cycleMinutes: 54,      // 6 min loading + 12 km round trip at 30 km/h
//   trucks: 7
// }
```

## Why the margin is 15% and not 30%

The margin covers the two things every site loses and no schedule admits: a truck that arrives late,
and a mix change between grades. Thirty percent buys plant capacity that is then never used, and unused
capacity still bills power, operators and maintenance. If a job genuinely needs headroom — two pour
fronts, or a single plant serving two sites — model that as two demand numbers rather than one inflated
one.

## The two numbers the arithmetic cannot see

* **Haul time.** On linear work (roads, channels, pipelines) the pour moves and the truck cycle, not the
  plant, sets the day's output. Past roughly 30 minutes one way, two small plants that can be moved
  usually beat one large plant with a long fleet.
* **Stoppages.** Rain, aggregate delivery and breakdowns are not in the formula. A plant sized exactly to
  the average will miss the day it matters.

## The models, as published

`data/models.json` is the table the calculator resolves against: rated output, mixer, aggregate batcher,
cement silo and the published FOB starting price. It is the same table the price list on the site is
generated from, so the two cannot drift.

```json
{ "id": "HZS60", "output": 60, "mixer": "JS1000", "batcher": "PLD1600", "silo": "2 x 80 t", "fobFrom": 110000 }
```

## Running it

```bash
node -e "console.log(require('./calculate').size({dailyM3:300,hours:8,haulKm:10,truckM3:7}))"
```

No dependencies, no build step, works in any modern browser — copy `calculate.js` into a page and call
`size()`.

## Where this comes from

We build these plants, so the table and the prices are ours; the arithmetic is the arithmetic anyone
would use. A hosted version with the same numbers, in English and Bahasa Indonesia, is at
**https://disongequipment.com/batching-plant-calculator** (and
`/id/kalkulator-batching-plant`). Reference prices are FOB port of loading and exclude freight, duty and
installation.

MIT licensed. If the formula is wrong for your case, open an issue — that is more useful to us than
agreement.
