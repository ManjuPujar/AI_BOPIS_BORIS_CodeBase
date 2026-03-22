import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import inventoryService from '../services/inventoryService';
import Loader from '../components/common/Loader';

const styles = {
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, backgroundColor: '#1b1b1f', padding: '8px 16px', borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#E8E8E8', padding: '8px 0', backgroundColor: 'transparent' },
  table: { width: '100%', backgroundColor: '#1b1b1f', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.05)' },
  th: { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, color: '#5C5C60', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.12)' },
  td: { padding: '14px 20px', fontSize: 13, color: '#8E8E92', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  editButton: { padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#8E8E92', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, transition: 'all 220ms ease' },
  editInput: { width: 70, padding: '4px 8px', borderRadius: 6, border: '1px solid #3b82f6', fontSize: 13, textAlign: 'center', outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8' },
  saveButton: { padding: '4px 8px', borderRadius: 6, border: 'none', backgroundColor: '#10b981', color: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  cancelButton: { padding: '4px 8px', borderRadius: 6, border: 'none', backgroundColor: '#ef4444', color: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 },
  pageButton: { padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', color: '#E8E8E8', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 220ms ease' },
  pageButtonDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  emptyState: { textAlign: 'center', padding: 48, color: '#5C5C60', fontSize: 14 },
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory(page, 20, search);
      setInventory(data.inventory || data.items || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 20));
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const startEdit = (item) => {
    setEditingId(item._id || item.id);
    setEditValue(String(item.quantityOnHand ?? item.onHand ?? 0));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (itemId) => {
    const qty = parseInt(editValue, 10);
    if (isNaN(qty) || qty < 0) {
      toast.warn('Please enter a valid quantity');
      return;
    }
    setSaving(true);
    try {
      await inventoryService.updateInventory(itemId, qty);
      toast.success('Inventory updated');
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inventory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={styles.searchBar}>
        <FiSearch size={18} color="#5C5C60" />
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by SKU or product name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#c8102e',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 220ms ease',
          }}
        >
          Search
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : inventory.length === 0 ? (
        <div style={{ ...styles.table, ...styles.emptyState }}>No inventory items found</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Size</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>On Hand</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Reserved</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Available</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const itemId = item._id || item.id;
                const onHand = item.quantityOnHand ?? item.onHand ?? 0;
                const reserved = item.reserved ?? 0;
                const available = item.available ?? onHand - reserved;
                const isEditing = editingId === itemId;

                return (
                  <tr key={itemId}>
                    <td style={{ ...styles.td, fontWeight: 500, color: '#E8E8E8' }}>
                      {item.productName || item.name || 'Product'}
                    </td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: 13 }}>
                      {item.sku || 'N/A'}
                    </td>
                    <td style={styles.td}>{item.size || 'N/A'}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <input
                            style={styles.editInput}
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(itemId);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            style={styles.saveButton}
                            onClick={() => saveEdit(itemId)}
                            disabled={saving}
                          >
                            <FiCheck size={14} />
                          </button>
                          <button style={styles.cancelButton} onClick={cancelEdit}>
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{onHand}</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center', color: reserved > 0 ? '#f59e0b' : '#5C5C60' }}>
                      {reserved}
                    </td>
                    <td style={{
                      ...styles.td,
                      textAlign: 'center',
                      fontWeight: 600,
                      color: available > 0 ? '#10b981' : '#ef4444',
                    }}>
                      {available}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {!isEditing && (
                        <button style={styles.editButton} onClick={() => startEdit(item)}>
                          <FiEdit2 size={13} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageButton, ...(page <= 1 ? styles.pageButtonDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: '#5C5C60' }}>
                Page {page} of {totalPages}
              </span>
              <button
                style={{ ...styles.pageButton, ...(page >= totalPages ? styles.pageButtonDisabled : {}) }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
