import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package, DollarSign, Truck, Store, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { PaymentMethod, Request } from '../../types/request';

interface CreateResolutionModalProps {
    request: Request;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: any }[] = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'ach_transfer', label: 'ACH Transfer', icon: DollarSign },
    { value: 'bank_deposit', label: 'Bank Deposit', icon: DollarSign },
    { value: 'cash', label: 'Cash', icon: DollarSign },
];

export const CreateResolutionModal = ({ request, isOpen, onClose, onSuccess }: CreateResolutionModalProps) => {
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>();
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>(['card', 'bank_deposit']);
    const [error, setError] = useState('');

    const productCost = watch('product_cost') || 0;
    const serviceFee = watch('service_fee') || 0;
    const taxes = watch('taxes') || 0;
    const shippingCost = watch('shipping_cost') || 0;

    const totalAmount = Number(productCost) + Number(serviceFee) + Number(taxes) + Number(shippingCost);

    useEffect(() => {
        if (isOpen && request) {
            setValue('product_name', request.product_name);
            setValue('product_url', request.product_url || '');
            if (request.pickup_location && request.type !== 'product_delivery') {
                setValue('store_location', `${request.pickup_location.address}, ${request.pickup_location.city}, ${request.pickup_location.country}`);
            }
        }
    }, [isOpen, request, setValue]);

    if (!isOpen) return null;

    const togglePaymentMethod = (method: PaymentMethod) => {
        setSelectedPaymentMethods(prev =>
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    const onSubmit = async (data: any) => {
        try {
            setError('');
            if (selectedPaymentMethods.length === 0) {
                setError('Please select at least one payment method');
                return;
            }

            const resolutionData = {
                request_id: request.id,
                quote_breakdown: {
                    product_cost: Number(data.product_cost),
                    service_fee: Number(data.service_fee),
                    taxes: Number(data.taxes),
                },
                shipping_cost: Number(data.shipping_cost),
                product_details: {
                    name: data.product_name,
                    store: data.product_store,
                    price: Number(data.product_cost),
                    url: data.product_url || undefined,
                },
                store_info: {
                    name: data.store_name,
                    location: data.store_location,
                    contact: data.store_contact || undefined,
                },
                total_amount: totalAmount,
                allowed_payment_methods: selectedPaymentMethods,
                estimated_delivery_days: Number(data.estimated_delivery_days),
                notes: data.notes || undefined,
            };

            const response = await fetch('/api/v1/resolutions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(resolutionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create resolution');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create resolution');
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Package className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Create Resolution</h2>
                                <p className="text-sm text-slate-600">{request.product_name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Package className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Product Details</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Product Name *" placeholder="iPhone 15 Pro Max" {...register('product_name', { required: 'Product name is required' })} error={errors.product_name?.message as string} />
                                <Input label="Product Store *" placeholder="Apple Store" {...register('product_store', { required: 'Store is required' })} error={errors.product_store?.message as string} />
                            </div>
                            <Input label="Product URL (optional)" type="url" placeholder="https://store.apple.com/..." {...register('product_url')} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Store className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Store Information</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Store Name *" placeholder="Apple Store 5th Avenue" {...register('store_name', { required: 'Store name is required' })} error={errors.store_name?.message as string} />
                                <Input label="Store Location *" placeholder="767 5th Ave, New York, NY" {...register('store_location', { required: 'Location is required' })} error={errors.store_location?.message as string} />
                            </div>
                            <Input label="Store Contact (optional)" placeholder="+1 (212) 336-1440" {...register('store_contact')} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <DollarSign className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Pricing Breakdown</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Product Cost *" type="number" step="0.01" placeholder="999.99" {...register('product_cost', { required: 'Product cost is required', min: 0 })} error={errors.product_cost?.message as string} />
                                <Input label="Service Fee *" type="number" step="0.01" placeholder="50.00" {...register('service_fee', { required: 'Service fee is required', min: 0 })} error={errors.service_fee?.message as string} />
                                <Input label="Taxes *" type="number" step="0.01" placeholder="89.99" {...register('taxes', { required: 'Taxes are required', min: 0 })} error={errors.taxes?.message as string} />
                                <Input label="Shipping Cost *" type="number" step="0.01" placeholder="25.00" {...register('shipping_cost', { required: 'Shipping cost is required', min: 0 })} error={errors.shipping_cost?.message as string} />
                            </div>
                            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary-600">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-slate-200">
                                <Truck className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Delivery & Payment</h3>
                            </div>
                            <Input label="Estimated Delivery Days *" type="number" placeholder="3" {...register('estimated_delivery_days', { required: 'Delivery estimate is required', min: 1 })} error={errors.estimated_delivery_days?.message as string} />
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Allowed Payment Methods * (Select at least one)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                                        <button key={value} type="button" onClick={() => togglePaymentMethod(value)} className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${selectedPaymentMethods.includes(value) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                                            <Icon className="h-5 w-5" />
                                            <span className="text-xs font-medium text-center">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Additional Notes (optional)</label>
                            <textarea className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Any additional information for the customer..." {...register('notes')} />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                                {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : (<><Package className="h-4 w-4 mr-2" />Create Resolution</>)}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
