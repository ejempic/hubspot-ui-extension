import { useState } from 'react';

const useDeposit = () => {
    const [deposit, setDeposit] = useState({
        Deposit_Who_Paying_Deposit: '',
        Deposit_Range: '',
        Deposit_Deposit_Source: '',
        Deposit_Deposit_Desc: '',
        Deposit_Package_Type: '',
        Deposit_Context: '',
        Deposit_Amount_Paid: '',
        Deposit_Amount_Paid_Print: '',
        Deposit_Payment_Method: '',
        Deposit_Payment_Terminal_Number: 'Bpoint', //REQURIE AND SHOW IF Deposit_Payment_Method  debit card/creditCard Value is Bpoint
        Deposit_Promotion_Type: '',
        Deposit_Sales_Accept_Forecast: null, // Date
        Deposit_Sales_Accept_Forecast_Text: null, // Date
        Deposit_Comment: '',
    });

    const handleDepositChange = (field, val) => {
        setDeposit(prevDeposit => ({
            ...prevDeposit,
            [field]: val,
        }));
    };

    return { deposit, handleDepositChange, setDeposit };
};

export default useDeposit;