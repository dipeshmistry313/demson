
export const taskCategories = ["Work", "Personal", "Urgent"];
export type TaskCategory = typeof taskCategories[number];

export enum TaskPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export enum TaskStatus {
  Pending = "Pending",
  Completed = "Completed",
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: Date;
  isRecurring: boolean;
  status: TaskStatus;
}

export const reminderCategories = ["Personal", "Work", "Follow-up", "Appointment"];
export type ReminderCategory = typeof reminderCategories[number];

export interface Reminder {
  id: string;
  title: string;
  time: Date;
  isRecurring: boolean;
  category: ReminderCategory;
}

export const orderTypes = ["B&W", "Colour", "Custom"];
export type OrderType = typeof orderTypes[number];

export const orderSources = ["Instagram", "WhatsApp", "Facebook", "Email", "Referral", "Walk-in"];
export type OrderSource = typeof orderSources[number];

export enum OrderStatus {
  Pending = "Pending",
  InProgress = "In progress",
  Completed = "Completed",
  Delivered = "Delivered",
}

export enum PaymentStatus {
  Pending = "Pending",
  Partial = "Partial",
  Paid = "Paid",
}

export const deliveryMethods = ["Pickup", "Courier", "Email (digital)"];
export type DeliveryMethod = typeof deliveryMethods[number];

export const progressStatuses = ["Not Started", "Sketch Started", "Outline", "Shading", "Final Touches", "Ready"];
export type ProgressStatus = typeof progressStatuses[number];


export interface SketchOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  orderType: OrderType;
  orderSource: OrderSource;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  priceQuoted: number;
  pricePaid: number;
  orderDate: Date;
  deliveryDate: Date;
  deliveredDate?: Date;
  description: string;
  tags: string[];
  referenceImage?: string; // base64 string
  progressStatus: ProgressStatus;
  communicationLog: string;
}

export const expenseCategories = ["Supplies", "Marketing", "Courier", "Travel", "Personal", "Operations", "Misc"];
export type ExpenseCategory = typeof expenseCategories[number];

// Unified BudgetCategory to match ExpenseCategory for consistency
export const budgetCategories = expenseCategories;
export type BudgetCategory = typeof budgetCategories[number];


export const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Credit Card"];
export type PaymentMethod = typeof paymentMethods[number];

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
    paymentMethod: PaymentMethod;
    vendor: string;
    notes?: string;
    receiptImage?: string; // base64 string
}

export interface Income {
    id: string;
    description: string;
    amount: number;
    date: Date;
}

export interface BudgetCategoryAllocation {
  category: BudgetCategory;
  amount: number;
}

export interface Budget {
    id: string;
    name: string;
    fromDate: Date;
    toDate: Date;
    totalAmount: number;
    notes?: string;
    categoryAllocations: BudgetCategoryAllocation[];
}
