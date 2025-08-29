import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../types';
import Card, { Modal } from '../components/Card';
import Icon from '../components/Icon';

const getPriorityColor = (priority: TaskPriority) => {
    switch(priority) {
        case TaskPriority.High: return 'border-red-500';
        case TaskPriority.Medium: return 'border-yellow-500';
        case TaskPriority.Low: return 'border-green-500';
        default: return 'border-gray-300';
    }
};

const inputStyles = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white text-gray-800";
const labelStyles = "block text-sm font-medium text-gray-700";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
    onUpdateTask: (task: Task) => void;
    taskToEdit: Task | null;
    taskCategories: string[];
    onAddTaskCategory: (category: string) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, onUpdateTask, taskToEdit, taskCategories, onAddTaskCategory }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<TaskCategory>(taskCategories[0]);
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
    const [dueDate, setDueDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setCategory(taskToEdit.category);
            setPriority(taskToEdit.priority);
            setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
            setIsRecurring(taskToEdit.isRecurring);
        } else {
            setTitle('');
            setCategory(taskCategories[0]);
            setPriority(TaskPriority.Medium);
            setDueDate(new Date().toISOString().split('T')[0]);
            setIsRecurring(false);
        }
    }, [taskToEdit, isOpen, taskCategories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'add_new') {
            const newCategory = prompt('Enter new task category:');
            if (newCategory) {
                onAddTaskCategory(newCategory);
                setCategory(newCategory);
            }
        } else {
            setCategory(value as TaskCategory);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const taskData = { title, category, priority, dueDate: new Date(dueDate), isRecurring };

        if (taskToEdit) {
            onUpdateTask({ ...taskData, id: taskToEdit.id, status: taskToEdit.status });
        } else {
            onAddTask(taskData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? "Edit Task" : "Add New Task"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelStyles}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyles} required />
                </div>
                <div>
                    <label className={labelStyles}>Category</label>
                    <select value={category} onChange={handleCategoryChange} className={inputStyles}>
                        {taskCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="add_new" className="font-bold text-primary">Add New...</option>
                    </select>
                </div>
                 <div>
                    <label className={labelStyles}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={inputStyles}>
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelStyles}>Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputStyles} required />
                </div>
                <div className="flex items-center">
                    <input id="isRecurring" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="custom-checkbox" />
                    <label htmlFor="isRecurring" className="ml-3 block text-sm text-gray-900">Recurring Task</label>
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">{taskToEdit ? "Update Task" : "Add Task"}</button>
                </div>
            </form>
        </Modal>
    );
};

interface TasksPageProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
    onUpdateTask: (task: Task) => void;
    taskCategories: string[];
    onAddTaskCategory: (category: string) => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ tasks, setTasks, onAddTask, onUpdateTask, taskCategories, onAddTaskCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filterMode, setFilterMode] = useState<'progress' | 'category'>('progress');
    const [activeFilter, setActiveFilter] = useState<string>('All');

    const progressFilters: ('All' | TaskStatus)[] = ['All', TaskStatus.Pending, TaskStatus.Completed];
    const categoryFilters: ('All' | string)[] = ['All', ...taskCategories];

    const handleOpenModalForEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleOpenModalForAdd = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };
    
    const handleFilterModeChange = (mode: 'progress' | 'category') => {
        setFilterMode(mode);
        setActiveFilter('All');
    }

    const toggleStatus = (id: string) => {
        setTasks(tasks.map(task => 
            task.id === id 
            ? {...task, status: task.status === TaskStatus.Pending ? TaskStatus.Completed : TaskStatus.Pending} 
            : task
        ));
    };
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (activeFilter === 'All') return true;
            if (filterMode === 'progress') {
                return task.status === activeFilter;
            }
            if (filterMode === 'category') {
                return task.category === activeFilter;
            }
            return true;
        }).sort((a,b) => (a.status === b.status) ? (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) : a.status === 'Pending' ? -1 : 1);
    }, [tasks, filterMode, activeFilter]);
    
    const currentFilterOptions = filterMode === 'progress' ? progressFilters : categoryFilters;

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <AddTaskModal isOpen={isModalOpen} onClose={handleCloseModal} onAddTask={onAddTask} onUpdateTask={onUpdateTask} taskToEdit={editingTask} taskCategories={taskCategories} onAddTaskCategory={onAddTaskCategory} />
            <header className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">To-Do Manager</h1>
                    <p className="mt-1 text-sm text-gray-600">Organize your personal and work tasks.</p>
                </div>
                 <button onClick={handleOpenModalForAdd} className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition">
                    <Icon name="plus" className="w-6 h-6"/>
                </button>
            </header>

            <div className="bg-white p-2 rounded-lg shadow-sm">
                <div className="flex border-b mb-2">
                    <button onClick={() => handleFilterModeChange('progress')} className={`px-4 py-2 text-sm font-semibold ${filterMode === 'progress' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>By Progress</button>
                    <button onClick={() => handleFilterModeChange('category')} className={`px-4 py-2 text-sm font-semibold ${filterMode === 'category' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>By Category</button>
                </div>
                 <div className="overflow-x-auto pb-2">
                    <div className="inline-flex rounded-lg shadow-sm bg-gray-50 p-1">
                        {currentFilterOptions.map(filter => (
                            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md ${activeFilter === filter ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Card>
                {filteredTasks.length > 0 ? (
                    <ul className="space-y-3">
                        {filteredTasks.map((task, index) => (
                            <li key={task.id} style={{ animationDelay: `${index * 50}ms` }} className={`flex items-center p-3 bg-gray-50 rounded-lg border-l-4 transition animate-slide-in-up ${getPriorityColor(task.priority)} ${task.status === TaskStatus.Completed ? 'opacity-60' : ''}`}>
                                <input 
                                    type="checkbox" 
                                    aria-label={`Mark task ${task.title} as ${task.status === TaskStatus.Pending ? 'completed' : 'pending'}`} 
                                    className="custom-checkbox"
                                    checked={task.status === TaskStatus.Completed} 
                                    onChange={() => toggleStatus(task.id)} 
                                />
                                <div className="flex-1 mx-4">
                                    <p className={`text-gray-800 ${task.status === TaskStatus.Completed ? 'line-through' : ''}`}>{task.title}</p>
                                    <p className="text-xs text-gray-500">{task.category} - Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => handleOpenModalForEdit(task)} className="p-2 text-gray-400 hover:text-primary">
                                    <Icon name="edit" className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No tasks match the current filter.</p>
                )}
            </Card>
        </div>
    );
};

export default TasksPage;