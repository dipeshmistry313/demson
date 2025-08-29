import React, { useState, useEffect, useMemo } from 'react';
import { Reminder, ReminderCategory } from '../types';
import Card, { Modal } from '../components/Card';
import Icon from '../components/Icon';

const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white text-gray-800";
const labelStyles = "block text-sm font-medium text-gray-700";

interface AddReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    onUpdateReminder: (reminder: Reminder) => void;
    reminderToEdit: Reminder | null;
    reminderCategories: string[];
    onAddReminderCategory: (category: string) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({ isOpen, onClose, onAddReminder, onUpdateReminder, reminderToEdit, reminderCategories, onAddReminderCategory }) => {
    const [title, setTitle] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [category, setCategory] = useState<ReminderCategory>(reminderCategories[0]);
    
     useEffect(() => {
        if (reminderToEdit) {
            setTitle(reminderToEdit.title);
            const d = new Date(reminderToEdit.time);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setDateTime(d.toISOString().slice(0, 16));
            setIsRecurring(reminderToEdit.isRecurring);
            setCategory(reminderToEdit.category);
        } else {
            setTitle('');
            setDateTime('');
            setIsRecurring(false);
            setCategory(reminderCategories[0]);
        }
    }, [reminderToEdit, isOpen, reminderCategories]);
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'add_new') {
            const newCategory = prompt('Enter new reminder category:');
            if (newCategory) {
                onAddReminderCategory(newCategory);
                setCategory(newCategory);
            }
        } else {
            setCategory(value as ReminderCategory);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dateTime) return;
        
        const reminderData = { title, time: new Date(dateTime), isRecurring, category };

        if (reminderToEdit) {
            onUpdateReminder({ ...reminderData, id: reminderToEdit.id });
        } else {
            onAddReminder(reminderData);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reminderToEdit ? "Edit Reminder" : "Add New Reminder"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelStyles}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyles} required />
                </div>
                 <div>
                    <label className={labelStyles}>Category</label>
                    <select value={category} onChange={handleCategoryChange} className={inputStyles}>
                        {reminderCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="add_new" className="font-bold text-primary">Add New...</option>
                    </select>
                </div>
                <div>
                    <label className={labelStyles}>Date & Time</label>
                    <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className={inputStyles} required />
                </div>
                 <div className="flex items-center">
                    <input id="isRecurringReminder" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="custom-checkbox" />
                    <label htmlFor="isRecurringReminder" className="ml-3 block text-sm text-gray-900">Recurring Reminder</label>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">{reminderToEdit ? "Update" : "Add"} Reminder</button>
                </div>
            </form>
        </Modal>
    );
};

interface RemindersPageProps {
    reminders: Reminder[];
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    onUpdateReminder: (reminder: Reminder) => void;
    reminderCategories: string[];
    onAddReminderCategory: (category: string) => void;
}

const RemindersPage: React.FC<RemindersPageProps> = ({ reminders, onAddReminder, onUpdateReminder, reminderCategories, onAddReminderCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<'All' | string>('All');
    
    const handleOpenModal = (reminder: Reminder | null) => {
        setEditingReminder(reminder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingReminder(null);
        setIsModalOpen(false);
    };

    const filteredReminders = useMemo(() => {
        return reminders
            .filter(r => selectedCategory === 'All' ? true : r.category === selectedCategory)
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [reminders, selectedCategory]);
    
    const categoryFilters = ['All', ...reminderCategories];

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <AddReminderModal isOpen={isModalOpen} onClose={handleCloseModal} onAddReminder={onAddReminder} onUpdateReminder={onUpdateReminder} reminderToEdit={editingReminder} reminderCategories={reminderCategories} onAddReminderCategory={onAddReminderCategory} />
            <header className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reminders</h1>
                     <p className="mt-1 text-sm text-gray-600">Stay on top of every important event.</p>
                </div>
                <button onClick={() => handleOpenModal(null)} className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition">
                    <Icon name="plus" className="w-6 h-6"/>
                </button>
            </header>

            <div className="overflow-x-auto pb-2">
                <div className="inline-flex rounded-lg shadow-sm bg-white p-1">
                    {categoryFilters.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${selectedCategory === cat ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                {filteredReminders.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {filteredReminders.map((reminder, index) => (
                            <li key={reminder.id} className="py-4 flex items-center justify-between animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <div>
                                    <p className="text-lg font-medium text-gray-800">{reminder.title}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(reminder.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                         <span className="ml-2 text-xs text-gray-400">&bull; {reminder.category}</span>
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    {reminder.isRecurring && (
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-4">
                                            Recurring
                                        </span>
                                    )}
                                    <button onClick={() => handleOpenModal(reminder)} className="p-2 text-gray-400 hover:text-primary">
                                        <Icon name="edit" className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">No reminders match the current filter.</p>
                )}
            </Card>
        </div>
    );
};

export default RemindersPage;