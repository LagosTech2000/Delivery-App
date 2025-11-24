
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/request.service';
import type { CreateRequestData } from '../../types/request';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowLeft, Package, MapPin, Phone, FileText, Info, ShoppingCart, FileCheck, Box, Sparkles } from 'lucide-react';

export const CreateRequestForm = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm<any>();
    const [successMessage, setSuccessMessage] = useState('');

    const requestType = watch('type', 'product_delivery');
    const shippingType = watch('shipping_type');

    const onSubmit = async (data: any) => {
        try {
            setSuccessMessage('');

            // Build the request data matching backend expectations
            const submitData: any = {
                product_name: data.product_name,
                product_description: data.product_description || undefined,
                product_url: data.product_url || undefined,
                type: data.type,
                source: data.source || 'other',
                weight: data.weight ? parseFloat(data.weight) : undefined,
                quantity: data.quantity ? parseInt(data.quantity) : 1,
                shipping_type: data.shipping_type,
                pickup_location: data.type === 'product_delivery'
                    ? { address: 'Store location (TBD by agent)', city: 'TBD', country: 'TBD' }
                    : {
                        address: data.pickup_address,
                        city: data.pickup_city,
                        country: data.pickup_country
                    },
                delivery_location: {
                    address: data.delivery_address,
                    city: data.delivery_city,
                    country: data.delivery_country
                },
                preferred_contact_method: data.preferred_contact_method || 'email',
                customer_phone: data.phoneNumber ? `${data.countryCode || '+1'}${data.phoneNumber}` : undefined,
                notes: data.notes || undefined
            };

            await requestService.createRequest(submitData);
            setSuccessMessage('Request created successfully!');

            setTimeout(() => {
                navigate('/requests');
            }, 1500);
        } catch (error: any) {
            console.error('Failed to create request', error);

            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                backendErrors.forEach((err: { field: string; message: string }) => {
                    setError(err.field as any, { message: err.message });
                });
                setError('root', {
                    message: error.response.data.error || 'Please fix the errors above',
                });
            } else {
                setError('root', {
                    message: error.response?.data?.error || error.message || 'Failed to create request. Please try again.',
                });
            }
        }
    };

    const renderTypeSpecificFields = () => {
        switch (requestType) {
            case 'product_delivery':
                return (
                    <>
                        <div>
                            <Input
                                label="Product URL (optional)"
                                type="url"
                                placeholder="https://amazon.com/product-link"
                                {...register('product_url')}
                            />
                            <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>Link to the product page - helps agent verify exact item</span>
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Store/Source</label>
                            <select
                                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                {...register('source')}
                            >
                                <option value="amazon">Amazon</option>
                                <option value="ebay">eBay</option>
                                <option value="national_store">National Store</option>
                                <option value="international_store">International Store</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Input
                                    label="Quantity"
                                    type="number"
                                    placeholder="1"
                                    defaultValue="1"
                                    {...register('quantity')}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Approx. Weight (kg)"
                                    type="number"
                                    step="0.1"
                                    placeholder="1.5"
                                    {...register('weight')}
                                />
                            </div>
                        </div>
                    </>
                );

            case 'document':
                return (
                    <>
                        <div>
                            <Input
                                label="Document Description *"
                                placeholder="e.g., Legal contract, passport copy, etc."
                                {...register('product_description', { required: 'Description is required for documents' })}
                                error={errors.product_description?.message}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 ml-1">Urgency Level</label>
                            <select
                                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                {...register('urgency')}
                            >
                                <option value="standard">Standard</option>
                                <option value="urgent">Urgent (24-48h)</option>
                                <option value="express">Express (Same Day)</option>
                            </select>
                        </div>
                    </>
                );

            case 'package':
                return (
                    <>
                        <div>
                            <Input
                                label="Package Contents *"
                                placeholder="e.g., Electronics, clothing, books"
                                {...register('product_description', { required: 'Contents description is required' })}
                                error={errors.product_description?.message}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Input
                                    label="Weight (kg) *"
                                    type="number"
                                    step="0.1"
                                    placeholder="5.0"
                                    {...register('weight', { required: 'Weight is required for packages' })}
                                    error={errors.weight?.message}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Dimensions (approx)"
                                    placeholder="30x20x10 cm"
                                    {...register('dimensions')}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 h-11 px-3 py-2 border border-slate-200 rounded-xl bg-white cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        {...register('fragile')}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700">Fragile</span>
                                </label>
                            </div>
                        </div>
                    </>
                );

            case 'custom':
                return (
                    <>
                        <div>
                            <Input
                                label="Detailed Description *"
                                placeholder="Describe what you need delivered"
                                {...register('product_description', { required: 'Description is required for custom requests' })}
                                error={errors.product_description?.message}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Input
                                    label="Estimated Budget (optional)"
                                    type="number"
                                    placeholder="100"
                                    {...register('budget')}
                                />
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Your budget helps agents provide accurate quotes
                                </p>
                            </div>
                            <div>
                                <Input
                                    label="Weight (kg)"
                                    type="number"
                                    step="0.1"
                                    placeholder="2.0"
                                    {...register('weight')}
                                />
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent hover:text-primary-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Info className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        Fill out this form with details about what you need delivered. An agent will review your request,
                        provide a detailed quote with pricing, and handle the entire delivery process for you.
                    </p>
                </div>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-slate-200">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        Create New Delivery Request
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                ✓
                            </div>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Request Type Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Sparkles className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Request Type</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { value: 'product_delivery', label: 'Product', icon: ShoppingCart },
                                    { value: 'document', label: 'Document', icon: FileCheck },
                                    { value: 'package', label: 'Package', icon: Box },
                                    { value: 'custom', label: 'Custom', icon: Sparkles },
                                ].map(({ value, label, icon: Icon }) => (
                                    <label
                                        key={value}
                                        className={`relative flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${requestType === value
                                            ? 'border-primary-500 bg-primary-50 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value={value}
                                            {...register('type', { required: true })}
                                            className="sr-only"
                                        />
                                        <Icon className={`h-6 w-6 ${requestType === value ? 'text-primary-600' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-medium ${requestType === value ? 'text-primary-700' : 'text-slate-600'}`}>
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Package className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                            </div>

                            <div>
                                <Input
                                    label="Item Name *"
                                    placeholder={
                                        requestType === 'document' ? 'e.g., Legal Contract' :
                                            requestType === 'package' ? 'e.g., Electronics Package' :
                                                requestType === 'custom' ? 'e.g., Custom Delivery' :
                                                    'e.g., iPhone 15 Pro Max'
                                    }
                                    {...register('product_name', { required: 'Item name is required' })}
                                    error={errors.product_name?.message}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 ml-1">Shipping Type *</label>
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    {...register('shipping_type', { required: 'Shipping type is required' })}
                                >
                                    <option value="national">National (Within Country)</option>
                                    <option value="international">International (Cross-Border)</option>
                                </select>
                            </div>

                            {renderTypeSpecificFields()}
                        </div>

                        {/* Pickup Location - Only for non-product deliveries */}
                        {requestType !== 'product_delivery' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                    <MapPin className="h-4 w-4 text-slate-600" />
                                    <h3 className="text-lg font-semibold text-slate-900">Pickup Location</h3>
                                </div>
                                <p className="text-sm text-slate-600">Where should the agent collect the item from?</p>

                                <div>
                                    <Input
                                        label="Street Address *"
                                        placeholder="123 Main Street, Apt 4B"
                                        {...register('pickup_address', {
                                            required: requestType !== 'product_delivery' ? 'Pickup address is required' : false
                                        })}
                                        error={errors.pickup_address?.message}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input
                                        label="City *"
                                        placeholder="New York"
                                        {...register('pickup_city', {
                                            required: requestType !== 'product_delivery' ? 'Pickup city is required' : false
                                        })}
                                        error={errors.pickup_city?.message}
                                    />
                                    <Input
                                        label="Country *"
                                        placeholder="USA"
                                        {...register('pickup_country', {
                                            required: requestType !== 'product_delivery' ? 'Pickup country is required' : false
                                        })}
                                        error={errors.pickup_country?.message}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Info message for product delivery */}
                        {requestType === 'product_delivery' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">Pickup Location</p>
                                        <p className="text-blue-700">
                                            For product deliveries, the agent will purchase the item from the store you specify.
                                            You only need to provide the delivery address.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Location */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <MapPin className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Delivery Location</h3>
                            </div>

                            <div>
                                <Input
                                    label="Street Address *"
                                    placeholder="456 Oak Avenue, Suite 200"
                                    {...register('delivery_address', { required: 'Delivery address is required' })}
                                    error={errors.delivery_address?.message}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Input
                                    label="City *"
                                    placeholder="Boston"
                                    {...register('delivery_city', { required: 'Delivery city is required' })}
                                    error={errors.delivery_city?.message}
                                />
                                <Input
                                    label="Country *"
                                    placeholder="USA"
                                    {...register('delivery_country', { required: 'Delivery country is required' })}
                                    error={errors.delivery_country?.message}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Phone className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Contact Preferences</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Preferred Contact Method</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        {...register('preferred_contact_method')}
                                    >
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="both">Both Email & WhatsApp</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Phone Number (optional)</label>
                                    <div className="flex gap-2">
                                        <select
                                            {...register('countryCode')}
                                            defaultValue="+1"
                                            className="w-32 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white text-slate-900"
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+504">🇭🇳 +504</option>
                                        </select>
                                        <input
                                            type="tel"
                                            placeholder="2025551234"
                                            {...register('phoneNumber')}
                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <FileText className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 ml-1">Special Instructions (optional)</label>
                                <textarea
                                    className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    placeholder="Any special handling instructions, delivery time preferences, or other important details..."
                                    {...register('notes')}
                                />
                            </div>
                        </div>

                        {errors.root && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                                {errors.root.message}
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                                <Package className="h-4 w-4 mr-2" />
                                Create Request
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
