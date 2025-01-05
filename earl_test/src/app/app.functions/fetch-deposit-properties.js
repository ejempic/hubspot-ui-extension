const axios = require('axios');

exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    try {
        const { data } = await fetchCustomProperties(PRIVATE_APP_TOKEN);
        return data;
    } catch (e) {
        console.error("Error fetching developers and estates:", e);
        return e;
    }
};

 const fetchCustomProperties = async (token) => {
     const objectType = '2-35849675';

     return axios.get(
         'https://api.hubapi.com/crm/v3/properties/'+objectType,
     {
             headers: {
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`,
             },
         }
     );
 }
