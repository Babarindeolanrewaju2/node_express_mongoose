function rentalCost(startDate, endDate, pricePerDay) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));
  return diffDays * pricePerDay;
}

console.log(rentalCost(new Date('2022-12-01'), new Date('2022-12-07'), 50)); // prints "350"

var moment = require('moment');

function rentalCost(startDate, endDate, pricePerDay) {
  var duration = moment.duration(moment(endDate).diff(moment(startDate)));
  var days = duration.asDays();
  return days * pricePerDay;
}
console.log(rentalCost(new Date('2022-12-01'), new Date('2022-12-07'), 50)); // prints "350"

function rentalPerDay(price, days) {
  return price / days;
}
console.log(rentalPerDay(100, 7)); // prints "14.285714285714286"
