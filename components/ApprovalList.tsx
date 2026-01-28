
import React from 'react';
import { ReimbursementItem, ReimbursementStatus } from '../types';

interface ApprovalListProps {
  type: 'all' | 'sync';
}

const ApprovalList: React.FC<ApprovalListProps> = ({ type }) => {
  const mockApprovals: ReimbursementItem[] = [
    { requestNo: 'R-BU-251222001', requester: 'Rebekah Meklejohn', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '-', submittedDate: '2025-12-22', invoiceDate: '2025-12-22', totalAmount: 79, currencyType: 'AUD' },
    { requestNo: 'R-BU-251222002', requester: 'Rebekah Meklejohn', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '-', submittedDate: '2025-12-22', invoiceDate: '2025-12-22', totalAmount: 35, currencyType: 'AUD' },
    { requestNo: 'R-BU-251222003', requester: 'Rebekah Meklejohn', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '-', submittedDate: '2025-12-22', invoiceDate: '2025-12-22', totalAmount: 84.59, currencyType: 'AUD' },
    { requestNo: 'R-BU-251222004', requester: 'Rebekah Meklejohn', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '-', submittedDate: '2025-12-22', invoiceDate: '2025-12-22', totalAmount: 120, currencyType: 'AUD' },
    { requestNo: 'R-BU-251222005', requester: 'Rebekah Meklejohn', status: ReimbursementStatus.PROCESSING, department: 'VM', createdDate: '-', submittedDate: '2025-12-22', invoiceDate: '2025-12-22', totalAmount: 120, currencyType: 'AUD' },
  ];

  if (type === 'sync') {
    // Add "Synced" status for Sync to Myob view
    mockApprovals.forEach(m => m.status = ReimbursementStatus.SYNCED);
  }

  const getStatusColor = (status: ReimbursementStatus) => {
    switch (status) {
      case ReimbursementStatus.PROCESSING: return 'bg-blue-50 text-blue-600 border-blue-100';
      case ReimbursementStatus.SYNCED: return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Request No.</span>
           <input type="text" placeholder="Please input Request No." className="text-sm px-3 py-1.5 border rounded w-48" />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-600">Submitted Date</span>
           <div className="flex items-center gap-1">
             <input type="date" className="text-sm px-3 py-1.5 border rounded" />
             <span className="text-gray-400">To</span>
             <input type="date" className="text-sm px-3 py-1.5 border rounded" />
           </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">Search</button>
        <button className="bg-white text-gray-600 border px-4 py-1.5 rounded text-sm hover:bg-gray-50">Reset</button>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 mt-4">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y text-gray-500 font-medium">
              <th className="p-3 w-8"><input type="checkbox" /></th>
              <th className="p-3">Request No.</th>
              <th className="p-3">Requester</th>
              <th className="p-3">Department</th>
              <th className="p-3">Invoice Date</th>
              <th className="p-3">Submitted Date</th>
              {type === 'sync' && <th className="p-3">Approval Date</th>}
              <th className="p-3">{type === 'sync' ? 'Sync Status' : 'Approval Status'}</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Currency Type</th>
            </tr>
          </thead>
          <tbody>
            {mockApprovals.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50/30 transition-colors">
                <td className="p-3"><input type="checkbox" /></td>
                <td className="p-3 text-blue-600 font-medium cursor-pointer">{item.requestNo}</td>
                <td className="p-3 text-gray-700">{item.requester}</td>
                <td className="p-3 text-gray-600">{item.department}</td>
                <td className="p-3 text-gray-500">{item.invoiceDate}</td>
                <td className="p-3 text-gray-500">{item.submittedDate}</td>
                {type === 'sync' && <td className="p-3 text-gray-500">2026-01-02</td>}
                <td className="p-3">
                   <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 font-semibold text-gray-700">{item.totalAmount.toFixed(2)}</td>
                <td className="p-3 text-gray-500">{item.currencyType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalList;
