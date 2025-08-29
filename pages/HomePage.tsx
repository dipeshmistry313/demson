
import React from 'react';
import Card from '../components/Card';
import { Task, TaskStatus, Reminder, SketchOrder, Expense, Budget } from '../types';
import { formatCurrencyINR } from '../utils';

interface HomePageProps {
    tasks: Task[];
    reminders: Reminder[];
    orders: SketchOrder[];
    expenses: Expense[];
    budgets: Budget[];
    onLogout: () => void;
}

const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ tasks, reminders, orders, expenses, budgets, onLogout }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (someDate: Date) => {
        const d = new Date(someDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };
    
    const now = new Date();
    const activeBudget = budgets.find(b => {
      const from = new Date(b.fromDate);
      from.setHours(0,0,0,0);
      const to = new Date(b.toDate);
      to.setHours(23,59,59,999);
      return from <= now && now <= to;
    });

    const categorySummary = activeBudget ? activeBudget.categoryAllocations.reduce((acc, alloc) => {
        acc[alloc.category] = { budget: alloc.amount, actual: 0 };
        return acc;
    }, {} as { [key: string]: { budget: number, actual: number } }) : null;

    if (activeBudget && categorySummary) {
        expenses.filter(e => {
            const expenseDate = new Date(e.date);
            const from = new Date(activeBudget.fromDate);
            from.setHours(0,0,0,0);
            const to = new Date(activeBudget.toDate);
            to.setHours(23,59,59,999);
            return expenseDate >= from && expenseDate <= to;
        }).forEach(expense => {
            if(categorySummary[expense.category]) {
                categorySummary[expense.category]!.actual += expense.amount;
            }
        });
    }


    const todaysTasks = tasks.filter(task => isToday(task.dueDate) && task.status === TaskStatus.Pending);
    const upcomingReminders = reminders.filter(reminder => new Date(reminder.time) > new Date());
    const ordersDueSoon = orders.filter(order => {
        const deliveryDate = new Date(order.deliveryDate);
        return deliveryDate > now && deliveryDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Welcome back to Demson Manager!</p>
                </div>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 text-sm font-medium text-primary bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                  aria-label="Logout"
                >
                  Logout
                </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <Card title={activeBudget ? `Current Budget: ${activeBudget.name}` : "Budget vs Actuals"} className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="space-y-3">
                        {categorySummary ? Object.keys(categorySummary).map(cat => {
                            const category = cat;
                            const { budget, actual } = categorySummary[category]!;
                            const color = actual > budget ? 'bg-danger' : 'bg-primary';

                            return (
                                <div key={category}>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium text-gray-600">{category}</span>
                                        <span className="text-gray-500">{formatCurrencyINR(actual)} / {formatCurrencyINR(budget)}</span>
                                    </div>
                                    <ProgressBar value={actual} max={budget} color={color} />
                                </div>
                            );
                        }) : <p className="text-sm text-gray-500">No active budget for the current period.</p>}
                    </div>
                </Card>

                <Card title="Orders Due Soon" className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                    {ordersDueSoon.length > 0 ? (
                        <ul className="space-y-3">
                            {ordersDueSoon.slice(0, 3).map(order => (
                                <li key={order.id} className="text-sm text-gray-600 flex justify-between">
                                    <span><span className="font-semibold">{order.id}</span> for {order.clientName}</span>
                                    <span className="font-medium text-gray-700">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No orders due soon.</p>
                    )}
                </Card>
            </div>

            <Card title="Today's Tasks" className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
                {todaysTasks.length > 0 ? (
                    <ul className="space-y-3">
                        {todaysTasks.map(task => (
                            <li key={task.id} className="flex items-center justify-between">
                                <span className="text-gray-700">{task.title}</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>{task.priority}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No tasks due today. Great job!</p>
                )}
            </Card>

            <Card title="Upcoming Reminders" className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                 {upcomingReminders.length > 0 ? (
                    <ul className="space-y-3">
                        {upcomingReminders.slice(0, 3).map(reminder => (
                            <li key={reminder.id} className="flex items-center justify-between text-gray-700">
                                <span>{reminder.title}</span>
                                <span className="text-sm text-gray-500">{new Date(reminder.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No upcoming reminders.</p>
                )}
            </Card>
        </div>
    );
};

export default HomePage;
