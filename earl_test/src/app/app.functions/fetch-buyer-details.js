const axios = require('axios');

exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    const { hs_object_id } = context.parameters;
    try {
        const { data } = await fetchBuyerDetails(PRIVATE_APP_TOKEN, hs_object_id);
        return data;
    } catch (e) {
        console.error("Error fetchBuyerDetails:", e);
        return e;
    }
};

const fetchBuyerDetails = (token, hs_object_id) => {
    const query = `
  query getDealInformation($hs_object_id: String!) {
  CRM {
    deal(uniqueIdentifier: "hs_object_id", uniqueIdentifierValue: $hs_object_id) {
      contact_first_name
      contact_last_name
      contact_email
      contact_id
      contact_phone
    }
  }
}
`;

    const body = {
        operationName: 'getDealInformation',
        query,
        variables: { hs_object_id }
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