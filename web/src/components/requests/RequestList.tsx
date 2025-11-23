import { useEffect, useState } from 'react';
import { requestService } from '../../services/request.service';
import type { Request } from '../../types/request';
import { RequestCard } from './RequestCard';
import { RequestDetailModal } from './RequestDetailModal';
import { Loader2, Plus, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const RequestList = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await requestService.getRequests({ limit: 50 });
                setRequests(response.data);
            } catch (err) {
                setError('Failed to load requests');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 200); // Delay clearing to allow modal animation
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <Button variant="ghost" onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Available Requests</h2>
                    <Link to="/requests/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Button>
                    </Link>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="bg-white p-4 rounded-full inline-flex mb-4 shadow-sm">
                            <Package className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No requests found</h3>
                        <p className="text-slate-500 mt-1">Be the first to create a delivery request!</p>
                        <Link to="/requests/new">
                            <Button className="mt-6" variant="outline">
                                Create Request
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {requests.map((request) => (
                            <RequestCard
                                key={request.id}
                                request={request}
                                onClick={() => handleRequestClick(request)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <RequestDetailModal
                    request={selectedRequest}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};
