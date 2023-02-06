const axios = require('axios');

async function login(email, password) {

    try {
        // API call to the Hack Check API endpoint
        const response = await axios.get(`https://hackcheck.woventeams.com/api/v4/breachedaccount/${email}`);
        // handle the API response
        // console.log(response.data)
        // if (response.status === 200) {
        // filter breaches that fit the criteria
        const filteredBreaches = response.data.filter(breach => !breach.IsSensitive && breach.DataClasses.includes("Passwords"));
        console.log(filteredBreaches)
        if (filteredBreaches.length > 0) {
            // Return the filtered breaches in the format specified in the task
            return {
                success: true,
                meta: {
                    suggestPasswordChange: true,
                    breachedAccounts: filteredBreaches.map(breach => ({
                        name: breach.Name,
                        domain: breach.Domain,
                        breachDate: breach.BreachDate,
                        addedDate: breach.AddedDate
                    }))
                }
            };
        } else {
            // Return "no breaches found (HTTP 404)" if no breaches are returned
            return {
                success: true,
                message: "no breaches found (HTTP 404)"
            };
        }
        // } else {
        //     return {
        //         success: true
        //     };
        // }
    } catch (error) {
        console.log(error)
        // if (error.response.status === 404) {
        //     return {
        //         success: true,
        //         message: "no breaches found (HTTP 404)"
        //     };
        // }
    }

}

let result = login("test@example.com", "pw")

// Log to console
console.log(result)