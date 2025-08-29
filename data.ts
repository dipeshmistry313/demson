
import { Task, TaskStatus, Reminder, SketchOrder, OrderStatus, PaymentStatus, Expense, Budget, TaskPriority, ProgressStatus } from './types';

export const mockTasks: Task[] = [
  { id: '1', title: 'Finish portrait sketch for Jane', category: 'Work', priority: TaskPriority.High, dueDate: new Date(Date.now() + 86400000), isRecurring: false, status: TaskStatus.Pending },
  { id: '2', title: 'Buy new charcoal pencils', category: 'Personal', priority: TaskPriority.Medium, dueDate: new Date(Date.now() + 2 * 86400000), isRecurring: false, status: TaskStatus.Pending },
  { id: '3', title: 'Follow up with client about payment', category: 'Urgent', priority: TaskPriority.High, dueDate: new Date(), isRecurring: false, status: TaskStatus.Pending },
  { id: '4', title: 'Update portfolio website', category: 'Work', priority: TaskPriority.Low, dueDate: new Date(Date.now() + 5 * 86400000), isRecurring: false, status: TaskStatus.Completed },
];

export const mockReminders: Reminder[] = [
  { id: '1', title: 'Post on Instagram', time: new Date(new Date().setHours(18, 0, 0, 0)), isRecurring: true, category: 'Work' },
  { id: '2', title: 'Team meeting', time: new Date(new Date().setHours(10, 0, 0, 0) + 86400000), isRecurring: false, category: 'Work' },
  { id: '3', title: 'Call insurance company', time: new Date(new Date().setHours(14, 30, 0, 0)), isRecurring: false, category: 'Personal' },
];

export const mockOrders: SketchOrder[] = [
  { id: 'ORD-001', clientName: 'John Doe', clientPhone: '123-456-7890', clientEmail: 'john.doe@example.com', orderType: 'Colour', orderSource: 'Instagram', orderStatus: OrderStatus.InProgress, paymentStatus: PaymentStatus.Paid, deliveryMethod: 'Courier', priceQuoted: 15000, pricePaid: 15000, orderDate: new Date(Date.now() - 5 * 86400000), deliveryDate: new Date(Date.now() + 2 * 86400000), description: 'A4 couple portrait, colourful background.', tags: ['Portrait', 'Couple'], progressStatus: 'Shading', communicationLog: 'Client confirmed background color on Tuesday.' },
  { id: 'ORD-002', clientName: 'Jane Smith', clientPhone: '987-654-3210', clientEmail: 'jane.smith@example.com', orderType: 'B&W', orderSource: 'WhatsApp', orderStatus: OrderStatus.Pending, paymentStatus: PaymentStatus.Partial, deliveryMethod: 'Email (digital)', priceQuoted: 8000, pricePaid: 4000, orderDate: new Date(Date.now() - 3 * 86400000), deliveryDate: new Date(Date.now() + 5 * 86400000), description: 'Digital B&W sketch of a pet cat.', tags: ['Pet'], progressStatus: 'Sketch Started', communicationLog: 'Awaiting final approval on the pose.' },
  { id: 'ORD-003', clientName: 'Sam Wilson', clientPhone: '555-555-5555', clientEmail: 'sam.w@example.com', orderType: 'Custom', orderSource: 'Referral', orderStatus: OrderStatus.Completed, paymentStatus: PaymentStatus.Paid, deliveryMethod: 'Pickup', priceQuoted: 25000, pricePaid: 25000, orderDate: new Date(Date.now() - 10 * 86400000), deliveryDate: new Date(Date.now() - 2 * 86400000), deliveredDate: new Date(Date.now() - 1 * 86400000), description: 'Large canvas with custom abstract design.', tags: ['Abstract', 'Canvas'], progressStatus: 'Ready', communicationLog: 'Client picked up on Monday.' },
  { id: 'ORD-004', clientName: 'Emily Brown', clientPhone: '111-222-3333', clientEmail: 'emily.b@example.com', orderType: 'Colour', orderSource: 'Email', orderStatus: OrderStatus.Delivered, paymentStatus: PaymentStatus.Pending, deliveryMethod: 'Courier', priceQuoted: 18000, pricePaid: 0, orderDate: new Date(Date.now() - 15 * 86400000), deliveryDate: new Date(Date.now() - 5 * 86400000), deliveredDate: new Date(Date.now() - 4 * 86400000), description: 'Family portrait with 4 members.', tags: ['Portrait', 'Family'], progressStatus: 'Ready', communicationLog: 'Delivered via courier, tracking number sent.' },
  { id: 'ORD-005', clientName: 'Michael Chen', clientPhone: '444-555-6666', clientEmail: 'michael.c@example.com', orderType: 'B&W', orderSource: 'Facebook', orderStatus: OrderStatus.InProgress, paymentStatus: PaymentStatus.Pending, deliveryMethod: 'Pickup', priceQuoted: 12000, pricePaid: 0, orderDate: new Date(Date.now() - 2 * 86400000), deliveryDate: new Date(Date.now() + 8 * 86400000), description: 'Pet portrait, dog.', tags: ['Pet', 'Portrait'], progressStatus: 'Outline', communicationLog: 'Initial sketch sent for review.' },
];

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

export const mockBudgets: Budget[] = [
    { 
      id: 'bud-1', 
      name: 'Monthly Art Supplies', 
      fromDate: firstDayOfMonth, 
      toDate: lastDayOfMonth, 
      totalAmount: 20000, 
      categoryAllocations: [
        { category: 'Supplies', amount: 15000 },
        { category: 'Misc', amount: 5000 }
      ],
      notes: "General supplies for the month"
    },
    { 
      id: 'bud-2', 
      name: 'Q3 Marketing Push', 
      fromDate: new Date(today.getFullYear(), 5, 1), 
      toDate: new Date(today.getFullYear(), 8, 30), 
      totalAmount: 50000, 
      categoryAllocations: [
        { category: 'Marketing', amount: 40000 },
        { category: 'Operations', amount: 10000 }
      ]
    },
];

export const mockExpenses: Expense[] = [
    { id: '1', title: 'Canvas pack', amount: 5000, category: 'Supplies', date: new Date(new Date(firstDayOfMonth).setDate(2)), paymentMethod: 'Credit Card', vendor: 'ArtStore' },
    { id: '2', title: 'Instagram Ads', amount: 3000, category: 'Marketing', date: new Date(new Date(today.getFullYear(), 6, 15)), paymentMethod: 'UPI', vendor: 'Meta' },
    { id: '3', title: 'Shipping for ORD-001', amount: 1500, category: 'Courier', date: new Date(Date.now() - 4 * 86400000), paymentMethod: 'Cash', vendor: 'Local Courier' },
    { id: '4', title: 'Paint tubes', amount: 7500, category: 'Supplies', date: new Date(new Date(firstDayOfMonth).setDate(10)), paymentMethod: 'Credit Card', vendor: 'ArtStore' },
];
