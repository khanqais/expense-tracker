import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { LogOut, Plus, Trash2, Edit2 } from 'lucide-react';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food' });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    fetchUserProfile(token);
    fetchExpenses(token);
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const res = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchExpenses = async (token) => {
    try {
      const res = await api.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data.expenses);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editId) {
        await api.put(`/api/expenses/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/expenses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setFormData({ title: '', amount: '', category: 'Food' });
      setShowForm(false);
      setEditId(null);
      fetchExpenses(token);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({ title: expense.title, amount: expense.amount, category: expense.category });
    setEditId(expense._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for summary
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const categories = [...new Set(expenses.map(e => e.category))];

  return (
    <div className="container">
      <nav className="dashboard-nav">
        <h2>ExpenseTracker<span style={{color: 'var(--primary-color)'}}>.</span></h2>
        <div className="flex items-center gap-4">
          <span className="text-secondary">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-danger flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="glass-panel summary-card">
          <h3 className="text-secondary">Total Spent</h3>
          <div className="summary-value">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="glass-panel summary-card">
          <h3 className="text-secondary">Total Transactions</h3>
          <div className="summary-value" style={{color: '#fff'}}>{expenses.length}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3>Recent Transactions</h3>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ title: '', amount: '', category: 'Food' }); }} 
          className="btn btn-primary"
        >
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="glass-panel mb-4">
          <h3 className="mb-4">{editId ? 'Edit Expense' : 'Add New Expense'}</h3>
          <form onSubmit={handleSubmit} className="flex gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-input" value={formData.title} onChange={handleFormChange} required />
            </div>
            <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
              <label className="form-label">Amount ($)</label>
              <input type="number" name="amount" className="form-input" value={formData.amount} onChange={handleFormChange} required min="0.01" step="0.01" />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select name="category" className="form-input" value={formData.category} onChange={handleFormChange}>
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Transportation">Transportation</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              {editId ? 'Update' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {/* Expense List */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {loading ? (
          <div className="text-center text-secondary py-4">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-secondary" style={{ padding: '3rem 0' }}>
            No expenses found. Add your first transaction!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {expenses.map((expense) => (
              <div key={expense._id} className="expense-item">
                <div className="expense-info">
                  <h3>{expense.title}</h3>
                  <div className="expense-meta">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(expense)} className="btn-icon">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(expense._id)} className="btn-icon" style={{color: 'var(--danger)'}}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
