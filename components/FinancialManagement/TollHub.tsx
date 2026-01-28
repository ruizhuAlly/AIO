
import React, { useRef } from 'react';
import { SyncStatus } from '../../types';

interface TollItem {
  id: string;
  fileName: string;
  status: SyncStatus;
  date: string;
}

interface TollHubProps {
  items: TollItem[];
  onUpload: (fileName: string) => void;
  onSync: (id: string) => void;
}

const TollHub: React.FC<TollHubProps> = ({ items, onUpload, onSync }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0].name)} 
        className="hidden" 
        accept=".pdf,.jpg,.png" 
      />
      
      {/* Upload area with dotted border */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="bg-white rounded-[2rem] border-2 border-dashed border-blue-200 p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 group"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Upload TOLL Invoices</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Directly sync TOLL receipts to MYOB after upload</p>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/30 border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <th className="px-12 py-8">Receipt Info</th>
              <th className="px-12 py-8 text-center">Status</th>
              <th className="px-12 py-8 text-center">Date</th>
              <th className="px-12 py-8 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-gray-300 font-medium italic">No receipts uploaded yet.</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-12 py-10">
                    <span className="font-black text-gray-800 tracking-tight text-base group-hover:text-blue-600 transition-colors">{item.fileName}</span>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex justify-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                        item.status === SyncStatus.SUCCESS 
                          ? 'bg-green-50 text-green-600 border-green-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {item.status === SyncStatus.SUCCESS ? 'SYNCED' : 'NOT SYNCED'}
                      </span>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-center">
                    <span className="text-sm font-bold text-gray-300">{item.date}</span>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex justify-end">
                      {item.status === SyncStatus.SUCCESS ? (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          SYNCED
                        </div>
                      ) : (
                        <button 
                          onClick={() => onSync(item.id)}
                          className="bg-[#2a6aff] hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-10 py-3.5 rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                          SYNC TO MYOB
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TollHub;
