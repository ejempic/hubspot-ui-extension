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
      contact_phone contact_first_name
      contact_last_name
      contact_email
      contact_id
      contact_phone
      associations {
        p_deposit_collection__deal_to_deposit(orderBy: hubspot_deal_id__desc) {
          items {
            add_second_buyer_details
            amount_paid
            amount_paid__print_
            ar_team_to_process_payment
            auth_key_1
            auth_key_2
            authorise_id
            bank_response_code
            bpoint_key_generate_source
            bpoint_merchant_id
            bpoint_payment_date
            bpoint_payment_link
            bpoint_payment_successful
            buyer_1
            buyer_1_after_hours_number
            buyer_1_business_number
            buyer_1_email
            buyer_1_email_not_provided
            buyer_1_mobile
            buyer_1_surname
            buyer_1_title
            buyer_2
            buyer_2_after_hours_number
            buyer_2_business_number
            buyer_2_email
            buyer_2_email_not_provided
            buyer_2_given_name
            buyer_2_mobile
            buyer_2_surname
            buyer_2_title
            buyer_info_postcode
            buyer_info_state
            buyer_info_street_name
            buyer_info_street_number
            buyer_info_suburb
            call_out_response
            can_be_refunded_automatically
            card_type
            client_name
            comment
            contact_after_hours_number
            contact_business_number
            contact_details_need_to_be_updated
            contact_mobile_number
            context
            current_address
            date_of_deposit
            day_of_deposit
            deal_deposit_number
            deposit_amount
            deposit_deal_id
            deposit_description
            deposit_receipt_number
            deposit_source
            deposit_type
            deposit_workflow_unenrolment
            developer__tex_
            developer_description
            display_centre__text_
            display_centre_description
            email_address
            estate__text_
            estate_description
            expected_titles
            facade__text_
            final_quote_amount
            finalised_refund_request_count
            fixed_site_costs_
            framework_id
            framework_sync_response
            frontage
            given_name
            house_type__text_
            house_type_description
            hs_all_owner_ids
            hs_created_by_user_id
            hs_createdate
            hs_lastmodifieddate
            hs_object_id
            hs_object_source
            hs_object_source_detail_1
            hs_object_source_detail_2
            hs_object_source_detail_3
            hs_object_source_id
            hs_object_source_label
            hs_object_source_user_id
            hs_pinned_engagement_id
            hs_read_only
            hs_unique_creation_key
            hs_updated_by_user_id
            hs_was_imported
            hubspot_deal_id
            hubspot_owner_assigneddate
            hubspot_owner_id
            hubspot_support__refund_processed_tomorrow_
            hubspot_support__refund_processed_yesterday_
            hubspot_team_id
            if_other_please_specify
            inactive_deposit_description
            inactive_package_type
            inactive_range
            is_initial_deposit
            is_processed_next_day
            is_submitted_
            is_the_deposit_from_buyer_1_or_buyer_2_
            is_the_land_titled_
            is_this_a_kdrb_or_vacant_lot_
            job_created
            job_number
            land_settlement
            land_settlement__text_
            lms_id
            lot_number
            name
            name_of_person_depositing
            original_processed_date_and_time
            package_type
            payment_method
            payment_url
            phone___of_person_depositing
            postcode
            processed
            promotion_type__text_
            proposed_building_address
            proposed_building_developer
            proposed_building_display_centre
            proposed_building_estate
            proposed_building_facade
            proposed_building_house_type
            proposed_building_lot_number
            proposed_building_size
            range
            receipt_number__bpoint_
            receipt_url
            refundable
            refundable_amount
            region
            request_date
            requested_by
            response_code
            response_text
            result_key_1
            result_key_2
            retrieval_reference_number
            sale_condition
            sale_type
            sales_accept_forecast
            sales_rep_manager_email
            selected_developer
            selected_display_centre
            selected_estate
            selected_facade
            selected_house_type
            selected_promotion
            selected_promotion_type
            selected_region
            selected_sale_type
            selected_sale_type_id
            selected_team
            sent_to_framework_
            settlement_date
            sf_deposit_id
            sf_opportunity_id
            simonds_representative
            simonds_representative_manager__text_
            site_start
            site_start_
            site_start__text_
            size
            state
            status
            street_name
            street_number
            suburb
            sync_failed_
            team__text_
            terminal_number
            title_due
            today_s_date
            transaction_number
            was_processed_yesterday
          }
        }
      }
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