const axios = require('axios');

exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    const {
        dropdown,
        length,
    } = context.parameters || {};

    try {

        if(!dropdown){
            const developers = await fetchDevelopers(PRIVATE_APP_TOKEN);
            const estates = await fetchEstates(PRIVATE_APP_TOKEN);
            const displayCenters = await fetchDisplayCenters(PRIVATE_APP_TOKEN);
            const facades = await fetchFacades(PRIVATE_APP_TOKEN);
            const houseTypes = await fetchHouseTypes(PRIVATE_APP_TOKEN);
            const promotionTypes = await fetchPromotionTypes(PRIVATE_APP_TOKEN);
            const teams = await fetchTeams(PRIVATE_APP_TOKEN);
            // const regions = await fetchRegions(PRIVATE_APP_TOKEN);

            return {
                developers,
                estates,
                displayCenters,
                facades,
                houseTypes,
                promotionTypes,
                teams
            };
        }else{
            if(dropdown === 'developers' && length > 0){
                return await fetchDevelopers(PRIVATE_APP_TOKEN, length);
            }
            if(dropdown === 'estates' && length > 0){
                return await fetchEstates(PRIVATE_APP_TOKEN, length);
            }
        }
    } catch (e) {
        console.error("Error fetching data:", e);
        return e;
    }
};


const fetchDevelopers = async (token, length = 0 ) => {
    const query = `
query getDevelopers {
  CRM {
    p_developers_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      ${length > 0 ?'offset: '+length:''}
      limit: 500
    ) {
      items {
        name
        hs_object_id
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};

const fetchEstates = async (token, length = 0) => {
    const query = `
query getEstates {
  CRM {
    p_estates_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      ${length > 0 ?'offset: '+length:''}
      limit: 500
    ) {
      items {
        name
        hs_object_id
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchDisplayCenters = async (token) => {
    const query = `
query getDisplayCenters {
  CRM {
    p_display_centre_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 2000
    ) {
      items {
        name
        hs_object_id
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchFacades = async (token) => {
    const query = `
query getFacades {
  CRM {
    p_facades_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 2000
    ) {
      items {
        name
        hs_object_id
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchHouseTypes = async (token) => {
    const query = `
query getHouseTypes {
  CRM {
    p_house_types_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 2000
    ) {
      items {
        hs_object_id
        name
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchPromotionTypes = async (token) => {
    const query = `
query getPromotionTypes {
  CRM {
    p_promotion_types_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 2000
    ) {
      items {
        hs_object_id
        name
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchTeams = async (token) => {
    const query = `
query getTeams {
  CRM {
    p_teams_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 100
    ) {
      items {
        hs_object_id
        name
        status
      }
    }
  }
}
`;
    return await fetchData(token, query);
};


const fetchRegions = async (token) => {
    const query = `
query getRegions {
  CRM {
    p_regions_collection(
      filter: {status__neq: "inactive"}
      orderBy: name__asc
      limit: 100
    ) {
      items {
        name
        hs_object_id }
      }
    }
  }
}
`;
    return await fetchData(token, query);
};

const fetchData = async (token, query) => {
    const body = {
        query
    };

    return await axios.post(
        'https://api.hubapi.com/collector/graphql',
        JSON.stringify(body),
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    ).then(response => response.data)
        .catch(error => {
            console.error("Error in fetchData:", error);
            throw error;
        });
};