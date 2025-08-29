import React, { useState, useEffect, useMemo } from 'react';
import { SketchOrder, OrderStatus, PaymentStatus, OrderType, OrderSource, DeliveryMethod, ProgressStatus } from '../types';
import Card, { Modal } from '../components/Card';
import Icon from '../components/Icon';
import { formatCurrencyINR } from '../utils';

const getStatusColor = (status: OrderStatus) => {
    switch(status) {
        case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        case OrderStatus.InProgress: return 'bg-blue-100 text-blue-800';
        case OrderStatus.Completed: return 'bg-green-100 text-green-800';
        case OrderStatus.Delivered: return 'bg-indigo-100 text-indigo-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Pending: return 'text-red-500';
        case PaymentStatus.Partial: return 'text-yellow-500';
        case PaymentStatus.Paid: return 'text-green-500';
        default: return 'text-gray-500';
    }
}

const inputStyles = "w-full p-2 border bg-white border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent";
const labelStyles = "block text-sm font-medium text-gray-700 mb-1";


interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddOrder: (order: Omit<SketchOrder, 'id'>) => void;
    onUpdateOrder: (order: SketchOrder) => void;
    orderToEdit: SketchOrder | null;
    orderTypes: string[];
    onAddOrderType: (type: string) => void;
    orderSources: string[];
    onAddOrderSource: (source: string) => void;
    deliveryMethods: string[];
    onAddDeliveryMethod: (method: string) => void;
    progressStatuses: string[];
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onAddOrder, onUpdateOrder, orderToEdit, orderTypes, onAddOrderType, orderSources, onAddOrderSource, deliveryMethods, onAddDeliveryMethod, progressStatuses }) => {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [description, setDescription] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [orderType, setOrderType] = useState<OrderType>(orderTypes[0]);
    const [orderSource, setOrderSource] = useState<OrderSource>(orderSources[0]);
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(deliveryMethods[0]);
    const [priceQuoted, setPriceQuoted] = useState('');
    const [pricePaid, setPricePaid] = useState('');
    const [tags, setTags] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | undefined>(undefined);
    const [progressStatus, setProgressStatus] = useState<ProgressStatus>(progressStatuses[0]);
    const [communicationLog, setCommunicationLog] = useState('');
    const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.Pending);
    
    useEffect(() => {
        if (orderToEdit) {
            setClientName(orderToEdit.clientName);
            setClientPhone(orderToEdit.clientPhone);
            setClientEmail(orderToEdit.clientEmail);
            setDescription(orderToEdit.description);
            setDeliveryDate(new Date(orderToEdit.deliveryDate).toISOString().split('T')[0]);
            setOrderType(orderToEdit.orderType);
            setOrderSource(orderToEdit.orderSource);
            setDeliveryMethod(orderToEdit.deliveryMethod);
            setPriceQuoted(String(orderToEdit.priceQuoted));
            setPricePaid(String(orderToEdit.pricePaid));
            setTags(orderToEdit.tags.join(', '));
            setReferenceImage(orderToEdit.referenceImage);
            setProgressStatus(orderToEdit.progressStatus);
            setCommunicationLog(orderToEdit.communicationLog);
            setOrderStatus(orderToEdit.orderStatus);
        } else {
            setClientName(''); setClientPhone(''); setClientEmail(''); setDescription('');
            setDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]); setOrderType(orderTypes[0]);
            setOrderSource(orderSources[0]); setDeliveryMethod(deliveryMethods[0]);
            setPriceQuoted(''); setPricePaid('0'); setTags('');
            setReferenceImage(undefined); setProgressStatus(progressStatuses[0]); setCommunicationLog('');
            setOrderStatus(OrderStatus.Pending);
        }
    }, [orderToEdit, isOpen, orderTypes, orderSources, deliveryMethods, progressStatuses]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDynamicSelect = (value: string, setter: (val: string) => void, adder: (val: string) => void, type: string) => {
        if (value === 'add_new') {
            const newValue = prompt(`Enter new ${type}:`);
            if (newValue) {
                adder(newValue);
                setter(newValue);
            }
        } else {
            setter(value);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numPriceQuoted = parseFloat(priceQuoted);
        const numPricePaid = parseFloat(pricePaid);

        if (!clientName || !priceQuoted || isNaN(numPriceQuoted)) return;

        const commonData = {
            clientName, clientPhone, clientEmail, description,
            deliveryDate: new Date(deliveryDate), orderType, orderSource,
            deliveryMethod, priceQuoted: numPriceQuoted, pricePaid: numPricePaid,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            referenceImage, progressStatus, communicationLog, orderStatus,
            paymentStatus: numPricePaid <= 0 ? PaymentStatus.Pending : numPricePaid < numPriceQuoted ? PaymentStatus.Partial : PaymentStatus.Paid,
        };

        if (orderToEdit) {
            onUpdateOrder({ ...commonData, id: orderToEdit.id, orderDate: orderToEdit.orderDate });
        } else {
            onAddOrder({ ...commonData, orderDate: new Date() });
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={orderToEdit ? "Edit Sketch Order" : "Add New Sketch Order"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelStyles}>Client Name*</label><input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={inputStyles} required /></div>
                    <div><label className={labelStyles}>Client Phone</label><input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className={inputStyles} /></div>
                    <div><label className={labelStyles}>Client Email</label><input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className={inputStyles} /></div>
                    <div><label className={labelStyles}>Delivery Date*</label><input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className={inputStyles} required /></div>
                </div>

                <div><label className={labelStyles}>Order Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className={inputStyles} rows={2}></textarea></div>
                <div><label className={labelStyles}>Client Communication Log</label><textarea value={communicationLog} onChange={e => setCommunicationLog(e.target.value)} className={inputStyles} rows={2}></textarea></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className={labelStyles}>Order Type</label><select value={orderType} onChange={e => handleDynamicSelect(e.target.value, setOrderType, onAddOrderType, 'Order Type')} className={inputStyles}>{orderTypes.map(t => <option key={t} value={t}>{t}</option>)}<option value="add_new" className="font-bold text-primary">Add New...</option></select></div>
                    <div><label className={labelStyles}>Order Source</label><select value={orderSource} onChange={e => handleDynamicSelect(e.target.value, setOrderSource, onAddOrderSource, 'Order Source')} className={inputStyles}>{orderSources.map(s => <option key={s} value={s}>{s}</option>)}<option value="add_new" className="font-bold text-primary">Add New...</option></select></div>
                    <div><label className={labelStyles}>Delivery Method</label><select value={deliveryMethod} onChange={e => handleDynamicSelect(e.target.value, setDeliveryMethod, onAddDeliveryMethod, 'Delivery Method')} className={inputStyles}>{deliveryMethods.map(m => <option key={m} value={m}>{m}</option>)}<option value="add_new" className="font-bold text-primary">Add New...</option></select></div>
                    <div><label className={labelStyles}>Progress Status</label><select value={progressStatus} onChange={e => setProgressStatus(e.target.value as ProgressStatus)} className={inputStyles}>{progressStatuses.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><label className={labelStyles}>Order Status</label><select value={orderStatus} onChange={e => setOrderStatus(e.target.value as OrderStatus)} className={inputStyles}>{Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelStyles}>Price Quoted*</label><input type="number" value={priceQuoted} onChange={e => setPriceQuoted(e.target.value)} className={inputStyles} required min="0" /></div>
                    <div><label className={labelStyles}>Price Paid</label><input type="number" value={pricePaid} onChange={e => setPricePaid(e.target.value)} className={inputStyles} min="0" /></div>
                </div>
                
                <div><label className={labelStyles}>Tags (comma-separated)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inputStyles} /></div>
                
                <div>
                    <label className={labelStyles}>Reference Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-primary hover:file:bg-violet-100"/>
                    {referenceImage && <img src={referenceImage} alt="Reference" className="mt-2 rounded-md max-h-40" />}
                </div>

                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">{orderToEdit ? "Update Order" : "Add Order"}</button>
                </div>
            </form>
        </Modal>
    );
};

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, name: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
const statusFilters: ('All' | OrderStatus)[] = ['All', OrderStatus.Pending, OrderStatus.InProgress, OrderStatus.Completed, OrderStatus.Delivered];

interface OrdersPageProps {
    orders: SketchOrder[];
    onAddOrder: (order: Omit<SketchOrder, 'id'>) => void;
    onUpdateOrder: (order: SketchOrder) => void;
    orderTypes: string[];
    onAddOrderType: (type: string) => void;
    orderSources: string[];
    onAddOrderSource: (source: string) => void;
    deliveryMethods: string[];
    onAddDeliveryMethod: (method: string) => void;
    progressStatuses: string[];
}

const OrderCard: React.FC<{order: SketchOrder, onEdit: (order: SketchOrder) => void}> = ({ order, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isOverdue = new Date(order.deliveryDate) < new Date() && order.orderStatus !== OrderStatus.Completed && order.orderStatus !== OrderStatus.Delivered;

    return (
        <Card className="transition hover:shadow-xl cursor-pointer animate-slide-in-up">
            <div onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex-1 mb-4 sm:mb-0">
                        <p className="font-bold text-lg text-gray-800">{order.clientName}</p>
                        <p className="text-sm text-gray-500">{order.id} &bull; {order.orderType}</p>
                    </div>
                    <div className="flex-shrink-0 sm:text-right space-y-2">
                        <p className={`font-bold text-xl ${getPaymentStatusColor(order.paymentStatus)}`}>{formatCurrencyINR(order.priceQuoted)}</p>
                        <p className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</p>
                        <p className={`text-sm ${isOverdue ? 'text-danger font-semibold' : 'text-gray-500'}`}>
                            Due: {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] mt-4 pt-4 border-t' : 'max-h-0'}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong className="text-gray-600">Client Contact:</strong> {order.clientPhone || 'N/A'} | {order.clientEmail || 'N/A'}</div>
                    <div><strong className="text-gray-600">Progress:</strong> {order.progressStatus}</div>
                    <div><strong className="text-gray-600">Description:</strong> {order.description}</div>
                    <div><strong className="text-gray-600">Communication:</strong> {order.communicationLog}</div>
                    {order.referenceImage && 
                        <div className="md:col-span-2"><strong className="text-gray-600 block mb-1">Reference:</strong><img src={order.referenceImage} alt="Reference" className="rounded-lg max-h-60 w-auto" /></div>
                    }
               </div>
               <div className="text-right mt-4">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(order); }} className="text-primary hover:text-primary/80 font-semibold py-2 px-4 rounded inline-flex items-center text-sm">
                        <Icon name="edit" className="w-4 h-4 mr-2" />
                        Edit Order
                    </button>
               </div>
            </div>
        </Card>
    );
};

const OrdersPage: React.FC<OrdersPageProps> = (props) => {
    const { orders, onAddOrder, onUpdateOrder } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<SketchOrder | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'All' | OrderStatus>('All');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const handleOpenModalForEdit = (order: SketchOrder) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleOpenModalForAdd = () => {
        setEditingOrder(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const clearDateFilter = () => { setSelectedMonth(null); setSelectedYear(null); };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => 
                order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(order => {
                if (!selectedMonth || !selectedYear) return true;
                const orderDate = new Date(order.orderDate);
                return orderDate.getMonth() === selectedMonth - 1 && orderDate.getFullYear() === selectedYear;
            })
            .filter(order => selectedStatus === 'All' ? true : order.orderStatus === selectedStatus)
            .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, searchTerm, selectedStatus, selectedMonth, selectedYear]);

    const groupedByPayment = useMemo(() => {
        return filteredOrders.reduce((acc, order) => {
            const status = order.paymentStatus;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status]!.push(order);
            return acc;
        }, {} as Record<PaymentStatus, SketchOrder[]>);
    }, [filteredOrders]);


    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <AddOrderModal isOpen={isModalOpen} onClose={handleCloseModal} onAddOrder={onAddOrder} onUpdateOrder={onUpdateOrder} orderToEdit={editingOrder} {...props} />
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Sketch Order Manager</h1>
                    <p className="mt-1 text-sm text-gray-600">Track and manage all your client commissions.</p>
                </div>
                <button onClick={handleOpenModalForAdd} className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition">
                    <Icon name="plus" className="w-6 h-6"/>
                </button>
            </header>

            <Card>
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Search by Order ID or Client Name..." className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="flex gap-2">
                        <select value={selectedMonth || ''} onChange={e => setSelectedMonth(Number(e.target.value) || null)} className={inputStyles + ' md:w-32'}><option value="">Month</option>{months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}</select>
                        <select value={selectedYear || ''} onChange={e => setSelectedYear(Number(e.target.value) || null)} className={inputStyles + ' md:w-28'}><option value="">Year</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        {(selectedMonth || selectedYear) && <button onClick={clearDateFilter} className="p-2 text-gray-500 hover:text-danger">&times;</button>}
                    </div>
                </div>
            </Card>

            <div className="overflow-x-auto pb-2">
                <div className="inline-flex rounded-lg shadow-sm bg-white p-1">
                    {statusFilters.map(status => (
                        <button key={status} onClick={() => setSelectedStatus(status)} className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${selectedStatus === status ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    Object.values(PaymentStatus).map(paymentStatus => (
                        groupedByPayment[paymentStatus] && groupedByPayment[paymentStatus].length > 0 && (
                            <details key={paymentStatus} open className="group">
                                <summary className="list-none flex items-center justify-between p-2 font-semibold text-lg text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg">
                                    {paymentStatus} ({groupedByPayment[paymentStatus].length})
                                    <span className="text-gray-500 transform transition-transform duration-300 group-open:rotate-180">▼</span>
                                </summary>
                                <div className="pl-4 space-y-4 pt-2">
                                    {groupedByPayment[paymentStatus].map(order => <OrderCard key={order.id} order={order} onEdit={handleOpenModalForEdit} />)}
                                </div>
                            </details>
                        )
                    ))
                ) : (
                    <Card><p className="text-center text-gray-500">No orders match the current filters.</p></Card>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;