
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ProcessingBatch, ConfirmationStatus } from '../../types';

interface LineItem {
  id: string;
  name: string;
  taxAmount: string;
  gstAmount: string;
  taxInvoiceAmount: string;
  category: string;
  confidence: number;
  pageIndex: number;
  top: string;
  left: string;
}

interface InvoiceGroup {
  id: string;
  supplierInvoiceNo: string;
  account: string;
  cardName: string;
  startPage: number; 
  lineItems: LineItem[];
  status: ConfirmationStatus;
}

const ACCOUNT_CODE_OPTIONS = [
  '6-6100',
  '6-6200',
  '6-6300',
  '6-6400',
  '6-6500'
];

const EXTERNAL_ACCOUNTS = ['ALLY', 'DDT', 'GRANDLINE'];

interface OcrWorkbenchProps {
  onBack: (isFinal: boolean, shouldSync?: boolean, specificSubFileId?: string) => void;
  fileName: string;
  batchId: string;
  targetScrollId?: string | null;
  allBatches: ProcessingBatch[];
  isReadOnly?: boolean;
}

const OcrWorkbench: React.FC<OcrWorkbenchProps> = ({ onBack, fileName, batchId, targetScrollId, allBatches, isReadOnly = false }) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef<string | null>(null);

  const currentBatch = allBatches.find(b => b.id === batchId);
  const childBatches = allBatches.filter(b => b.parentId === batchId);
  const isParentView = childBatches.length > 0;

  const visiblePages = useMemo(() => {
    if (!isParentView) return [1, 2];
    const totalPages = currentBatch?.pages || 5;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [currentBatch, isParentView]);

  const [invoiceGroups, setInvoiceGroups] = useState<InvoiceGroup[]>([]);

  useEffect(() => {
    const month = currentBatch?.selectedMonth || 'JAN';
    const year = currentBatch?.selectedYear || '26';
    const dateSuffix = `${month}${year}`;

    let groups: InvoiceGroup[] = [];
    if (isParentView) {
      groups = childBatches.map((child, idx) => ({
        id: child.id,
        supplierInvoiceNo: `INV-2026-${(idx + 1).toString().padStart(3, '0')} ${dateSuffix}`,
        account: 'ALLY',
        cardName: `Burwood-Petersham-101-ALLY`,
        startPage: idx * 2,
        status: child.confirmationStatus,
        lineItems: [
          { id: `${child.id}-li1`, name: 'BASE RENTAL', taxAmount: '2000', gstAmount: '200', taxInvoiceAmount: '2200', category: '6-6100', confidence: 95, pageIndex: idx * 2, top: '85%', left: '28%' },
          { id: `${child.id}-li2`, name: 'ELECTRICITY', taxAmount: '145.2', gstAmount: '14.5', taxInvoiceAmount: '159.7', category: '6-6200', confidence: 85, pageIndex: idx * 2, top: '91%', left: '28%' },
        ]
      }));
    } else {
      groups = [{
        id: batchId,
        supplierInvoiceNo: `INV-2026-001 ${dateSuffix}`,
        account: 'ALLY',
        cardName: `Burwood-Petersham-101-ALLY`,
        startPage: 0,
        status: currentBatch?.confirmationStatus || ConfirmationStatus.TO_BE_CONFIRMED,
        lineItems: [
          { id: `li-1`, name: 'BASE RENTAL', taxAmount: '2000', gstAmount: '200', taxInvoiceAmount: '2200', category: '6-6100', confidence: 95, pageIndex: 0, top: '85%', left: '28%' },
          { id: `li-2`, name: 'ELECTRICITY', taxAmount: '145.2', gstAmount: '14.5', taxInvoiceAmount: '159.7', category: '6-6200', confidence: 88, pageIndex: 0, top: '91%', left: '28%' },
        ]
      }];
    }
    setInvoiceGroups(groups);

    if (targetScrollId && hasAutoScrolled.current !== targetScrollId) {
      const groupIdx = groups.findIndex(g => g.id === targetScrollId);
      if (groupIdx !== -1) {
        hasAutoScrolled.current = targetScrollId;
        setTimeout(() => {
          handleInvoiceNumberClick(groups[groupIdx].startPage);
          const groupEl = document.getElementById(`group-${targetScrollId}`);
          if (groupEl) groupEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [batchId, isParentView, childBatches, currentBatch, targetScrollId]);

  const handleInvoiceNumberClick = (startPageIdx: number) => {
    if (pdfScrollRef.current) {
      const pageElements = pdfScrollRef.current.querySelectorAll('.pdf-page-item');
      if (pageElements[startPageIdx]) pageElements[startPageIdx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const updateGroup = (groupIdx: number, updates: Partial<InvoiceGroup>) => {
    if (isReadOnly) return;
    setInvoiceGroups(prev => prev.map((g, i) => i === groupIdx ? { ...g, ...updates } : g));
  };

  const handleCategoryChange = (groupIdx: number, itemIdx: number, newCategory: string) => {
    if (isReadOnly) return;
    const updatedGroups = [...invoiceGroups];
    updatedGroups[groupIdx].lineItems[itemIdx].category = newCategory;
    setInvoiceGroups(updatedGroups);
  };

  const handleIndividualConfirm = (groupIdx: number) => {
    if (isReadOnly) return;
    const group = invoiceGroups[groupIdx];
    const nextStatus = group.status === ConfirmationStatus.CONFIRMED ? ConfirmationStatus.TO_BE_CONFIRMED : ConfirmationStatus.CONFIRMED;
    updateGroup(groupIdx, { status: nextStatus });
    onBack(false, false, group.id);
  };

  const handleConfirmFinalize = () => setShowSyncModal(true);

  const handleModalClose = (shouldSync: boolean) => {
    setShowSyncModal(false);
    onBack(true, shouldSync);
  };

  const calculateTotal = (lineItems: LineItem[]) => {
    return lineItems.reduce((acc, item) => acc + parseFloat(item.taxInvoiceAmount || '0'), 0).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-4 duration-500 overflow-hidden text-gray-800">
      {showSyncModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSyncModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 text-center tracking-tight leading-snug">Confirm All Invoices?</h3>
            <p className="text-gray-500 text-center mt-3 text-xs px-6 leading-relaxed">Selecting 'Confirm' will mark all associated invoices as 'Confirmed'.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSyncModal(false)} className="flex-1 py-3 border rounded-xl text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={() => handleModalClose(true)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">Confirm All</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onBack(false)} 
            className="text-gray-400 hover:text-blue-500 p-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-800 tracking-tight">OCR Recognition Workbench {isReadOnly && <span className="text-orange-500 font-black ml-2 text-[10px] uppercase">(View Only)</span>}</h2>
            <div className="w-[1px] h-3 bg-gray-200"></div>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest pt-0.5">
              REVIEWING: {fileName.toUpperCase()}
            </span>
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="flex gap-3 items-center">
            <button onClick={() => onBack(false)} className="px-6 py-2 border rounded-xl hover:bg-gray-50 text-gray-500 font-bold text-[10px] uppercase tracking-widest transition-all">SAVE DRAFT</button>
            <button 
              onClick={handleConfirmFinalize} 
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              CONFIRM & FINALIZE
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#f8faff]">
        {/* Left Side: PDF Preview */}
        <div className="w-1/2 p-10 overflow-y-auto border-r scroll-smooth bg-[#f8faff]" ref={pdfScrollRef}>
          <div className="max-w-md mx-auto space-y-20 pb-96">
            {visiblePages.map((pageNo, idx) => (
              <div key={pageNo} className="pdf-page-item relative group">
                <div className="absolute -left-12 top-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-all ${idx % 2 === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {pageNo}
                  </span>
                </div>
                
                <div className="aspect-[1/1.41] bg-white shadow-sm rounded-xl p-12 border border-gray-100 relative transition-all group-hover:shadow-lg">
                  <div className="h-full w-full relative select-none">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-12 opacity-30">
                      <div className="text-3xl font-black text-blue-900 italic tracking-tighter uppercase leading-none">INVOICE</div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">PAGE</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">{pageNo.toString().padStart(3, '0')}</p>
                      </div>
                    </div>

                    {invoiceGroups.flatMap(g => g.lineItems)
                      .filter(li => li.pageIndex === idx)
                      .map(li => (
                        <div 
                          key={li.id}
                          style={{ top: li.top, left: li.left }}
                          className={`absolute px-3 py-1.5 rounded transition-all border ${
                            activeItemId === li.id 
                              ? 'bg-blue-600/5 border-blue-500 ring-4 ring-blue-50 z-10 scale-110' 
                              : 'bg-transparent border-transparent'
                          }`}
                        >
                          <div className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                            activeItemId === li.id ? 'text-blue-700' : 'text-transparent'
                          }`}>
                            {li.name}
                          </div>
                        </div>
                      ))}

                    <div className="space-y-6 pt-10 opacity-[0.04]">
                      <div className="h-3 bg-gray-900 rounded w-full"></div>
                      <div className="h-3 bg-gray-900 rounded w-full"></div>
                      <div className="h-3 bg-gray-900 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form View */}
        <div className="w-1/2 p-10 overflow-y-auto bg-white flex flex-col items-center" ref={formScrollRef}>
          <div className="w-full max-w-2xl space-y-16 pb-48">
            {invoiceGroups.map((group, groupIdx) => (
              <div key={group.id} id={`group-${group.id}`} className="space-y-6 animate-in fade-in duration-300 border-b border-gray-100 pb-16 last:border-0 last:pb-0">
                
                {/* 1. Sub-file Settings - Moved to TOP as requested */}
                <div className="bg-[#f8faff] p-6 rounded-[1.5rem] border border-blue-100/50 shadow-sm space-y-5 relative">
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">SUB-FILE SETTINGS</div>
                  
                  <div className="grid grid-cols-2 gap-8 items-center pt-2">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-blue-900/60 uppercase tracking-widest block">External Account</label>
                      <div className={`flex bg-white p-1 rounded-xl border border-gray-100 gap-1 ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
                        {EXTERNAL_ACCOUNTS.map(acc => (
                          <button 
                            key={acc}
                            disabled={isReadOnly}
                            onClick={() => updateGroup(groupIdx, { account: acc, cardName: `Burwood-Petersham-101-${acc}` })}
                            className={`flex-1 py-1.5 text-[9px] rounded-lg transition-all font-black uppercase tracking-tighter ${group.account === acc ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                          >
                            {acc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">MYOB Card Name</label>
                      <div className="w-full font-mono text-xs font-bold text-blue-700/80 bg-white px-4 py-2.5 border border-gray-100 rounded-xl">
                        {group.cardName}
                      </div>
                    </div>
                  </div>

                  {/* 2. Supplier Invoice Info - Compact integration */}
                  <div className="flex items-center gap-4 pt-2 border-t border-blue-100/30">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 px-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Supplier Invoice No.</label>
                        <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black">#0{groupIdx + 1}</span>
                      </div>
                      <input 
                        type="text"
                        value={group.supplierInvoiceNo}
                        readOnly={isReadOnly}
                        onMouseDown={() => handleInvoiceNumberClick(group.startPage)}
                        onChange={(e) => updateGroup(groupIdx, { supplierInvoiceNo: e.target.value })}
                        className="w-full font-mono text-xs font-bold text-blue-800 bg-white px-4 py-2.5 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all shadow-sm"
                      />
                    </div>
                    {isParentView && (
                      <div className="pt-4">
                        <button 
                          onClick={() => handleIndividualConfirm(groupIdx)}
                          className={`text-[9px] font-black px-5 py-2.5 rounded-xl border uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                            group.status === ConfirmationStatus.CONFIRMED 
                              ? 'text-green-600 bg-green-50 border-green-200' 
                              : 'text-blue-600 bg-white border-blue-100 hover:bg-blue-50'
                          }`}
                        >
                          {group.status === ConfirmationStatus.CONFIRMED ? '✓ Confirmed' : 'Confirm'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Line Items Table - MAIN CONTENT */}
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                  <table className="w-full text-left border-separate border-spacing-y-2.5">
                    <thead>
                      <tr className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        <th className="px-4 pb-1">Field</th>
                        <th className="px-4 pb-1 text-center">Tax</th>
                        <th className="px-4 pb-1 text-center">Gst</th>
                        <th className="px-4 pb-1 text-center">Total</th>
                        <th className="px-4 pb-1">Account No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.lineItems.map((item, itemIdx) => {
                        const isFocused = activeItemId === item.id;
                        return (
                          <tr key={item.id} onClick={() => setActiveItemId(item.id)} className={`transition-all cursor-pointer ${isFocused ? 'scale-[1.01] z-10' : ''}`}>
                            <td className={`px-4 py-3.5 bg-gray-50/50 rounded-l-2xl border-y border-l transition-all shadow-sm ${isFocused ? 'border-blue-500 ring-4 ring-blue-50 bg-white' : 'border-gray-50'}`}>
                              <span className={`text-[10px] font-black uppercase tracking-tight ${isFocused ? 'text-blue-600' : 'text-gray-700'}`}>{item.name}</span>
                            </td>
                            <td className={`px-4 py-3.5 bg-gray-50/50 border-y text-center transition-all shadow-sm ${isFocused ? 'border-blue-500 bg-white' : 'border-gray-50'}`}>
                              <div className="font-bold text-gray-600 text-xs">{item.taxAmount}</div>
                            </td>
                            <td className={`px-4 py-3.5 bg-gray-50/50 border-y text-center transition-all shadow-sm ${isFocused ? 'border-blue-500 bg-white' : 'border-gray-50'}`}>
                              <div className="font-bold text-gray-600 text-xs">{item.gstAmount}</div>
                            </td>
                            <td className={`px-4 py-3.5 bg-gray-50/50 border-y text-center transition-all shadow-sm ${isFocused ? 'border-blue-500 bg-white' : 'border-gray-50'}`}>
                              <div className="font-bold text-gray-800 text-xs">{item.taxInvoiceAmount}</div>
                            </td>
                            <td className={`px-4 py-3.5 bg-gray-50/50 rounded-r-2xl border-y border-r transition-all shadow-sm ${isFocused ? 'border-blue-500 ring-4 ring-blue-50 bg-white' : 'border-gray-50'}`}>
                              <select 
                                value={item.category}
                                disabled={isReadOnly}
                                onChange={(e) => handleCategoryChange(groupIdx, itemIdx, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-blue-100/50 border border-blue-100 rounded-lg py-1 px-2 text-[9px] font-black text-blue-600 outline-none hover:bg-white transition-colors cursor-pointer appearance-none text-center"
                              >
                                {ACCOUNT_CODE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Clean, concise Sub Total integrated into the layout */}
                  <div className="mt-4 px-4 py-5 flex items-center justify-between border-t border-gray-100 border-dashed">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">SUB TOTAL</span>
                    <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 font-black text-xs shadow-sm tracking-tight transition-all hover:scale-105">
                      ${calculateTotal(group.lineItems)}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcrWorkbench;
