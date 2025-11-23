
import { RequestList } from '../components/requests/RequestList';

export const Requests = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Requests</h1>
                <p className="text-slate-500">Manage and track your delivery requests</p>
            </div>
            <RequestList />
        </div>
    );
};
