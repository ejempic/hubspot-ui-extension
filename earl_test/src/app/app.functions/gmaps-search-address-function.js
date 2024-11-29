const axios = require("axios");

exports.main = async (context = {}) => {
  const { searchValue,placeId ,googleMapsAPIKey } = context.parameters;

    try {
      if(placeId)
      {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapsAPIKey}`;      
        const response = await axios.get(url); 
        return await response.data;
      }
      else{
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchValue}&key=${googleMapsAPIKey}&types=address&components=country:au`;      
        const response = await axios.get(url); 
        return await response.data;
      }
      
      
    } catch (error) {
      console.error("Error fetching address suggestions", error);
    }
    return false;
};
