
import React, { useState } from 'react';
import { ReimbursementItem, ReimbursementStatus } from '../types';
import NewReimbursementDrawer from './NewReimbursementDrawer';

const mockData: ReimbursementItem[] = [
  { requestNo: 'R-BU-260107001', status: ReimbursementStatus.PROCESSING, department: 'Buying', createdDate: '2026-01-07', submittedDate: '2026-01-07', invoiceDate: '2026-01-06', totalAmount: 17.71, currencyType: 'AUD', currentApprover: 'nicole.k' },
  { requestNo: 'R-PR-260107001', status: ReimbursementStatus.PROCESSING, department: 'Production', createdDate: '2026-01-07', submittedDate: '2026-01-07', invoiceDate: '2026-01-06', totalAmount: 19.99, currencyType: 'AUD', currentApprover: 'invoice review (finan...' },
  { requestNo: 'R-WA-260106002', status: ReimbursementStatus.PROCESSING, department: 'WA Region RM', createdDate: '2026-01-06', submittedDate: '2026-01-06', invoiceDate: '2026-01-06', totalAmount: 329, currencyType: 'AUD', currentApprover: 'francis.g' },
  { requestNo: 'R-WA-260105002', status: ReimbursementStatus.PROCESSING, department: 'WA Region RM', createdDate: '2026-01-06', submittedDate: '2026-01-06', invoiceDate: '2026-01-05', totalAmount: 52.6, currencyType: 'AUD', currentApprover: 'francis.g' },
  { requestNo: 'R-VM-260105002', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '2026-01-05', submittedDate: '2026-01-05', invoiceDate: '2026-01-05', totalAmount: 10, currencyType: 'AUD', currentApprover: 'invoice review (finan...' },
  { requestNo: 'R-WA-260105001', status: ReimbursementStatus.PROCESSING, department: 'WA Region RM', createdDate: '2026-01-05', submittedDate: '2026-01-05', invoiceDate: '2025-12-30', totalAmount: 486.28, currencyType: 'AUD', currentApprover: 'francis.g' },
  { requestNo: 'R-BU-260103001', status: ReimbursementStatus.DRAFT, department: 'Buying', createdDate: '2026-01-03', submittedDate: '-', invoiceDate: '2026-01-02', totalAmount: 0.00, currencyType: 'AUD', currentApprover: '-' },
  { requestNo: 'R-HR-260102001', status: ReimbursementStatus.REIMBURSED, department: 'HR', createdDate: '2026-01-02', submittedDate: '2026-01-02', invoiceDate: '2026-01-01', totalAmount: 150.00, currencyType: 'AUD', currentApprover: '-' },
];

const ReimbursementList: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('Please select Status');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const statuses = [
    ReimbursementStatus.DRAFT,
    ReimbursementStatus.REIMBURSING,
    ReimbursementStatus.PROCESSING,
    ReimbursementStatus.REJECTED,
    ReimbursementStatus.REIMBURSED
  ];

  const getStatusColor = (status: ReimbursementStatus) => {
    switch (status) {
      case ReimbursementStatus.DRAFT: return 'bg-gray-100 text-gray-500 border-gray-200';
      case ReimbursementStatus.PROCESSING:
      case ReimbursementStatus.REIMBURSING: return 'bg-blue-50 text-blue-600 border-blue-100';
      case ReimbursementStatus.REJECTED: return 'bg-red-50 text-red-600 border-red-100';
      case ReimbursementStatus.REIMBURSED: return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Request No.</span>
           <input type="text" placeholder="Please input Request No." className="text-sm px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-48" />
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Submitted Date</span>
           <div className="flex items-center gap-1">
             <input type="date" className="text-sm px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
             <span className="text-gray-400">To</span>
             <input type="date" className="text-sm px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
           </div>
        </div>

        <div className="flex items-center gap-2 relative">
           <span className="text-sm text-gray-600">Status</span>
           <button 
             onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
             className="text-sm px-3 py-1.5 border rounded flex items-center justify-between w-48 bg-white hover:border-blue-500 transition-colors"
           >
             <span className={selectedStatus === 'Please select Status' ? 'text-gray-400' : 'text-gray-700'}>{selectedStatus}</span>
             <svg className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
           </button>
           
           {isStatusDropdownOpen && (
             <div className="absolute top-full left-12 mt-1 w-48 bg-white border rounded shadow-lg z-20 overflow-hidden">
               {statuses.map(status => (
                 <button 
                    key={status}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      setSelectedStatus(status);
                      setIsStatusDropdownOpen(false);
                    }}
                 >
                   {status}
                 </button>
               ))}
               <button 
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors border-t"
                  onClick={() => {
                    setSelectedStatus('Please select Status');
                    setIsStatusDropdownOpen(false);
                  }}
               >
                 Clear
               </button>
             </div>
           )}
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             Search
          </button>
          <button className="bg-white text-gray-600 border px-4 py-1.5 rounded text-sm hover:bg-gray-50 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path></svg>
             Reset
          </button>
        </div>
      </div>

      <div className="p-4 flex gap-4">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Reimbursement
        </button>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y text-gray-500 font-medium">
              <th className="p-3 w-8"><input type="checkbox" /></th>
              <th className="p-3">Request No.</th>
              <th className="p-3">Status</th>
              <th className="p-3">Department</th>
              <th className="p-3">Created Date</th>
              <th className="p-3">Submitted Date</th>
              <th className="p-3">Invoice Date</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Currency Type</th>
              <th className="p-3">Current Approver</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50/30 transition-colors group">
                <td className="p-3"><input type="checkbox" /></td>
                <td className="p-3 text-blue-600 font-medium hover:underline cursor-pointer">{item.requestNo}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{item.department}</td>
                <td className="p-3 text-gray-500">{item.createdDate}</td>
                <td className="p-3 text-gray-500">{item.submittedDate}</td>
                <td className="p-3 text-gray-500">{item.invoiceDate}</td>
                <td className="p-3 font-semibold text-gray-700">{item.totalAmount.toFixed(2)}</td>
                <td className="p-3 text-gray-500">{item.currencyType}</td>
                <td className="p-3 text-gray-600 truncate max-w-[120px]">{item.currentApprover}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500">
        <span>Total 8 items</span>
        <div className="flex items-center gap-1">
           <button className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
           <button className="px-2 py-1 bg-blue-600 text-white rounded">1</button>
           <button className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

      {/* Drawer */}
      <NewReimbursementDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default ReimbursementList;
