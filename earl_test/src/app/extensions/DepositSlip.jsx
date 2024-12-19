import React, {useEffect, useState, useCallback} from "react";
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
    Tile,
    DescriptionList,
    DescriptionListItem,
    DateInput,
    NumberInput,
    Modal,
    ModalBody,
    ModalFooter,
    LoadingSpinner, ButtonRow
} from "@hubspot/ui-extensions";
import {
    yesNoOptions,
    KDRBOptions,
    regionOptions,
    rangeOptions,
    depositSourceOptions,
    depositDescriptionOptions,
    packageTypeOptions,
    contextOptions,
    whoisPayingOptions,
    paymentMethodOptions
} from './depositSlipSrc/DropdownOptions';

import useBuyer from './depositSlipSrc/useBuyer';
import useDevelopment from './depositSlipSrc/useDevelopment';
import useDeposit from './depositSlipSrc/useDeposit';

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({context, runServerlessFunction, actions}) => (<Extension
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
    fetchProperties={actions.fetchCrmObjectProperties}
    actions={actions}
/>));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({context, runServerless, sendAlert, fetchProperties, actions}) => {


    const user = context.user;
    const [loading, setLoading] = useState(true);
    const [hasBuyer2, setHasBuyer2] = useState(false);
    const [buyerAddressSearch, setBuyerAddressSearch] = useState("");
    const [buyerAddressSuggestions, setBuyerAddressSuggestions] = useState([]);
    const [showBuyerAddressFields, setShowBuyerAddressFields] = useState(false);
    const [isAddressManually, setIsAddressManually] = useState(false);
    const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
    const [isAddressSelectedLoading, setIsAddressSelectedLoading] = useState(false);

    const [devAddressSearch, setDevAddressSearch] = useState("");
    const [devAddressSuggestions, setDevAddressSuggestions] = useState([]);
    const [showDevAddressFields, setShowDevAddressFields] = useState(false);
    const [allowEditDevAddressFields, setAllowEditDevAddressFields] = useState(false);
    const [isDevAddressSearchLoading, setIsDevAddressSearchLoading] = useState(false);
    const [isDevAddressSelectedLoading, setIsDevAddressSelectedLoading] = useState(false);

    const [googleMapsAPIKey, setGoogleMapsAPIKey] = useState('AIzaSyCRzHOewiZAy5tHTd3ViTIN7Z7RAD6vqy8');
    const [authenticateApiResponse, setAuthenticateApiResponse] = useState("");
    const [btnAuthenticateLoading, setBtnAuthenticateLoading] = useState("Authenticate with UAT Framework API");

    const [developers, setDevelopers] = useState([]);
    const [estates, setEstates] = useState([]);
    const [displayCentre, setDisplayCentre] = useState([]);
    const [facades, setFacades] = useState([]);
    const [houseTypes, setHouseTypes] = useState([]);
    const [promotionTypes, setPromotionTypes] = useState([]);
    const [teams, setTeams] = useState([]);
    const [regions, setRegions] = useState([]);

    const [currentBuyerId, setCurrentBuyerId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [showFirstButton, setShowFirstButton] = useState(false);
    const [showSecondButton, setShowSecondButton] = useState(false);

    const [currentBuyer, setCurrentBuyer] = useState({
        contact_email: "",
        contact_first_name: "",
        contact_last_name: "",
        contact_phone: "null"
    });
    const [dealDeposits, setDealDeposits] = useState(null);
    const [currentDeposit, setCurrentDeposit] = useState(null);

    // useEffect(() => {
    //     console.log(currentBuyer)
    // }, [currentBuyer]);
    // useEffect(() => {
    //     console.log(dealDeposits)
    // }, [dealDeposits]);
    // useEffect(() => {
    //     console.log(user)
    // }, [user]);
    useEffect(() => {
        runServerless({name: "fetchDropdownOptions"}).then((resp) => {
            if (resp.status === "SUCCESS") {
                setDevelopers(resp.response.data.CRM?.p_developers_collection?.items || []);
                setEstates(resp.response.data.CRM?.p_estates_collection?.items || []);
                setDisplayCentre(resp.response.data.CRM?.p_display_centre_collection?.items || []);
                setFacades(resp.response.data.CRM?.p_facades_collection?.items || []);
                setHouseTypes(resp.response.data.CRM?.p_house_types_collection?.items || []);
                setPromotionTypes(resp.response.data.CRM?.p_promotion_types_collection?.items || []);
                setRegions(resp.response.data.CRM?.p_regions_collection?.items || []);

                const initialTeamOption = resp.response.data.CRM?.p_teams_collection?.items;

                setTeams([{label: '--None--', value: '--None--'}, ...initialTeamOption.map(item => ({
                    label: item.name, value: item.hs_object_id
                }))] || []);

            }
            // setDeposit({...deposit, Deposit_Who_Paying_Deposit: 'Buyer 1'})
        });
    }, []);

    const [whoisPayingOptionsFinal, setWhoisPayingOptionsFinal] = useState(whoisPayingOptions);
    useEffect(() => {
        if (hasBuyer2) {
            setWhoisPayingOptionsFinal(whoisPayingOptions)
            setDeposit({...deposit, Deposit_Who_Paying_Deposit: ''})
        }else{
            setDeposit({...deposit, Deposit_Who_Paying_Deposit: whoisPayingOptions[0].value})
            setWhoisPayingOptionsFinal([{label: 'Buyer 1', value: 'Buyer 1'}])
        }
    }, [hasBuyer2]);
    useEffect(() => {
        fetchProperties(["hs_object_id"]).then((properties) => {
            setCurrentBuyerId(properties.hs_object_id);
        });

    }, [fetchProperties]);
    useEffect(() => {
        runServerless({name: "fetchBuyerDetails", parameters: {hs_object_id: currentBuyerId}}).then((resp) => {
            // console.log(resp);
            if (resp.status === "SUCCESS") {
                setCurrentBuyer(resp.response.data.CRM.deal);

                const depositItems = resp.response.data.CRM.deal?.associations.p_deposit_collection__deal_to_deposit.items
                setDealDeposits(depositItems);
                console.log(depositItems)
                if (depositItems.length === 0) {
                    setShowFirstButton(true)
                    setDeposit({...deposit, Deposit_Deposit_Desc: depositDescriptionOptions[0].value})
                } else {
                    if (depositItems[0].deposit_type === "Initial Fee") {
                        setShowSecondButton(true)
                    }
                    setCurrentDeposit(depositItems[0]);
                }
            }
            setLoading(false);
        });
    }, [currentBuyerId]);
    useEffect(() => {
        handleBuyerChange('Buyer_1_Given_Name', currentBuyer.contact_first_name);
        handleBuyerChange('Buyer_1_Surname', currentBuyer.contact_last_name);
        handleBuyerChange('Buyer_1_Email_Not_Provided', currentBuyer.contact_email === '');
        handleBuyerChange('Buyer_1_Email', currentBuyer.contact_email);
        handleBuyerChange('Buyer_1_Mobile', currentBuyer.contact_phone);
    }, [currentBuyer]);

    const {buyer, setBuyer, handleBuyerChange} = useBuyer();
    const {development, setDevelopment, handleDevelopmentChange} = useDevelopment();
    const {deposit, setDeposit, handleDepositChange} = useDeposit();

    const [system, setSystem] = useState({
        System_Team: '',
        System_Representative: user.firstName + " " + user.lastName, //login user
        // System_Company_Name: 'Not Set',
    });

    const [validationMessage, setValidationMessage] = useState({
        Development_Address_Is_Land_Titled: '', Development_Address_Is_KDRB_OR_Vacant: '',
    });
    const [isValid, setIsValid] = useState({
        Development_Address_Is_Land_Titled: true, Development_Address_Is_KDRB_OR_Vacant: true,
    });
    const handleDevelopmentRegionChange = (region) => {
        setDevelopment({...development, Development_Region: region})
        const selectedRegion = regions.find(item => item.hs_object_id === region);

        // If the region is found, extract the label
        const regionLabel = selectedRegion ? selectedRegion.name : '';

        if(region){
            const filteredTeams = teams.filter(item => item.label.startsWith(regionLabel));
            const filteredTeamOption = [{label: '--None--', value: '--None--'}, ...filteredTeams];

            setTeams(filteredTeamOption || []);
        }
    }
    const enterAddressManually = (checked) => {
        setShowBuyerAddressFields(true);
        setIsAddressManually(!checked);
    }
    const enterDevAddressManually = (checked) => {
        setShowDevAddressFields(true);
        setAllowEditDevAddressFields(!checked);
    }
    const handleDevAddressSearch = async (searchValue) => {

        if (searchValue.length > 3) {
            setIsDevAddressSearchLoading(true);

            setDevAddressSearch(searchValue);

            const {response} = await runServerless({
                name: "gmapsSearchAddress",
                parameters: {searchValue: searchValue, googleMapsAPIKey: googleMapsAPIKey, placeId: false, suburb: true}
            });
            setIsDevAddressSearchLoading(false);
            console.log("address_suggestion", response.predictions);
            if (response) {
                setDevAddressSuggestions(response.predictions);
                setShowDevAddressFields(true);
            }
        }


    };
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
            console.log(addressDetails)
            const streetNumber = addressDetails.address_components.find((comp) => comp.types.includes("street_number"))?.long_name;
            const streetName = addressDetails.address_components.find((comp) => comp.types.includes("route"))?.long_name;
            const suburb = addressDetails.address_components.find((comp) => comp.types.includes("locality"))?.long_name;
            const state = addressDetails.address_components.find((comp) => comp.types.includes("administrative_area_level_1"))?.short_name;
            const postcode = addressDetails.address_components.find((comp) => comp.types.includes("postal_code"))?.long_name;

            handleBuyerChange('Buyer_Info_Street_Number', streetNumber || "")
            handleBuyerChange('Buyer_Info_Street_Name', streetName || "")
            handleBuyerChange('Buyer_Info_Suburb', suburb || "")
            handleBuyerChange('Buyer_Info_State', state || "")
            handleBuyerChange('Postcode', postcode || "")

            setShowBuyerAddressFields(true);
            setBuyerAddressSuggestions([]);
        } catch (error) {
            console.error("Error fetching place details", error);
        }
    };
    const handleDevAddressSelect = async (placeId) => {
        try {

            setIsDevAddressSelectedLoading(true);
            const {response} = await runServerless({
                name: "gmapsSearchAddress",
                parameters: {searchValue: false, googleMapsAPIKey: googleMapsAPIKey, placeId: placeId}
            });
            setIsDevAddressSelectedLoading(false);
            const addressDetails = response.result;
            const suburb = addressDetails.address_components.find((comp) => comp.types.includes("locality"))?.long_name;
            const state = addressDetails.address_components.find((comp) => comp.types.includes("administrative_area_level_1"))?.short_name;
            const postcode = addressDetails.address_components.find((comp) => comp.types.includes("postal_code"))?.long_name;

            handleDevelopmentChange('Development_Address_Suburb', suburb || "");
            handleDevelopmentChange('Development_Address_State', state || "");
            handleDevelopmentChange('Development_Address_Postcode', postcode || "");

            setShowDevAddressFields(true);
            setDevAddressSuggestions([]);
        } catch (error) {
            console.error("Error fetching place details", error);
        }
    };

    const handleChangePaymentMethod = (value) => {
        setDeposit({...deposit, Deposit_Payment_Method: value})
        if ((deposit.Deposit_Payment_Method === 'Credit Card' || deposit.Deposit_Payment_Method === 'Debit Card')) {
            setDeposit({...deposit, Deposit_Payment_Terminal_Number: 'Bpoint'})
        }
    }

    // Call serverless function to execute with parameters.
    // The `myFunc` function name is configured inside `serverless.json`
    // const handleClick = async () => {
    //   const { response } = await runServerless({ name: "myFunc", parameters: { text: text } });
    //   sendAlert({ message: response });
    // };

    const buyerDetails = (
        <Flex gap="sm" direction='column'>
            <Heading>
                <Icon name="contact"/> Buyer Information
            </Heading>

            <Accordion title={hasBuyer2 ? "Buyer 1 Details" : "Buyer Details"} size="sm" defaultOpen={true}>
                <Tile compact={true}>
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
                    <Input
                        name="Buyer_1_Email"
                        description="Receipts for online payments will be sent to this address."
                        label="Email"
                        required={true}
                        value={buyer.Buyer_1_Email}
                        onChange={(val) => handleBuyerChange("Buyer_1_Email", val)}
                    />
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
                </Tile>
            </Accordion>

            {hasBuyer2 && (
                <>
                    <Divider/>
                    <Accordion title="Buyer 2 Details" size="sm" defaultOpen={true}>
                        <Tile compact={true}>
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
                        </Tile>
                    </Accordion>
                </>
            )}

            <Divider/>

            <Accordion title="Buyer Current Address" size="sm" defaultOpen={true}>
                <Tile compact={true}>
                    <Input
                        name="buyerAddressSearch"
                        label="Search Address"
                        value={buyerAddressSearch}
                        onInput={(val) => handleAddressSearch(val)}
                    />
                    {isAddressSearchLoading && (<LoadingSpinner label="Getting address suggestions..."/>)}
                    <Checkbox onChange={enterAddressManually}>Enter Address Manually</Checkbox>

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
                                readOnly={isAddressManually}
                            />
                            <Input
                                name="Buyer_Info_Street_Name"
                                label="Street Name"
                                value={buyer.Buyer_Info_Street_Name}
                                readOnly={isAddressManually}
                            />
                            <Input
                                name="Buyer_Info_Suburb"
                                label="Suburb"
                                value={buyer.Buyer_Info_Suburb}
                                readOnly={isAddressManually}
                            />
                            <Input
                                name="Buyer_Info_State"
                                label="State"
                                value={buyer.Buyer_Info_State}
                                readOnly={isAddressManually}
                            />
                            <Input
                                name="Postcode"
                                label="Postcode"
                                value={buyer.Postcode}
                                readOnly={isAddressManually}
                            />
                        </>
                    )}
                </Tile>
            </Accordion>
        </Flex>
    );
    const developmentDetails = (
        <>
            <Flex gap="sm" direction='column'>
                <Heading>
                    <Icon name="home"/> Development Details
                </Heading>
                <Accordion title="Development Details" size="sm" defaultOpen={false}>
                    <Tile compact={true}>
                        <Select
                            label="Developer"
                            name="Development_Developer"
                            placeholder=""
                            required={true}
                            options={[{label: '[UNKNOWN]', value: 'unknown'}, ...developers.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))]}
                            onChange={(value) => setDevelopment({...development, Development_Developer: value})}
                        />

                        {development.Development_Developer === 'unknown' && (<Input
                            name="Development_Developer_Desc"
                            label="Developer Description"
                            placeholder=""
                            required={true}
                            value={development.Development_Developer_Desc}
                            onChange={(value) => handleDevelopmentChange("Development_Developer_Desc", value)}
                        />)}

                        <Select
                            label="Estate"
                            name="Development_Estate"
                            placeholder=""
                            required={true}
                            options={[{label: '[UNKNOWN]', value: 'unknown'}, ...estates.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))]}
                            onChange={(value) => setDevelopment({...development, Development_Estate: value})}
                        />
                        {development.Development_Estate === 'unknown' && (<Input
                            name="Development_Estate_Desc"
                            label="Estate Description"
                            placeholder=""
                            required={true}
                            value={development.Development_Estate_Desc}
                            onChange={(value) => handleDevelopmentChange("Development_Estate_Desc", value)}
                        />)}

                        <Select
                            label="Display Centre"
                            name="Development_Display_Centre"
                            placeholder=""
                            required={true}
                            options={[{label: '[UNKNOWN]', value: 'unknown'}, ...displayCentre.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))]}
                            onChange={(value) => setDevelopment({...development, Development_Display_Centre: value})}
                        />
                        {development.Development_Display_Centre === 'unknown' && (<Input
                            name="Development_Display_Centre_Desc"
                            label="Display Centre Description"
                            placeholder=""
                            required={true}
                            value={development.Development_Display_Centre_Desc}
                            onChange={(value) => handleDevelopmentChange("Development_Display_Centre_Desc", value)}
                        />)}

                        <Select
                            label="House Type"
                            name="Development_House_Type"
                            placeholder=""
                            required={true}
                            options={[{label: '[UNKNOWN]', value: 'unknown'}, ...houseTypes.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))]}
                            onChange={(value) => setDevelopment({...development, Development_House_Type: value})}
                        />
                        {development.Development_House_Type === 'unknown' && (<Input
                            name="Development_House_Type_Desc"
                            label="House Type Description"
                            placeholder=""
                            required={true}
                            value={development.Development_House_Type_Desc}
                            onChange={(value) => handleDevelopmentChange("Development_House_Type_Desc", value)}
                        />)}

                        <Input
                            name="Development_Size"
                            label="House Size"
                            value={development.Development_Size}
                            onChange={(value) => handleDevelopmentChange("Development_Size", value)}
                        />
                        <Select
                            label="Facade"
                            name="Development_Facade"
                            placeholder=""
                            required={true}
                            options={facades.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))}
                            onChange={(value) => setDevelopment({...development, Development_Facade: value})}
                        />
                        <Select
                            label="Region"
                            name="Development_Region"
                            placeholder=""
                            required={true}
                            options={regions.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))}
                            onChange={(value) => handleDevelopmentRegionChange(value)}
                        />
                    </Tile>
                </Accordion>
                <Divider/>
                <Accordion title="Development Address" size="sm" defaultOpen={false}>

                    <Tile compact={true}>
                        <Select
                            label="Is the Land Titled?"
                            name="Development_Address_Is_Land_Titled"
                            required={true}
                            error={!isValid.Development_Address_Is_Land_Titled}
                            validationMessage={validationMessage.Development_Address_Is_Land_Titled}
                            onChange={(value) => {
                                setDevelopment({
                                    ...development, Development_Address_Is_Land_Titled: value,
                                });
                                if (!value) {
                                    setValidationMessage((prevState) => ({
                                        ...prevState, Development_Address_Is_Land_Titled: 'This is required',
                                    }));
                                    setIsValid((prevState) => ({
                                        ...prevState, Development_Address_Is_Land_Titled: false,
                                    }));
                                } else {
                                    setValidationMessage((prevState) => ({
                                        ...prevState, Development_Address_Is_Land_Titled: '',
                                    }));
                                    setIsValid((prevState) => ({
                                        ...prevState, Development_Address_Is_Land_Titled: true,
                                    }));
                                }
                            }}
                            options={yesNoOptions}
                        />

                        <Select
                            label="Is this a KDRB or Vacant Lot?"
                            name="Development_Address_Is_KDRB_OR_Vacant"
                            placeholder=""
                            required={true}
                            error={!isValid.Development_Address_Is_KDRB_OR_Vacant}
                            validationMessage={validationMessage.Development_Address_Is_KDRB_OR_Vacant}
                            onChange={(value) => {
                                setDevelopment({
                                    ...development, Development_Address_Is_KDRB_OR_Vacant: value,
                                });
                                if (!value) {
                                    setValidationMessage((prevState) => ({
                                        ...prevState, Development_Address_Is_KDRB_OR_Vacant: 'This is required',
                                    }));
                                    setIsValid((prevState) => ({
                                        ...prevState, Development_Address_Is_KDRB_OR_Vacant: false,
                                    }));
                                } else {
                                    setValidationMessage((prevState) => ({
                                        ...prevState, Development_Address_Is_KDRB_OR_Vacant: '',
                                    }));
                                    setIsValid((prevState) => ({
                                        ...prevState, Development_Address_Is_KDRB_OR_Vacant: true,
                                    }));
                                }
                            }}
                            options={KDRBOptions}
                        />


                        {development.Development_Address_Is_Land_Titled === "Yes" && (<Input
                            name="Development_Address_Street_Number"
                            label="Street Number"
                            value={development.Development_Address_Street_Number}
                            required
                            onChange={(val) => handleDevelopmentChange("Development_Address_Street_Number", val)}
                        />)}
                        {development.Development_Address_Is_Land_Titled === "No" && (
                            <DateInput
                                label="Expected Titles"
                                name="Development_Address_Expected_Titles"
                                onChange={(val) => {
                                    handleDevelopmentChange("Development_Address_Expected_Titles", val)
                                    handleDevelopmentChange("Development_Address_Expected_Titles_Text", baseToUnix(val))
                                }}
                                value={development.Development_Address_Expected_Titles}
                                required
                                format="L"
                            />
                        )}
                        <Input
                            name="Development_Address_Lot_No"
                            label="Lot Number"
                            value={development.Development_Address_Lot_No}
                            required
                            onChange={(val) => handleDevelopmentChange("Development_Address_Lot_No", val)}
                        />

                        <Input
                            name="devAddressSearch"
                            label="Search Suburb"
                            value={devAddressSearch}
                            onInput={(val) => handleDevAddressSearch(val)}
                        />

                        {isDevAddressSearchLoading && (<LoadingSpinner label="Getting address suggestions..."/>)}
                        <Checkbox onChange={enterDevAddressManually}>Enter Suburb Manually</Checkbox>

                        {isDevAddressSelectedLoading && <LoadingSpinner label="Fetching address..."/>}

                        {devAddressSuggestions.length > 0 && (<List>
                            {devAddressSuggestions.map((suggestion) => (<Link
                                key={suggestion.place_id}
                                onClick={() => handleDevAddressSelect(suggestion.place_id)}
                            >
                                {suggestion.description}
                            </Link>))}
                        </List>)}

                        {showDevAddressFields && (<>
                            <Input
                                name="Development_Address_Suburb"
                                label="Suburb"
                                required={true}
                                readOnly={allowEditDevAddressFields}
                                value={development.Development_Address_Suburb}
                                onChange={(val) => handleDevelopmentChange("Development_Address_Suburb", val)}
                            />
                            <Input
                                name="Development_Address_State"
                                label="State"
                                required={true}
                                readOnly={allowEditDevAddressFields}
                                value={development.Development_Address_State}
                                onChange={(val) => handleDevelopmentChange("Development_Address_State", val)}
                            />
                            <Input
                                name="Development_Address_Postcode"
                                label="Postcode"
                                required={true}
                                readOnly={allowEditDevAddressFields}
                                value={development.Development_Address_Postcode}
                                onChange={(val) => handleDevelopmentChange("Development_Address_Postcode", val)}
                            />
                        </>)}
                        <DateInput
                            label="Site Start"
                            name="Development_Address_Site_Start"
                            onChange={(val) => {
                                handleDevelopmentChange("Development_Address_Site_Start", val)
                                handleDevelopmentChange("Development_Address_Site_Start_Text", baseToUnix(val))
                            }}
                            value={development.Development_Address_Site_Start}
                            format="L"
                        />
                        <DateInput
                            label="Land Settlement"
                            name="Development_Address_Site_Land_Settlement"
                            onChange={(val) => {
                                handleDevelopmentChange("Development_Address_Site_Land_Settlement", val)
                                handleDevelopmentChange("Development_Address_Site_Land_Settlement_Text", baseToUnix(val))
                            }}
                            value={development.Development_Address_Site_Land_Settlement}
                            format="L"
                        />
                    </Tile>
                </Accordion>
            </Flex>
        </>
    );

    const depositDetails = (
        <Flex gap="sm" direction='column'>
            <Heading>
                <Icon name="shoppingCart"/> Deposit Details
            </Heading>
            <Accordion title="Deposit Details" size="sm" defaultOpen={false}>
                <Tile compact={true}>
                    <Select
                        label="Who's paying this deposit?"
                        name="Deposit_Who_Paying_Deposit"
                        required={true}
                        options={whoisPayingOptionsFinal}
                        value={deposit.Deposit_Who_Paying_Deposit}
                        onChange={(value) => setDeposit({...deposit, Deposit_Who_Paying_Deposit: value})}
                    />
                    <Select
                        label="Range"
                        name="Deposit_Range"
                        placeholder=""
                        required={true}
                        options={rangeOptions}
                        onChange={(value) => setDeposit({...deposit, Deposit_Range: value})}
                    />
                    <Select
                        label="Deposit Source"
                        name="Deposit_Deposit_Source"
                        placeholder=""
                        options={depositSourceOptions}
                        onChange={(value) => setDeposit({...deposit, Deposit_Deposit_Source: value})}
                    />
                    <Select
                        label="Deposit Description"
                        name="Deposit_Deposit_Desc"
                        readOnly
                        required={true}
                        value={deposit.Deposit_Deposit_Desc}
                        options={depositDescriptionOptions}
                        onChange={(value) => setDeposit({...deposit, Deposit_Deposit_Desc: value})}
                    />
                    <Select
                        label="Package Type"
                        name="Deposit_Package_Type"
                        placeholder=""
                        required={true}
                        options={packageTypeOptions}
                        onChange={(value) => setDeposit({...deposit, Deposit_Package_Type: value})}
                    />
                    <Select
                        label="Context"
                        name="Deposit_Context"
                        placeholder=""
                        required={true}
                        options={contextOptions}
                        onChange={(value) => setDeposit({...deposit, Deposit_Context: value})}
                    />
                    <NumberInput
                        label="Amount Paid"
                        name="Deposit_Amount_Paid"
                        placeholder=""
                        required={true}
                        min={1}
                        value={deposit.Deposit_Amount_Paid}
                        onChange={(value) => handleDepositChange("Deposit_Amount_Paid", value)}
                    />
                    <Input
                        label={"Amount Paid \"Print\""}
                        name="Deposit_Amount_Paid_Print"
                        placeholder=""
                        required={true}
                        value={deposit.Deposit_Amount_Paid_Print}
                        onChange={(value) => handleDepositChange("Deposit_Amount_Paid_Print", value)}
                    />
                    <Select
                        label="Payment Method"
                        name="Deposit_Payment_Method"
                        placeholder=""
                        required={true}
                        options={paymentMethodOptions}
                        onChange={(value) => handleChangePaymentMethod(value)}
                    />
                    {(deposit.Deposit_Payment_Method === 'Credit Card' || deposit.Deposit_Payment_Method === 'Debit Card') && (
                        <Input
                            label="Terminal Number"
                            name="Deposit_Payment_Terminal_Number"
                            placeholder="Bpoint"
                            required={true}
                            value={deposit.Deposit_Payment_Terminal_Number}
                            onChange={(value) => setDeposit({...deposit, Deposit_Payment_Terminal_Number: value})}
                        />)}
                    <Select
                        label="Promotion Types"
                        name="Deposit_Promotion_Type"
                        placeholder=""
                        required={true}
                        options={[{label: '--None--', value: '--None--'}, ...promotionTypes.map(item => ({
                            label: item.name, value: item.hs_object_id
                        }))]}
                        onChange={(value) => setDeposit({...deposit, Deposit_Promotion_Type: value})}
                    />
                    <DateInput
                        label="Sales Accept Forecast"
                        name="Deposit_Sales_Accept_Forecast"
                        required={true}
                        timezone={'portalTz'}
                        onChange={(val) => {
                            handleDepositChange("Deposit_Sales_Accept_Forecast", val)
                            handleDepositChange("Deposit_Sales_Accept_Forecast_Text", baseToUnix(val))
                        }}
                        value={deposit.Deposit_Sales_Accept_Forecast}
                        format="L"
                    />
                    <Input
                        label="Comment"
                        name="Deposit_Comment"
                        placeholder=""
                        value={deposit.Deposit_Comment}
                        onChange={(value) => setDeposit({...deposit, Deposit_Comment: value})}
                    />
                </Tile>
            </Accordion>
        </Flex>
    );

    const systemDetails = (
        <>
            <Flex gap="sm" direction='column'>
                <Heading>
                    <Icon name="settings"/> System Details
                </Heading>
                <Tile compact={true}>
                    <Select
                        label="Team"
                        name="System_Team"
                        placeholder=""
                        required={true}
                        options={teams}
                        onChange={(value) => setSystem({...system, System_Team: value})}
                    />
                    <Input
                        label="Simonds Representative"
                        name="System_Representative"
                        required={true}
                        readOnly={true}
                        value={system.System_Representative}
                        onChange={(value) => setSystem({...system, System_Representative: value})}
                    />
                    {/*<Input*/}
                    {/*    label="Company Name"*/}
                    {/*    name="System_Company_Name"*/}
                    {/*    required={true}*/}
                    {/*    readOnly={true}*/}
                    {/*    value={system.System_Company_Name}*/}
                    {/*    onChange={(value) => setSystem({...system, System_Company_Name: value})}*/}
                    {/*/>*/}
                </Tile>
            </Flex>
        </>
    );

    const fields = [
        {
            name: "Buyer_1_Given_Name",
            label: "Given Name",
            required: true,
        },
        {
            name: "Buyer_1_Surname",
            label: "Surname",
            required: true,
        },
        {
            name: "Buyer_1_Email",
            label: "Email",
            required: true,
        },
        {
            name: "Buyer_1_Mobile",
            label: "Mobile",
            required: true,
        },
        // Buyer 2 Fields
        {
            name: "Buyer_2_Given_Name",
            label: "Buyer 2 Given Name",
            required: () => buyer.Buyer_Add_Second_Buyer, // Required if second buyer is added
        },
        {
            name: "Buyer_2_Surname",
            label: "Buyer 2 Surname",
            required: () => buyer.Buyer_Add_Second_Buyer,
        },
        {
            name: "Buyer_2_Email",
            label: "Buyer 2 Email",
            required: () => buyer.Buyer_Add_Second_Buyer && !buyer.Buyer_2_Email_Not_Provided,
        },
        {
            name: "Buyer_2_Mobile",
            label: "Buyer 2 Mobile",
            required: () => buyer.Buyer_Add_Second_Buyer,
        },

        {
            name: "Development_Developer",
            label: "Developer",
            required: true,
        },
        {
            name: "Development_Developer_Desc",
            label: "Developer Description",
            required: () => development.Development_Developer === 'unknown',
        },
        {
            name: "Development_Estate",
            label: "Estate",
            required: true,
        },
        {
            name: "Development_Estate_Desc",
            label: "Estate Description",
            required: () => development.Development_Estate === 'unknown',
        },
        {
            name: "Development_Display_Centre",
            label: "Display Centre",
            required: true,
        },
        {
            name: "Development_Display_Centre_Desc",
            label: "Display Centre Description",
            required: () => development.Development_Display_Centre === 'unknown',
        },
        {
            name: "Development_House_Type",
            label: "House Type",
            required: true,
        },
        {
            name: "Development_House_Type_Desc",
            label: "House Type Description",
            required: () => development.Development_House_Type === 'unknown',
        },
        {
            name: "Development_Region",
            label: "Region",
            required: true,
        },
        {
            name: "Development_Address_Is_Land_Titled",
            label: "Is the Land Titled?",
            required: true,
        },
        {
            name: "Development_Address_Is_KDRB_OR_Vacant",
            label: "Is this a KDRB or Vacant Lot?",
            required: true,
        },
        {
            name: "Development_Address_Street_Number",
            label: "Street Number",
            required: () => development.Development_Address_Is_Land_Titled === "Yes",
        },
        {
            name: "Development_Address_Expected_Titles",
            label: "Expected Titles",
            required: () => development.Development_Address_Is_Land_Titled === "No",
        },
        {
            name: "Development_Address_Lot_No",
            label: "Lot Number",
            required: () => false,
        },
        {
            name: "Development_Address_Suburb",
            label: "Suburb",
            required: true,
        },
        {
            name: "Development_Address_State",
            label: "State",
            required: true,
        },
        {
            name: "Development_Address_Postcode",
            label: "Postcode",
            required: true,
        },
        {name: "Deposit_Who_Paying_Deposit", label: "Who's Paying the Deposit", required: true},
        {name: "Deposit_Range", label: "Deposit Range", required: true},
        {name: "Deposit_Deposit_Desc", label: "Deposit Description", required: true},
        {name: "Deposit_Package_Type", label: "Package Type", required: true},
        {name: "Deposit_Context", label: "Context", required: true},
        {name: "Deposit_Amount_Paid", label: "Amount Paid", required: true},
        {name: "Deposit_Amount_Paid_Print", label: "Amount Paid (Print)", required: true},
        {name: "Deposit_Payment_Method", label: "Payment Method", required: true},
        {
            name: "Deposit_Payment_Terminal_Number",
            label: "Terminal Number",
            required: () => (deposit.Deposit_Payment_Method === 'Credit Card' || deposit.Deposit_Payment_Method === 'Debit Card'),
        },
        {name: "Deposit_Promotion_Type", label: "Promotion Type", required: true},
        {name: "Deposit_Sales_Accept_Forecast", label: "Sales Accept Forecast", required: true},

        {name: "System_Team", label: "Team", required: true},
        // {name: "System_Representative", label: "Simonds Representative", required: true},
        {name: "System_Company_Name", label: "Company Name", required: true},
    ];

    const [validationError, setValidationError] = useState([]);
    const [validating, setValidating] = useState(false);

    const validateForm = () => {
        setValidated(false);
        let isValid = true;
        let errors = [];

        fields.forEach(field => {
            const {name, required} = field;
            const value = buyer[name] || development[name] || deposit[name] || system[name];
            // Check if required is a function and call it, otherwise use the boolean value
            const isRequired = typeof required === 'function' ? required() : required;

            // Logic to determine if the field is invalid
            const logic = isRequired && (!value || value === '');
            // console.log(name)
            // console.log("Value: "+ value)
            // console.log("required: "+required)
            // console.log("Logic: "+logic)
            // (!condition || condition()) &&
            if (logic) {
                isValid = false;
                const errorMessageField = `${field.label} is required.`;
                errors.push(field.label);
                // console.log("error message: "+errorMessageField)
            }
            // console.log("isValid: "+isValid)
            // console.log("++++++++++++")
            // console.log(errors)
            // console.log("++++++++++++")
        });

        setValidationError([]);
        if (!isValid && errors.length > 0) {
            setValidationError(errors);
        }

        console.log('after validation')
        return !isValid;
    };

    const [submittedData, setSubmittedData] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(null);
    const [validated, setValidated] = useState(false);

    function baseToUnix(baseDate) {
        console.log(baseDate)
        const date = new Date(Date.UTC(baseDate.year, baseDate.month, baseDate.date));

        const unix = date.getTime(); // Convert milliseconds to seconds
        console.log(unix)

        return unix;

    }
    const generateDeal = () => {

        const submissionData = {
            buyer,
            development,
            deposit,
            system,
            user,
            currentBuyer,
            currentBuyerId,
        };

        console.log(submissionData)
        runServerless({
            name: "submitFormData",
            parameters: submissionData,
        }).then((response) => {
            console.log("response")
            console.log(response)
            if (response.status === "SUCCESS") {
                console.log(response.response)
                sendAlert({message: "Form submitted successfully!"});
            } else {
                //     sendAlert({message: "Failed to submit the form. Please try again."});
            }
            setSubmittedData(submissionData)
            setSubmitLoading(false);

        });
    };
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {

        setSubmitted(true)
        console.log("validationError")
        console.log(validationError)
        console.log("validated")
        console.log(validated)
        if (!validateForm()) {
            return;
        }
        console.log("validationError 1")
        setValidated(true);
        setSubmitLoading(true);
        generateDeal()
        setSubmitted(false)
    };

    const readonlyBuyerDetails = (currentDeposit &&
        <Flex gap="sm" direction='column'>
            <Heading>
                <Icon name="contact"/> Buyer Information
            </Heading>

            <Accordion title={currentDeposit.add_second_buyer_details.value ? "Buyer 1 Details" : "Buyer Details"}
                       size="sm" defaultOpen={true}>
                <Tile compact={true}>
                    <DescriptionList direction="column">
                        <DescriptionListItem label={'Given Name'}>
                            <Text>{currentDeposit.given_name || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Surname'}>
                            <Text>{currentDeposit.buyer_1_surname || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Email'}>
                            <Text>{currentDeposit.buyer_1_email || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Mobile'}>
                            <Text>{currentDeposit.buyer_1_mobile || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Business Number'}>
                            <Text>{currentDeposit.buyer_1_business_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'After Hours Number'}>
                            <Text>{currentDeposit.buyer_1_after_hours_number || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Accordion>

            <Divider/>
            <Accordion title="Buyer 2 Details" size="sm" defaultOpen={true}>
                <Tile compact={true}>
                    <DescriptionList direction="column">
                        <DescriptionListItem label={'Given Name'}>
                            <Text>{currentDeposit.buyer_2_given_name || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Surname'}>
                            <Text>{currentDeposit.buyer_2_surname || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Email'}>
                            <Text>{currentDeposit.buyer_2_email || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Mobile'}>
                            <Text>{currentDeposit.buyer_2_mobile || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Business Number'}>
                            <Text>{currentDeposit.buyer_2_business_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'After Hours Number'}>
                            <Text>{currentDeposit.buyer_2_after_hours_number || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Accordion>

            <Divider/>

            <Accordion title="Buyer Current Address" size="sm" defaultOpen={true}>
                <Tile compact={true}>
                    <DescriptionList direction="column">
                        <DescriptionListItem label={'Buyer Info Street Number'}>
                            <Text>{currentDeposit.buyer_info_street_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Buyer Info Street Name'}>
                            <Text>{currentDeposit.buyer_info_street_name || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Buyer Info Suburb'}>
                            <Text>{currentDeposit.buyer_info_suburb || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Buyer Info State'}>
                            <Text>{currentDeposit.buyer_info_state?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Buyer Info Postcode'}>
                            <Text>{currentDeposit.buyer_info_postcode || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Accordion>
        </Flex>);

    const readonlyDevelopmentDetails = (currentDeposit &&
        <Flex gap="sm" direction='column'>
            <Heading>
                <Icon name="home"/> Development Details
            </Heading>
            <Accordion title="Development Details" size="sm" defaultOpen={false}>
                <Tile compact={true}>
                    <DescriptionList direction="column">
                        <DescriptionListItem label={'Developer'}>
                            <Text>{(currentDeposit.selected_developer === 'unknown' ? currentDeposit.developer_description : currentDeposit.selected_developer) || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Estate'}>
                            <Text>{(currentDeposit.selected_estate === 'unknown' ? currentDeposit.estate_description : currentDeposit.selected_estate) || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Display Centre'}>
                            <Text>{(currentDeposit.selected_display_centre === 'unknown' ? currentDeposit.display_centre_description : currentDeposit.selected_display_centre) || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'House Type'}>
                            <Text>{(currentDeposit.selected_house_type === 'unknown' ? currentDeposit.house_type_description : currentDeposit.selected_house_type) || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'House Size'}>
                            <Text>{currentDeposit.size || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Facade'}>
                            <Text>{currentDeposit.selected_facade || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Region'}>
                            <Text>{currentDeposit.selected_region || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Accordion>
            <Divider/>
            <Accordion title="Development Address" size="sm" defaultOpen={false}>

                <Tile compact={true}>

                    <DescriptionList direction="column">
                        <DescriptionListItem label={'Is the Land Titled?'}>
                            <Text>{currentDeposit.is_the_land_titled_?'Yes':'No' || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Is this a KDRB or Vacant Lot?'}>
                            <Text>{currentDeposit.is_this_a_kdrb_or_vacant_lot_?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Street Number'}>
                            <Text>{currentDeposit.street_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Expected Titles'}>
                            <Text>{currentDeposit.expected_titles || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Lot Number'}>
                            <Text>{currentDeposit.lot_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Suburb'}>
                            <Text>{currentDeposit.suburb || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'State'}>
                            <Text>{currentDeposit.state?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Postcode'}>
                            <Text>{currentDeposit.postcode || '--'}</Text>
                        </DescriptionListItem>

                        <DescriptionListItem label={'Site Start'}>
                            <Text>{currentDeposit.site_start || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label={'Land Settlement'}>
                            <Text>{currentDeposit.land_settlement || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Accordion>
        </Flex>
    )

    const readonlyDepositDetails =  (currentDeposit &&
        <Flex gap="sm" direction='column'>
            <Heading>
            <Icon name="shoppingCart"/> Deposit Details
        </Heading>
            <Tile compact={true}>
                    <DescriptionList direction="column">
                        <DescriptionListItem label="Who's paying this deposit?">
                            <Text>{currentDeposit.is_the_deposit_from_buyer_1_or_buyer_2_?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Range">
                            <Text>{currentDeposit.range?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Deposit Source">
                            <Text>{currentDeposit.deposit_source?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Deposit Description">
                            <Text>{currentDeposit.deposit_type || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Package Type">
                            <Text>{currentDeposit.package_type?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Context">
                            <Text>{currentDeposit.context?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Amount Paid">
                            <Text>{currentDeposit.amount_paid || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label='Amount Paid Print'>
                            <Text>{currentDeposit.amount_paid__print_ || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Payment Method">
                            <Text>{currentDeposit.payment_method?.value || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Terminal Number">
                            <Text>{currentDeposit.terminal_number || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Promotion Types">
                            <Text>{currentDeposit.selected_promotion_type || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Sales Accept Forecast">
                            <Text>{currentDeposit.sales_accept_forecast || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Comment">
                            <Text>{currentDeposit.comment || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
        </Flex>
   );

    const readonlySystemDetails =  (currentDeposit &&
        <Flex gap="sm" direction='column'>
            <Heading>
            <Icon name="settings"/> System Details
        </Heading>
            <Tile compact={true}>
                <DescriptionList direction="column">
                    <DescriptionListItem label="Team">
                        <Text>{currentDeposit.selected_team || '--'}</Text>
                    </DescriptionListItem>
                </DescriptionList>
                <DescriptionList direction="column">
                    <DescriptionListItem label="Simonds Representative">
                        <Text>{currentDeposit.simonds_representative_manager__text_}</Text>
                        {/*<Text>{currentDeposit.simonds_representative || '--'}</Text>*/}
                    </DescriptionListItem>
                </DescriptionList>
            </Tile>
        </Flex>
    );

    const depositMadeDisplay = (
        currentDeposit &&
        <Flex gap="lg" direction='column'>
            {readonlyBuyerDetails}
            {readonlyDevelopmentDetails}
            {readonlyDepositDetails}
            {readonlySystemDetails}
        </Flex>
    );

    const initialDisplay = (
        <>
            <DescriptionList direction="row">
                <DescriptionListItem label={'First Name'}>
                    <Text>{buyer.Buyer_1_Given_Name}</Text>
                </DescriptionListItem>
                <DescriptionListItem label={'Last Name'}>
                    <Text>{buyer.Buyer_1_Surname}</Text>
                </DescriptionListItem>
            </DescriptionList>
            <DescriptionList direction="row">
                <DescriptionListItem label={'Email'}>
                    <Text>{buyer.Buyer_1_Email || '--'}</Text>
                </DescriptionListItem>
                <DescriptionListItem label={'Phone'}>
                    <Text>{buyer.Buyer_1_Mobile || '--'}</Text>
                </DescriptionListItem>
            </DescriptionList>
            <DescriptionList direction="row">
                <DescriptionListItem label={'Initial Fee Deposit'}>
                    {
                        showFirstButton ? (
                            <Button
                                onClick={() => {
                                    setShowForm(true)
                                    setShowFirstButton(false)
                                }}
                                variant="primary"
                                size="sm"
                                type="button"
                            >
                                Create Initial Fee Deposit
                            </Button>
                        ) :
                        <Text>--</Text>
                    }
                        </DescriptionListItem>
                <DescriptionListItem label={'Preliminary Fee Deposit'}>
                    {
                        showSecondButton ? (
                            <Button
                                onClick={() => {
                                    console.log('preliminary button clicked');
                                }}
                                variant="primary"
                                size="sm"
                                type="button"
                            >
                                Pay for Preliminary Deposit
                            </Button>
                        ) :
                            <Text>--</Text>
                    }
                </DescriptionListItem>
                <DescriptionListItem label={'Total Paid Amount'}>
                    <Text>--</Text>
                </DescriptionListItem>
                </DescriptionList>
            <Flex gap="sm" direction='column'>
                <Flex gap="sm" direction='row' wrap='wrap' justify='end'>



                </Flex>

                {depositMadeDisplay}
            </Flex>
        </>
    )
    return (
        <>
            {loading &&
                <LoadingSpinner label="Fetching buyer's data" showLabel={true} size='md'
                                layout="centered"></LoadingSpinner>}
            {!loading &&
                <>
                    {!showForm && initialDisplay}
                    {
                        showForm && (

                            <Form>
                                <Flex gap="lg" direction='column'>
                                    {buyerDetails}
                                    {developmentDetails}
                                    {depositDetails}
                                    {systemDetails}
                                    <Flex direction={'row'} justify={'end'} wrap={'wrap'} gap={'small'}>
                                        {submitLoading && <LoadingSpinner size='xs'></LoadingSpinner>}
                                        <Button
                                            overlay={
                                                (!submitted ? null : validated ? null :
                                                    <Modal id="validation-modal" title="Validation Error" width="md">
                                                        <ModalBody>
                                                            <>
                                                                {validating &&
                                                                    <LoadingSpinner size='xs'
                                                                                    label={"Validating.."}></LoadingSpinner>}


                                                                {
                                                                    validationError.length > 0 && <>
                                                                        <Text> The following fields are required: </Text>
                                                                        <List variant="ordered-styled">
                                                                            {validationError.map((validationErr) => (validationErr))}
                                                                        </List>
                                                                    </>
                                                                }

                                                            </>
                                                            {/*<Text>{JSON.stringify(validationError)}</Text>*/}
                                                            {/*<Text>{JSON.stringify(buyer)}</Text>*/}
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <Button
                                                                onClick={() => actions.closeOverlay('validation-modal')}>Ok</Button>
                                                        </ModalFooter>
                                                    </Modal>)
                                            }
                                            onClick={handleSubmit} disabled={submitLoading} size="md" type="submit"
                                            variant="primary">Submit</Button>
                                    </Flex>

                                    <Text>{validated}</Text>
                                    <Text>{JSON.stringify(submittedData)}</Text>
                                </Flex>
                            </Form>
                        )
                    }

                </>
            }
        </>
    );

};
