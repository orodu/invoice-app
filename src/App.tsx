import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Trash2,
  Search
} from 'lucide-react';
import './App.css';

/**
 * INVOICE MANAGEMENT APP
 * Features:
 * - Full CRUD with LocalStorage persistence
 * - Status flow: Draft -> Pending -> Paid
 * - Dark/Light mode toggle with persistence
 * - Responsive design (Mobile, Tablet, Desktop)
 * - Validation: Client info, positive numbers for price/qty
 * - Accessibility: Keyboard support (ESC), Semantic HTML
 */

// --- Types ---
interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceDate: string;
  paymentTerms: string;
  projectDescription: string;
  status: 'draft' | 'pending' | 'paid';
  items: InvoiceItem[];
  total: number;
}

type View = 'list' | 'detail' | 'form';

// --- Utility Functions ---
const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let id = '';
  for (let i = 0; i < 2; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) id += nums.charAt(Math.floor(Math.random() * nums.length));
  return id;
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

const calculateTotal = (items: InvoiceItem[]): number => {
  return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
};

// --- Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-500',
    pending: 'bg-orange-500/10 text-orange-500',
    draft: 'bg-slate-500/10 text-slate-500 dark:bg-slate-400/10 dark:text-slate-300',
  };
  const dots: Record<string, string> = {
    paid: 'bg-emerald-500',
    pending: 'bg-orange-500',
    draft: 'bg-slate-500 dark:bg-slate-300',
  };
  return (
    <div className={`flex items-center justify-center gap-2 w-28 py-3 rounded-md font-bold capitalize text-xs md:text-sm ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dots[status]}`}></span>
      {status}
    </div>
  );
};

// --- Invoice Form Component ---
interface InvoiceFormProps {
  invoice?: Invoice | null;
  onCancel: () => void;
  onSubmit: (data: Invoice) => void;
}

const InvoiceForm = ({ invoice, onCancel, onSubmit }: InvoiceFormProps) => {
  const [formData, setFormData] = useState<Invoice>({
    id: invoice?.id || generateId(),
    clientName: invoice?.clientName || '',
    clientEmail: invoice?.clientEmail || '',
    clientAddress: invoice?.clientAddress || '',
    invoiceDate: invoice?.invoiceDate || new Date().toISOString().split('T')[0],
    paymentTerms: invoice?.paymentTerms || '30',
    projectDescription: invoice?.projectDescription || '',
    status: invoice?.status || 'pending',
    items: invoice?.items?.length ? invoice.items : [{ id: Math.random(), name: '', quantity: 1, price: 0 }],
    total: invoice?.total || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName) newErrors.clientName = "Required";
    if (!formData.clientEmail || !/\S+@\S+\.\S+/.test(formData.clientEmail)) newErrors.clientEmail = "Invalid email";
    if (!formData.items.length) newErrors.items = "An item is required";
    formData.items.forEach((item, idx) => {
      if (!item.name) newErrors[`item_${idx}_name`] = "Required";
      if (item.quantity <= 0) newErrors[`item_${idx}_qty`] = "Must be > 0";
      if (item.price <= 0) newErrors[`item_${idx}_price`] = "Must be > 0";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Math.random(), name: '', quantity: 1, price: 0 }]
    });
  };

  const handleSubmit = (status: 'draft' | 'pending') => {
    const data = { ...formData, status };
    if (status === 'draft' || validate()) {
      data.total = calculateTotal(data.items);
      onSubmit(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-start">
      <div className="bg-white dark:bg-[#141625] w-full max-w-2xl h-full overflow-y-auto p-8 md:p-14 md:rounded-r-3xl flex flex-col animate-in slide-in-from-left duration-500">
        <button onClick={onCancel} className="flex items-center gap-4 text-sm font-bold mb-8 dark:text-white lg:hidden">
          <ChevronLeft className="text-indigo-500" /> Go Back
        </button>
        <h2 className="text-2xl font-bold mb-12 dark:text-white">
          {invoice ? <span>Edit <span className="text-slate-400">#</span>{invoice.id}</span> : 'New Invoice'}
        </h2>
        <div className="space-y-10 pb-32">
          <section>
            <h3 className="text-indigo-500 font-bold text-sm mb-6">Bill To</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-2">Client's Name</label>
                <input
                  type="text"
                  className={`w-full p-4 border rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500 ${errors.clientName ? 'border-red-500' : 'border-slate-200'}`}
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                />
                {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-2">Client's Email</label>
                <input
                  type="email"
                  className={`w-full p-4 border rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500 ${errors.clientEmail ? 'border-red-500' : 'border-slate-200'}`}
                  value={formData.clientEmail}
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                />
                {errors.clientEmail && <p className="text-red-500 text-xs mt-1">{errors.clientEmail}</p>}
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  className="w-full p-4 border border-slate-200 rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500"
                  value={formData.clientAddress}
                  onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                />
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-2">Invoice Date</label>
              <input
                type="date"
                className="w-full p-4 border border-slate-200 rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500"
                value={formData.invoiceDate}
                onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-2">Payment Terms</label>
              <select
                className="w-full p-4 border border-slate-200 rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="1">Next 1 Day</option>
                <option value="7">Next 7 Days</option>
                <option value="14">Next 14 Days</option>
                <option value="30">Next 30 Days</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-xs font-medium mb-2">Project Description</label>
              <input
                type="text"
                className="w-full p-4 border border-slate-200 rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none focus:border-indigo-500"
                value={formData.projectDescription}
                onChange={e => setFormData({ ...formData, projectDescription: e.target.value })}
              />
            </div>
          </section>
          <section>
            <h3 className="text-slate-500 font-bold text-lg mb-4">Item List</h3>
            <div className="space-y-4">
              {formData.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-5">
                    <label className="md:hidden block text-slate-400 text-xs mb-2">Item Name</label>
                    <input
                      type="text"
                      className={`w-full p-4 border rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none ${errors[`item_${idx}_name`] ? 'border-red-500' : 'border-slate-200'}`}
                      value={item.name}
                      onChange={e => {
                        const items = [...formData.items];
                        items[idx].name = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                    />
                    {errors[`item_${idx}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_name`]}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:contents">
                    <div className="md:col-span-2">
                      <label className="md:hidden block text-slate-400 text-xs mb-2">Qty.</label>
                      <input
                        type="number"
                        min="1"
                        className={`w-full p-4 border rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none ${errors[`item_${idx}_qty`] ? 'border-red-500' : 'border-slate-200'}`}
                        value={item.quantity}
                        onChange={e => {
                          const items = [...formData.items];
                          items[idx].quantity = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, items });
                        }}
                      />
                      {errors[`item_${idx}_qty`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_qty`]}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="md:hidden block text-slate-400 text-xs mb-2">Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`w-full p-4 border rounded-md dark:bg-[#1e2139] dark:border-[#252945] dark:text-white outline-none ${errors[`item_${idx}_price`] ? 'border-red-500' : 'border-slate-200'}`}
                        value={item.price}
                        onChange={e => {
                          const items = [...formData.items];
                          items[idx].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, items });
                        }}
                      />
                      {errors[`item_${idx}_price`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_price`]}</p>}
                    </div>
                    <div className="md:col-span-2 text-right md:text-left">
                      <label className="md:hidden block text-slate-400 text-xs mb-2">Total</label>
                      <div className="p-4 font-bold text-slate-500 dark:text-slate-400">
                        {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-end md:col-span-1">
                      <button
                        onClick={() => setFormData({ ...formData, items: formData.items.filter(i => i.id !== item.id) })}
                        className="text-slate-400 hover:text-red-500 p-4"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="w-full mt-8 bg-slate-100 dark:bg-[#252945] dark:text-white p-4 rounded-full font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2a3050] transition-colors">
              + Add New Item
            </button>
          </section>
        </div>
        <div className="fixed bottom-0 left-0 w-full md:w-2/3 lg:max-w-2xl bg-white dark:bg-[#141625] p-6 md:p-8 flex items-center justify-between shadow-2xl md:rounded-tr-3xl z-50">
          <button onClick={onCancel} className="bg-slate-100 dark:bg-[#252945] dark:text-slate-300 py-4 px-6 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-[#2a3050] transition-colors">
            Discard
          </button>
          <div className="flex gap-3">
            {!invoice && (
              <button
                onClick={() => handleSubmit('draft')}
                className="bg-slate-800 hover:bg-slate-900 text-slate-300 py-4 px-6 rounded-full font-bold transition-colors"
              >
                Save as Draft
              </button>
            )}
            <button
              onClick={() => handleSubmit('pending')}
              className="bg-indigo-500 hover:bg-indigo-400 text-white py-4 px-6 rounded-full font-bold transition-colors"
            >
              {invoice ? 'Save Changes' : 'Save & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sidebar Component ---
const Sidebar = ({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (v: boolean) => void }) => (
  <aside className="fixed left-0 top-0 h-full w-24 bg-[#373b53] dark:bg-[#1e2139] flex-col items-center justify-between z-[60] hidden lg:flex rounded-r-3xl overflow-hidden">
    <div className="w-full aspect-square bg-indigo-500 rounded-r-3xl flex items-center justify-center relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-400 rounded-tl-3xl"></div>
      <div className="relative z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-indigo-500 transform rotate-45"></div>
      </div>
    </div>
    <div className="w-full flex flex-col items-center pb-8">
      <button onClick={() => setIsDarkMode(!isDarkMode)} className="mb-8 text-slate-400 hover:text-white transition-colors p-2">
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
      <div className="w-full h-[1px] bg-slate-600 mb-8"></div>
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-10 h-10 rounded-full border-2 border-transparent hover:border-indigo-500 cursor-pointer" alt="User" />
    </div>
  </aside>
);

// --- Mobile Header Component ---
const MobileHeader = ({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (v: boolean) => void }) => (
  <header className="lg:hidden sticky top-0 left-0 w-full h-20 bg-[#373b53] dark:bg-[#1e2139] flex items-center justify-between z-[60]">
    <div className="h-full aspect-square bg-indigo-500 rounded-r-3xl flex items-center justify-center relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-indigo-400 rounded-tl-3xl"></div>
      <div className="relative z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-indigo-500 transform rotate-45"></div>
      </div>
    </div>
    <div className="flex items-center gap-6 pr-6">
      <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-slate-400 hover:text-white transition-colors p-2">
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
      <div className="w-[1px] h-20 bg-slate-600"></div>
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-8 h-8 rounded-full" alt="User" />
    </div>
  </header>
);

// --- Main App ---
export default function App() {
  // --- State ---
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoices_stage2');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<View>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme_stage2');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [filterStatus, setFilterStatus] = useState<string[]>(['draft', 'pending', 'paid']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Keyboard Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteModal) setShowDeleteModal(false);
        else if (view === 'form') setView('list');
        else if (isEditing) setIsEditing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal, view, isEditing]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('invoices_stage2', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_stage2', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_stage2', 'light');
    }
  }, [isDarkMode]);

  // --- Logic ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => filterStatus.includes(inv.status));
  }, [invoices, filterStatus]);

  const toggleFilter = (status: string) => {
    setFilterStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleCreateInvoice = (data: Invoice) => {
    const newInvoice: Invoice = {
      ...data,
      id: generateId(),
      total: calculateTotal(data.items),
    };
    setInvoices([newInvoice, ...invoices]);
    setView('list');
  };

  const handleUpdateInvoice = (data: Invoice) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === data.id ? {
        ...data,
        total: calculateTotal(data.items)
      } : inv
    );
    setInvoices(updatedInvoices);
    setSelectedInvoice(updatedInvoices.find(i => i.id === data.id) || null);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedInvoice) return;
    setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
    setShowDeleteModal(false);
    setView('list');
    setSelectedInvoice(null);
  };

  const markAsPaid = () => {
    if (!selectedInvoice) return;
    const updated = invoices.map(inv =>
      inv.id === selectedInvoice.id ? { ...inv, status: 'paid' as const } : inv
    );
    setInvoices(updated);
    setSelectedInvoice(updated.find(i => i.id === selectedInvoice.id) || null);
  };

  // --- List View ---
  const renderListView = () => (
    <>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold dark:text-white mb-2">Invoices</h1>
          <p className="text-slate-400 text-sm">
            {filteredInvoices.length} total <span className="hidden md:inline">invoices</span>
          </p>
        </div>
        <div className="flex items-center gap-4 md:gap-10">
          <div className="relative group">
            <button className="flex items-center gap-3 font-bold dark:text-white hover:opacity-70 transition-opacity">
              Filter <ChevronRight className="rotate-90 text-indigo-500" size={16} />
            </button>
            <div className="absolute top-10 right-0 w-40 bg-white dark:bg-[#252945] shadow-xl rounded-lg p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {['draft', 'pending', 'paid'].map(s => (
                <label key={s} className="flex items-center gap-3 mb-3 last:mb-0 cursor-pointer capitalize font-bold text-sm dark:text-white">
                  <input
                    type="checkbox"
                    className="accent-indigo-500 w-4 h-4"
                    checked={filterStatus.includes(s)}
                    onChange={() => toggleFilter(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={() => setView('form')}
            className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-white p-2 md:pl-2 md:pr-4 rounded-full font-bold transition-colors"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-500">
              <Plus size={20} />
            </div>
            <span className="text-sm md:text-base pr-2">New</span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-64 h-64 mb-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center opacity-30">
              <Search size={100} />
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-4">There is nothing here</h2>
            <p className="text-slate-400 max-w-xs">Create an invoice by clicking the New button and get started</p>
          </div>
        ) : (
          filteredInvoices.map(inv => (
            <div
              key={inv.id}
              onClick={() => { setSelectedInvoice(inv); setView('detail'); }}
              className="bg-white dark:bg-[#1e2139] p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between border-2 border-transparent hover:border-indigo-500 transition-all cursor-pointer animate-in slide-in-from-bottom-2"
            >
              <div className="flex justify-between items-center md:contents mb-6 md:mb-0">
                <span className="font-bold dark:text-white"><span className="text-slate-400">#</span>{inv.id}</span>
                <span className="text-slate-400 text-sm">{formatDate(inv.invoiceDate)}</span>
                <span className="text-slate-400 text-sm md:w-32 truncate">{inv.clientName}</span>
              </div>
              <div className="flex justify-between items-center md:contents">
                <span className="text-lg font-bold dark:text-white md:w-32 text-right">{formatCurrency(inv.total)}</span>
                <div className="flex items-center gap-4">
                  <StatusBadge status={inv.status} />
                  <ChevronRight className="text-indigo-500 hidden md:block" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  // --- Detail View ---
  const renderDetailView = () => {
    if (!selectedInvoice) return null;
    return (
      <div className="animate-in fade-in duration-500">
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-4 text-sm font-bold mb-8 dark:text-white hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="text-indigo-500" /> Go Back
        </button>
        <div className="bg-white dark:bg-[#1e2139] p-6 rounded-lg flex items-center justify-between mb-6">
          <div className="flex items-center justify-between w-full md:w-auto md:gap-4">
            <span className="text-slate-400 text-sm">Status</span>
            <StatusBadge status={selectedInvoice.status} />
          </div>
          <div className="hidden md:flex gap-2">
            <button
              disabled={selectedInvoice.status === 'paid'}
              onClick={() => setIsEditing(true)}
              className="bg-slate-100 dark:bg-[#252945] dark:text-slate-300 py-4 px-6 rounded-full font-bold disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-[#2a3050] transition-colors"
            >
              Edit
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-full font-bold transition-colors">
              Delete
            </button>
            {selectedInvoice.status === 'pending' && (
              <button onClick={markAsPaid} className="bg-indigo-500 hover:bg-indigo-400 text-white py-4 px-6 rounded-full font-bold transition-colors">
                Mark as Paid
              </button>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1e2139] p-8 md:p-12 rounded-lg mb-24 md:mb-0">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-1">
                <span className="text-slate-400">#</span>{selectedInvoice.id}
              </h2>
              <p className="text-slate-400 text-sm">{selectedInvoice.projectDescription}</p>
            </div>
            <div className="text-slate-400 text-sm md:text-right">
              {selectedInvoice.clientAddress.split(',').map((line, i) => <p key={i}>{line.trim()}</p>)}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="mb-8">
                <h4 className="text-slate-400 text-sm mb-3">Invoice Date</h4>
                <p className="font-bold text-lg dark:text-white">{formatDate(selectedInvoice.invoiceDate)}</p>
              </div>
              <div>
                <h4 className="text-slate-400 text-sm mb-3">Payment Due</h4>
                <p className="font-bold text-lg dark:text-white">
                  {formatDate(new Date(new Date(selectedInvoice.invoiceDate).getTime() + (parseInt(selectedInvoice.paymentTerms) * 86400000)))}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-slate-400 text-sm mb-3">Bill To</h4>
              <p className="font-bold text-lg dark:text-white mb-2">{selectedInvoice.clientName}</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-slate-400 text-sm mb-3">Sent to</h4>
              <p className="font-bold text-lg dark:text-white truncate">{selectedInvoice.clientEmail}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-[#252945] rounded-t-lg p-6 md:p-8">
            {selectedInvoice.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between mb-6 last:mb-0">
                <div>
                  <p className="font-bold dark:text-white">{item.name}</p>
                  <p className="text-slate-400 font-bold">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
                <p className="font-bold dark:text-white">{formatCurrency(item.quantity * item.price)}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 dark:bg-black p-8 rounded-b-lg flex items-center justify-between text-white">
            <span className="text-sm">Amount Due</span>
            <span className="text-2xl font-bold">{formatCurrency(selectedInvoice.total)}</span>
          </div>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#1e2139] p-6 flex justify-center gap-2 border-t dark:border-[#252945]">
          <button disabled={selectedInvoice.status === 'paid'} onClick={() => setIsEditing(true)} className="bg-slate-100 dark:bg-[#252945] py-4 px-6 rounded-full font-bold disabled:opacity-30">
            Edit
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 text-white py-4 px-6 rounded-full font-bold">
            Delete
          </button>
          {selectedInvoice.status === 'pending' && (
            <button onClick={markAsPaid} className="bg-indigo-500 text-white py-4 px-6 rounded-full font-bold">
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f8fb] dark:bg-[#141625] transition-colors duration-300">
      <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <MobileHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="lg:pl-24 max-w-3xl mx-auto px-6 py-8 md:py-16">
        {view === 'list' && renderListView()}
        {view === 'detail' && renderDetailView()}
        {view === 'form' && <InvoiceForm onCancel={() => setView('list')} onSubmit={handleCreateInvoice} />}
        {isEditing && selectedInvoice && (
          <InvoiceForm invoice={selectedInvoice} onCancel={() => setIsEditing(false)} onSubmit={handleUpdateInvoice} />
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#1e2139] p-8 md:p-12 rounded-lg max-w-md w-full animate-in zoom-in-95">
              <h2 className="text-2xl font-bold dark:text-white mb-4">Confirm Deletion</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to delete invoice #{selectedInvoice?.id}?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="bg-slate-100 dark:bg-[#252945] py-4 px-6 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-[#2a3050] transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-full font-bold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
