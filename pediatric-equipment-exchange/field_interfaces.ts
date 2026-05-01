
export interface ItemFields {
    id: string
    name: string
    category: string
    subcategory: string | null
    condition: string
    status: string
    description: string | null
    size: string
    color: string | null
    donor: string | null
    image_urls: string[]
    barcode_value?: string | null
    created_at: string
    location?: string
    barcode_number?: number
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

export interface ProfileFields {
    id: string,
    full_name: string,
    created_at: string,
    username: string,
    role: string,
    email: string
}

export interface ReadableDistribution {
    id: string,
    equipment_id: string,
    reserved_by?: string,
    equipment_name?: string,
    equipment_status?: string,
    equipment_deleted_at?: string,
    recipient_name?: string,
    contact_name?: string,
    contact_email?: string,
    contact_phone?: string,
    authorized_for_pickup?: string,
    clinic_name?: string,
    reserved_by_name?: string,
    allocated_by_name?: string,
    returned_by_name?: string,
    cancelled_by_name?: string,
    signed_by_name?: string,
    equipment_deleted_by?: string,
    reserved_at?: string,
    returned_at?: string,
    allocated_at?: string,
    cancelled_at?: string,
    cancellation_reason?: string,
    therapist_notes?: string,
    signed_at?: string,
    signed_waiver_url?: string,
    condition_at_allocation?: string
}