
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import TasksPage from './pages/TasksPage';
import ExpensesPage from './pages/ExpensesPage';
import RemindersPage from './pages/RemindersPage';
import BudgetDetailPage from './pages/BudgetDetailPage';
import LoginPage from './pages/LoginPage';
import { mockTasks, mockReminders, mockOrders, mockExpenses, mockBudgets } from './data';
import { Task, Reminder, SketchOrder, Expense, TaskStatus, Budget, taskCategories, orderTypes, orderSources, deliveryMethods, progressStatuses, expenseCategories, paymentMethods, reminderCategories as initialReminderCategories } from './types';

// Custom hook for persisting state to localStorage
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        // The reviver function is crucial for converting ISO date strings back to Date objects
        return JSON.parse(storedValue, (k, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');

  // All data states are now persistent
  const [tasks, setTasks] = usePersistentState<Task[]>('demson-manager-tasks', mockTasks);
  const [reminders, setReminders] = usePersistentState<Reminder[]>('demson-manager-reminders', mockReminders);
  const [orders, setOrders] = usePersistentState<SketchOrder[]>('demson-manager-orders', mockOrders);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('demson-manager-expenses', mockExpenses);
  const [budgets, setBudgets] = usePersistentState<Budget[]>('demson-manager-budgets', mockBudgets);

  // Dynamic category states are also persisted
  const [taskCats, setTaskCats] = usePersistentState<string[]>('demson-manager-taskCats', taskCategories);
  const [reminderCats, setReminderCats] = usePersistentState<string[]>('demson-manager-reminderCats', initialReminderCategories);
  const [orderSourcesState, setOrderSourcesState] = usePersistentState<string[]>('demson-manager-orderSources', orderSources);
  const [orderTypesState, setOrderTypesState] = usePersistentState<string[]>('demson-manager-orderTypes', orderTypes);
  const [deliveryMethodsState, setDeliveryMethodsState] = usePersistentState<string[]>('demson-manager-deliveryMethods', deliveryMethods);
  const [expenseCats, setExpenseCats] = usePersistentState<string[]>('demson-manager-expenseCats', expenseCategories);

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'Demson' && pass === 'Demson@123') {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      status: TaskStatus.Pending,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleAddReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const handleUpdateReminder = (updatedReminder: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
  };

  const handleAddOrder = (order: Omit<SketchOrder, 'id'>) => {
     const newOrder: SketchOrder = {
      ...order,
      id: `ORD-${String(Date.now()).slice(-4)}`,
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrder = (updatedOrder: SketchOrder) => {
    setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const fullNewExpense: Expense = {
      ...newExpense,
      id: `exp-${Date.now()}`,
    };
    setExpenses(prev => [fullNewExpense, ...prev]);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    }
  };

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const fullNewBudget: Budget = {
      ...newBudget,
      id: `bud-${Date.now()}`,
    };
    setBudgets(prev => [fullNewBudget, ...prev]);
  };
  
  const handleUpdateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
    }
  };

  const dynamicCategoryProps = {
    taskCategories: taskCats,
    onAddTaskCategory: (cat: string) => setTaskCats(prev => [...prev, cat]),
    reminderCategories: reminderCats,
    onAddReminderCategory: (cat: string) => setReminderCats(prev => [...prev, cat]),
    orderTypes: orderTypesState,
    onAddOrderType: (type: string) => setOrderTypesState(prev => [...prev, type]),
    orderSources: orderSourcesState,
    onAddOrderSource: (source: string) => setOrderSourcesState(prev => [...prev, source]),
    deliveryMethods: deliveryMethodsState,
    onAddDeliveryMethod: (method: string) => setDeliveryMethodsState(prev => [...prev, method]),
    expenseCategories: expenseCats,
    onAddExpenseCategory: (cat: string) => setExpenseCats(prev => [...prev, cat]),
    progressStatuses,
    paymentMethods
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex flex-col h-screen font-sans bg-gray-50 text-gray-800">
        <main className="flex-1 overflow-y-auto pb-20">
            <Routes>
              <Route path="/" element={<HomePage tasks={tasks} reminders={reminders} orders={orders} expenses={expenses} budgets={budgets} onLogout={handleLogout} />} />
              <Route path="/orders" element={<OrdersPage orders={orders} onAddOrder={handleAddOrder} onUpdateOrder={handleUpdateOrder} {...dynamicCategoryProps} />} />
              <Route path="/tasks" element={<TasksPage tasks={tasks} setTasks={setTasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} {...dynamicCategoryProps} />} />
              <Route path="/expenses" element={<ExpensesPage expenses={expenses} budgets={budgets} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onAddBudget={handleAddBudget} onUpdateBudget={handleUpdateBudget} onDeleteBudget={handleDeleteBudget} {...dynamicCategoryProps} />} />
              <Route path="/budget/:budgetId" element={<BudgetDetailPage budgets={budgets} expenses={expenses} onAddExpense={handleAddExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} expenseCategories={expenseCats} onAddExpenseCategory={(cat: string) => setExpenseCats(prev => [...prev, cat])} paymentMethods={paymentMethods} />} />
              <Route path="/reminders" element={<RemindersPage reminders={reminders} onAddReminder={handleAddReminder} onUpdateReminder={handleUpdateReminder} {...dynamicCategoryProps} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
