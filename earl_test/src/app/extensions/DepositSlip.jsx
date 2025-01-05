import React, {useEffect, useState, useCallback} from "react";
import {toWords} from 'number-to-words';
import axios from "axios";
import {
    Divider,
    Link,
    LoadingButton,
    Button,
    Text,
    Dropdown,
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
    LoadingSpinner,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
} from "@hubspot/ui-extensions";
import {
    yesNoOptions,
    KDRBOptions,
    rangeOptions,
    depositSourceOptions,
    depositDescriptionOptions,
    packageTypeOptions,
    contextOptions,
    whoisPayingOptions,
    paymentMethodOptions,
    dropdownValueIsUnknown,
    generateDropdownOptions, generateOptionFromProperties
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
    refreshObjectProperties={actions.refreshObjectProperties}
/>));

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({context, runServerless, sendAlert, fetchProperties, actions, refreshObjectProperties}) => {

        const user = context.user;
        const [loading, setLoading] = useState(true);
        const [hasBuyer2, setHasBuyer2] = useState(false);
        const [buyerAddressSearch, setBuyerAddressSearch] = useState("");
        const [buyerAddressSuggestions, setBuyerAddressSuggestions] = useState([]);
        const [showBuyerAddressFields, setShowBuyerAddressFields] = useState(false);
        const [isAddressManually, setIsAddressManually] = useState(true);
        const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false);
        const [isAddressSelectedLoading, setIsAddressSelectedLoading] = useState(false);

        const [devAddressSearch, setDevAddressSearch] = useState("");
        const [devAddressSuggestions, setDevAddressSuggestions] = useState([]);
        const [showDevAddressFields, setShowDevAddressFields] = useState(false);
        const [allowEditDevAddressFields, setAllowEditDevAddressFields] = useState(true);
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
        const [initialTeam, setInitialTeam] = useState([]);
        const [teams, setTeams] = useState([]);
        const [regions, setRegions] = useState([]);
        const [optionsLoaded, setOptionsLoaded] = useState(false);

        const depositTitleInitial = 'Deposit Details';
        const [depositTitle, setDepositTitle] = useState(depositTitleInitial);
        const [depositShow, setDepositShow] = useState(false);
        const [developmentShow, setDevelopmentShow] = useState(false);
        const [currentBuyerId, setCurrentBuyerId] = useState(null);

        const [showForm, setShowForm] = useState(false);
        const [showFirstButton, setShowFirstButton] = useState(false);
        const [showSecondButton, setShowSecondButton] = useState(false);
        const [showTerminalNumber, setShowTerminalNumber] = useState(false);//removed

        const [currentBuyer, setCurrentBuyer] = useState({
            contact_email: "",
            contact_first_name: "",
            contact_last_name: "",
            contact_phone: "null"
        });
        const [dealDeposits, setDealDeposits] = useState(null);
        const [currentDeposit, setCurrentDeposit] = useState(null);
        const [initialDepositFee, setInitialDepositFee] = useState(null);
        const [prelimDepositFee, setPrelimDepositFee] = useState(null);
        const [totalDepositFee, setTotalDepositFee] = useState('--');
        const [whoisPayingOptionsFinal, setWhoisPayingOptionsFinal] = useState(whoisPayingOptions)
        const [saleTypeOptions, setSaleTypeOptions] = useState(null);
        const handleNumberChange = (value) => {
            handleDepositChange("Deposit_Amount_Paid", value)
            handleDepositChange("Deposit_Amount_Paid_Print", capitalizeWords(toWords(value)))
        };

        function capitalizeWords(str) {
            return str.replace(/\b\w/g, char => char.toUpperCase());
        }

        useEffect(() => {
            runServerless({name: "fetchDropdownOptions"}).then((resp) => {
                if (resp.status === "SUCCESS") {
                    setDevelopers(resp.response.data.CRM?.p_developers_collection?.items || []);
                    setEstates(resp.response.data.CRM?.p_estates_collection?.items || []);
                    setDisplayCentre(resp.response.data.CRM?.p_display_centre_collection?.items || []);
                    setFacades(resp.response.data.CRM?.p_facades_collection?.items || []);
                    setHouseTypes(resp.response.data.CRM?.p_house_types_collection?.items || []);
                    setPromotionTypes(resp.response.data.CRM?.p_promotion_types_collection?.items || []);
                    // setRegions(resp.response.data.CRM?.p_regions_collection?.items || []);

                    const initialTeamOption = resp.response.data.CRM?.p_teams_collection?.items;

                    const team = [{label: '--None--', value: '--None--'}, ...initialTeamOption.map(item => ({
                        label: item.name, value: item.hs_object_id
                    }))] || [];
                    setInitialTeam(team);
                    setTeams(team);
                    let dropdownLoaded = true;

                }
            }).then(() => {
                runServerless({name: "fetchPropertiesOption"}).then((resp) => {
                    if (resp.status === "SUCCESS") {
                        const result = resp.response.results;
                        if (result) {
                            const sale_type = generateOptionFromProperties(result, 'sale_type');
                            setSaleTypeOptions(sale_type)
                            const region = generateOptionFromProperties(result, 'region');
                            setRegions(region)
                        }
                        setOptionsLoaded(true);
                    }
                });
            });

        }, []);

        useEffect(() => {
            if (hasBuyer2) {
                setWhoisPayingOptionsFinal(whoisPayingOptions)
                setDeposit({...deposit, Deposit_Who_Paying_Deposit: ''})
            } else {
                setDeposit({...deposit, Deposit_Who_Paying_Deposit: whoisPayingOptions[0].value})
                setWhoisPayingOptionsFinal([{label: 'Buyer 1', value: 'Buyer 1'}])
            }
        }, [hasBuyer2]);
        useEffect(() => {
            fetchProperties(["hs_object_id"]).then((properties) => {
                setCurrentBuyerId(properties.hs_object_id);
            });
            fetchProperties('*').then((properties) => console.log(properties));
        }, [fetchProperties]);
        const fetchBuyerDetails = () => {
            runServerless({name: "fetchBuyerDetails", parameters: {hs_object_id: currentBuyerId}}).then((resp) => {
                // console.log(resp);
                if (resp.status === "SUCCESS") {
                    setCurrentBuyer(resp.response.data.CRM.deal);

                    const depositItems = resp.response.data.CRM.deal?.associations.p_deposit_collection__deal_to_deposit.items
                    setDealDeposits(depositItems);
                    setDepositTitle(depositTitleInitial)
                    if (depositItems.length === 0) {
                        setShowFirstButton(true)
                        setShowSecondButton(false)
                        setDeposit({...deposit, Deposit_Deposit_Desc: depositDescriptionOptions[0].value})
                        // setDepositTitle("Deposit Details for Initial Fee")
                    } else {
                        console.log(depositItems)
                        setDeposit({...deposit, Deposit_Deposit_Desc: depositDescriptionOptions[1].value})
                        let initialDeposit = depositItems.find(item => item.deposit_type === 'Initial Fee');
                        let prelimDeposit = depositItems.find(item => item.deposit_type === 'Preliminary Fee');
                        console.log("===============")
                        console.log(initialDeposit)
                        console.log(prelimDeposit)
                        console.log("==================")
                        // let totalAmount = 0;
                        if (initialDeposit) {
                            setShowSecondButton(true)
                            setInitialDepositFee(initialDeposit);
                            setCurrentDeposit(initialDeposit);
                        }
                        if (prelimDeposit) {
                            setShowSecondButton(true)
                            setPrelimDepositFee(prelimDeposit);
                            setCurrentDeposit(prelimDeposit);
                        } else {
                            // setCurrentBuyer(resp.response.data.CRM.deal);
                            // given_name
                            // buyer_1_surname
                            // buyer_1_email
                            // buyer_1_mobile
                        }
                        setShowTerminalNumber(checkIfPaymentMethodIsCard(initialDeposit.payment_method?.value))
                    }
                }
                setLoading(false);
            });
        }
        useEffect(() => {
            fetchBuyerDetails()
        }, [currentBuyerId]);
        useEffect(() => {
            if (currentDeposit && optionsLoaded) {
                console.log("========================")
                console.log("currentDeposit")
                console.log(currentDeposit)
                setShowBuyerAddressFields(true);
                setShowDevAddressFields(true);
                setDevelopmentShow(true);
                setDepositShow(true);
                handleBuyerChange('Buyer_1_Given_Name', currentDeposit.given_name);
                handleBuyerChange('Buyer_1_Surname', currentDeposit.buyer_1_surname);
                handleBuyerChange('Buyer_1_Email_Not_Provided', currentDeposit.buyer_1_email_not_provided === '');
                handleBuyerChange('Buyer_1_Email', currentDeposit.buyer_1_email);
                handleBuyerChange('Buyer_1_Mobile', currentDeposit.buyer_1_mobile);
                handleBuyerChange('Buyer_1_Business_Number', currentDeposit.buyer_1_business_number);
                handleBuyerChange('Buyer_1_After_Hours', currentDeposit.buyer_1_after_hours_number);
                setHasBuyer2(currentDeposit.add_second_buyer_details?.value === 'true')
                // handleBuyerChange('Buyer_Add_Second_Buyer', currentDeposit.add_second_buyer_details?.value);

                handleBuyerChange('Buyer_2_Given_Name', currentDeposit.buyer_2_given_name);
                handleBuyerChange('Buyer_2_Surname', currentDeposit.buyer_2_surname);
                handleBuyerChange('Buyer_2_Email_Not_Provided', currentDeposit.buyer_2_email_not_provided);
                handleBuyerChange('Buyer_2_Email', currentDeposit.buyer_2_email);
                handleBuyerChange('Buyer_2_Mobile', currentDeposit.buyer_2_mobile);
                handleBuyerChange('Buyer_2_Business_Number', currentDeposit.buyer_2_business_number);
                handleBuyerChange('Buyer_2_After_Hours', currentDeposit.buyer_2_after_hours_number);
                handleBuyerChange('Buyer_Info_Street_Number', currentDeposit.buyer_info_street_number);
                handleBuyerChange('Buyer_Info_Street_Name', currentDeposit.buyer_info_street_name);
                handleBuyerChange('Buyer_Info_Suburb', currentDeposit.buyer_info_suburb);
                handleBuyerChange('Buyer_Info_State', currentDeposit.buyer_info_state?.value);
                handleBuyerChange('Postcode', currentDeposit.buyer_info_postcode);

                handleDevelopmentChange('Development_Developer', filterValuePerLabel(developers, currentDeposit.selected_developer));
                handleDevelopmentChange('Development_Developer_Desc', currentDeposit.developer_description);
                handleDevelopmentChange('Development_Estate', filterValuePerLabel(estates, currentDeposit.selected_estate));
                handleDevelopmentChange('Development_Estate_Desc', currentDeposit.estate_description);
                handleDevelopmentChange('Development_Display_Centre', filterValuePerLabel(displayCentre, currentDeposit.selected_display_centre));
                handleDevelopmentChange('Development_Display_Centre_Desc', currentDeposit.display_centre_description);
                handleDevelopmentChange('Development_House_Type', filterValuePerLabel(houseTypes, currentDeposit.selected_house_type));
                handleDevelopmentChange('Development_House_Type_Desc', currentDeposit.house_type_description);
                handleDevelopmentChange('Development_Size', currentDeposit.size);
                handleDevelopmentChange('Development_Facade', filterValuePerLabel(facades, currentDeposit.selected_facade));
                handleDevelopmentChange('Development_Region', currentDeposit.region?.value);

                handleDevelopmentChange('Development_Address_Is_Land_Titled', currentDeposit.is_the_land_titled_ ? 'Yes' : 'No');
                handleDevelopmentChange('Development_Address_Is_KDRB_OR_Vacant', currentDeposit.is_this_a_kdrb_or_vacant_lot_?.value);
                handleDevelopmentChange('Development_Address_Street_Number', currentDeposit.street_number);
                handleDevelopmentChange('Development_Address_Expected_Titles', unixToBase(currentDeposit.expected_titles));
                handleDevelopmentChange('Development_Address_Expected_Titles_Text', currentDeposit.expected_titles);
                handleDevelopmentChange('Development_Address_Lot_No', currentDeposit.lot_number);
                handleDevelopmentChange('Development_Address_Street_Name', currentDeposit.street_name);
                handleDevelopmentChange('Development_Address_Suburb', currentDeposit.suburb);
                handleDevelopmentChange('Development_Address_State', currentDeposit.state?.value);
                handleDevelopmentChange('Development_Address_Postcode', currentDeposit.postcode);

                handleDevelopmentChange('Development_Address_Site_Start', unixToBase(currentDeposit.site_start));
                handleDevelopmentChange('Development_Address_Site_Start_Text', currentDeposit.site_start);
                handleDevelopmentChange('Development_Address_Site_Land_Settlement', unixToBase(currentDeposit.land_settlement));
                handleDevelopmentChange('Development_Address_Site_Land_Settlement_Text', currentDeposit.land_settlement);

                handleDepositChange('Deposit_Who_Paying_Deposit', filterValuePerLabel(whoisPayingOptionsFinal, currentDeposit.is_the_deposit_from_buyer_1_or_buyer_2_?.value, 'value', 'value'));
                handleDepositChange('Deposit_Range', filterValuePerLabel(rangeOptions, currentDeposit.range?.value, 'value', 'value'));
                handleDepositChange('Deposit_Deposit_Source', filterValuePerLabel(depositSourceOptions, currentDeposit.deposit_source?.value, 'value', 'value'));

                handleDepositChange('Deposit_Package_Type', filterValuePerLabel(packageTypeOptions, currentDeposit.package_type?.value, 'value', 'value'));
                handleDepositChange('Deposit_Context', filterValuePerLabel(contextOptions, currentDeposit.context?.value, 'value', 'value'));
                handleDepositChange('Sale_Type', filterValuePerLabel(saleTypeOptions, currentDeposit.sale_type?.value, 'value', 'value'));
                handleDepositChange('Deposit_Amount_Paid', currentDeposit.amount_paid);
                handleDepositChange('Deposit_Amount_Paid_Print', currentDeposit.amount_paid__print_);
                handleDepositChange('Deposit_Payment_Method', currentDeposit.payment_method?.value);
                handleDepositChange('Deposit_Payment_Terminal_Number', currentDeposit.terminal_number);
                handleDepositChange('Deposit_Promotion_Type', filterValuePerLabel(promotionTypes, currentDeposit.selected_promotion_type));
                handleDepositChange('Deposit_Sales_Accept_Forecast', unixToBase(currentDeposit.sales_accept_forecast));
                handleDepositChange('Deposit_Sales_Accept_Forecast_Text', currentDeposit.sales_accept_forecast);
                handleDepositChange('Deposit_Comment', currentDeposit.comment);

                const populateTeam = teams.filter(item => item.label === currentDeposit.selected_team);

                if (populateTeam && populateTeam.length > 0) {
                    setSystem({
                        ...system,
                        System_Team: populateTeam ? populateTeam[0].value : '',
                        System_Representative: currentDeposit.simonds_representative?.firstname + ' ' + currentDeposit.simonds_representative?.lastname,
                    })
                }
            }
        }, [currentDeposit, optionsLoaded, whoisPayingOptionsFinal]);

        /**
         *
         * @param options array
         * @param value string
         * @param key filter key that the value you want to connect
         * @param valueKey key value you want to get
         * @returns {*|string}
         */
        function filterValuePerLabel(options, value, key = 'name', valueKey = 'hs_object_id') {
            const filter = options.filter(item => item[key] === value)
            // console.log("=========")
            // console.log("options")
            // console.log(options)
            // console.log(value)
            // console.log(filter)
            if (filter && filter.length > 0) {
                // console.log(filter[0])
                return filter[0][valueKey];
            }
            // console.log("========")
            return '';
        }

        /**
         *
         * @param options array
         * @param value string
         * @param key filter key that the value you want to connect
         * @param valueKey key value you want to get
         * @returns {*|string}
         */
        function filterLabelPerValue(options, value, key = 'value', valueKey = 'label') {
            const filter = options.filter(item => item[key] === value)
            // console.log("=========")
            // console.log("options")
            // console.log(options)
            // console.log(value)
            // console.log(filter)
            if (filter && filter.length > 0) {
                // console.log(filter[0])
                return filter[0][valueKey];
            }
            // console.log("========")
            return '';
        }

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
            const selectedRegion = regions.find(item => item.value === region);
            console.log("Regions")
            console.log(regions)
            console.log(selectedRegion)

            // If the region is found, extract the label
            const regionLabel = selectedRegion ? selectedRegion.value : '';
            console.log(regionLabel)

            if (region) {
                console.log(region)

                const filteredTeams = initialTeam.filter(item => item.label.startsWith(regionLabel));
                setTeams(filteredTeams || []);
                setSystem({...system, System_Team: ""})
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
            const paymentIsCard = checkIfPaymentMethodIsCard(value);
            if (paymentIsCard) {
                handleDepositChange('Deposit_Payment_Terminal_Number', 'Bpoint');
            } else {
                handleDepositChange('Deposit_Payment_Terminal_Number', '');
            }
            handleDepositChange('Deposit_Payment_Method', value);
        }
        const checkIfPaymentMethodIsCard = (value) => {
            return (value === 'Credit Card' || value === 'Debit Card')
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
                    <Flex justify={'between'}>
                        <Text><Icon name="contact"/> Buyer Information</Text>
                        <Button
                            onClick={() => {
                                setShowForm(false)
                            }}
                            size="xs"
                            type="button"
                        >
                            Cancel
                        </Button>
                    </Flex>
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
                                {/*<Checkbox*/}
                                {/*    checked={buyer.Buyer_2_Email_Not_Provided}*/}
                                {/*    name="Buyer_2_Email_Not_Provided"*/}
                                {/*    onChange={(val) => handleBuyerChange("Buyer_2_Email_Not_Provided", val)}*/}
                                {/*>*/}
                                {/*    Email Not Provided*/}
                                {/*</Checkbox>*/}
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
                    <Accordion title="Development Details" size="sm" defaultOpen={developmentShow}>
                        <Tile compact={true}>
                            <Select
                                label="Developer"
                                name="Development_Developer"
                                placeholder=""
                                required={true}
                                options={generateDropdownOptions(developers)}
                                value={development.Development_Developer}
                                onChange={(value) => setDevelopment({...development, Development_Developer: value})}
                            />

                            {dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(developers), development.Development_Developer)) && (
                                <Input
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
                                options={generateDropdownOptions(estates)}
                                value={development.Development_Estate}
                                onChange={(value) => setDevelopment({...development, Development_Estate: value})}
                            />
                            {dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(estates), development.Development_Estate)) && (
                                <Input
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
                                options={generateDropdownOptions(displayCentre)}
                                value={development.Development_Display_Centre}
                                onChange={(value) => handleDevelopmentChange("Development_Display_Centre", value)}
                            />
                            {dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(displayCentre), development.Development_Display_Centre)) && (
                                <Input
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
                                options={generateDropdownOptions(houseTypes)}
                                value={development.Development_House_Type}
                                onChange={(value) => handleDevelopmentChange("Development_House_Type", value)}
                            />
                            {dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(houseTypes), development.Development_House_Type)) && (
                                <Input
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
                                value={development.Development_Facade}
                                onChange={(value) => setDevelopment({...development, Development_Facade: value})}
                            />
                            <Select
                                label="Region"
                                name="Development_Region"
                                placeholder=""
                                required={true}
                                options={regions}
                                value={development.Development_Region}
                                onChange={(value) => handleDevelopmentRegionChange(value)}
                            />
                        </Tile>
                    </Accordion>
                    <Divider/>
                    <Accordion title="Development Address" size="sm" defaultOpen={developmentShow}>

                        <Tile compact={true}>
                            <Select
                                label="Is the Land Titled?"
                                name="Development_Address_Is_Land_Titled"
                                required={true}
                                error={!isValid.Development_Address_Is_Land_Titled}
                                validationMessage={validationMessage.Development_Address_Is_Land_Titled}
                                value={development.Development_Address_Is_Land_Titled}
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
                                value={development.Development_Address_Is_KDRB_OR_Vacant}
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
                            {/*<Text>{development.Development_Address_Site_Start}</Text>*/}
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
                    <Icon name="shoppingCart"/> {depositTitle}
                </Heading>
                <Accordion title={depositTitle} size="sm" defaultOpen={depositShow}>
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
                            value={deposit.Deposit_Range}
                            onChange={(value) => setDeposit({...deposit, Deposit_Range: value})}
                        />
                        {/*<Select*/}
                        {/*    label="Deposit Source"*/}
                        {/*    name="Deposit_Deposit_Source"*/}
                        {/*    placeholder=""*/}
                        {/*    options={depositSourceOptions}*/}
                        {/*    value={deposit.Deposit_Deposit_Source}*/}
                        {/*    onChange={(value) => setDeposit({...deposit, Deposit_Deposit_Source: value})}*/}
                        {/*/>*/}
                        {/*<Select*/}
                        {/*    label="Deposit Description"*/}
                        {/*    name="Deposit_Deposit_Desc"*/}
                        {/*    readOnly*/}
                        {/*    required={true}*/}
                        {/*    value={deposit.Deposit_Deposit_Desc}*/}
                        {/*    options={depositDescriptionOptions}*/}
                        {/*    onChange={(value) => setDeposit({...deposit, Deposit_Deposit_Desc: value})}*/}
                        {/*/>*/}
                        <Select
                            label="Package Type"
                            name="Deposit_Package_Type"
                            placeholder=""
                            required={true}
                            options={packageTypeOptions}
                            value={deposit.Deposit_Package_Type}
                            onChange={(value) => setDeposit({...deposit, Deposit_Package_Type: value})}
                        />
                        <Select
                            label="Context"
                            name="Deposit_Context"
                            placeholder=""
                            required={true}
                            options={contextOptions}
                            value={deposit.Deposit_Context}
                            onChange={(value) => setDeposit({...deposit, Deposit_Context: value})}
                        />
                        <Select
                            label="Sale Type"
                            name="Sale_Type"
                            placeholder=""
                            required={true}
                            value={deposit.Sale_Type}
                            options={saleTypeOptions}
                            onChange={(value) => setDeposit({...deposit, Sale_Type: value})}
                        />
                        <NumberInput
                            label="Amount Paid"
                            name="Deposit_Amount_Paid"
                            placeholder=""
                            required={true}
                            min={1}
                            value={deposit.Deposit_Amount_Paid}
                            onChange={(value) => handleNumberChange(value)}
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
                            value={deposit.Deposit_Payment_Method}
                            options={paymentMethodOptions}
                            onChange={(value) => handleChangePaymentMethod(value)}
                        />
                        {/*{showTerminalNumber && (*/}
                        {/*    <Input*/}
                        {/*        label="Terminal Number"*/}
                        {/*        name="Deposit_Payment_Terminal_Number"*/}
                        {/*        placeholder="Bpoint"*/}
                        {/*        required={true}*/}
                        {/*        value={deposit.Deposit_Payment_Terminal_Number}*/}
                        {/*        onChange={(value) => setDeposit({...deposit, Deposit_Payment_Terminal_Number: value})}*/}
                        {/*    />)}*/}
                        <Select
                            label="Promotion Types"
                            name="Deposit_Promotion_Type"
                            placeholder=""
                            required={true}
                            options={[{label: '--None--', value: '--None--'}, ...promotionTypes.map(item => ({
                                label: item.name, value: item.hs_object_id
                            }))]}
                            value={deposit.Deposit_Promotion_Type}
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
                            value={system.System_Team}
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

        function baseToUnix(baseDate) {
            const date = new Date(Date.UTC(baseDate.year, baseDate.month, baseDate.date));
            const unix = date.getTime(); // Convert milliseconds to seconds
            return unix;

        }

        function unixToString(unixDate, name = '') {
            if (name) {
                console.log("++++++++++")
                console.log(name)
                console.log(unixDate)
            }
            if (!unixDate) {
                return;
            }
            const date = new Date(parseFloat(unixDate));
            const baseDate = {
                year: date.getUTCFullYear(),
                month: date.getUTCMonth(),
                date: date.getUTCDate()
            };
            if (name) {
                console.log(date)
                console.log(baseDate)
            }
            const formattedDate = `${String(baseDate.date).padStart(2, '0')}/${String(baseDate.month).padStart(2, '0')}/${baseDate.year}`;
            if (name) {
                console.log(formattedDate)
                console.log("++++++++++")
            }
            return formattedDate;
        }

        function unixToBase(unixDate) {
            if (!unixDate) {
                return '';
            }
            const date = new Date(parseFloat(unixDate));
            const baseDate = {
                year: date.getUTCFullYear(),
                month: date.getUTCMonth(),
                date: date.getUTCDate()
            };
            const formattedDate = `${String(baseDate.date).padStart(2, '0')}/${String(baseDate.month + 1).padStart(2, '0')}/${baseDate.year}`;
            return {...baseDate, formattedDate: formattedDate}
        }


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
                required: () => buyer.Buyer_Add_Second_Buyer,
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
                required: () => dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(developers), development.Development_Developer)),
            },
            {
                name: "Development_Estate",
                label: "Estate",
                required: true,
            },
            {
                name: "Development_Estate_Desc",
                label: "Estate Description",
                required: () => dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(estates), development.Development_Estate)),
            },
            {
                name: "Development_Display_Centre",
                label: "Display Centre",
                required: true,
            },
            {
                name: "Development_Display_Centre_Desc",
                label: "Display Centre Description",
                required: () => dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(displayCentre), development.Development_Display_Centre)),
            },
            {
                name: "Development_House_Type",
                label: "House Type",
                required: true,
            },
            {
                name: "Development_House_Type_Desc",
                label: "House Type Description",
                required: () => dropdownValueIsUnknown(filterLabelPerValue(generateDropdownOptions(houseTypes), development.Development_House_Type)),
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
            {name: "Deposit_Promotion_Type", label: "Promotion Type", required: true},
            {name: "Deposit_Sales_Accept_Forecast", label: "Sales Accept Forecast", required: true},
            {name: "System_Team", label: "Team", required: true},
        ];

        const [validationError, setValidationError] = useState([]);
        const [validating, setValidating] = useState(false);

        const isValidatingLOg = false;
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
                if (isValidatingLOg) {
                    console.log(name)
                    console.log("Value: " + value)
                    console.log("required: " + isRequired)
                    console.log("Logic: " + logic)
                }
                // (!condition || condition()) &&
                if (logic) {
                    isValid = false;
                    const errorMessageField = `${field.label} is required.`;
                    errors.push(field.label);
                    // console.log("error message: "+errorMessageField)
                }

                if (isValidatingLOg) {
                    console.log("isValid: " + isValid)
                    console.log("++++++++++++")
                    console.log(errors)
                    console.log("++++++++++++")
                }
            });

            setValidationError([]);
            if (!isValid && errors.length > 0) {
                setValidationError(errors);
            }

            if (isValidatingLOg) {
                console.log('after validation')
                console.log(isValid)
                console.log(errors)
            }
            return isValid;
        };

        const [submittedData, setSubmittedData] = useState(null);
        const [submitLoading, setSubmitLoading] = useState(null);
        const [validated, setValidated] = useState(false);

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
            setSubmittedData(submissionData)
            runServerless({
                name: "submitFormData",
                parameters: submissionData,
            }).then((response) => {
                console.log("response")
                console.log(response)
                if (response.status === "SUCCESS") {
                    console.log(response.response)
                    sendAlert({message: "Form submitted successfully!"});
                    handleAfterSubmitSuccess();
                } else {
                    //     sendAlert({message: "Failed to submit the form. Please try again."});
                }
                setSubmitLoading(false);

            });
        };

        const handleAfterSubmitSuccess = () => {
            actions.reloadPage()
            // refreshObjectProperties();
            // fetchBuyerDetails()
            // setShowForm(false);
        }

        const handleSubmit = () => {
            setSubmitLoading(true);
            generateDeal()
        };

        useEffect(() => {
            validateOnChange();
        }, [buyer, development, deposit, system]);
        const validateOnChange = () => {

            if (isValidatingLOg) {
                console.log("======VALIDATION=====")
                console.log("validationError")
                console.log(validationError)
            }
            const validatedForm = validateForm();
            if (validatedForm) {
                setValidated(true);
            }

            if (isValidatingLOg) {
                console.log("validated")
                console.log(validatedForm)
            }
        }


        const readonlyBuyerDetails = (currentDeposit &&
            <Flex gap="sm" direction='column'>
                <Flex gap="sm" direction='row' wrap='wrap' justify='between'>
                    <Heading>
                        <Icon name="contact"/> Buyer Information
                    </Heading>
                    <Button
                        variant="primary"
                        size="xs"
                        type="button"
                    >Edit</Button>
                </Flex>

                <Accordion title={currentDeposit.add_second_buyer_details?.value ? "Buyer 1 Details" : "Buyer Details"}
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
                                <Text>{currentDeposit.is_the_land_titled_ ? 'Yes' : 'No' || '--'}</Text>
                            </DescriptionListItem>
                            <DescriptionListItem label={'Is this a KDRB or Vacant Lot?'}>
                                <Text>{currentDeposit.is_this_a_kdrb_or_vacant_lot_?.value || '--'}</Text>
                            </DescriptionListItem>
                            <DescriptionListItem label={'Street Number'}>
                                <Text>{currentDeposit.street_number || '--'}</Text>
                            </DescriptionListItem>
                            <DescriptionListItem label={'Expected Titles'}>
                                <Text>{unixToString(currentDeposit.expected_titles) || '--'}</Text>
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
                                <Text>{unixToString(currentDeposit.site_start) || '--'}</Text>
                            </DescriptionListItem>
                            <DescriptionListItem label={'Land Settlement'}>
                                <Text>{unixToString(currentDeposit.land_settlement) || '--'}</Text>
                            </DescriptionListItem>
                        </DescriptionList>
                    </Tile>
                </Accordion>
            </Flex>
        )

        const readonlyDepositDetails = (currentDeposit &&
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
                            <Text>{unixToString(currentDeposit.sales_accept_forecast) || '--'}</Text>
                        </DescriptionListItem>
                        <DescriptionListItem label="Comment">
                            <Text>{currentDeposit.comment || '--'}</Text>
                        </DescriptionListItem>
                    </DescriptionList>
                </Tile>
            </Flex>
        );

        const readonlySystemDetails = (currentDeposit &&
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
                            <Text>{currentDeposit.simonds_representative ?
                                currentDeposit.simonds_representative?.firstname + ' ' + currentDeposit.simonds_representative?.lastname
                                : (currentDeposit.simonds_representative_manager__text_ ?? '--')}</Text>
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
        const handleChangeDDOptions = (value) => {
            if (value === 'Initial Fee') {
                let deposit = dealDeposits.filter(item => item.deposit_type === 'Initial Fee');
                if (deposit.length > 0) {
                    deposit = deposit[0];
                }
                setCurrentDeposit(deposit);
            }
            if (value === 'Preliminary Fee') {
                setCurrentDeposit(null);
                if (dealDeposits.length > 1) {
                    let deposit = dealDeposits.filter(item => item.deposit_type === 'Preliminary Fee');
                    if (deposit.length > 0) {
                        deposit = deposit[0];
                    }
                    setCurrentDeposit(deposit);
                }
            }
        }
        const editInitialFee = () => {
            setDepositTitle("Deposit Details for Initial Fee")
            if (initialDepositFee) {
                handleDepositChange('Deposit_Object_Id', currentDeposit.hs_object_id);
                console.log('Actual edit initial')
                setCurrentDeposit(initialDepositFee);
            }
            handleDepositChange('Deposit_Deposit_Desc', depositDescriptionOptions[0].value);
            setShowForm(true)
        }
        const editPrelimFee = () => {
            setDepositTitle("Deposit Details for Preliminary Fee")
            console.log("Deposit Details for Preliminary Fee")
            console.log(initialDepositFee)
            console.log(prelimDepositFee)
            if (prelimDepositFee) {
                handleDepositChange('Deposit_Object_Id', currentDeposit.hs_object_id);
                console.log('Actual edit prelim')
                setCurrentDeposit(prelimDepositFee);
            } else {
                setCurrentDeposit(initialDepositFee);
                handleDepositChange('Deposit_Amount_Paid', '');
                handleDepositChange('Deposit_Amount_Paid_Print', '');
            }
            handleDepositChange('Deposit_Deposit_Desc', depositDescriptionOptions[1].value);
            setShowForm(true)
        }

        const initialDisplay = (
            <>
                <Table bordered={true}>
                    <TableHead>
                        <TableRow>
                            <TableHeader width="min">Deposit Type</TableHeader>
                            <TableHeader width="min">Amount</TableHeader>
                            <TableHeader width="min">Payment Type</TableHeader>
                            <TableHeader width="min">Status</TableHeader>
                            <TableHeader width="min">Action</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        <TableRow>
                            <TableCell width="min">Initial Fee</TableCell>
                            <TableCell width="min">{initialDepositFee?.amount_paid ?
                                new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(initialDepositFee?.amount_paid)
                                : '--'}</TableCell>
                            <TableCell width="min">{initialDepositFee?.payment_method?.value ?? '--'}</TableCell>
                            <TableCell width="min"></TableCell>
                            <TableCell width="min">
                                <Button
                                    onClick={editInitialFee}
                                    variant="primary"
                                    size="sm"
                                    type="button"
                                >
                                    Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell width="min">Preliminary Fee</TableCell>
                            <TableCell width="min">{prelimDepositFee?.amount_paid ?
                                new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(prelimDepositFee?.amount_paid)
                                : '--'}</TableCell>
                            <TableCell width="min">{prelimDepositFee?.payment_method?.value ?? '--'}</TableCell>
                            <TableCell width="min"></TableCell>
                            <TableCell width="min">
                                {showSecondButton && <Button
                                    onClick={editPrelimFee}
                                    variant="primary"
                                    size="sm"
                                    type="button"
                                >
                                    Edit
                                </Button>
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {/*<DescriptionList direction="row">*/}
                {/*    <DescriptionListItem label={'First Name'}>*/}
                {/*        <Text>{buyer.Buyer_1_Given_Name}</Text>*/}
                {/*    </DescriptionListItem>*/}
                {/*    <DescriptionListItem label={'Last Name'}>*/}
                {/*        <Text>{buyer.Buyer_1_Surname}</Text>*/}
                {/*    </DescriptionListItem>*/}
                {/*</DescriptionList>*/}
                {/*<DescriptionList direction="row">*/}
                {/*    <DescriptionListItem label={'Email'}>*/}
                {/*        <Text>{buyer.Buyer_1_Email || '--'}</Text>*/}
                {/*    </DescriptionListItem>*/}
                {/*    <DescriptionListItem label={'Phone'}>*/}
                {/*        <Text>{buyer.Buyer_1_Mobile || '--'}</Text>*/}
                {/*    </DescriptionListItem>*/}
                {/*</DescriptionList>*/}
                {/*<DescriptionList direction="row">*/}
                {/*    <DescriptionListItem label={'Initial Fee Deposit'}>*/}
                {/*        {*/}
                {/*            showFirstButton ? (*/}
                {/*                    <Button*/}
                {/*                        onClick={() => {*/}
                {/*                            setShowForm(true)*/}
                {/*                            setShowFirstButton(false)*/}
                {/*                        }}*/}
                {/*                        variant="primary"*/}
                {/*                        size="sm"*/}
                {/*                        type="button"*/}
                {/*                    >*/}
                {/*                        Create Initial Fee Deposit*/}
                {/*                    </Button>*/}
                {/*                ) :*/}
                {/*                <Text>{initialDepositFee.amount_paid}</Text>*/}
                {/*        }*/}
                {/*    </DescriptionListItem>*/}
                {/*    <DescriptionListItem label={'Preliminary Fee Deposit'}>*/}
                {/*        {*/}
                {/*            showSecondButton ? (*/}
                {/*                    <Button*/}
                {/*                        onClick={() => {*/}
                {/*                            setShowForm(true)*/}
                {/*                            setShowFirstButton(false)*/}
                {/*                        }}*/}
                {/*                        variant="primary"*/}
                {/*                        size="sm"*/}
                {/*                        type="button"*/}
                {/*                    >*/}
                {/*                        Pay for Preliminary Deposit*/}
                {/*                    </Button>*/}
                {/*                ) :*/}
                {/*                <Text>{prelimDepositFee.amount_paid}</Text>*/}
                {/*        }*/}
                {/*    </DescriptionListItem>*/}
                {/*    <DescriptionListItem label={'Total Paid Amount'}>*/}
                {/*        <Text>{totalDepositFee}</Text>*/}
                {/*    </DescriptionListItem>*/}
                {/*</DescriptionList>*/}
                {/*{dealDeposits && dealDeposits.length > 0 &&*/}
                {/*    <Flex gap="sm" direction='column'>*/}
                {/*        <Divider></Divider>*/}
                {/*        <Flex gap="sm" direction='row' wrap='wrap' justify='between'>*/}
                {/*            <Text format={{fontWeight: 'bold'}}>Deposit Details</Text>*/}
                {/*            <Dropdown*/}
                {/*                options={ddOptions}*/}
                {/*                variant="transparent"*/}
                {/*                buttonSize="md"*/}
                {/*                buttonText={dropdownDetailTitle}*/}
                {/*            />*/}
                {/*            {showDepositInitialFee && depositMadeDisplay}*/}
                {/*        </Flex>*/}
                {/*    </Flex>*/}
                {/*}*/}
            </>
        )

        const unvalidatedButton =
            validated ? <></> : <Button
                overlay={<Modal id="validation-modal" title="Validation Error" width="md">
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
                </Modal>}
                disabled={submitLoading} size="md"
                id={'submit_button'}
                variant="primary">
                Submit Errors Found
            </Button>;
        const validatedButton =
            !validated ? <></> : <Button
                onClick={handleSubmit}
                disabled={submitLoading} size="md"
                id={'submit_button'}
                variant="primary">
                Submit Clean
            </Button>;
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
                                                onClick={() => {
                                                    setShowForm(false)
                                                }}
                                                type="button"
                                            >
                                                Cancel
                                            </Button>
                                            {validatedButton}
                                            {unvalidatedButton}

                                        </Flex>
                                    </Flex>
                                </Form>
                            )
                        }

                    </>
                }
            </>
        );
    }
;
