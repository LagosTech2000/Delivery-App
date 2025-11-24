import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/request.service';
import type { Request } from '../types/request';
import { RequestDetailModal } from '../components/requests/RequestDetailModal';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Package, Loader2, ShoppingCart, FileCheck, Box, Sparkles, Filter } from 'lucide-react';

const REQUEST_TYPES = [
    { value: 'all', label: 'All Types', icon: Package },
    { value: 'product_delivery', label: 'Product', icon: ShoppingCart },
    { value: 'document', label: 'Document', icon: FileCheck },
    { value: 'package', label: 'Package', icon: Box },
    { value: 'custom', label: 'Custom', icon: Sparkles },
];

const STATUS_COLUMNS = [
    { status: 'pending', label: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
    { status: 'claimed', label: 'Claimed', color: 'bg-blue-50 border-blue-200' },
    { status: 'resolution_provided', label: 'Resolution', color: 'bg-purple-50 border-purple-200' },
    { status: 'payment', label: 'Payment', color: 'bg-indigo-50 border-indigo-200' },
    { status: 'verification', label: 'Verification', color: 'bg-orange-50 border-orange-200' },
    { status: 'confirmed', label: 'Confirmed', color: 'bg-teal-50 border-teal-200' },
];

const getRequestTypeIcon = (type: string) => {
    switch (type) {
        case 'product_delivery': return ShoppingCart;
        case 'document': return FileCheck;
        case 'package': return Box;
        case 'custom': return Sparkles;
        default: return Box;
    }
};

export const Requests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await requestService.getRequests({ limit: 50 });
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let filtered = requests;

        // Filter by type
        if (selectedType !== 'all') {
            filtered = filtered.filter(req => req.type === selectedType);
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(req => req.status === selectedStatus);
        }

        setFilteredRequests(filtered);
    }, [requests, selectedType, selectedStatus]);

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 200);
    };

    const handleRequestUpdated = () => {
        fetchRequests();
    };

    const getRequestsByStatus = (status: string) => {
        return filteredRequests.filter(req => req.status === status);
    };

    const RequestKanbanCard = ({ request }: { request: Request }) => {
        const TypeIcon = getRequestTypeIcon(request.type);

        return (
            <div
                onClick={() => handleRequestClick(request)}
                className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all group"
            >
                <div className="flex items-start gap-2 mb-2">
                    <div className="p-1.5 bg-primary-50 rounded-md group-hover:bg-primary-100 transition-colors">
                        <TypeIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 line-clamp-2">{request.product_name}</h4>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{request.type.replace(/_/g, ' ')}</p>
                    </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400">To:</span>
                        <span className="truncate">{request.delivery_location.city}</span>
                    </div>
                    {request.customer && (
                        <div className="flex items-center gap-1">
                            <span className="text-slate-400">By:</span>
                            <span className="truncate">{request.customer.name}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
                        <p className="text-slate-500 mt-1">
                            {user?.role === 'agent' ? 'Manage delivery requests' : 'Track your delivery requests'}
                        </p>
                    </div>
                    {user?.role === 'customer' && (
                        <Link to="/requests/new">
                            <Button>
                                <Package className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="h-4 w-4 text-slate-600" />
                        <h3 className="font-semibold text-slate-900">Filters</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Type Filter */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Request Type</label>
                            <div className="flex flex-wrap gap-2">
                                {REQUEST_TYPES.map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setSelectedType(value)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedType === value
                                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                            : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedStatus('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedStatus === 'all'
                                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                        : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                        }`}
                                >
                                    All Statuses
                                </button>
                                {STATUS_COLUMNS.map(({ status, label }) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${selectedStatus === status
                                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                            : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 bg-slate-50 rounded-2xl">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4">
                        <div className="inline-flex gap-4 min-w-full">
                            {STATUS_COLUMNS.map(({ status, label, color }) => {
                                const statusRequests = getRequestsByStatus(status);

                                return (
                                    <div key={status} className="flex-shrink-0 w-80">
                                        <div className={`rounded-xl border-2 ${color} h-full`}>
                                            {/* Column Header */}
                                            <div className="p-4 border-b border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-slate-900">{label}</h3>
                                                    <span className="px-2 py-0.5 bg-white rounded-full text-xs font-medium text-slate-600">
                                                        {statusRequests.length}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column Content */}
                                            <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
                                                {statusRequests.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <Package className="h-8 w-8 text-slate-300 mb-2" />
                                                        <p className="text-sm text-slate-400">No requests</p>
                                                    </div>
                                                ) : (
                                                    statusRequests.map(request => (
                                                        <RequestKanbanCard key={request.id} request={request} />
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <RequestDetailModal
                    request={selectedRequest}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onRequestUpdated={handleRequestUpdated}
                />
            )}
        </>
    );
};
