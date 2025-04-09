export const yesNoOptions = [{label: 'Yes', value: 'Yes'}, {label: 'No', value: 'No'}];

export const KDRBOptions = [{label: 'KDRB', value: 'KDRB'}, {label: 'Vacant Lot', value: 'Vacant Lot'}];
// export const regionOptions = [{label: 'Melbourne Metro', value: 'Melbourne Metro'}, {
//     label: 'New South Wales', value: 'New South Wales'
// }, {label: 'Queensland', value: 'Queensland'}, {label: 'Regional', value: 'Regional'}, {
//     label: 'South Australia', value: 'South Australia'
// },];

export const rangeOptions = [
    {label: 'Elevate', value: 'Elevate'},
    {label: 'Elite', value: 'Elite'},
    {label: 'Emerge', value: 'Emerge'},
    {label: 'Masterpiece', value: 'Masterpiece'},
    {label: 'Medium Density', value: 'Medium Density'},
];
export const depositSourceOptions = [
    {label: 'Newspaper', value: 'Newspaper'},
    {label: 'Radio Advertisement', value: 'Radio Advertisement'},
    {label: 'TV', value: 'TV'},
    {label: 'Referral', value: 'Referral'},
    {label: 'Internet', value: 'Internet'},
    {label: 'Display Walk-in', value: 'Display Walk-in'},
    {label: 'Realestate.com.au', value: 'Realestate.com.au'},
    {label: 'Other', value: 'Other'},
];
export const depositDescriptionOptions = [
    {label: 'Initial Fee', value: 'Initial Fee'},
    {label: 'Preliminary Fee', value: 'Preliminary Fee'},
    {label: 'Customisation Fee', value: 'Customisation Fee'},
];
export const packageTypeOptions = [
    {label: 'Fixed Site Costs', value: 'Fixed Site Costs'},
    {label: 'Site Cost Allowance', value: 'Site Cost Allowance'},
    // {label: 'Runway Package', value: 'Runway Package'},
    {label: 'Exclusive Hold', value: 'Exclusive Hold'},
    {label: 'Simonds Investment Service', value: 'Simonds Investment Service'},
    {label: 'Community Housing', value: 'Community Housing'},
    {label: 'Government Housing', value: 'Government Housing'},
    {label: 'Precinct', value: 'Precinct'},
    {label: 'House & Land Package', value: 'House & Land Package'},
    {label: 'Knockdown and Rebuild', value: 'Knockdown and Rebuild'},
];
export const contextOptions = [
    {label: '[No Specific Identification]', value: '[No Specific Identification]'},
    {label: 'Projects', value: 'Projects'},
    {label: 'Straight to Contract', value: 'Straight to Contract'},
    {label: 'Tender', value: 'Tender'},
    {label: 'Colour Pallette', value: 'Colour Pallette'},
    {label: 'Gallery', value: 'Gallery'},
    {label: 'VIC KDRB', value: 'VIC KDRB'},
];
export const saleTypeOptions = [
    {label: 'Order', value: '-2'},
    {label: 'Spec', value: '4'},
    {label: 'Insurance', value: '31'},
    {label: 'Dual Occ', value: '34'},
    {label: 'Masterpiece Standalone', value: '36'},
    {label: 'Medium Density', value: '37'},
];
export const paymentMethodOptions = [
    // {label: 'Cheque', value: 'Cheque'},
    // {label: 'Cash', value: 'Cash'},
    {label: 'Credit Card', value: 'Credit Card'},
    {label: 'Direct Credit', value: 'Direct Credit'},
    {label: 'Debit Card', value: 'Debit Card'},
];
export var whoisPayingOptions = [{label: 'Buyer 1', value: 'Buyer 1'}, {label: 'Buyer 2', value: 'Buyer 2'}];
export const dropdownValueIsUnknown = (value) => {
    if(typeof value === 'string'){
        return value.toLowerCase().includes("unknown")
    }
    return false;
}
export const generateDropdownOptions = (options, addUnknown = false, label = 'name' , value = 'hs_object_id') => {
    let mapOptions = options.map(item => ({
        label: item[label], value: item[value]
    }));

    if (addUnknown) {
        // Check if '[UNKNOWN]' option is already present
        const unknownOption = mapOptions.find(option => option.label === '[Unknown]');

        if (!unknownOption) {
            mapOptions = [{label: '[Unknown]', value: '[Unknown]'}, ...mapOptions];
        }
    }

    return mapOptions;
}
export const generateOptionFromProperties= (result, properties) => {
    let property = result.find(item=> item.name === properties)
    if(property){
        let propertyOptions_ = property.options;
        if(propertyOptions_.length > 0){
            propertyOptions_ = propertyOptions_.sort((a, b) => a.displayOrder - b.displayOrder);
            propertyOptions_ = propertyOptions_.filter(item => !item.hidden);
            propertyOptions_ = generateDropdownOptions(propertyOptions_, false, 'label','value')
            return  propertyOptions_;
        }
    }
    return null;
}