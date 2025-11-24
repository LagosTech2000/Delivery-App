export type RequestStatus =
    | 'pending'
    | 'claimed'
    | 'resolution_provided'
    | 'payment'
    | 'verification'
    | 'confirmed'
    | 'customer_rejected'
    | 'agent_rejected'
    | 'completed'
    | 'cancelled';

export type PaymentMethod = 'card' | 'ach_transfer' | 'bank_deposit' | 'cash';

export type RequestType = 'product_delivery' | 'document' | 'package' | 'custom';
export type ShippingType = 'national' | 'international';

export interface Location {
    address: string;
    city: string;
    country: string;
}

export interface Request {
    id: string;
    customer_id: string;
    customer?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    product_name: string;
    product_description?: string;
    product_url?: string;
    type: RequestType;
    source?: string;
    weight?: number;
    quantity?: number;
    shipping_type: ShippingType;
    pickup_location: Location;
    delivery_location: Location;
    preferred_contact_method: 'email' | 'whatsapp' | 'both';
    customer_phone?: string;
    notes?: string;
    payment_method?: PaymentMethod;
    payment_proof?: string;
    claimed_at?: string;
    status: RequestStatus;
    created_at: string;
    updated_at: string;
    claimed_by_agent_id?: string;
}

export interface CreateRequestData {
    product_name: string;
    product_description?: string;
    product_url?: string;
    type: RequestType;
    source?: string;
    weight?: number;
    quantity?: number;
    shipping_type: ShippingType;
    pickup_location: Location;
    delivery_location: Location;
    preferred_contact_method: 'email' | 'whatsapp' | 'both';
    customer_phone?: string;
    notes?: string;
}

export interface RequestFilters {
    page?: number;
    limit?: number;
    status?: RequestStatus;
    type?: RequestType;
    shipping_type?: ShippingType;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
