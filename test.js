import {
    users as sampleUsers,
    breaches as sampleBreaches,
} from "./sample";
import axios from "axios";

function authenticate(email, password) {
    const account = sampleUsers.find(a => a.email === email);
    if (account && account.password === password) {
        return account;
    } else {
        return null;
    }
}

// The object returned from this function will be displayed in
// a modal upon clicking submit on the login form.

async function login(email, password) {
    const account = authenticate(email, password);
    if (account) {
        // A new breach was detected!
        const response = await axios.get(`https://hackcheck.woventeams.com/api/v4/breachedaccount/${email}`);



        const sampleBreaches = response.data.filter(breach => !breach.IsSensitive && breach.DataClasses.includes("Passwords") && new Date(breach.AddedDate) > account.lastLogin);

        if (sampleBreaches.length > 0) {
            return {
                success: true,
                meta: {
                    suggestPasswordChange: true,
                    breachedAccounts: sampleBreaches.map(breach => ({
                        name: breach.Name,
                        domain: breach.Domain,
                        breachDate: breach.BreachDate,
                        addedDate: breach.AddedDate
                    }))
                }
            };
        } else {
            return {
                success: true
            };
        }
    } else {
        return {
            success: false,
            message: "The username or password you entered is invalid."
        };
    }
}

export default login;



async function login(email, password) {
    const account = authenticate(email, password);
    if (account) {
        try {
            // API call to the Hack Check API endpoint
            const response = await axios.get(`https://hackcheck.woventeams.com/api/v4/breachedaccount/${email}`);
            // handle the API response
            if (response.status === 200) {
                // filter breaches that fit the criteria
                const sampleBreaches = response.data.filter(breach => !breach.IsSensitive && breach.DataClasses.includes("Passwords") && new Date(breach.AddedDate) > account.lastLogin);
                // Return the filtered breaches in the format specified in the task
                return {
                    success: true,
                    meta: {
                        suggestPasswordChange: true,
                        breachedAccounts: sampleBreaches.map(breach => ({
                            name: breach.Name,
                            domain: breach.Domain,
                            breachDate: breach.BreachDate,
                            addedDate: breach.AddedDate
                        }))
                    }
                };
            } else {
                return {
                    success: true
                };
            }
        } catch (error) {
            if (error.response.status === 404) {
                return {
                    success: true
                };
            }
        }
    } else {
        return {
            success: false,
            message: "The username or password you entered is invalid."
        };
    }
}



async function login(email, password) {
    const account = authenticate(email, password);
    if (account) {
        try {
            // API call to the Hack Check API endpoint
            const response = await axios.get(`https://hackcheck.woventeams.com/api/v4/breachedaccount/${email}`);
            // handle the API response
            if (response.status === 200) {
                // filter breaches that fit the criteria
                const filteredBreaches = response.data.filter(breach => !breach.IsSensitive && breach.DataClasses.includes("Passwords") && new Date(breach.AddedDate) > account.lastLogin);
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
            } else {
                return {
                    success: true
                };
            }
        } catch (error) {
            if (error.response.status === 404) {
                return {
                    success: true,
                    message: "no breaches found (HTTP 404)"
                };
            }
        }
    } else {
        return {
            success: false,
            message: "The username or password you entered is invalid."
        };
    }
}