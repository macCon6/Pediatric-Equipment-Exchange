
export interface ItemFields {
    id: string,
    name: string,
    category: string,
    subcategory: string | null,
    condition: string,
    status: string,
    description: string | null,
    size: string,
    color: string | null,
    donor: string | null,
    image_urls: string[],
    created_at: string,
    location: string,
    barcode_value: string | null
}

export interface DistributionFields {
    id: string, 
    equipment_id: string,
    recipient_id: string,
    reserved_by: string,
    allocated_by: string | null,
    returned_by: string | null,
    reserved_at: string, 
    allocated_at: string | null,
    returned_at: string | null,
    condition_at_allocation: string | null,
    notes: string | null,
    cancellation_reason: string | null,
    cancelled_at: string | null,
    cancelled_by: string | null,
    signed_at: string | null,
    signed_by: string | null,
    signed_waiver_url: string | null,
    waiver_template_id: string | null
    
}

export interface RecipientFields {
    id: string,
    name: string,
    contact_name: string,
    email: string,
    phone: string,
    created_at: string,
    authorized_for_pickup: string,
    clinic_id: string
}

export interface ClinicFields {
    id: string,
    name: string,
    created_at: string,
}

// distribution fetch with recipient info for the "Distribution Details Popup"
export interface DistributionWithRecipient extends DistributionFields {
  recipient: RecipientFields
}