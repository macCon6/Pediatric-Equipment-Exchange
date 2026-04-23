
export interface ItemFields {
    id: string
    name: string
    category: string
    subcategory?: string
    condition: string
    status: string
    description?: string
    size: string
    color: string
    donor?: string
    image_urls: string[]
    created_at: string
    location: string
    barcode_value: string | null
}

export interface DistributionFields {
    id: string, 
    equipment_id: string,
    recipient_id: string,
    reserved_by: string,
    allocated_by?: string,
    returned_by?: string,
    reserved_at: string, 
    allocated_at?: string,
    returned_at?: string,
    condition_at_allocation?: string,
    notes?: string,
    cancellation_reason?: string,
    cancelled_at?: string,
    cancelled_by?: string,
    signed_at?: string,
    signed_by?: string,
    signed_waiver_url?: string,
    waiver_template_id: string
    
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