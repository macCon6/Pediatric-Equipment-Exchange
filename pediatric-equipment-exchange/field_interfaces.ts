
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
    donor: string
    image_urls: string[]
    created_at: string
    location: string
    barcode_number: number
}

export interface DistributionFields {
    id: string, 
    equipment_id: string,
    recipient_id: string,
    reserved_by: string,
    allocated_by: string,
    returned_by: string,
    reserved_at: string, 
    allocated_at?: string,
    returned_at?: string,
    waiver_signed: boolean,
    waiver_url?: string,
    signed_at?: string,
    condition_at_allocation?: string,
    notes?: string,
}

export interface RecipientFields {
    id: string,
    name: string,
    contact_name: string,
    organization?: string,
    email: string,
    phone: string,
    created_at: string
}