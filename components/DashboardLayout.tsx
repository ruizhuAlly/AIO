
import React, { useState, useRef, useEffect } from 'react';
import { SidebarMenu, ProcessingBatch, ConfirmationStatus, SyncStatus } from '../types';
import ReimbursementList from './ReimbursementList';
import ApprovalList from './ApprovalList';
import PdfSplitter from './FinancialManagement/PdfSplitter';
import OcrWorkbench from './FinancialManagement/OcrWorkbench';
import SyncHub from './FinancialManagement/SyncHub';
import FinancialReports from './FinancialManagement/FinancialReports';
import TollHub from './FinancialManagement/TollHub';
import SyncToMyob from './FinancialManagement/SyncToMyob';

interface DashboardLayoutProps {
  onLogout: () => void;
  onSwitchModule: () => void;
  moduleType: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout, onSwitchModule, moduleType }) => {
  const isFinancial = moduleType === 'financial';
  const initialMenu = isFinancial ? SidebarMenu.INVOICE_HUB : SidebarMenu.REIMBURSEMENT;
  
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>(initialMenu);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['request', 'fin_hub', 'sync_myob']);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [targetScrollId, setTargetScrollId] = useState<string | null>(null);
  const [isWorkbenchReadOnly, setIsWorkbenchReadOnly] = useState(false);

  const [batches, setBatches] = useState<ProcessingBatch[]>([
    { id: 'BATCH-004', fileName: 'Main_Invoices_Jan.pdf', confirmationStatus: ConfirmationStatus.NOT_RECOGNIZED, syncStatus: SyncStatus.NOT_SYNCED, pages: 12, date: '2026-01-16', isSplit: false, selectedMonth: 'JAN', selectedYear: '26' },
    { id: 'BATCH-013', fileName: 'Spec Sheet.pdf', confirmationStatus: ConfirmationStatus.PARTIALLY_CONFIRMED, syncStatus: SyncStatus.NOT_SYNCED, pages: 14, date: '2026-01-19', isSplit: false, selectedMonth: 'JAN', selectedYear: '26' },
    { id: 'BATCH-013-PART-1', fileName: 'Spec Sheet.pdf', subFileName: 'Spec Sheet_Part_1', confirmationStatus: ConfirmationStatus.CONFIRMED, syncStatus: SyncStatus.NOT_SYNCED, pages: 4, date: '2026-01-19', isSplit: true, parentId: 'BATCH-013', selectedMonth: 'JAN', selectedYear: '26' },
    { id: 'BATCH-013-PART-2', fileName: 'Spec Sheet.pdf', subFileName: 'Spec Sheet_Part_2', confirmationStatus: ConfirmationStatus.TO_BE_CONFIRMED, syncStatus: SyncStatus.NOT_SYNCED, pages: 2, date: '2026-01-19', isSplit: true, parentId: 'BATCH-013', selectedMonth: 'JAN', selectedYear: '26' },
  ]);

  const [tollInvoices, setTollInvoices] = useState<any[]>([
    { id: 'TOLL-001', fileName: 'Toll_Receipt_Jan.pdf', status: SyncStatus.NOT_SYNCED, date: '2026-01-15' }
  ]);

  const handleUpload = (fileName: string, month: string, year: string) => {
    // FIX: Use functional update to avoid race conditions when uploading multiple files
    setBatches(prev => {
      const newBatch: ProcessingBatch = {
        // Use timestamp and a small random string to ensure unique IDs during batch processing
        id: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fileName,
        confirmationStatus: ConfirmationStatus.NOT_RECOGNIZED,
        syncStatus: SyncStatus.NOT_SYNCED,
        pages: Math.floor(Math.random() * 10) + 5,
        date: new Date().toISOString().split('T')[0],
        isSplit: false,
        selectedMonth: month,
        selectedYear: year,
      };
      return [newBatch, ...prev];
    });
  };

  const handleTollUpload = (fileName: string) => {
    const newItem = {
      id: `TOLL-${Date.now()}`,
      fileName,
      status: SyncStatus.NOT_SYNCED,
      date: new Date().toISOString().split('T')[0]
    };
    setTollInvoices(prev => [newItem, ...prev]);
  };

  const handleTollSync = (id: string) => {
    setTollInvoices(prev => prev.map(item => 
      item.id === id ? { ...item, status: SyncStatus.SUCCESS } : item
    ));
  };

  const handleNavigateToSplit = (id: string) => {
    setActiveBatchId(id);
    setActiveMenu(SidebarMenu.PDF_SPLITTER);
  };

  const handleNavigateToOCR = (id: string, readOnly: boolean = false, scrollId?: string) => {
    setActiveBatchId(id);
    setIsWorkbenchReadOnly(readOnly);
    setTargetScrollId(scrollId || null);
    setActiveMenu(SidebarMenu.OCR_WORKBENCH);
  };

  const handleRunOCR = (id: string) => {
    const childrenIds = batches.filter(b => b.parentId === id).map(b => b.id);
    const isParent = childrenIds.length > 0;
    const targetIds = isParent ? childrenIds : [id];

    setBatches(prev => prev.map(b => 
      targetIds.includes(b.id) 
        ? { ...b, confirmationStatus: ConfirmationStatus.RECOGNIZING, ocrProgress: 0 } 
        : (isParent && b.id === id ? { ...b, confirmationStatus: ConfirmationStatus.RECOGNIZING } : b)
    ));

    targetIds.forEach(targetId => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        setBatches(currentBatches => {
          const updated = currentBatches.map(b => {
            if (b.id === targetId) {
              const finished = progress >= 100;
              if (finished) clearInterval(interval);
              return { 
                ...b, 
                ocrProgress: finished ? 100 : progress, 
                confirmationStatus: finished ? ConfirmationStatus.TO_BE_CONFIRMED : ConfirmationStatus.RECOGNIZING 
              };
            }
            return b;
          });
          if (progress >= 100 && isParent) {
            const allSiblingsFinished = updated
              .filter(child => child.parentId === id)
              .every(child => child.confirmationStatus === ConfirmationStatus.TO_BE_CONFIRMED || child.confirmationStatus === ConfirmationStatus.CONFIRMED);
            if (allSiblingsFinished) {
              return updated.map(b => b.id === id ? { ...b, confirmationStatus: ConfirmationStatus.TO_BE_CONFIRMED } : b);
            }
          }
          return updated;
        });
      }, 400);
    });
  };

  const handleSplitConfirm = (subPdfs: {name: string, start: number, end: number}[]) => {
    if (!activeBatchId) return;
    const parentBatch = batches.find(b => b.id === activeBatchId);
    if (!parentBatch) return;

    const newSubBatches: ProcessingBatch[] = subPdfs.map((pdf, idx) => ({
      id: `${activeBatchId}-PART-${idx + 1}-${Date.now()}`,
      fileName: parentBatch.fileName,
      subFileName: pdf.name,
      confirmationStatus: ConfirmationStatus.NOT_RECOGNIZED,
      syncStatus: SyncStatus.NOT_SYNCED,
      pages: (pdf.end - pdf.start) + 1,
      date: parentBatch.date,
      isSplit: true,
      parentId: parentBatch.id,
      selectedMonth: parentBatch.selectedMonth,
      selectedYear: parentBatch.selectedYear,
    }));

    setBatches(prev => {
      const otherFiles = prev.filter(b => b.parentId !== activeBatchId);
      return [...newSubBatches, ...otherFiles];
    });
    setActiveBatchId(null);
    setActiveMenu(SidebarMenu.INVOICE_HUB);
  };

  const handleWorkbenchConfirm = (id: string, isFinal: boolean, shouldSync?: boolean, specificSubFileId?: string) => {
    if (isFinal || (!isFinal && !specificSubFileId)) {
      setActiveBatchId(null);
      setTargetScrollId(null);
      setActiveMenu(SidebarMenu.INVOICE_HUB);
    }
    if (isFinal || specificSubFileId) {
      setBatches(prev => {
        let nextBatches = [...prev];
        if (isFinal) {
          const targetParentId = id;
          nextBatches = nextBatches.map(b => (b.id === targetParentId || b.parentId === targetParentId) ? { ...b, confirmationStatus: ConfirmationStatus.CONFIRMED } : b);
        } else if (specificSubFileId) {
          nextBatches = nextBatches.map(b => b.id === specificSubFileId ? { ...b, confirmationStatus: b.confirmationStatus === ConfirmationStatus.CONFIRMED ? ConfirmationStatus.TO_BE_CONFIRMED : ConfirmationStatus.CONFIRMED } : b);
          const parentId = nextBatches.find(b => b.id === specificSubFileId)?.parentId;
          if (parentId) {
            const children = nextBatches.filter(b => b.parentId === parentId);
            const allConfirmed = children.every(c => c.confirmationStatus === ConfirmationStatus.CONFIRMED);
            const someConfirmed = children.some(c => c.confirmationStatus === ConfirmationStatus.CONFIRMED);
            nextBatches = nextBatches.map(b => b.id === parentId ? { ...b, confirmationStatus: allConfirmed ? ConfirmationStatus.CONFIRMED : someConfirmed ? ConfirmationStatus.PARTIALLY_CONFIRMED : ConfirmationStatus.TO_BE_CONFIRMED } : b);
          }
        }
        return nextBatches;
      });
    }
  };

  const handleActualSync = (ids: string[]) => {
    const targetIds = Array.isArray(ids) ? ids : [ids];
    setBatches(prev => prev.map(b => (targetIds.includes(b.id) || (b.parentId && targetIds.includes(b.parentId))) ? { ...b, syncStatus: SyncStatus.SYNCING } : b));
    setTimeout(() => {
      setBatches(prev => prev.map(b => (targetIds.includes(b.id) || (b.parentId && targetIds.includes(b.parentId))) ? { ...b, syncStatus: SyncStatus.SUCCESS, confirmationStatus: ConfirmationStatus.CONFIRMED } : b));
    }, 1500);
  };

  const handleMoveToSync = (ids: string[]) => {
    const targetIds = Array.isArray(ids) ? ids : [ids];
    setBatches(prev => prev.map(b => (targetIds.includes(b.id) || (b.parentId && targetIds.includes(b.parentId))) ? { ...b, confirmationStatus: ConfirmationStatus.CONFIRMED } : b));
  };

  const handleDeleteBatches = (ids: string[]) => {
    setBatches(prev => prev.filter(b => !ids.includes(b.id)));
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBatch = batches.find(b => b.id === activeBatchId);
  const existingChildren = activeMenu === SidebarMenu.PDF_SPLITTER && activeBatchId 
    ? batches.filter(b => b.parentId === activeBatchId).map(b => ({ name: b.subFileName || '', pages: b.pages })).reverse() : [];

  // FIXED LOGIC: 
  // An item belongs to SYNC only if it is confirmed AND (if it has siblings) ALL of them are confirmed.
  const syncItems = batches.filter(b => {
    if (b.syncStatus === SyncStatus.SUCCESS) return true;
    const parentId = b.parentId || b.id;
    const groupItems = batches.filter(item => item.id === parentId || item.parentId === parentId);
    const children = groupItems.filter(i => !!i.parentId);
    if (children.length > 0) {
      return children.every(c => c.confirmationStatus === ConfirmationStatus.CONFIRMED);
    } else {
      return b.confirmationStatus === ConfirmationStatus.CONFIRMED;
    }
  });

  const hubItems = batches.filter(b => !syncItems.some(si => si.id === b.id));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f5]">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-[#001529] text-white flex flex-col z-40`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <span className={`font-bold text-xl overflow-hidden whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>Store Manage</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {!isFinancial ? (
            <div className="mb-2">
              <button onClick={() => toggleGroup('request')} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#1890ff1a] transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {isSidebarOpen && <span>Request Centre</span>}
                </div>
              </button>
              {isSidebarOpen && expandedGroups.includes('request') && (
                <div className="bg-[#000c17]">
                  <button onClick={() => setActiveMenu(SidebarMenu.REIMBURSEMENT)} className={`w-full text-left pl-14 py-3 transition-colors ${activeMenu === SidebarMenu.REIMBURSEMENT ? 'text-[#1890ff] bg-[#1890ff1a] border-r-4 border-[#1890ff]' : 'text-gray-400 hover:text-white'}`}>Reimbursement</button>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-2">
              <button onClick={() => toggleGroup('fin_hub')} className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#1890ff1a] transition-colors">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  {isSidebarOpen && <span>Financial Centre</span>}
                </div>
                {isSidebarOpen && (
                  <svg className={`w-4 h-4 transition-transform ${expandedGroups.includes('fin_hub') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
              </button>
              {isSidebarOpen && expandedGroups.includes('fin_hub') && (
                <div className="bg-[#000c17] py-1">
                  <button onClick={() => setActiveMenu(SidebarMenu.INVOICE_HUB)} className={`w-full text-left pl-14 py-3 transition-colors ${activeMenu === SidebarMenu.INVOICE_HUB ? 'text-[#1890ff] bg-[#1890ff1a] border-r-4 border-[#1890ff]' : 'text-gray-400 hover:text-white'}`}>Leasing Invoices</button>
                  <div className="relative">
                    <button onClick={() => toggleGroup('sync_myob')} className={`w-full text-left pl-14 py-3 flex items-center justify-between hover:bg-[#1890ff1a] transition-colors ${activeMenu === SidebarMenu.SYNC_TO_MYOB_LEASING || activeMenu === SidebarMenu.SYNC_TO_MYOB_REIMBURSEMENT ? 'text-[#1890ff]' : 'text-gray-400 hover:text-white'}`}>
                      <span>Sync to MYOB</span>
                      <svg className={`w-3 h-3 mr-4 transition-transform ${expandedGroups.includes('sync_myob') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {expandedGroups.includes('sync_myob') && (
                      <div className="bg-[#001020]">
                        <button onClick={() => setActiveMenu(SidebarMenu.SYNC_TO_MYOB_LEASING)} className={`w-full text-left pl-20 py-2.5 transition-colors text-xs ${activeMenu === SidebarMenu.SYNC_TO_MYOB_LEASING ? 'text-[#1890ff] bg-[#1890ff0d] border-r-4 border-[#1890ff]' : 'text-gray-500 hover:text-white'}`}>Leasing</button>
                        <button onClick={() => setActiveMenu(SidebarMenu.SYNC_TO_MYOB_REIMBURSEMENT)} className={`w-full text-left pl-20 py-2.5 transition-colors text-xs ${activeMenu === SidebarMenu.SYNC_TO_MYOB_REIMBURSEMENT ? 'text-[#1890ff] bg-[#1890ff0d] border-r-4 border-[#1890ff]' : 'text-gray-500 hover:text-white'}`}>Reimbursement</button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveMenu(SidebarMenu.TOLL_HUB)} className={`w-full text-left pl-14 py-3 transition-colors ${activeMenu === SidebarMenu.TOLL_HUB ? 'text-[#1890ff] bg-[#1890ff1a] border-r-4 border-[#1890ff]' : 'text-gray-400 hover:text-white'}`}>TOLL Invoices</button>
                  <button onClick={() => setActiveMenu(SidebarMenu.REPORTS_CENTER)} className={`w-full text-left pl-14 py-3 transition-colors ${activeMenu === SidebarMenu.REPORTS_CENTER ? 'text-[#1890ff] bg-[#1890ff1a] border-r-4 border-[#1890ff]' : 'text-gray-400 hover:text-white'}`}>Reports Center</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
             </button>
             <div className="flex items-center text-sm text-gray-400 gap-2">
                <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => setActiveMenu(initialMenu)}>Home</span>
                <span>/</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">{isFinancial ? 'Financial Management' : 'Request Centre'}</span>
                <span>/</span>
                <span className="text-gray-800 font-bold tracking-tight uppercase text-[10px]">{activeMenu.replace('_', ' ')}</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative" ref={userDropdownRef}>
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border shadow-inner">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" className="w-full h-full object-cover" />
                 </div>
                 <span className="text-sm font-semibold text-gray-700">admin</span>
                 <svg className={`w-4 h-4 transition-transform text-gray-400 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                  <button onClick={() => { setIsUserDropdownOpen(false); onSwitchModule(); }} className="w-full text-left px-5 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium">Switch Module</button>
                  <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t transition-colors">Personal Center</button>
                  <button onClick={() => { setIsUserDropdownOpen(false); onLogout(); }} className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t transition-colors">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-[#f0f2f5] relative">
          <div className="min-h-full">
            {activeMenu === SidebarMenu.REIMBURSEMENT && <ReimbursementList />}
            {activeMenu === SidebarMenu.REPORTS_CENTER && <FinancialReports />}
            {activeMenu === SidebarMenu.TOLL_HUB && (
              <TollHub 
                items={tollInvoices} 
                onUpload={handleTollUpload}
                onSync={handleTollSync}
              />
            )}
            {activeMenu === SidebarMenu.INVOICE_HUB && (
              <SyncHub 
                onSplit={handleNavigateToSplit}
                onRunOCR={handleRunOCR}
                onReview={handleNavigateToOCR}
                onSyncToMyob={(id) => handleMoveToSync([id])}
                onDelete={handleDeleteBatches}
                onBulkSync={handleMoveToSync}
                onQuickConfirm={(subId) => handleWorkbenchConfirm(subId, false, false, subId)}
                items={hubItems} 
                onUpload={handleUpload} 
              />
            )}
            {activeMenu === SidebarMenu.SYNC_TO_MYOB_LEASING && (
              <SyncToMyob 
                items={syncItems}
                onSync={handleActualSync}
                onDelete={handleDeleteBatches}
              />
            )}
            {activeMenu === SidebarMenu.SYNC_TO_MYOB_REIMBURSEMENT && (
              <ApprovalList type="sync" />
            )}
            {activeMenu === SidebarMenu.PDF_SPLITTER && (
              <PdfSplitter 
                onBack={() => { setActiveBatchId(null); setActiveMenu(SidebarMenu.INVOICE_HUB); }} 
                onConfirmSplit={handleSplitConfirm} 
                sourceFileName={activeBatch?.fileName || "Unknown.pdf"}
                totalPages={activeBatch?.pages || 12}
                initialSubPdfs={existingChildren}
              />
            )}
            {activeMenu === SidebarMenu.OCR_WORKBENCH && (
              <OcrWorkbench 
                onBack={(isFinal, shouldSync, subId) => handleWorkbenchConfirm(activeBatchId!, isFinal, shouldSync, subId)} 
                fileName={activeBatch?.subFileName || activeBatch?.fileName || "Unknown.pdf"}
                batchId={activeBatchId!}
                targetScrollId={targetScrollId}
                allBatches={batches}
                isReadOnly={isWorkbenchReadOnly}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
