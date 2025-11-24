import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { requestService } from '../services/request.service';
import type { Request } from '../types/request';
import { RequestCard } from '../components/requests/RequestCard';
import { RequestDetailModal } from '../components/requests/RequestDetailModal';
import { Package, Loader2 } from 'lucide-react';

export const Dashboard = () => {
    const { user } = useAuth();
    const [availableRequests, setAvailableRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchAvailableRequests = async () => {
            if (user?.role === 'agent') {
                try {
                    const response = await requestService.getRequests({
                        limit: 6,
                        // Don't pass status filter - let backend handle role-based filtering
                    });
                    setAvailableRequests(response.data);
                } catch (error) {
                    console.error('Failed to fetch available requests', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchAvailableRequests();
    }, [user?.role]);

    const handleRequestClick = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedRequest(null), 200);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">
                            {user?.role === 'agent' ? 'Manage your deliveries' : 'Track your requests'}
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

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Welcome back
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user?.name}</div>
                            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Account Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{user?.role}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {user?.role === 'agent' ? 'Ready to deliver' : 'Ready to ship'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Active</div>
                            <p className="text-xs text-slate-500 mt-1">Account verified</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Agent-specific: Available Requests Section */}
                {user?.role === 'agent' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Available Requests</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Claim requests to start delivering
                                </p>
                            </div>
                            <Link to="/requests">
                                <Button variant="outline">
                                    View All
                                </Button>
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64 bg-slate-50 rounded-2xl">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                            </div>
                        ) : availableRequests.length === 0 ? (
                            <Card className="bg-slate-50 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                                        <Package className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No available requests</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Check back later for new delivery opportunities
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {availableRequests.map((request) => (
                                    <RequestCard
                                        key={request.id}
                                        request={request}
                                        onClick={() => handleRequestClick(request)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <RequestDetailModal
                    request={selectedRequest}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onRequestUpdated={() => {
                        // Refresh the requests list
                        const fetchAvailableRequests = async () => {
                            if (user?.role === 'agent') {
                                try {
                                    const response = await requestService.getRequests({ limit: 6 });
                                    setAvailableRequests(response.data);
                                } catch (error) {
                                    console.error('Failed to fetch available requests', error);
                                }
                            }
                        };
                        fetchAvailableRequests();
                    }}
                />
            )}
        </>
    );
};
