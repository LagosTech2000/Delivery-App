
import type { Request } from '../../types/request';
import { Card, CardContent } from '../ui/Card';
import { MapPin, Package, Calendar, Truck } from 'lucide-react';

interface RequestCardProps {
    request: Request;
    onClick?: () => void;
}

export const RequestCard = ({ request, onClick }: RequestCardProps) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        available: 'bg-green-100 text-green-800',
        claimed: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-indigo-100 text-indigo-800',
        resolution_provided: 'bg-purple-100 text-purple-800',
        accepted: 'bg-teal-100 text-teal-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-slate-100 text-slate-800',
        cancelled: 'bg-red-50 text-red-600',
    };

    return (
        <Card
            className="cursor-pointer hover:border-primary-200 hover:shadow-md transition-all group"
            onClick={onClick}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <Package className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 line-clamp-1">{request.product_name}</h3>
                            <p className="text-sm text-slate-500 capitalize">{request.type.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[request.status]}`}>
                        {request.status.replace('_', ' ')}
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
