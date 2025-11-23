import { api } from './api';
import type { Request, CreateRequestData, RequestFilters, PaginatedResponse } from '../types/request';

export const requestService = {
    async getRequests(filters: RequestFilters = {}): Promise<PaginatedResponse<Request>> {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
        if (filters.shipping_type) params.append('shipping_type', filters.shipping_type);

        const { data } = await api.get<{ success: boolean; data: Request[]; meta: any }>(`/requests?${params.toString()}`);
        return {
            data: data.data,
            meta: data.meta
        };
    },

    async getRequest(id: string): Promise<Request> {
        const { data } = await api.get<{ data: { request: Request } }>(`/requests/${id}`);
        return data.data.request;
    },

    async createRequest(requestData: CreateRequestData): Promise<Request> {
        const { data } = await api.post<{ data: { request: Request } }>('/requests', requestData);
        return data.data.request;
    },

    async claimRequest(id: string): Promise<Request> {
        const { data } = await api.post<{ data: { request: Request } }>(`/requests/${id}/claim`);
        return data.data.request;
    },

    async unclaimRequest(id: string): Promise<Request> {
        const { data } = await api.post<{ data: { request: Request } }>(`/requests/${id}/unclaim`);
        return data.data.request;
    }
};
