import { useState } from 'react';

const useBuyer = () => {
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
        Buyer_Info_Suburb: '',
        Buyer_Info_State: '',
        Postcode: ''
    });

    const handleBuyerChange = (field, val) => {
        setBuyer(prevBuyer => ({
            ...prevBuyer,
            [field]: val,
        }));
    };

    return { buyer, handleBuyerChange, setBuyer };
};

export default useBuyer;