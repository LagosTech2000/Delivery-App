
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/request.service';
import type { CreateRequestData } from '../../types/request';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowLeft, Package, MapPin, Phone, FileText, Info } from 'lucide-react';

export const CreateRequestForm = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm<any>();
    const [successMessage, setSuccessMessage] = useState('');

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
                source: 'other', // Backend expects RequestSource enum value
                weight: data.weight ? parseFloat(data.weight) : undefined,
                quantity: data.quantity ? parseInt(data.quantity) : 1,
                shipping_type: data.shipping_type,
                pickup_location: {
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

            // Handle validation errors from backend
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent hover:text-primary-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">How it works</p>
                    <p className="text-blue-700">Fill out this form with details about what you need delivered. An agent will review your request and provide you with a quote. You can then accept or request changes.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary-600" />
                        Create New Delivery Request
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-600 text-sm font-medium border border-green-200">
                            ✓ {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Product Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Package className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Product Information</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Product Name *"
                                        placeholder="e.g., iPhone 15 Pro Max"
                                        {...register('product_name', { required: 'Product name is required' })}
                                        error={errors.product_name?.message}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Enter the name or title of the item you want delivered</span>
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Request Type *</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        {...register('type', { required: 'Type is required' })}
                                    >
                                        <option value="product_delivery">Product Delivery</option>
                                        <option value="package">Package</option>
                                        <option value="document">Document</option>
                                        <option value="custom">Custom/Other</option>
                                    </select>
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Select the category that best describes your delivery</span>
                                    </p>
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
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Choose whether this is a domestic or international delivery</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="Product Description (optional)"
                                    placeholder="e.g., Brand new, sealed in box, space black color"
                                    {...register('product_description')}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>Provide additional details about the item (condition, color, special features, etc.)</span>
                                </p>
                            </div>

                            <div>
                                <Input
                                    label="Product URL (optional)"
                                    type="url"
                                    placeholder="https://example.com/product"
                                    {...register('product_url')}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>Link to the product page if purchasing online (helps agent verify item)</span>
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Input
                                        label="Weight (kg)"
                                        type="number"
                                        step="0.1"
                                        placeholder="1.5"
                                        {...register('weight')}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Approximate weight in kilograms (affects shipping cost)</span>
                                    </p>
                                </div>
                                <div>
                                    <Input
                                        label="Quantity"
                                        type="number"
                                        placeholder="1"
                                        defaultValue="1"
                                        {...register('quantity')}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Number of items to be delivered</span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-3">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500 mb-1">Estimated Size</p>
                                        <p className="text-sm font-medium text-slate-700">
                                            {shippingType === 'international' ? '📦 International' : '📦 Domestic'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pickup Location Section */}
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
                                    {...register('pickup_address', { required: 'Pickup address is required' })}
                                    error={errors.pickup_address?.message}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>Full street address including apartment/unit number if applicable</span>
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Input
                                        label="City *"
                                        placeholder="New York"
                                        {...register('pickup_city', { required: 'Pickup city is required' })}
                                        error={errors.pickup_city?.message}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>City or town name</span>
                                    </p>
                                </div>
                                <div>
                                    <Input
                                        label="Country *"
                                        placeholder="USA"
                                        {...register('pickup_country', { required: 'Pickup country is required' })}
                                        error={errors.pickup_country?.message}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Country where item will be collected</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Location Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <MapPin className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Delivery Location</h3>
                            </div>
                            <p className="text-sm text-slate-600">Where should the item be delivered to?</p>

                            <div>
                                <Input
                                    label="Street Address *"
                                    placeholder="456 Oak Avenue, Suite 200"
                                    {...register('delivery_address', { required: 'Delivery address is required' })}
                                    error={errors.delivery_address?.message}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>Complete delivery address with any special instructions for finding the location</span>
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Input
                                        label="City *"
                                        placeholder="Boston"
                                        {...register('delivery_city', { required: 'Delivery city is required' })}
                                        error={errors.delivery_city?.message}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Destination city or town</span>
                                    </p>
                                </div>
                                <div>
                                    <Input
                                        label="Country *"
                                        placeholder="USA"
                                        {...register('delivery_country', { required: 'Delivery country is required' })}
                                        error={errors.delivery_country?.message}
                                    />
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Destination country</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <Phone className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                            </div>
                            <p className="text-sm text-slate-600">How should the agent contact you about this request?</p>

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
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Choose how you'd like to receive updates</span>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 ml-1">Phone Number (optional)</label>
                                    <div className="flex gap-2">
                                        <select
                                            {...register('countryCode')}
                                            defaultValue="+1"
                                            className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-900"
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+504">🇭🇳 +504</option>
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+86">🇨🇳 +86</option>
                                            <option value="+81">🇯🇵 +81</option>
                                            <option value="+49">🇩🇪 +49</option>
                                            <option value="+33">🇫🇷 +33</option>
                                            <option value="+39">🇮🇹 +39</option>
                                            <option value="+34">🇪🇸 +34</option>
                                            <option value="+52">🇲🇽 +52</option>
                                            <option value="+55">🇧🇷 +55</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+7">🇷🇺 +7</option>
                                            <option value="+82">🇰🇷 +82</option>
                                            <option value="+234">🇳🇬 +234</option>
                                        </select>
                                        <input
                                            type="tel"
                                            placeholder="2025551234"
                                            {...register('phoneNumber')}
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-slate-400"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                        <span>Digits only - no +, spaces, or dashes. Example: 2025551234</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <FileText className="h-4 w-4 text-slate-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Additional Information</h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 ml-1">Special Instructions or Notes (optional)</label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    placeholder="e.g., Please handle with care - fragile item. Delivery preferred between 2-5 PM. Ring doorbell twice."
                                    {...register('notes')}
                                />
                                <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>Any special handling instructions, delivery time preferences, or other important details the agent should know</span>
                                </p>
                            </div>
                        </div>

                        {errors.root && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200">
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
