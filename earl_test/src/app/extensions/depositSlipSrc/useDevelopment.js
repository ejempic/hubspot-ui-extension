import { useState } from 'react';

const useDevelopment = () => {

    const [development, setDevelopment] = useState({
        Development_Developer: '',
        Development_Developer_Desc: '',
        Development_Estate: '',
        Development_Estate_Desc: '',
        Development_Display_Centre: '',
        Development_Display_Centre_Desc: '',
        Development_House_Type: '',
        Development_House_Type_Desc: '',
        Development_Size: '',
        Development_Facade: '',
        Development_Region: '',

        Development_Address_Is_Land_Titled: '',
        Development_Address_Is_KDRB_OR_Vacant: '',
        Development_Address_Street_Number: '',// REQUIRED AND SHOW IF Land Title is Yes
        Development_Address_Expected_Titles: null,// REQUIRED AND SHOW IF Land Title is No
        Development_Address_Expected_Titles_Text: null,// REQUIRED AND SHOW IF Land Title is No
        Development_Address_Lot_No: '', // REQUIRED AND SHOW IF is KDRB or Vacant is Vacant Lot
        Development_Address_Street_Name: '',
        Development_Address_Suburb: '',
        Development_Address_State: '',
        Development_Address_Postcode: '',

        Development_Address_Site_Start: null,
        Development_Address_Site_Land_Settlement: null,
        Development_Address_Site_Start_Text: null,
        Development_Address_Site_Land_Settlement_Text: null,
    });

    const handleDevelopmentChange = (field, val) => {
        if(field == 'Development_Address_Site_Start' || field == 'Development_Address_Site_Start_Text'){
            console.log(val)
        }
        setDevelopment(prevDevelopment => ({
            ...prevDevelopment,
            [field]: val,
        }));
    };

    return { development, handleDevelopmentChange, setDevelopment };
};

export default useDevelopment;