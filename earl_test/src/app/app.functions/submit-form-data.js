// for HubSpot API calls
const hubspot = require('@hubspot/api-client');

// Initialize HubSpot API client
const hubspotClient = new hubspot.Client({
    accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN'],
});


exports.main = async (context = {}) => {
    const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;
    const {
        buyer,
        development,
        deposit,
        system,
        user,
    } = context.parameters;
    try {

        return context.parameters;
        // /*const { data } = await*/ submitFormData(PRIVATE_APP_TOKEN,
        //     buyer,
        //     development,
        //     deposit,
        //     system,
        //     user
        // );
        // // return data;
    } catch (e) {
        console.error("Error submit for data:", e);
        return e;
    }
};

// const submitFormData = (token, buyer, development, deposit, system, user) => {
    // console.log(buyer, development, deposit, system, user)
    // Define the GraphQL query
//     const query = `
//   query getDealInformation($hs_object_id: String!) {
//   CRM {
//     deal(uniqueIdentifier: "hs_object_id", uniqueIdentifierValue: $hs_object_id) {
//       contact_first_name
//       contact_last_name
//       contact_email
//       contact_id
//       contact_phone
//     }
//   }
// }
// `;
//
//     const body = {
//         operationName: 'getDealInformation',
//         query,
//         variables: { hs_object_id }
//     };
//
//     return axios.post(
//         'https://api.hubapi.com/collector/graphql',
//         JSON.stringify(body),
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//             },
//         }
//     );
// };