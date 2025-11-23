
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <Link to="/requests/new">
                    <Button>New Request</Button>
                </Link>
            </div>

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
        </div>
    );
};
