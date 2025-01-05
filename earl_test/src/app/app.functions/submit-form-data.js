const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client({
    accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN'],
});

// Entry function of this module, it creates a quote together with line items
exports.main = async (context = {}) => {
    const {
        buyer,
        development,
        deposit,
        system,
        user,
        currentBuyer,
        currentBuyerId
    } = context.parameters;


    // const product = await findProductBySKU(sku);
    //
    // if (product === null) {
    //     return ({ error: 'PRODUCT_NOT_FOUND' });
    // } else {
        const newDeposit = await createDeposit({buyer,
            development,
            deposit,
            system,
            user,
            currentBuyer,
            currentBuyerId
        });

        return {newDeposit}
        //
        // // Add line items to a newly created quote
        // const lineItems = [];
        // for (let i = 0; i < numberOfBuses; i++) {
        //     lineItems.push(
        //         addLineItem({
        //             productId: product.id,
        //             quoteId: quote.id,
        //             quantity: distance,
        //         })
        //     );
        // }
        // await Promise.all(lineItems);
        // return { quote };
    // }
};

async function getOwner(user){

    const owners =  await hubspotClient.crm.owners.ownersApi.getPage(user.email);

    if(owners){
        return owners.results[0];
    }
    return null;
}

// Function to create a line item and associate with quote
async function createDeposit({ buyer, development, deposit, system, user, currentBuyer, currentBuyerId }) {

    const owner = await getOwner(user)
    const ownerId = owner.id;
    const request = {
        properties: {
            name: buyer.Buyer_1_Given_Name+ " " + buyer.Buyer_1_Surname+ " - "+ deposit.Deposit_Deposit_Desc,
            // hubspot_deal_id: currentBuyerId,

            given_name: buyer.Buyer_1_Given_Name,
            buyer_1_surname: buyer.Buyer_1_Surname,
            buyer_1_email: buyer.Buyer_1_Email,
            buyer_1_email_not_provided: buyer.Buyer_1_Email_Not_Provided,
            buyer_1_mobile: buyer.Buyer_1_Mobile,
            buyer_1_business_number: buyer.Buyer_1_Business_Number,
            buyer_1_after_hours_number: buyer.Buyer_1_After_Hours,
            add_second_buyer_details: buyer.Buyer_Add_Second_Buyer,

            buyer_2_given_name: buyer.Buyer_2_Given_Name,
            buyer_2_surname: buyer.Buyer_2_Surname,
            buyer_2_email_not_provided: buyer.Buyer_2_Email_Not_Provided,
            buyer_2_email: buyer.Buyer_2_Email,
            buyer_2_mobile: buyer.Buyer_2_Mobile,
            buyer_2_business_number: buyer.Buyer_2_Business_Number,
            buyer_2_after_hours_number: buyer.Buyer_2_After_Hours,

            buyer_info_street_number: buyer.Buyer_Info_Street_Number,
            buyer_info_street_name: buyer.Buyer_Info_Street_Name,
            buyer_info_suburb: buyer.Buyer_Info_Suburb,
            buyer_info_state: buyer.Buyer_Info_State,
            buyer_info_postcode: buyer.Postcode,

            // selected_developer: development.Development_Developer,
            developer_description: development.Development_Developer_Desc,
            // selected_estate: development.Development_Estate,
            estate_description: development.Development_Estate_Desc,
            // selected_display_centre: development.Development_Display_Centre,
            display_centre_description: development.Development_Display_Centre_Desc,
            // selected_house_type: development.Development_House_Type,
            house_type_description: development.Development_House_Type_Desc,
            size: development.Development_Size,
            // selected_facade: development.Development_Facade,
            region: development.Development_Region,

            is_the_land_titled_: development.Development_Address_Is_Land_Titled === 'Yes',
            is_this_a_kdrb_or_vacant_lot_: development.Development_Address_Is_KDRB_OR_Vacant,
            street_number: development.Development_Address_Street_Number,// REQUIRED AND SHOW IF Land Title is Yes
            expected_titles: development.Development_Address_Expected_Titles_Text,// REQUIRED AND SHOW IF Land Title is No
            lot_number: development.Development_Address_Lot_No, // REQUIRED AND SHOW IF is KDRB or Vacant is Vacant Lot
            street_name: development.Development_Address_Street_Name,
            suburb: development.Development_Address_Suburb,
            state: development.Development_Address_State,
            postcode:development.Development_Address_Postcode,

            site_start: (development.Development_Address_Site_Start_Text),
            land_settlement: (development.Development_Address_Site_Land_Settlement_Text),

            is_the_deposit_from_buyer_1_or_buyer_2_:deposit.Deposit_Who_Paying_Deposit,
            range:deposit.Deposit_Range,
            // deposit_source:deposit.Deposit_Deposit_Source,
            deposit_type: deposit.Deposit_Deposit_Desc,
            package_type:deposit.Deposit_Package_Type,
            context:deposit.Deposit_Context,
            sale_type:deposit.Sale_Type,
            amount_paid:deposit.Deposit_Amount_Paid,
            amount_paid__print_:deposit.Deposit_Amount_Paid_Print,
            payment_method:deposit.Deposit_Payment_Method,
            terminal_number: deposit.Deposit_Payment_Method === 'Credit Card' || deposit.Deposit_Payment_Method === 'Debit Card' ?'Bpoint':'', //REQURIE AND SHOW IF Deposit_Payment_Method  debit card/creditCard Value is Bpoint
            // selected_promotion_type: deposit.Deposit_Promotion_Type,
            sales_accept_forecast: (deposit.Deposit_Sales_Accept_Forecast_Text), // Date
            comment:deposit.Deposit_Comment,

            // selected_team:system.System_Team,
            // simonds_representative_manager__text_: user.firstName+ ' '+user.lastName,
            simonds_representative: parseInt(ownerId),
            // simonds_representative: JSON.stringify({owner_id: parseInt(ownerId),firstname: user.firstName,email: user.email,lastname: user.lastName}),
        },
        associations: [
            {
                to: {
                    id: currentBuyerId,
                },
                types: [
                    {
                        associationCategory: 'USER_DEFINED',
                        associationTypeId: 133,
                    },
                ],
            },
        ],
    };
    // return request;

    const createdDeposit =  await hubspotClient.crm.objects.basicApi.create('2-35849675', request);

    await createAssociates({createdDeposit, buyer, development, deposit, system, user, currentBuyer, currentBuyerId });

    return createdDeposit;
}

async function createAssociates({createdDeposit, buyer, development, deposit, system, user, currentBuyer, currentBuyerId }) {

    const depositId = createdDeposit.id
    const depositType = '2-35849675'
    const associatesTypes = [
        {name:'deposit_to_developers', typeId: '2-35849673', value: development.Development_Developer === 'unknown'?null:development.Development_Developer},
        {name:'deposit_to_display_centre', typeId: '2-35849679', value: development.Development_Display_Centre === 'unknown'?null:development.Development_Display_Centre},
        {name:'deposit_to_estates', typeId: '2-35849678', value: development.Development_Estate === 'unknown'?null:development.Development_Estate},
        {name:'deposit_to_facades', typeId: '2-35849680', value: development.Development_Facade === 'unknown'?null:development.Development_Facade},
        {name:'deposit_to_house_types', typeId: '2-35849682', value: development.Development_House_Type === 'unknown'?null:development.Development_House_Type},
        {name:'deposit_to_promotion_types', typeId: '2-35849677', value: deposit.Deposit_Promotion_Type === 'unknown'?null:deposit.Deposit_Promotion_Type},
        // {name:'deposit_to_regions', typeId: '2-35849671', value: development.Development_Region},
        {name:'deposit_to_teams', typeId: '2-35849672', value: system.System_Team},
    ];
    associatesTypes.map(async (associatesType) => {
        if(associatesType.value){
            await hubspotClient.crm.objects.associationsApi.create(
                depositType,
                depositId,
                associatesType.typeId,
                associatesType.value,
                associatesType.name
            );
        }

    })
}