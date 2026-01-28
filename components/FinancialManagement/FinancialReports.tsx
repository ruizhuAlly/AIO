
import React from 'react';

const FinancialReports: React.FC = () => {
  const reportCards = [
    {
      title: 'Leasing Expense Analytics',
      description: 'Monthly breakdown of lease categories and confidence metrics.',
      icon: (
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,21H5a2,2,0,0,1-2-2V5A2,2,0,0,1,5,3H19a2,2,0,0,1,2,2V19A2,2,0,0,1,19,21ZM5,5V19H19V5ZM17,17H13V13h4Zm-6,0H7V11h4Zm6-6H13V7h4Zm-6,0H7V7h4Z"/>
          </svg>
        </div>
      )
    },
    {
      title: 'TOLL Usage Summary',
      description: 'Aggregate report of all toll syncs by card and supplier.',
      icon: (
        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100">
          <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21,16.5C21,16.88,20.79,17.21,20.47,17.38L12.57,21.82C12.41,21.94,12.21,22,12,22s-0.41-0.06-0.57-0.18L3.53,17.38C3.21,17.21,3,16.88,3,16.5V7.5C3,7.12,3.21,6.79,3.53,6.62L11.43,2.18C11.59,2.06,11.79,2,12,2s0.41,0.06,0.57,0.18L20.47,6.62C20.79,6.79,21,7.12,21,7.5V16.5Z"/>
          </svg>
        </div>
      )
    },
    {
      title: 'Cross-Module Reconciliation',
      description: 'Match sync history against bank statements.',
      icon: (
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
          <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM13,7H11v6H17V11H13Z"/>
          </svg>
        </div>
      )
    },
    {
      title: 'Reimbursement Audit',
      description: 'Review staff spending patterns and sync accuracy.',
      icon: (
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
          <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2h12a2,2,0,0,0,2-2V8ZM13,9V3.5L18.5,9ZM6,20V4h5V10h6v10Z"/>
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="p-12 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Report Center</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
          SELECT A CATEGORY TO VIEW OR GENERATE DETAILED FINANCIAL REPORTS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {reportCards.map((card, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300"
          >
            {card.icon}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-800 tracking-tight">{card.title}</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{card.description}</p>
            </div>
            <button className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 mt-4 group-hover:gap-3 transition-all">
              VIEW REPORTS
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialReports;
