
import React, { useRef, useState, useEffect } from 'react';
import { SidebarMenu, ProcessingBatch, ConfirmationStatus, SyncStatus } from '../../types';

interface SyncHubProps {
  onSplit: (id: string) => void;
  onRunOCR: (id: string) => void;
  onReview: (id: string, readOnly?: boolean, scrollId?: string) => void;
  onSyncToMyob: (id: string) => void;
  onDelete: (ids: string[]) => void;
  onBulkSync: (ids: string[]) => void;
  onQuickConfirm: (id: string) => void;
  items: ProcessingBatch[];
  onUpload: (fileName: string, month: string, year: string) => void;
}

interface PendingUpload {
  file: File;
  month: string;
  year: string;
}

const SyncHub: React.FC<SyncHubProps> = ({ onSplit, onRunOCR, onReview, onSyncToMyob, onDelete, onBulkSync, onQuickConfirm, items, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedParentIds, setExpandedParentIds] = useState<string[]>([]);
  
  // Multi-Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const years = ['24', '25', '26', '27'];

  useEffect(() => {
    const parentsWithChildren = items
      .filter(item => items.some(child => child.parentId === item.id))
      .map(item => item.id);
    
    setExpandedParentIds(prev => {
      const newIds = parentsWithChildren.filter(id => !prev.includes(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, [items]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const defaultMonth = months[new Date().getMonth()];
      const defaultYear = new Date().getFullYear().toString().slice(-2);
      
      const newPending = files.map(f => ({
        file: f,
        month: defaultMonth,
        year: defaultYear
      }));
      
      setPendingUploads(newPending);
      setIsUploadModalOpen(true);
    }
  };

  const updatePendingUpload = (index: number, updates: Partial<PendingUpload>) => {
    setPendingUploads(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads(prev => prev.filter((_, i) => i !== index));
    if (pendingUploads.length <= 1) {
      setIsUploadModalOpen(false);
    }
  };

  const handleConfirmUpload = () => {
    pendingUploads.forEach(upload => {
      onUpload(upload.file.name, upload.month, upload.year);
    });
    setIsUploadModalOpen(false);
    setPendingUploads([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedParentIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: ConfirmationStatus) => {
    switch (status) {
      case ConfirmationStatus.NOT_RECOGNIZED: return 'bg-gray-100 text-gray-500 border-gray-200';
      case ConfirmationStatus.RECOGNIZING: return 'bg-blue-50 text-blue-600 border-blue-200';
      case ConfirmationStatus.TO_BE_CONFIRMED: return 'bg-orange-50 text-orange-600 border-orange-200';
      case ConfirmationStatus.PARTIALLY_CONFIRMED: return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case ConfirmationStatus.CONFIRMED: return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const parents = items.filter(item => !item.parentId);
  const childrenMap: Record<string, ProcessingBatch[]> = {};
  items.forEach(item => {
    if (item.parentId) {
      if (!childrenMap[item.parentId]) childrenMap[item.parentId] = [];
      childrenMap[item.parentId].push(item);
    }
  });

  const selectedItems = items.filter(i => selectedIds.includes(i.id));
  const eligibleForDelete = selectedItems.filter(i => i.syncStatus !== SyncStatus.SUCCESS);
  const canDelete = eligibleForDelete.length > 0;
  
  const confirmDelete = () => {
    onDelete(eligibleForDelete.map(i => i.id));
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
  };

  const handleStatusClick = (e: React.MouseEvent, item: ProcessingBatch, isChild: boolean) => {
    e.stopPropagation();
    if (isChild) return;
    if (item.confirmationStatus !== ConfirmationStatus.NOT_RECOGNIZED && item.confirmationStatus !== ConfirmationStatus.RECOGNIZING) {
      onReview(item.id, item.syncStatus === SyncStatus.SUCCESS);
    }
  };

  const handleNameClick = (e: React.MouseEvent, item: ProcessingBatch, isChild: boolean) => {
    e.stopPropagation();
    if (isChild && item.parentId) {
      onReview(item.parentId, item.syncStatus === SyncStatus.SUCCESS, item.id);
    } else if (!isChild) {
      if (item.confirmationStatus !== ConfirmationStatus.NOT_RECOGNIZED && item.confirmationStatus !== ConfirmationStatus.RECOGNIZING) {
        onReview(item.id, item.syncStatus === SyncStatus.SUCCESS);
      }
    }
  };

  const renderRow = (item: ProcessingBatch, isChild: boolean = false) => {
    const children = childrenMap[item.id] || [];
    const hasChildren = !isChild && children.length > 0;
    const isExpanded = expandedParentIds.includes(item.id);

    const areAllChildrenRecognized = hasChildren && children.every(c => c.confirmationStatus !== ConfirmationStatus.NOT_RECOGNIZED);
    const areSomeChildrenRecognizing = hasChildren && children.some(c => c.confirmationStatus === ConfirmationStatus.RECOGNIZING);

    return (
      <tr 
        key={item.id} 
        onClick={(e) => hasChildren ? toggleExpand(item.id) : handleNameClick(e, item, isChild)}
        className={`transition-all group border-b border-gray-50/50 ${selectedIds.includes(item.id) ? 'bg-blue-50/30' : 'hover:bg-blue-50/10'} ${hasChildren || (isChild && item.parentId) ? 'cursor-pointer' : ''} ${!isChild ? 'bg-white' : 'bg-gray-50/20'}`}
      >
        <td className="px-8 py-5 w-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedIds.includes(item.id)}
              onChange={() => toggleSelection(item.id)}
            />
          </div>
        </td>
        <td className={`px-8 py-5 ${isChild ? 'pl-20' : ''}`}>
          <div className="flex items-center gap-4">
            {!isChild && (
              <div className={`p-1 rounded transition-all shrink-0 ${hasChildren ? 'text-blue-500' : 'text-gray-200'}`}>
                {hasChildren ? (
                  <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                ) : (
                  <div className="w-5 h-5"></div>
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {!isChild && hasChildren && (
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">MASTER BATCH</span>
                   {item.selectedMonth && <span className="text-[9px] font-black text-gray-400">[{item.selectedMonth} {item.selectedYear}]</span>}
                </div>
              )}
              <div 
                className={`font-black tracking-tight transition-colors truncate ${isChild ? 'text-gray-700 text-sm hover:text-blue-600 hover:underline' : 'text-gray-800 text-base'} group-hover:text-blue-600`}
                onClick={(e) => isChild && handleNameClick(e, item, isChild)}
              >
                {item.subFileName || item.fileName}
              </div>
              <div className="text-[10px] font-black text-gray-300 uppercase mt-1 flex items-center gap-2">
                {isChild && <span className="text-blue-500 font-black">PART</span>}
                ID: {item.id} • {item.pages} Pages
              </div>
            </div>
          </div>
        </td>
        <td className="px-8 py-5">
          <div className="flex justify-center">
            <div className="flex flex-col gap-2 min-w-[140px] items-center">
              <button 
                disabled={item.confirmationStatus === ConfirmationStatus.NOT_RECOGNIZED || item.confirmationStatus === ConfirmationStatus.RECOGNIZING || isChild}
                onClick={(e) => handleStatusClick(e, item, isChild)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border flex items-center gap-2 w-fit transition-all ${getStatusColor(item.confirmationStatus)} ${item.confirmationStatus !== ConfirmationStatus.NOT_RECOGNIZED && item.confirmationStatus !== ConfirmationStatus.RECOGNIZING && !isChild ? 'hover:scale-105 active:scale-95' : 'cursor-default'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${item.confirmationStatus === ConfirmationStatus.RECOGNIZING ? 'bg-current animate-ping' : 'bg-current'}`}></span>
                {item.confirmationStatus}
              </button>
              {(item.confirmationStatus === ConfirmationStatus.RECOGNIZING || areSomeChildrenRecognizing) && (
                <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${item.ocrProgress || (areSomeChildrenRecognizing ? 50 : 0)}%` }}></div>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-8 py-5 text-center text-gray-400 font-black text-xs">{item.date}</td>
        <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-3">
            {item.confirmationStatus === ConfirmationStatus.NOT_RECOGNIZED && !isChild && (
               <button onClick={() => onSplit(item.id)} className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all group/btn" title="Split PDF">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="6" cy="6" r="3" />
                   <circle cx="6" cy="18" r="3" />
                   <line x1="20" y1="4" x2="8.12" y2="15.88" />
                   <line x1="14.47" y1="14.48" x2="20" y2="20" />
                   <line x1="8.12" y1="8.12" x2="12" y2="12" />
                 </svg>
               </button>
            )}
            {!isChild && (item.confirmationStatus === ConfirmationStatus.NOT_RECOGNIZED || (hasChildren && !areAllChildrenRecognized)) && item.confirmationStatus !== ConfirmationStatus.RECOGNIZING && (
              <button onClick={() => onRunOCR(item.id)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Run OCR
              </button>
            )}
            {(item.confirmationStatus === ConfirmationStatus.TO_BE_CONFIRMED || item.confirmationStatus === ConfirmationStatus.PARTIALLY_CONFIRMED) && !isChild && (
              <button onClick={() => onReview(item.id)} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all">
                 REVIEW RESULT
              </button>
            )}
            {!isChild && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete([item.id]); }} 
                className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8 space-y-4 animate-in fade-in duration-500 pb-24">
      {/* Upload Config Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">Upload Batch Details</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Set the accounting period for each file</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-white">
              {pendingUploads.map((upload, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-6 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:border-blue-200">
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2v14a2 2 0 002 2z"></path></svg>
                      File {idx + 1}
                    </div>
                    <div className="text-sm font-black text-gray-800 truncate" title={upload.file.name}>{upload.file.name}</div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-28">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Month</label>
                      <select 
                        value={upload.month} 
                        onChange={(e) => updatePendingUpload(idx, { month: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-black focus:ring-4 focus:ring-blue-50 outline-none cursor-pointer"
                      >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Year</label>
                      <select 
                        value={upload.year} 
                        onChange={(e) => updatePendingUpload(idx, { year: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-black focus:ring-4 focus:ring-blue-50 outline-none cursor-pointer"
                      >
                        {years.map(y => <option key={y} value={y}>20{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => removePendingUpload(idx)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove File"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-4">
              <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={handleConfirmUpload} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Start Processing ({pendingUploads.length})</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">
            <h3 className="text-xl font-black text-gray-800 text-center tracking-tight">Confirm Deletion</h3>
            <p className="text-gray-400 text-center mt-6 text-sm font-medium">Are you sure you want to delete {eligibleForDelete.length} item(s)?</p>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 border-2 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest">CANCEL</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100">DELETE</button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" multiple />
      
      <div 
        onClick={() => fileInputRef.current?.click()} 
        className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-8 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 group shadow-sm"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>
        <div className="text-center">
          <h2 className="text-base font-black text-gray-800 tracking-tight">Upload Invoices</h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Supports multiple PDF files for batch processing</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/20">
          <div>
            <h2 className="text-lg font-black text-gray-800 tracking-tight">Invoice Processing Queue</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">MULTI-STAGE WORKFLOW: SPLIT → OCR → CONFIRM → SYNC</p>
          </div>
          <div className="flex gap-3">
             <button disabled={!canDelete} onClick={() => setIsDeleteModalOpen(true)} className="px-6 py-2 rounded-xl text-xs font-black uppercase border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-30">Delete Selected</button>
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[400px]">
          <table className="w-full text-sm text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400">
                <th className="px-8 py-5 w-10 border-b border-gray-50"><input type="checkbox" checked={selectedIds.length === items.length && items.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" /></th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] border-b border-gray-50">Batch Information</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] border-b border-gray-50 text-center">Confirmation Status</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] border-b border-gray-50 text-center">Date</th>
                <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] border-b border-gray-50 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map(parent => {
                const children = childrenMap[parent.id] || [];
                const isExpanded = expandedParentIds.includes(parent.id);
                return (
                  <React.Fragment key={parent.id}>
                    {renderRow(parent)}
                    {isExpanded && children.length > 0 && (
                      <tr className="bg-transparent group/container animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={5} className="p-0">
                          <div className="mx-8 mb-6 mt-2 border-2 border-dashed border-blue-400/50 rounded-2xl overflow-hidden bg-blue-50/5 shadow-inner">
                            <table className="w-full border-collapse">
                              <tbody>
                                {children.map(child => renderRow(child, true))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">No batches currently in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SyncHub;
