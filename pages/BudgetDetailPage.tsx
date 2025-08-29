

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Budget, Expense, ExpenseCategory, PaymentMethod } from '../types';
import Card, { Modal } from '../components/Card';
import Icon from '../components/Icon';
import { formatCurrencyINR } from '../utils';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
const inputStyles = "w-full p-2 border bg-white border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent";
const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
const dateInputWrapperStyles = "relative w-full p-2 border bg-white border-gray-300 rounded-md text-gray-800 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent";
const dateInputStyles = "absolute inset-0 w-full h-full opacity-0 cursor-pointer";

const DatePicker: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}> = ({ value, onChange, required }) => (
    <div className={dateInputWrapperStyles}>
        <div className="flex justify-between items-center">
            <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value ? new Date(value).toLocaleDateString() : 'Select a date'}</span>
            <Icon name="calendar" className="w-5 h-5 text-gray-400" />
        </div>
        <input type="date" value={value} onChange={onChange} className={dateInputStyles} required={required} />
    </div>
);

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    expenseToEdit: Expense | null;
    expenseCategories: string[];
    onAddExpenseCategory: (category: string) => void;
    paymentMethods: string[];
    // Optional props for pre-filling when adding from budget detail
    initialDate?: string;
    allowedCategories?: string[];
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAddExpense, onUpdateExpense, expenseToEdit, expenseCategories, onAddExpenseCategory, paymentMethods, initialDate, allowedCategories }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
    const [vendor, setVendor] = useState('');
    const [notes, setNotes] = useState('');
    const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);

    const categoriesToShow = allowedCategories || expenseCategories;

    useEffect(() => {
        if (expenseToEdit) {
            setTitle(expenseToEdit.title);
            setAmount(String(expenseToEdit.amount));
            setCategory(expenseToEdit.category);
            setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
            setPaymentMethod(expenseToEdit.paymentMethod);
            setVendor(expenseToEdit.vendor);
            setNotes(expenseToEdit.notes || '');
            setReceiptImage(expenseToEdit.receiptImage);
        } else {
            setTitle('');
            setAmount('');
            setCategory(categoriesToShow[0] || '');
            setDate(initialDate || new Date().toISOString().split('T')[0]);
            setPaymentMethod(paymentMethods[0]);
            setVendor('');
            setNotes('');
            setReceiptImage(undefined);
        }
    }, [expenseToEdit, isOpen, expenseCategories, paymentMethods, initialDate, categoriesToShow]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'add_new') {
            const newCategory = prompt('Enter new expense category:');
            if (newCategory) {
                onAddExpenseCategory(newCategory);
                setCategory(newCategory);
            }
        } else {
            setCategory(value as ExpenseCategory);
        }
    };

     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!title || !amount || isNaN(numAmount) || numAmount <= 0) return;

        const expenseData = { title, amount: numAmount, category, date: new Date(date), paymentMethod, vendor, notes, receiptImage };

        if (expenseToEdit) {
            onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
        } else {
            onAddExpense(expenseData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Edit Expense" : "Add New Expense"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div><label className={labelStyles}>Expense Title*</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyles} required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelStyles}>Amount*</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={inputStyles} required min="1" /></div>
                    <div><label className={labelStyles}>Expense Date*</label><DatePicker value={date} onChange={e => setDate(e.target.value)} required /></div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className={labelStyles}>Category</label>
                        <select value={category} onChange={handleCategoryChange} className={inputStyles}>
                            {categoriesToShow.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            {!allowedCategories && <option value="add_new" className="font-bold text-primary">Add New...</option>}
                        </select>
                    </div>
                     <div>
                        <label className={labelStyles}>Payment Method</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className={inputStyles}>
                            {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>
                </div>
                 <div><label className={labelStyles}>Vendor / Paid To</label><input type="text" value={vendor} onChange={e => setVendor(e.target.value)} className={inputStyles} /></div>
                 <div><label className={labelStyles}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputStyles} rows={2}></textarea></div>
                 <div>
                    <label className={labelStyles}>Attach Receipt</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-primary hover:file:bg-violet-100"/>
                    {receiptImage && <img src={receiptImage} alt="Receipt" className="mt-2 rounded-md max-h-40" />}
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">{expenseToEdit ? "Update" : "Add"} Expense</button>
                </div>
            </form>
        </Modal>
    );
};

interface BudgetDetailPageProps {
    budgets: Budget[];
    expenses: Expense[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    expenseCategories: string[];
    onAddExpenseCategory: (category: string) => void;
    paymentMethods: string[];
}

const ProgressBar: React.FC<{ value: number; max: number; }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const color = percentage > 100 ? 'bg-danger' : percentage > 85 ? 'bg-yellow-500' : 'bg-primary';
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full transition-width duration-500`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
        </div>
    );
};

const BudgetDetailPage: React.FC<BudgetDetailPageProps> = (props) => {
    const { budgets, expenses, onAddExpense, onUpdateExpense, onDeleteExpense } = props;
    const { budgetId } = useParams<{ budgetId: string }>();
    const [activeTab, setActiveTab] = useState<'details' | 'expenses' | 'charts'>('details');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const budget = useMemo(() => budgets.find(b => b.id === budgetId), [budgetId, budgets]);

    const mappedExpenses = useMemo(() => {
        if (!budget) return [];
        return expenses.filter(e => {
            const expenseDate = new Date(e.date);
            const isDateInRange = expenseDate >= new Date(budget.fromDate) && expenseDate <= new Date(budget.toDate);
            const isCategoryInBudget = budget.categoryAllocations.some(a => a.category === e.category);
            return isDateInRange && isCategoryInBudget;
        });
    }, [budget, expenses]);

    const categoryBreakdown = useMemo(() => {
        if (!budget) return [];
        return budget.categoryAllocations.map(alloc => {
            const spent = mappedExpenses
                .filter(exp => exp.category === alloc.category)
                .reduce((sum, exp) => sum + exp.amount, 0);
            return {
                category: alloc.category,
                allocated: alloc.amount,
                spent,
                remaining: alloc.amount - spent,
            };
        });
    }, [budget, mappedExpenses]);

    const totalSpent = mappedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const handleOpenExpenseModal = (expense: Expense | null) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    if (!budget) {
        return <div className="p-4 text-center">Budget not found. <Link to="/expenses" className="text-primary hover:underline">Go back</Link></div>;
    }

    const expensesByCategory = mappedExpenses.reduce((acc, exp) => {
        (acc[exp.category] = acc[exp.category] || []).push(exp);
        return acc;
    }, {} as Record<string, Expense[]>);

    const chartData = categoryBreakdown.map(cat => ({
        name: cat.category,
        Budget: cat.allocated,
        Expense: cat.spent,
    }));
    
    const pieChartAllocationData = budget.categoryAllocations.map(alloc => ({ name: alloc.category, value: alloc.amount }));
    const pieChartExpenseData = categoryBreakdown.filter(c => c.spent > 0).map(cat => ({ name: cat.category, value: cat.spent }));
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, value, percent }: any) => {
        const radius = outerRadius * 1.2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const anchor = x > cx ? 'start' : 'end';

        return (
            <text x={x} y={y} fill="#4b5563" textAnchor={anchor} dominantBaseline="central" fontSize={12}>
                {`${formatCurrencyINR(value)} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };


    return (
        <div className="p-4 space-y-6 animate-fade-in">
             <AddExpenseModal 
                isOpen={isExpenseModalOpen} 
                onClose={() => setIsExpenseModalOpen(false)} 
                onAddExpense={onAddExpense} 
                onUpdateExpense={onUpdateExpense} 
                expenseToEdit={editingExpense}
                initialDate={new Date().toISOString().split('T')[0]}
                allowedCategories={budget.categoryAllocations.map(a => a.category)}
                {...props}
            />
            <header className="flex justify-between items-start">
                <div>
                    <Link to="/expenses" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Budgets
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{budget.name}</h1>
                    <p className="mt-1 text-sm text-gray-600">{new Date(budget.fromDate).toLocaleDateString()} - {new Date(budget.toDate).toLocaleDateString()}</p>
                </div>
                 <button onClick={() => handleOpenExpenseModal(null)} className="bg-accent text-white py-2 px-3 rounded-lg shadow hover:bg-accent/90 transition text-sm font-semibold flex items-center">
                    <Icon name="plus" className="w-4 h-4 mr-1" /> Add Expense
                </button>
            </header>

            <Card>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500">Total Budget</p>
                        <p className="text-2xl font-semibold text-gray-800">{formatCurrencyINR(budget.totalAmount)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Spent</p>
                        <p className="text-2xl font-semibold text-danger">{formatCurrencyINR(totalSpent)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className="text-2xl font-semibold text-green-600">{formatCurrencyINR(budget.totalAmount - totalSpent)}</p>
                    </div>
                </div>
                <div className="mt-4"><ProgressBar value={totalSpent} max={budget.totalAmount} /></div>
            </Card>
            
             <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('details')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Details</button>
                    <button onClick={() => setActiveTab('expenses')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Expenses</button>
                    <button onClick={() => setActiveTab('charts')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'charts' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Charts</button>
                </nav>
            </div>

            {activeTab === 'details' && (
                <Card title="Category-wise Breakdown" className="animate-fade-in">
                    <div className="space-y-4">
                        {categoryBreakdown.map(item => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-700">{item.category}</span>
                                    <span className="text-sm text-gray-500">{formatCurrencyINR(item.spent)} / {formatCurrencyINR(item.allocated)}</span>
                                </div>
                                <ProgressBar value={item.spent} max={item.allocated} />
                                <p className="text-right text-xs text-gray-500 mt-1">{formatCurrencyINR(item.remaining)} remaining</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

             {activeTab === 'expenses' && (
                <div className="space-y-4 animate-fade-in">
                    {Object.keys(expensesByCategory).length > 0 ? Object.entries(expensesByCategory).map(([category, exps]) => (
                         <Card key={category} title={category}>
                             <ul className="divide-y divide-gray-100">
                                {exps.map(exp => (
                                    <li key={exp.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-800">{exp.title}</p>
                                            <p className="text-sm text-gray-500">{exp.vendor} | {new Date(exp.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <p className="font-semibold text-gray-700 mr-4">{formatCurrencyINR(exp.amount)}</p>
                                            <button onClick={() => handleOpenExpenseModal(exp)} className="p-2 text-gray-400 hover:text-primary"><Icon name="edit" className="w-5 h-5"/></button>
                                            <button onClick={() => onDeleteExpense(exp.id)} className="p-2 text-gray-400 hover:text-danger"><Icon name="trash" className="w-5 h-5"/></button>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                         </Card>
                    )) : <Card><p className="text-center text-gray-500">No expenses recorded for this budget yet.</p></Card>}
                </div>
            )}
            
            {activeTab === 'charts' && (
                <div className="space-y-6 animate-fade-in">
                    <Card title="Budget vs. Expense by Category">
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(value) => formatCurrencyINR(value as number)} />
                                    <Tooltip formatter={(value: number) => formatCurrencyINR(value)} />
                                    <Legend />
                                    <Bar dataKey="Budget" fill="#3b82f6" />
                                    <Bar dataKey="Expense" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Budget Allocation">
                             <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                                        <Pie data={pieChartAllocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={true} label={renderCustomizedLabel}>
                                            {pieChartAllocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrencyINR(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                         <Card title="Expense Breakdown">
                             <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                                        <Pie data={pieChartExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={true} label={renderCustomizedLabel}>
                                             {pieChartExpenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrencyINR(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BudgetDetailPage;