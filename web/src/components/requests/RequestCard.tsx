
import type { Request } from '../../types/request';
import { Card, CardContent } from '../ui/Card';
import { MapPin, Calendar, Truck, ShoppingCart, FileCheck, Box, Sparkles } from 'lucide-react';

interface RequestCardProps {
    request: Request;
    onClick?: () => void;
}

const getRequestTypeIcon = (type: string) => {
    switch (type) {
        case 'product_delivery':
            return ShoppingCart;
        case 'document':
            return FileCheck;
        case 'package':
            return Box;
        case 'custom':
            return Sparkles;
        default:
            return Box;
    }
};

export const RequestCard = ({ request, onClick }: RequestCardProps) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        claimed: 'bg-blue-100 text-blue-800',
        resolution_provided: 'bg-purple-100 text-purple-800',
        payment: 'bg-indigo-100 text-indigo-800',
        verification: 'bg-orange-100 text-orange-800',
        confirmed: 'bg-teal-100 text-teal-800',
        customer_rejected: 'bg-red-100 text-red-800',
        agent_rejected: 'bg-red-100 text-red-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-slate-100 text-slate-800',
    };

    const TypeIcon = getRequestTypeIcon(request.type);

    return (
        <Card
            className="cursor-pointer hover:border-primary-200 hover:shadow-md transition-all group"
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <TypeIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 line-clamp-1">{request.product_name}</h3>
                            <p className="text-sm text-slate-500 capitalize">{request.type.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[request.status as keyof typeof statusColors]}`}>
                        {request.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="truncate">From: {request.pickup_location.city}, {request.pickup_location.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-slate-400" />
                        <span className="truncate">To: {request.delivery_location.city}, {request.delivery_location.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
