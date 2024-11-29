const axios = require("axios");

exports.main = async (context = {}) => {
    try {
        const url = `https://fwapiuat.simonds.com.au:8021/api/Authenticate`;

        // Define the payload data
        const data = {
            "Username": "Gabriel Mingorance",
            "Key": "C42C5641-5B40-4C26-940A-3AEA47DB656D",
            "Application": "Framework"
        };

        // Send the POST request with the data object as the body
        const response = await axios.post(url, data); 
        console.log("response",response);
        
        return response.data;

    } catch (error) {
        console.error("Error connecting with framework API", error);
        return error;
    }
    return false;
};
