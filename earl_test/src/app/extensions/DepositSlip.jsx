import React, {useState} from "react";
import axios from "axios";
import {
    Divider,
    Link,
    Button,
    Text,
    Input,
    Select,
    Flex,
    hubspot,
    Checkbox,
    Accordion,
    Form,
    Heading,
    Icon,
    List,
    LoadingSpinner
} from "@hubspot/ui-extensions";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({context, runServerlessFunction, actions}) => (
    <Extension
        context={context}
        runServerless={runServerlessFunction}
        sendAlert={actions.addAlert}
    />
));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({context, runServerless, sendAlert}) => {

    const [hasBuyer2, setHasBuyer2] = useState(false);
    const [buyerAddressSearch, setBuyerAddressSearch] = useState("");
    const [buyerAddressSuggestions, setBuyerAddressSuggestions] = useState([]);
    const [showBuyerAddressFields, setShowBuyerAddressFields] = useState(false);
    const [googleMapsAPIKey, setGoogleMapsAPIKey] = useState('AIzaSyCRzHOewiZAy5tHTd3ViTIN7Z7RAD6vqy8');
    const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
    const [isAddressSelectedLoading, setIsAddressSelectedLoading] = useState(false);
    const [authenticateApiResponse, setAuthenticateApiResponse] = useState("");
    const [btnAuthenticateLoading, setBtnAuthenticateLoading] = useState("Authenticate with UAT Framework API");

    const [buyer, setBuyer] = useState({
        Buyer_1_Given_Name: '',
        Buyer_1_Surname: '',
        Buyer_1_Email_Not_Provided: false,
        Buyer_1_Email: '',
        Buyer_1_Mobile: '',
        Buyer_1_Business_Number: '',
        Buyer_1_After_Hours: '',
        Buyer_Add_Second_Buyer: false,

        Buyer_2_Given_Name: '',
        Buyer_2_Surname: '',
        Buyer_2_Email_Not_Provided: false,
        Buyer_2_Email: '',
        Buyer_2_Mobile: '',
        Buyer_2_Business_Number: '',
        Buyer_2_After_Hours: '',

        Buyer_Info_Street_Number: '',
        Buyer_Info_Street_Name: '',
        Buyer_Info_Suburb: [],
        Buyer_Info_State: '',
        Postcode: ''

    });

    const [development, setDevelopment] = useState({
        Development_Developer: '',
        Development_Developer_Desc: '',
        Development_Estate: '',
        Development_Estate_Desc: '',
        Development_Display_Centre: '',
        Development_House_Type: '',
        Development_House_Type_Desc: '',
        Development_Size: '',
        Development_Facade: '',
        Development_Region: '',

        Development_Address_Is_Land_Titled: '',
        Development_Address_Is_KDRB_OR_Vacant: '',
        Development_Address_Street_Number: '',// REQUIRED AND SHOW IF Land Title is Yes
        Development_Address_Expected_Titles: '',// REQUIRED AND SHOW IF Land Title is No
        Development_Address_Lot_No: '', // REQUIRED AND SHOW IF is KDRB or Vacant is Vacant Lot
        Development_Address_Street_Name: '',

        Development_Address_Suburb: '',
        Development_Address_State: '',
        Development_Address_Postcode: '',
        Development_Address_Site_Start: '',
        Development_Address_Site_Land_Settlement: '',
    });

    const [depositDetails, setDepositDetails] = useState({
        Deposit_Who_Paying_Deposit: '',
        Deposit_Range: '',
        Deposit_Deposit_Source: '',
        Deposit_Deposit_Desc: '',
        Deposit_Package_Type: '',
        Deposit_Context: '',
        Deposit_Amount_Paid: '',
        Deposit_Amount_Paid_Print: '',
        Deposit_Payment_Method: '',

        Deposit_Payment_Terminal_Number: '', //REQURIE AND SHOW IF Deposit_Payment_Method  debit card/creditCard Value is Bpoint

        Deposit_Promotion_Type: '',
        Deposit_Sales_Accept_Forecast: '', // Date
        Deposit_Comment: '',
    });



    const [systemDetails, setSystemDetails] = useState({
        System_Representative: '', //login user
        System_Company_Name: '',
    });

    const yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
        { label: '--None--', value: '' },
    ];
    const KDRBOptions = [
        { label: 'KDRB', value: 'KDRB' },
        { label: 'Vacant Lot', value: 'Vacant Lot' },
        { label: '--None--', value: '' },
    ];
    const [validationMessage, setValidationMessage] = useState({
        Development_Address_Is_Land_Titled: '',
        Development_Address_Is_KDRB_OR_Vacant: '',
    });
    const [isValid, setIsValid] = useState({
        Development_Address_Is_Land_Titled: true,
        Development_Address_Is_KDRB_OR_Vacant: true,
    });


    const handleBuyerChange = (field, val) => {
        setBuyer({
            ...buyer,
            [field]: val,
        });

    }

    const handleDevelopmentChange = (field, val) => {
        setDevelopment({
            ...development,
            [field]: val,
        });
    };


    const enterAddressManually = () => {
        setShowBuyerAddressFields(true);
    }

    const handleAddressSearch = async (searchValue) => {

        if (searchValue.length > 3) {
            setIsAddressSearchLoading(true);

            setBuyerAddressSearch(searchValue);

            const {response} = await runServerless({
                name: "gmapsSearchAddress",
                parameters: {searchValue: searchValue, googleMapsAPIKey: googleMapsAPIKey, placeId: false}
            });
            setIsAddressSearchLoading(false);
            console.log("address_suggestion", response.predictions);
            if (response) {
                setBuyerAddressSuggestions(response.predictions);
                setShowBuyerAddressFields(true);
            }
        }


    };

    const sendFrameworkUATAPIAuthenticate = async () => {

        setBtnAuthenticateLoading("loading...");
        setAuthenticateApiResponse("");
        const {response} = await runServerless({name: "frameworkApiUATAuthenticate", parameters: {}});

        setAuthenticateApiResponse(JSON.stringify(response));
        setBtnAuthenticateLoading("Authenticate with UAT Framework API");

    };

    const handleAddressSelect = async (placeId) => {
        try {

            setIsAddressSelectedLoading(true);
            const {response} = await runServerless({
                name: "gmapsSearchAddress",
                parameters: {searchValue: false, googleMapsAPIKey: googleMapsAPIKey, placeId: placeId}
            });
            setIsAddressSelectedLoading(false);
            const addressDetails = response.result;
            const streetNumber = addressDetails.address_components.find((comp) =>
                comp.types.includes("street_number")
            )?.long_name;
            const streetName = addressDetails.address_components.find((comp) =>
                comp.types.includes("route")
            )?.long_name;
            const suburb = addressDetails.address_components.find((comp) =>
                comp.types.includes("locality")
            )?.long_name;
            const state = addressDetails.address_components.find((comp) =>
                comp.types.includes("administrative_area_level_1")
            )?.long_name;
            const postcode = addressDetails.address_components.find((comp) =>
                comp.types.includes("postal_code")
            )?.long_name;

            setBuyer({
                Buyer_Info_Street_Number: streetNumber || "",
                Buyer_Info_Street_Name: streetName || "",
                Buyer_Info_Suburb: suburb || "",
                Buyer_Info_State: state || "",
                Postcode: postcode || "",
            });

            setShowBuyerAddressFields(true);
            setBuyerAddressSuggestions([]);
        } catch (error) {
            console.error("Error fetching place details", error);
        }
    };

    // Call serverless function to execute with parameters.
    // The `myFunc` function name is configured inside `serverless.json`
    // const handleClick = async () => {
    //   const { response } = await runServerless({ name: "myFunc", parameters: { text: text } });
    //   sendAlert({ message: response });
    // };
    const budgetInfo = (
        <>
            <Heading>
                <Icon name="contact" /> Buyer Information
            </Heading>

            <Accordion title={hasBuyer2 ? "Buyer 1 Details" : "Buyer Details"} size="sm" defaultOpen={true}>
                <Input
                    value={buyer.Buyer_1_Given_Name}
                    name="Buyer_1_Given_Name"
                    label="Given Name"
                    required={true}
                    onChange={(val) => handleBuyerChange("Buyer_1_Given_Name", val)}
                />
                <Input
                    value={buyer.Buyer_1_Surname}
                    name="Buyer_1_Surname"
                    label="Surname"
                    required={true}
                    onChange={(val) => handleBuyerChange("Buyer_1_Surname", val)}
                />
                <Checkbox
                    checked={buyer.Buyer_1_Email_Not_Provided}
                    name="Buyer_1_Email_Not_Provided"
                    onChange={(val) => handleBuyerChange("Buyer_1_Email_Not_Provided", val)}
                >
                    Email Not Provided
                </Checkbox>
                {!buyer.Buyer_1_Email_Not_Provided && (
                    <Input
                        name="Buyer_1_Email"
                        description="Receipts for online payments will be sent to this address."
                        label="Email"
                        required={true}
                        value={buyer.Buyer_1_Email}
                        onChange={(val) => handleBuyerChange("Buyer_1_Email", val)}
                    />
                )}
                <Input
                    name="Buyer_1_Mobile"
                    label="Mobile"
                    required={true}
                    value={buyer.Buyer_1_Mobile}
                    onChange={(val) => handleBuyerChange("Buyer_1_Mobile", val)}
                />
                <Input
                    name="Buyer_1_Business_Number"
                    label="Business Number"
                    value={buyer.Buyer_1_Business_Number}
                    onChange={(val) => handleBuyerChange("Buyer_1_Business_Number", val)}
                />
                <Input
                    name="Buyer_1_After_Hours"
                    label="After Hour Number"
                    value={buyer.Buyer_1_After_Hours}
                    onChange={(val) => handleBuyerChange("Buyer_1_After_Hours", val)}
                />
                <Checkbox
                    name="Buyer_Add_Second_Buyer"
                    checked={hasBuyer2}
                    onChange={() => setHasBuyer2(!hasBuyer2)}
                >
                    Add Second Buyer Details
                </Checkbox>
            </Accordion>

            {hasBuyer2 && (
                <>
                    <Divider />
                    <Accordion title="Buyer 2 Details" size="sm" defaultOpen={true}>
                        <Input
                            value={buyer.Buyer_2_Given_Name}
                            name="Buyer_2_Given_Name"
                            label="Given Name"
                            required={true}
                            onChange={(val) => handleBuyerChange("Buyer_2_Given_Name", val)}
                        />
                        <Input
                            value={buyer.Buyer_2_Surname}
                            name="Buyer_2_Surname"
                            label="Surname"
                            required={true}
                            onChange={(val) => handleBuyerChange("Buyer_2_Surname", val)}
                        />
                        <Checkbox
                            checked={buyer.Buyer_2_Email_Not_Provided}
                            name="Buyer_2_Email_Not_Provided"
                            onChange={(val) => handleBuyerChange("Buyer_2_Email_Not_Provided", val)}
                        >
                            Email Not Provided
                        </Checkbox>
                        {!buyer.Buyer_2_Email_Not_Provided && (
                            <Input
                                value={buyer.Buyer_2_Email}
                                name="Buyer_2_Email"
                                label="Email"
                                required={true}
                                onChange={(val) => handleBuyerChange("Buyer_2_Email", val)}
                            />
                        )}
                        <Input
                            value={buyer.Buyer_2_Mobile}
                            name="Buyer_2_Mobile"
                            label="Mobile"
                            required={true}
                            onChange={(val) => handleBuyerChange("Buyer_2_Mobile", val)}
                        />
                        <Input
                            value={buyer.Buyer_2_Business_Number}
                            name="Buyer_2_Business_Number"
                            label="Business Number"
                            onChange={(val) => handleBuyerChange("Buyer_2_Business_Number", val)}
                        />
                        <Input
                            value={buyer.Buyer_2_After_Hours}
                            name="Buyer_2_After_Hours"
                            label="After Hour Number"
                            onChange={(val) => handleBuyerChange("Buyer_2_After_Hours", val)}
                        />
                    </Accordion>
                </>
            )}

            <Divider />

            <Accordion title="Buyer Current Address" size="sm" defaultOpen={true}>
                <Input
                    name="buyerAddressSearch"
                    label="Search Address"
                    value={buyerAddressSearch}
                    onInput={(val) => handleAddressSearch(val)}
                />
                {isAddressSearchLoading && (
                    <LoadingSpinner label="Getting address suggestions..." />
                )}
                <Checkbox onChange={enterAddressManually}>Enter Address Manually</Checkbox>

                {isAddressSelectedLoading && <LoadingSpinner label="Fetching address..." />}

                {buyerAddressSuggestions.length > 0 && (
                    <List>
                        {buyerAddressSuggestions.map((suggestion) => (
                            <Link
                                key={suggestion.place_id}
                                onClick={() => handleAddressSelect(suggestion.place_id)}
                            >
                                {suggestion.description}
                            </Link>
                        ))}
                    </List>
                )}

                {showBuyerAddressFields && (
                    <>
                        <Input
                            name="Buyer_Info_Street_Number"
                            label="Street Number"
                            value={buyer.Buyer_Info_Street_Number}
                            readOnly
                        />
                        <Input
                            name="Buyer_Info_Street_Name"
                            label="Street Name"
                            value={buyer.Buyer_Info_Street_Name}
                            readOnly
                        />
                        <Input
                            name="Buyer_Info_Suburb"
                            label="Suburb"
                            value={buyer.Buyer_Info_Suburb}
                            readOnly
                        />
                        <Input
                            name="Buyer_Info_State"
                            label="State"
                            value={buyer.Buyer_Info_State}
                            readOnly
                        />
                        <Input
                            name="Postcode"
                            label="Postcode"
                            value={buyer.Postcode}
                            readOnly
                        />
                    </>
                )}
            </Accordion>
        </>
    );


    const developmentDetails = (
        <>
            <Heading>
                <Icon name="home" /> Development Details
            </Heading>

            <Accordion title="Development Details" size="sm" defaultOpen={false}>
                <Input
                    name="Development_Developer"
                    label="Developer"
                    value={development.Development_Developer}
                    onChange={(val) => handleDevelopmentChange("Development_Developer", val)}
                />
                <Input
                    name="Development_Developer_Desc"
                    label="Developer Description"
                    value={development.Development_Developer_Desc}
                    onChange={(val) => handleDevelopmentChange("Development_Developer_Desc", val)}
                />
                <Input
                    name="Development_Estate"
                    label="Estate"
                    value={development.Development_Estate}
                    onChange={(val) => handleDevelopmentChange("Development_Estate", val)}
                />
                <Input
                    name="Development_Estate_Desc"
                    label="Estate Description"
                    value={development.Development_Estate_Desc}
                    onChange={(val) => handleDevelopmentChange("Development_Estate_Desc", val)}
                />
                <Input
                    name="Development_Display_Centre"
                    label="Display Centre"
                    value={development.Development_Display_Centre}
                    onChange={(val) => handleDevelopmentChange("Development_Display_Centre", val)}
                />
                <Input
                    name="Development_House_Type"
                    label="House Type"
                    value={development.Development_House_Type}
                    onChange={(val) => handleDevelopmentChange("Development_House_Type", val)}
                />
                <Input
                    name="Development_House_Type_Desc"
                    label="House Type Description"
                    value={development.Development_House_Type_Desc}
                    onChange={(val) => handleDevelopmentChange("Development_House_Type_Desc", val)}
                />
                <Input
                    name="Development_Size"
                    label="Size"
                    value={development.Development_Size}
                    onChange={(val) => handleDevelopmentChange("Development_Size", val)}
                />
                <Input
                    name="Development_Facade"
                    label="Facade"
                    value={development.Development_Facade}
                    onChange={(val) => handleDevelopmentChange("Development_Facade", val)}
                />
                <Input
                    name="Development_Region"
                    label="Region"
                    value={development.Development_Region}
                    onChange={(val) => handleDevelopmentChange("Development_Region", val)}
                />
            </Accordion>
            <Divider/>
            <Accordion title="Development Address" size="sm" defaultOpen={false}>
                <Select
                    label="Is the Land Titled?"
                    name="Development_Address_Is_Land_Titled"
                    placeholder="--None--"
                    required={true}
                    error={!isValid.Development_Address_Is_Land_Titled}
                    validationMessage={validationMessage.Development_Address_Is_Land_Titled}
                    onChange={(value) => {
                        setDevelopment({
                            ...development,
                            Development_Address_Is_Land_Titled: value,
                        });
                        if (!value) {
                            setValidationMessage((prevState) => ({
                                ...prevState,
                                Development_Address_Is_Land_Titled: 'This is required',
                            }));
                            setIsValid((prevState) => ({
                                ...prevState,
                                Development_Address_Is_Land_Titled: false,
                            }));
                        } else {
                            setValidationMessage((prevState) => ({
                                ...prevState,
                                Development_Address_Is_Land_Titled: '',
                            }));
                            setIsValid((prevState) => ({
                                ...prevState,
                                Development_Address_Is_Land_Titled: true,
                            }));
                        }
                    }}
                    options={yesNoOptions}
                />

                <Select
                    label="Is this a KDRB or Vacant Lot?"
                    name="Development_Address_Is_KDRB_OR_Vacant"
                    placeholder="--None--"
                    required={true}
                    error={!isValid.Development_Address_Is_KDRB_OR_Vacant}
                    validationMessage={validationMessage.Development_Address_Is_KDRB_OR_Vacant}
                    onChange={(value) => {
                        setDevelopment({
                            ...development,
                            Development_Address_Is_KDRB_OR_Vacant: value,
                        });
                        if (!value) {
                            setValidationMessage((prevState) => ({
                                ...prevState,
                                Development_Address_Is_KDRB_OR_Vacant: 'This is required',
                            }));
                            setIsValid((prevState) => ({
                                ...prevState,
                                Development_Address_Is_KDRB_OR_Vacant: false,
                            }));
                        } else {
                            setValidationMessage((prevState) => ({
                                ...prevState,
                                Development_Address_Is_KDRB_OR_Vacant: '',
                            }));
                            setIsValid((prevState) => ({
                                ...prevState,
                                Development_Address_Is_KDRB_OR_Vacant: true,
                            }));
                        }
                    }}
                    options={KDRBOptions}
                />


                {development.Development_Address_Is_Land_Titled == "Yes" && (
                    <Input
                        name="Development_Address_Street_Number"
                        label="Street Number"
                        value={development.Development_Address_Street_Number}
                        required
                        onChange={(val) => handleDevelopmentChange("Development_Address_Street_Number", val)}
                    />
                )}
                {development.Development_Address_Is_Land_Titled == "No" && (
                    <Input
                        name="Development_Address_Expected_Titles"
                        label="Expected Titles"
                        value={development.Development_Address_Expected_Titles}
                        required
                        onChange={(val) => handleDevelopmentChange("Development_Address_Expected_Titles", val)}
                    />
                )}
                {development.Development_Address_Is_KDRB_OR_Vacant === "Vacant Lot" && (
                    <Input
                        name="Development_Address_Lot_No"
                        label="Lot Number"
                        value={development.Development_Address_Lot_No}
                        required
                        onChange={(val) => handleDevelopmentChange("Development_Address_Lot_No", val)}
                    />
                )}

            {/*    <Input*/}
            {/*        name="Development_Address_Street_Name"*/}
            {/*        label="Street Name"*/}
            {/*        value={development.Development_Address_Street_Name}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_Street_Name", val)}*/}
            {/*    />*/}
            {/*    <Input*/}
            {/*        name="Development_Address_Suburb"*/}
            {/*        label="Suburb"*/}
            {/*        value={development.Development_Address_Suburb}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_Suburb", val)}*/}
            {/*    />*/}
            {/*    <Input*/}
            {/*        name="Development_Address_State"*/}
            {/*        label="State"*/}
            {/*        value={development.Development_Address_State}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_State", val)}*/}
            {/*    />*/}
            {/*    <Input*/}
            {/*        name="Development_Address_Postcode"*/}
            {/*        label="Postcode"*/}
            {/*        value={development.Development_Address_Postcode}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_Postcode", val)}*/}
            {/*    />*/}
            {/*    <Input*/}
            {/*        name="Development_Address_Site_Start"*/}
            {/*        label="Site Start"*/}
            {/*        value={development.Development_Address_Site_Start}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_Site_Start", val)}*/}
            {/*    />*/}
            {/*    <Input*/}
            {/*        name="Development_Address_Site_Land_Settlement"*/}
            {/*        label="Land Settlement"*/}
            {/*        value={development.Development_Address_Site_Land_Settlement}*/}
            {/*        onChange={(val) => handleDevelopmentChange("Development_Address_Site_Land_Settlement", val)}*/}
            {/*    />*/}
            </Accordion>
        </>
    );


    return (
        <>
            <Form>
                {budgetInfo}
                {developmentDetails}
            </Form>
        </>
    );

};
