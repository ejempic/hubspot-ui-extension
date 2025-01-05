const axios = require('axios');

exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    try {
        const { data } = await fetchDevelopersAndEstates(PRIVATE_APP_TOKEN);
        return data;
    } catch (e) {
        console.error("Error fetching developers and estates:", e);
        return e;
    }
};

const fetchDevelopersAndEstates = (token) => {
    // Define the GraphQL query
    const query = `
  query getFields {
  CRM {
    p_developers_collection(filter: {status__neq: "inactive"}, orderBy: name__asc) {
      items {
        name
        hs_object_id
        status
      }
    }
    p_estates_collection(filter: {status__neq: "inactive"}) {
      items {
        name
        hs_object_id
        status
      }
    }
    p_display_centre_collection(filter: {status__neq: "inactive"}) {
      items {
        name
        hs_object_id
        status
      }
    }
    p_facades_collection(filter: {status__neq: "inactive"}) {
      items {
        name
        hs_object_id
        status
      }
    }
    p_house_types_collection(filter: {status__neq: "inactive"}) {
      items {
        hs_object_id
        name
        status
      }
    }
    p_promotion_types_collection(filter: {status__neq: "inactive"}) {
      items {
        hs_object_id
        name
        status
      }
    }
    p_teams_collection(filter: {status__neq: "inactive"}){
      items {
        hs_object_id
        name
        status
      }
    }
    p_regions_collection(filter: {status__neq: "inactive"}) {
      items {
        name
        hs_object_id
      }
    }
  }
}
`;

    const body = {
        operationName: 'getFields',
        query
    };

    return axios.post(
        'https://api.hubapi.com/collector/graphql',
        JSON.stringify(body),
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    );
};