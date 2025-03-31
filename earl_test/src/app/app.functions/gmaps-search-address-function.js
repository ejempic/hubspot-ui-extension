const axios = require("axios");

exports.main = async (context = {}) => {
    const {searchValue, placeId, googleMapsAPIKey, suburb} = context.parameters;

    try {
        if (placeId) {
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapsAPIKey}&types=address&components`;
            const response = await axios.get(url);
            return await response.data;
        } else {
            if (suburb) {

                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchValue}&key=${googleMapsAPIKey}&components=country:au`;
                const response = await axios.get(url);
                const predictions = response.data.predictions;

                const placeDetailsPromises = predictions.map(async (prediction) => {
                    const placeId = prediction.place_id; // Get the place_id from the prediction

                    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapsAPIKey}`;
                    const detailsResponse = await axios.get(placeDetailsUrl);
                    const result = detailsResponse.data.result;
                    const addressComponents = result.address_components;

                    let suburb, state, postcode;

                    addressComponents.forEach((component) => {
                        if (component.types.includes("locality")) {
                            suburb = component.long_name;
                        }
                        if (component.types.includes("administrative_area_level_1")) {
                            state = component.long_name;
                        }
                        if (component.types.includes("postal_code")) {
                            postcode = component.long_name;
                        }
                    });
                    if(!postcode){
                        return {};
                    }

                    return {
                        components: result,
                        // description: `${prediction.description} (${suburb || ''}, ${state || ''}, ${postcode || ''})`,
                        description: `${suburb || ''}, ${state || ''}, ${postcode || ''}`,
                        place_id: placeId,
                    };
                });
                const enhancedPredictions = await Promise.all(placeDetailsPromises);
                return {predictions: enhancedPredictions};
            } else {
                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchValue}&key=${googleMapsAPIKey}&types=address&components=country:au`;
                const response = await axios.get(url);
                return await response.data;
            }
        }
    } catch (error) {
        console.error("Error fetching address suggestions", error);
    }
    return false;
};