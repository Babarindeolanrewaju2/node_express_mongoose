const oneYearAgo = new Date(
  new Date().setFullYear(new Date().getFullYear() - 1)
);

Order.aggregate(
  [
    {
      $match: {
        createdAt: {
          $gte: oneYearAgo,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
  }
);

const startYear = 2018;
const endYear = 2020;

const startDate = new Date(startYear, 0, 1);
const endDate = new Date(endYear, 11, 31);

Order.aggregate(
  [
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
  }
);
