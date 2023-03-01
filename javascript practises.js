// create a function that calculate number
// of days between two dates
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // a and b are javascript Date objects
    return Math.floor((b - a) / _MS_PER_DAY);
}
// Return the current time
function getCurrentTime() {
    return new Date().getTime();
}

// Return the time of the next day
function getNextDayTime() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime();
}

// Return the time of the next week
function getNextWeekTime() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 0, 0, 0).getTime();
}

// Return the time of the next month
function getNextMonthTime() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), 0, 0, 0).getTime();
}

// Return the time of the next year
function getNextYearTime() {
    const now = new Date();
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate(), 0, 0, 0).getTime();
}

// Return the time of the next decade
function getNextDecadeTime() {
    const now = new Date();
    return new Date(now.getFullYear() + 10, now.getMonth(), now.getDate(), 0, 0, 0).getTime();
}

// Return the time of the next century
function getNextCenturyTime() {
    const now = new Date();
    return new Date(now.getFullYear() + 100, now.getMonth(), now.getDate(), 0, 0, 0).getTime();
}

async function addBook(book) {
    const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
    });
    return await response.json();
}


//create get the max number
function getMaxNumber(arr) {
    return Math.max.apply(null, arr);
}


//create get the min number
function getMinNumber(arr) {
    return Math.min.apply(null, arr);
}

//create getNextMonthTime
function getNextMonthTime() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), 0, 0, 0).getTime();
}

//function to calculate wages based on a period of time between two dates
function calculateWages(startDate, endDate, hourlyCharge) {
    const oneHour = 1000 * 60 * 60;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalHours = (end - start) / oneHour;
    const totalWages = hourlyCharge * totalHours;
    return totalWages;
}


const startDate = 'March 1, 2023';
const endDate = 'March 15, 2023';
const hourlyCharge = 15;

const totalWages = calculateWages(startDate, endDate, hourlyCharge);

console.log(`The employee's wages between ${startDate} and ${endDate} are $${totalWages}.`);
// Output: "The employee's wages between March 1, 2023 and March 15, 2023 are $1800."


//example aggregation pipeline for finding properties within a radius, based on the minimum and maximum number of bedrooms, a price range, and property type including different types of houses, flats, bungalows, farms/lands, and park homes:

db.properties.aggregate([
    // Match documents within a certain radius
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            distanceField: "distance",
            maxDistance: radius
        }
    },
    // Filter documents by number of bedrooms and price range
    {
        $match: {
            bedrooms: {
                $gte: minBeds,
                $lte: maxBeds
            },
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        }
    },
    // Group documents by property type
    {
        $group: {
            _id: "$propertyType",
            count: {
                $sum: 1
            }
        }
    },
    // Add computed field for house type
    {
        $addFields: {
            houseType: {
                $cond: [{
                        $in: ["$_id", ["detached", "semi-detached", "terraced"]]
                    },
                    "House",
                    {
                        $cond: [{
                                $in: ["$_id", ["flat"]]
                            },
                            "Flat",
                            {
                                $cond: [{
                                        $in: ["$_id", ["bungalow"]]
                                    },
                                    "Bungalow",
                                    {
                                        $cond: [{
                                                $in: ["$_id", ["farm", "land"]]
                                            },
                                            "Farm/Land",
                                            {
                                                $cond: [{
                                                        $in: ["$_id", ["park home"]]
                                                    },
                                                    "Park Home",
                                                    "Other"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    },
    // Group documents by house type and count
    {
        $group: {
            _id: "$houseType",
            count: {
                $sum: "$count"
            }
        }
    },
    // Project the fields to show the result
    {
        $project: {
            _id: 0,
            houseType: "$_id",
            count: 1
        }
    }
])


//aggregation filters properties within a specified search radius and then further filters the results by the number of bedrooms and price range

db.properties.aggregate([
    // Filter documents within the specified search radius
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            distanceField: "distance",
            maxDistance: searchRadius
        }
    },
    // Filter documents by number of bedrooms and price range
    {
        $match: {
            bedrooms: {
                $gte: minBeds,
                $lte: maxBeds
            },
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        }
    },
    // Group documents by property type
    {
        $group: {
            _id: "$propertyType",
            count: {
                $sum: 1
            }
        }
    },
    // Add computed field for house type
    {
        $addFields: {
            houseType: {
                $cond: [{
                        $in: ["$_id", ["detached", "semi-detached", "terraced"]]
                    },
                    "House",
                    {
                        $cond: [{
                                $in: ["$_id", ["flat"]]
                            },
                            "Flat",
                            {
                                $cond: [{
                                        $in: ["$_id", ["bungalow"]]
                                    },
                                    "Bungalow",
                                    {
                                        $cond: [{
                                                $in: ["$_id", ["farm", "land"]]
                                            },
                                            "Farm/Land",
                                            {
                                                $cond: [{
                                                        $in: ["$_id", ["park home"]]
                                                    },
                                                    "Park Home",
                                                    "Other"
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    },
    // Group documents by house type and count
    {
        $group: {
            _id: "$houseType",
            count: {
                $sum: "$count"
            }
        }
    },
    // Project the fields to show the result
    {
        $project: {
            _id: 0,
            houseType: "$_id",
            count: 1
        }
    }
])

//search for properties within a 5-mile radius of a specific location, with at least 2 bedrooms but no more than 4 bedrooms, and a monthly rental price between $1000 and $3000. We also want to filter by property type, including detached, semi-detached, and flats.
db.properties.aggregate([
    // Match documents within a 5-mile radius
    {
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            distanceField: "distance",
            maxDistance: 5 * 1609.34 // 5 miles in meters
        }
    },
    // Filter documents by number of bedrooms and price range
    {
        $match: {
            bedrooms: {
                $gte: 2,
                $lte: 4
            },
            price: {
                $gte: 1000,
                $lte: 3000
            }
        }
    },
    // Filter documents by property type
    {
        $match: {
            propertyType: {
                $in: ["detached", "semi-detached", "flat"]
            }
        }
    },
    // Group documents by property type and count
    {
        $group: {
            _id: "$propertyType",
            count: {
                $sum: 1
            }
        }
    },
    // Project the fields to show the result
    {
        $project: {
            _id: 0,
            propertyType: "$_id",
            count: 1
        }
    }
])
