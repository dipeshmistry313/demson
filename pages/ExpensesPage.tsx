
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Expense, ExpenseCategory, Budget, BudgetCategory, PaymentMethod, BudgetCategoryAllocation } from '../types';
import Card, { Modal } from '../components/Card';
import Icon from '../components/Icon';
import { formatCurrencyINR } from '../utils';

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
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAddExpense, onUpdateExpense, expenseToEdit, expenseCategories, onAddExpenseCategory, paymentMethods }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(expenseCategories[0]);
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
    const [vendor, setVendor] = useState('');
    const [notes, setNotes] = useState('');
    const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);

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
            setCategory(expenseCategories[0]);
            setDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod(paymentMethods[0]);
            setVendor('');
            setNotes('');
            setReceiptImage(undefined);
        }
    }, [expenseToEdit, isOpen, expenseCategories, paymentMethods]);

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
                            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="add_new" className="font-bold text-primary">Add New...</option>
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


interface AddBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBudget: (budget: Omit<Budget, 'id'>) => void;
    onUpdateBudget: (budget: Budget) => void;
    budgetToEdit: Budget | null;
    allBudgets: Budget[];
    expenseCategories: string[];
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, onAddBudget, onUpdateBudget, budgetToEdit, allBudgets, expenseCategories }) => {
    const [name, setName] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [notes, setNotes] = useState('');
    const [allocations, setAllocations] = useState<BudgetCategoryAllocation[]>([{ category: expenseCategories[0], amount: 0 }]);
    
    useEffect(() => {
        if (budgetToEdit) {
            setName(budgetToEdit.name);
            setFromDate(new Date(budgetToEdit.fromDate).toISOString().split('T')[0]);
            setToDate(new Date(budgetToEdit.toDate).toISOString().split('T')[0]);
            setNotes(budgetToEdit.notes || '');
            setAllocations(budgetToEdit.categoryAllocations);
        } else {
            setName(''); 
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setFromDate(today);
            setToDate(nextMonth.toISOString().split('T')[0]);
            setNotes('');
            setAllocations([{ category: expenseCategories[0], amount: 0 }]);
        }
    }, [budgetToEdit, isOpen, expenseCategories]);
    
    const handleAllocationChange = (index: number, field: keyof BudgetCategoryAllocation, value: string | number) => {
        const newAllocations = [...allocations];
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        newAllocations[index] = { ...newAllocations[index], [field]: field === 'amount' ? (isNaN(numValue) ? 0 : numValue) : value };
        setAllocations(newAllocations);
    };

    const addAllocationRow = () => setAllocations([...allocations, { category: expenseCategories[0], amount: 0 }]);
    const removeAllocationRow = (index: number) => setAllocations(allocations.filter((_, i) => i !== index));

    const totalAmount = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !fromDate || !toDate) {
            alert("Please fill in budget name and date range.");
            return;
        }

        const newFrom = new Date(fromDate);
        const newTo = new Date(toDate);
        newFrom.setHours(0,0,0,0);
        newTo.setHours(23,59,59,999);

        if (newFrom > newTo) {
            alert('The "From" date cannot be after the "To" date.');
            return;
        }

        const isOverlapping = allBudgets.some(b => {
            if (budgetToEdit && b.id === budgetToEdit.id) return false;
            const existingFrom = new Date(b.fromDate);
            const existingTo = new Date(b.toDate);
            existingFrom.setHours(0,0,0,0);
            existingTo.setHours(23,59,59,999);
            return newFrom <= existingTo && existingFrom <= newTo;
        });

        if (isOverlapping) {
            alert('Error: Budget period overlaps with an existing budget. Please choose a different date range.');
            return;
        }
        
        const budgetData = { name, totalAmount, fromDate: new Date(fromDate), toDate: new Date(toDate), notes, categoryAllocations: allocations };

        if (budgetToEdit) {
            onUpdateBudget({ ...budgetData, id: budgetToEdit.id });
        } else {
            onAddBudget(budgetData);
        }
        onClose();
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={budgetToEdit ? "Edit Budget" : "Add New Budget"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className={labelStyles}>Budget Name*</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyles} required/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelStyles}>From Date*</label><DatePicker value={fromDate} onChange={e => setFromDate(e.target.value)} required /></div>
                    <div><label className={labelStyles}>To Date*</label><DatePicker value={toDate} onChange={e => setToDate(e.target.value)} required /></div>
                </div>
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Category-wise Allocation</h4>
                    <div className="space-y-2">
                        {allocations.map((alloc, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <select value={alloc.category} onChange={e => handleAllocationChange(index, 'category', e.target.value)} className={inputStyles}>
                                    {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input type="number" placeholder="Amount" value={alloc.amount || ''} onChange={e => handleAllocationChange(index, 'amount', e.target.value)} className={inputStyles} min="0" />
                                <button type="button" onClick={() => removeAllocationRow(index)} className="p-2 text-danger hover:bg-red-50 rounded-full">&times;</button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addAllocationRow} className="mt-2 text-sm text-primary font-semibold">+ Add Category</button>
                     <div className="text-right text-sm font-medium text-gray-800 mt-2 p-2 bg-gray-100 rounded-md">
                        Total Budget Amount: <span className="font-bold">{formatCurrencyINR(totalAmount)}</span>
                    </div>
                </div>
                 <div><label className={labelStyles}>Notes (optional)</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputStyles} rows={2}></textarea></div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">{budgetToEdit ? "Update" : "Add"} Budget</button>
                </div>
            </form>
        </Modal>
    );
}

const BudgetCard: React.FC<{ budget: Budget; expenses: Expense[]; onEdit: (budget: Budget) => void; onDelete: (budgetId: string) => void; }> = ({ budget, expenses, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const spent = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= new Date(budget.fromDate) && expenseDate <= new Date(budget.toDate) && budget.categoryAllocations.some(a => a.category === e.category);
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const remaining = budget.totalAmount - spent;
    const percentage = budget.totalAmount > 0 ? (spent / budget.totalAmount) * 100 : 0;
    const progressBarColor = percentage > 100 ? 'bg-danger' : percentage > 85 ? 'bg-yellow-500' : 'bg-primary';

    return (
        <Card className="transition hover:shadow-lg hover:border-primary border border-transparent">
             <div className="relative">
                <div className="absolute top-0 right-0">
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpen(!menuOpen); }} className="p-2 text-gray-500 hover:text-gray-700">
                        <Icon name="dots-vertical" className="w-5 h-5"/>
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10" onMouseLeave={() => setMenuOpen(false)}>
                            <a href="#" onClick={(e) => { e.preventDefault(); onEdit(budget); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onDelete(budget.id); setMenuOpen(false); }} className="block px-4 py-2 text-sm text-danger hover:bg-red-50">Delete</a>
                        </div>
                    )}
                </div>
                <Link to={`/budget/${budget.id}`}>
                    <div className="flex justify-between items-center mb-2 pr-8">
                        <p className="font-bold text-lg text-gray-800">{budget.name}</p>
                        <p className="text-sm text-gray-500">{new Date(budget.fromDate).toLocaleDateString()} - {new Date(budget.toDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">{formatCurrencyINR(spent)} / {formatCurrencyINR(budget.totalAmount)}</span>
                        <span className={`font-semibold ${remaining < 0 ? 'text-danger' : 'text-green-600'}`}>{formatCurrencyINR(remaining)} Remaining</span>
                    </div>
                </Link>
             </div>
        </Card>
    );
};


interface ExpensesPageProps {
    expenses: Expense[];
    budgets: Budget[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    onAddBudget: (budget: Omit<Budget, 'id'>) => void;
    onUpdateBudget: (budget: Budget) => void;
    onDeleteBudget: (budgetId: string) => void;
    expenseCategories: string[];
    onAddExpenseCategory: (category: string) => void;
    paymentMethods: string[];
}

const ExpensesPage: React.FC<ExpensesPageProps> = (props) => {
    const { budgets, onAddExpense, onUpdateExpense, onAddBudget, onUpdateBudget, onDeleteBudget, expenses } = props;
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    
    const handleOpenExpenseModal = (expense: Expense | null) => { setEditingExpense(expense); setIsExpenseModalOpen(true); };
    const handleCloseExpenseModal = () => { setEditingExpense(null); setIsExpenseModalOpen(false); };
    const handleOpenBudgetModal = (budget: Budget | null) => { setEditingBudget(budget); setIsBudgetModalOpen(true); };
    const handleCloseBudgetModal = () => { setEditingBudget(null); setIsBudgetModalOpen(false); };
    
    const sortedBudgets = [...budgets].sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <AddExpenseModal isOpen={isExpenseModalOpen} onClose={handleCloseExpenseModal} onAddExpense={onAddExpense} onUpdateExpense={onUpdateExpense} expenseToEdit={editingExpense} {...props} />
            <AddBudgetModal isOpen={isBudgetModalOpen} onClose={handleCloseBudgetModal} onAddBudget={onAddBudget} onUpdateBudget={onUpdateBudget} budgetToEdit={editingBudget} allBudgets={budgets} expenseCategories={props.expenseCategories} />
            
            <header>
                 <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Expense Tracker</h1>
                 <p className="mt-1 text-sm text-gray-600">Manage your finances by creating budgets and tracking expenses.</p>
            </header>
            
            <div className="flex space-x-2">
                <button onClick={() => handleOpenBudgetModal(null)} className="flex-1 text-sm bg-primary text-white py-3 px-4 rounded-lg shadow hover:bg-primary/90 transition font-semibold">Add Budget</button>
                <button onClick={() => handleOpenExpenseModal(null)} className="flex-1 text-sm bg-accent text-white py-3 px-4 rounded-lg shadow hover:bg-accent/90 transition font-semibold">Add Expense</button>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">All Budgets</h2>
                {sortedBudgets.length > 0 ? (
                    sortedBudgets.map((budget, index) => (
                        <div key={budget.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <BudgetCard budget={budget} expenses={expenses} onEdit={handleOpenBudgetModal} onDelete={onDeleteBudget}/>
                        </div>
                    ))
                ) : (
                    <Card><p className="text-center text-gray-500 py-4">No budgets have been created yet. Click 'Add Budget' to start.</p></Card>
                )}
            </div>
        </div>
    );
};

export default ExpensesPage;
