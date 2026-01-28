
import React, { useState, useMemo } from 'react';
import { ProcessingBatch, SyncStatus, ConfirmationStatus } from '../../types';

interface SyncToMyobProps {
  items: ProcessingBatch[];
  onSync: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
}

// Mock field data helper
const getMockLineItems = (month: string = 'JAN', year: string = '26') => [
  { name: 'BASE RENTAL', tax: 2000.0, gst: 200.0, total: 2200.0, desc: `RENT_${month}${year}` },
  { name: 'ELECTRICITY', tax: 145.2, gst: 14.52, total: 159.72, desc: `ELEC_${month}${year}` },
  { name: 'WATER USAGE', tax: 45.0, gst: 4.5, total: 49.5, desc: `WATER_${month}${year}` },
];

const SyncToMyob: React.FC<SyncToMyobProps> = ({ items, onSync, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedMasterIds, setExpandedMasterIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSyncStatus, setFilterSyncStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; ids: string[]; isSynced: boolean }>({ isOpen: false, ids: [], isSynced: false });
  const [alreadySyncedModal, setAlreadySyncedModal] = useState(false);

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.subFileName?.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = filterSyncStatus === 'all' || item.syncStatus === filterSyncStatus;
    
    let matchesDate = true;
    if (dateFrom) matchesDate = matchesDate && item.date >= dateFrom;
    if (dateTo) matchesDate = matchesDate && item.date <= dateTo;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const parents = filteredItems.filter(item => !item.parentId);
  const childrenMap: Record<string, ProcessingBatch[]> = {};
  filteredItems.forEach(item => {
    if (item.parentId) {
      if (!childrenMap[item.parentId]) childrenMap[item.parentId] = [];
      childrenMap[item.parentId].push(item);
    }
  });

  const toggleMasterExpand = (id: string) => {
    setExpandedMasterIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkSelection = (parentId: string) => {
    const children = childrenMap[parentId] || [];
    const ids = [parentId, ...children.map(c => c.id)];
    const allSelected = ids.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  // Selection counter logic
  const selectedLeafItems = useMemo(() => {
    return items.filter(i => {
      const isSelected = selectedIds.includes(i.id);
      if (!isSelected) return false;
      if (i.parentId) return true;
      const hasChildren = items.some(child => child.parentId === i.id);
      return !hasChildren;
    });
  }, [items, selectedIds]);

  const selectedLeafCount = selectedLeafItems.length;

  const handleSyncSelected = () => {
    const alreadySyncedItems = selectedLeafItems.filter(i => i.syncStatus === SyncStatus.SUCCESS);
    if (alreadySyncedItems.length > 0) {
      setAlreadySyncedModal(true);
      return;
    }

    const idsToSync = selectedIds;
    if (idsToSync.length > 0) {
      onSync(idsToSync);
      setSelectedIds([]);
    }
  };

  const openDeleteDialog = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setDeleteDialog({
      isOpen: true,
      ids: [id],
      isSynced: item.syncStatus === SyncStatus.SUCCESS
    });
  };

  const confirmDelete = () => {
    onDelete(deleteDialog.ids);
    setDeleteDialog({ isOpen: false, ids: [], isSynced: false });
    setSelectedIds(prev => prev.filter(id => !deleteDialog.ids.includes(id)));
  };

  const getMasterStatus = (parent: ProcessingBatch, children: ProcessingBatch[]) => {
    if (children.length === 0) return parent.syncStatus;
    
    const allSynced = children.every(c => c.syncStatus === SyncStatus.SUCCESS);
    if (allSynced) return SyncStatus.SUCCESS;

    const anyFailed = children.some(c => c.syncStatus === SyncStatus.FAILED);
    const someSynced = children.some(c => c.syncStatus === SyncStatus.SUCCESS);
    
    if (anyFailed || someSynced) return 'PARTIAL'; // User requested: "部分同步成功" if failures exist
    return SyncStatus.NOT_SYNCED;
  };

  const renderStatusPill = (status: string | SyncStatus) => {
    switch(status) {
      case SyncStatus.SUCCESS:
        return <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase">SYNCED</span>;
      case 'PARTIAL':
        return <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase">部分同步成功</span>;
      case SyncStatus.FAILED:
        return <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 uppercase">FAILED</span>;
      case SyncStatus.SYNCING:
        return <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase animate-pulse">SYNCING</span>;
      default:
        return <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 uppercase">NOT SYNCED</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 bg-[#f0f2f5] min-h-full">
      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-6 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search file..." 
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/5 focus:border-blue-400 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-transparent shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Sync Date</span>
            <input 
              type="date" 
              className="bg-transparent text-[10px] font-bold text-gray-600 outline-none w-28"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-gray-300 text-[10px] font-black uppercase">To</span>
            <input 
              type="date" 
              className="bg-transparent text-[10px] font-bold text-gray-600 outline-none w-28"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <select 
            className="bg-gray-50 border border-transparent rounded-2xl px-4 py-2.5 text-[10px] font-black text-gray-500 uppercase tracking-tighter focus:ring-2 focus:ring-blue-500/5 transition-all outline-none cursor-pointer shrink-0"
            value={filterSyncStatus}
            onChange={(e) => setFilterSyncStatus(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value={SyncStatus.SUCCESS}>Synced</option>
            <option value={SyncStatus.NOT_SYNCED}>Not Synced</option>
            <option value={SyncStatus.SYNCING}>Syncing</option>
            <option value={SyncStatus.FAILED}>Failed</option>
          </select>
        </div>
        <button 
          disabled={selectedLeafCount === 0}
          onClick={handleSyncSelected}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-blue-700 transition-all disabled:opacity-20 shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path></svg>
          POST TO MYOB ({selectedLeafCount})
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-5 w-16 text-center">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(items.map(i => i.id));
                      else setSelectedIds([]);
                    }}
                    checked={selectedIds.length === items.length && items.length > 0}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                </th>
                <th className="px-6 py-5 w-[30%]">Source File Details</th>
                <th className="px-6 py-5 w-40">Expense Field</th>
                <th className="px-6 py-5 w-32 text-right">Tax Excl.</th>
                <th className="px-6 py-5 w-24 text-right">GST</th>
                <th className="px-6 py-5 w-32 text-right">Total Amount</th>
                <th className="px-6 py-5 w-48">MYOB Reference</th>
                <th className="px-6 py-5 w-40 text-center">Sync State</th>
                <th className="px-6 py-5 w-20 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parents.map(parent => {
                const children = childrenMap[parent.id] || [];
                const hasChildren = children.length > 0;
                const isParentSelected = selectedIds.includes(parent.id);
                // Expand by default if no children (single file)
                const isExpanded = expandedMasterIds.includes(parent.id) || !hasChildren;
                const masterStatus = getMasterStatus(parent, children);
                const lineItems = getMockLineItems(parent.selectedMonth, parent.selectedYear);
                
                return (
                  <React.Fragment key={parent.id}>
                    <tr 
                      className="bg-white border-b border-gray-100 cursor-pointer hover:bg-gray-50/80 transition-colors"
                      onClick={() => hasChildren && toggleMasterExpand(parent.id)}
                    >
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isParentSelected} 
                          onChange={() => handleBulkSelection(parent.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                        />
                      </td>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {hasChildren ? (
                               <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            ) : (
                               <div className="w-3.5 h-3.5"></div>
                            )}
                            {hasChildren && (
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">MASTER BATCH</span>
                            )}
                            <span className="font-bold text-sm tracking-tight text-gray-800">{parent.fileName}</span>
                            <span className="px-2 py-0.5 bg-gray-100 border text-gray-500 rounded text-[9px] font-bold">#{parent.id}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-gray-400">DATE: {parent.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderStatusPill(masterStatus)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDeleteDialog(parent.id); }} 
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>

                    {/* Expansion logic: Show children OR parent's line items */}
                    {isExpanded && (
                      hasChildren ? (
                        children.map(child => {
                          const isChildSelected = selectedIds.includes(child.id);
                          const childLines = getMockLineItems(child.selectedMonth, child.selectedYear);
                          return (
                            <React.Fragment key={child.id}>
                              <tr className={`bg-blue-50/20 border-l-4 ${isChildSelected ? 'border-blue-500' : 'border-transparent'}`}>
                                 <td className="px-6 py-2 text-center"></td>
                                 <td colSpan={6} className="px-6 py-2">
                                   <div className="flex items-center gap-2">
                                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                      <span className="font-black text-blue-900 text-xs tracking-tight truncate">{child.subFileName}</span>
                                      <span className="text-[9px] text-gray-400 font-bold ml-2">({childLines.length} FIELDS)</span>
                                   </div>
                                 </td>
                                 <td className="px-6 py-2 text-center">
                                    {renderStatusPill(child.syncStatus)}
                                 </td>
                                 <td className="px-6 py-2 text-right"></td>
                              </tr>
                              {childLines.map((field, fieldIdx) => (
                                <tr key={`${child.id}-${fieldIdx}`} className={`group/row transition-all border-l-4 ${isChildSelected ? 'border-blue-500 bg-blue-50/5' : 'border-transparent hover:bg-gray-50'}`}>
                                  <td className="px-6 py-3 relative text-center">
                                    <div className="absolute left-[2.4rem] top-0 h-full w-[1px] bg-gray-100 group-last/row:h-1/2"></div>
                                    <div className="absolute left-[2.4rem] top-1/2 w-4 h-[1px] bg-gray-100"></div>
                                  </td>
                                  <td className="px-6 py-3 pl-12"><div className="flex items-center gap-2"><span className="text-[10px] text-gray-400 font-bold italic">Line {fieldIdx + 1}</span></div></td>
                                  <td className="px-6 py-3"><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-tight">{field.name}</span></td>
                                  <td className="px-6 py-3 text-right font-mono text-xs text-gray-600">{field.tax.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-6 py-3 text-right font-mono text-xs text-gray-500">{field.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-6 py-3 text-right font-black text-gray-900 text-xs">{field.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-6 py-3"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><span className="text-[10px] font-bold text-blue-800 tracking-tighter uppercase">{field.desc}</span></div></td>
                                  <td colSpan={2} className="px-6 py-3"></td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        /* Standalone file details rendering (BUG FIX) */
                        <React.Fragment>
                          {lineItems.map((field, fieldIdx) => (
                             <tr key={`${parent.id}-${fieldIdx}`} className={`group/row transition-all border-l-4 ${isParentSelected ? 'border-blue-500 bg-blue-50/5' : 'border-transparent hover:bg-gray-50'}`}>
                              <td className="px-6 py-3 relative text-center">
                                <div className="absolute left-[2.4rem] top-0 h-full w-[1px] bg-gray-100 group-last/row:h-1/2"></div>
                                <div className="absolute left-[2.4rem] top-1/2 w-4 h-[1px] bg-gray-100"></div>
                              </td>
                              <td className="px-6 py-3 pl-12"><div className="flex items-center gap-2"><span className="text-[10px] text-gray-400 font-bold italic">Line {fieldIdx + 1}</span></div></td>
                              <td className="px-6 py-3"><span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-tight">{field.name}</span></td>
                              <td className="px-6 py-3 text-right font-mono text-xs text-gray-600">{field.tax.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-3 text-right font-mono text-xs text-gray-500">{field.gst.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-3 text-right font-black text-gray-900 text-xs">{field.total.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</td>
                              <td className="px-6 py-3"><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div><span className="text-[10px] font-bold text-blue-800 tracking-tighter uppercase">{field.desc}</span></div></td>
                              <td colSpan={2} className="px-6 py-3"></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    )}
                  </React.Fragment>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-32 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">No matching invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Modal for Resync */}
      {alreadySyncedModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAlreadySyncedModal(false)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Sync Denied</h3>
                <p className="text-gray-400 text-xs font-bold uppercase leading-relaxed">已经同步了，不允许再次同步。</p>
              </div>
              <button 
                onClick={() => setAlreadySyncedModal(false)}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10">
            <h3 className="text-xl font-black text-gray-800 tracking-tight leading-tight">
              {deleteDialog.isSynced ? 'Already Synced' : 'Confirm Permanent Deletion'}
            </h3>
            <p className="text-gray-500 mt-4 text-sm font-medium leading-relaxed">
              {deleteDialog.isSynced 
                ? "Warning: Record exists in MYOB. Deleting here will cause ledger inconsistency."
                : "This action will remove the selected invoices from the queue. This cannot be undone."}
            </p>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setDeleteDialog({ ...deleteDialog, isOpen: false })} className="flex-1 py-4 border-2 rounded-2xl text-gray-400 font-black text-[10px] uppercase">Cancel</button>
              <button onClick={confirmDelete} className={`flex-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase ${deleteDialog.isSynced ? 'bg-orange-600' : 'bg-red-500'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncToMyob;
