
import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const navItems = [
  { path: '/', name: 'Home', icon: 'home' },
  { path: '/orders', name: 'Orders', icon: 'orders' },
  { path: '/tasks', name: 'Tasks', icon: 'tasks' },
  { path: '/expenses', name: 'Expense Tracker', icon: 'expenses' },
  { path: '/reminders', name: 'Reminders', icon: 'reminders' },
];

const BottomNav: React.FC = () => {
  const activeLinkClass = 'text-primary';
  const inactiveLinkClass = 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-2 py-3 w-1/5 ${isActive ? activeLinkClass : inactiveLinkClass} hover:text-primary transition-colors duration-200`
            }
          >
            <Icon name={item.icon} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium text-center">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
