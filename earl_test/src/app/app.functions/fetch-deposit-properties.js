const axios = require('axios');

exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    const { portal_id } = context.parameters;
    var objectType = '2-35849675';

    if(portal_id === 46237448){
        objectType = '2-35672036'
    }

    try {
        const { data } = await fetchCustomProperties(PRIVATE_APP_TOKEN, objectType);
        return data;
    } catch (e) {
        console.error("Error fetching developers and estates:", e);
        return e;
    }
};

 const fetchCustomProperties = async (token, objectType) => {

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
