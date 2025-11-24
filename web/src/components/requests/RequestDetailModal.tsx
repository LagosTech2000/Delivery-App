import { useState } from 'react';
import { X, MapPin, Calendar, User, Phone, Mail, FileText, Tag, ShoppingCart, FileCheck, Box, Sparkles, Loader2, CheckCircle, Clock } from 'lucide-react';
import type { Request } from '../../types/request';
import { Button } from '../ui/Button';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { CreateResolutionModal } from '../resolutions/CreateResolutionModal';

interface RequestDetailModalProps {
    request: Request;
    isOpen: boolean;
    onClose: () => void;
    onRequestUpdated?: () => void;
}

const getRequestTypeIcon = (type: string) => {
    switch (type) {
        case 'product_delivery': return ShoppingCart;
        case 'document': return FileCheck;
        case 'package': return Box;
        case 'custom': return Sparkles;
        default: return Box;
    }
};

export const RequestDetailModal = ({ request, isOpen, onClose, onRequestUpdated }: RequestDetailModalProps) => {
    const { user } = useAuth();
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState('');
    const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            claimed: 'bg-blue-100 text-blue-800 border-blue-200',
            resolution_provided: 'bg-purple-100 text-purple-800 border-purple-200',
            payment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            verification: 'bg-orange-100 text-orange-800 border-orange-200',
            confirmed: 'bg-teal-100 text-teal-800 border-teal-200',
            customer_rejected: 'bg-red-100 text-red-800 border-red-200',
            agent_rejected: 'bg-red-100 text-red-800 border-red-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const handleClaimRequest = async () => {
        try {
            setIsClaiming(true);
            setError('');
            await requestService.claimRequest(request.id);
            onRequestUpdated?.();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to claim request');
        } finally {
            setIsClaiming(false);
        }
    };

    const TypeIcon = getRequestTypeIcon(request.type);
    const isAgent = user?.role === 'agent';
    const isCustomer = user?.role === 'customer';
    const canClaim = isAgent && request.status === 'pending';
    const canCreateResolution = isAgent && request.status === 'claimed' && request.claimed_by_agent_id === user?.id;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <TypeIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{request.product_name}</h2>
                                <p className="text-sm text-slate-500">Request Details</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                {formatStatus(request.status)}
                            </span>
                            <span className="text-sm text-slate-500">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Created {formatDate(request.created_at)}
                            </span>
                        </div>

                        {/* Agent Working Message (for customers when claimed) */}
                        {isCustomer && request.status === 'claimed' && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">Agent is Working on Your Request</h3>
                                        <p className="text-sm text-blue-700">
                                            An agent has claimed your request and is currently working on finding the best solution for you.
                                            You'll receive a resolution proposal soon!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Agent Information (when claimed) */}
                        {request.status !== 'pending' && request.claimed_by_agent_id && (
                            <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-100">
                                <div className="flex items-center gap-2 text-green-900 font-semibold">
                                    <CheckCircle className="h-4 w-4" />
                                    <h3>Assigned Agent</h3>
                                </div>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-600" />
                                        <span className="text-green-700">Agent ID:</span>
                                        <span className="font-medium text-green-900">{request.claimed_by_agent_id}</span>
                                    </div>
                                    {request.claimed_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-green-700">Claimed:</span>
                                            <span className="font-medium text-green-900">{formatDate(request.claimed_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer Information */}
                        {request.customer && (
                            <div className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
                                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                                    <User className="h-4 w-4" />
                                    <h3>Customer Information</h3>
                                </div>

                                <div className="grid gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-indigo-500" />
                                        <span className="text-indigo-600">Name:</span>
                                        <span className="font-medium text-indigo-900">
                                            {request.customer.name || 'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-indigo-500" />
                                        <span className="text-indigo-600">Email:</span>
                                        <a
                                            href={`mailto:${request.customer.email}`}
                                            className="font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            {request.customer.email}
                                        </a>
                                    </div>

                                    {request.customer.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-indigo-500" />
                                            <span className="text-indigo-600">Phone:</span>
                                            <a
                                                href={`tel:${request.customer.phone}`}
                                                className="font-medium text-primary-600 hover:text-primary-700"
                                            >
                                                {request.customer.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Product Information */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <TypeIcon className="h-4 w-4" />
                                <h3>Product Information</h3>
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Product Name</p>
                                    <p className="text-sm font-medium text-slate-900">{request.product_name}</p>
                                </div>

                                {request.product_description && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Description</p>
                                        <p className="text-sm text-slate-700">{request.product_description}</p>
                                    </div>
                                )}

                                {request.product_url && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Product URL</p>
                                        <a
                                            href={request.product_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline break-all"
                                        >
                                            {request.product_url}
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Type</p>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                            <Tag className="h-3 w-3" />
                                            {formatStatus(request.type)}
                                        </span>
                                    </div>
                                    {request.weight && (
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Weight</p>
                                            <p className="text-sm font-medium text-slate-900">{request.weight} kg</p>
                                        </div>
                                    )}
                                    {request.quantity && (
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Quantity</p>
                                            <p className="text-sm font-medium text-slate-900">{request.quantity}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Shipping Type</p>
                                    <span className="inline-flex items-center px-2 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                        {formatStatus(request.shipping_type)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Pickup Location */}
                            <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                                    <MapPin className="h-4 w-4" />
                                    <h3>Pickup Location</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-blue-900 font-medium">{request.pickup_location.address}</p>
                                    <p className="text-blue-700">
                                        {request.pickup_location.city}, {request.pickup_location.country}
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Location */}
                            <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-100">
                                <div className="flex items-center gap-2 text-green-900 font-semibold">
                                    <MapPin className="h-4 w-4" />
                                    <h3>Delivery Location</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-green-900 font-medium">{request.delivery_location.address}</p>
                                    <p className="text-green-700">
                                        {request.delivery_location.city}, {request.delivery_location.country}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <User className="h-4 w-4" />
                                <h3>Contact Information</h3>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    <span className="text-slate-600">Preferred Method:</span>
                                    <span className="font-medium text-slate-900">
                                        {formatStatus(request.preferred_contact_method)}
                                    </span>
                                </div>

                                {request.customer_phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-slate-500" />
                                        <span className="text-slate-600">Phone:</span>
                                        <a
                                            href={`tel:${request.customer_phone}`}
                                            className="font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            {request.customer_phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        {request.notes && (
                            <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                                    <FileText className="h-4 w-4" />
                                    <h3>Special Instructions</h3>
                                </div>
                                <p className="text-sm text-amber-900">{request.notes}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                            {canClaim && (
                                <Button onClick={handleClaimRequest} isLoading={isClaiming}>
                                    {isClaiming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Claiming...
                                        </>
                                    ) : (
                                        'Claim Request'
                                    )}
                                </Button>
                            )}
                            {canCreateResolution && (
                                <Button onClick={() => setIsResolutionModalOpen(true)}>
                                    Create Resolution
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Resolution Modal */}
            <CreateResolutionModal
                request={request}
                isOpen={isResolutionModalOpen}
                onClose={() => setIsResolutionModalOpen(false)}
                onSuccess={() => {
                    onRequestUpdated?.();
                }}
            />
        </>
    );
};
