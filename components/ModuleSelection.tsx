
import React from 'react';

interface ModuleSelectionProps {
  onSelect: (id: string) => void;
}

const ModuleSelection: React.FC<ModuleSelectionProps> = ({ onSelect }) => {
  const modules = [
    {
      id: 'store',
      title: 'Store Management',
      color: 'bg-red-50',
      icon: (
        <div className="bg-red-100 p-4 rounded-lg">
           <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,3,7V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V7A1,1,0,0,0,20,6ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10ZM19,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V8H19Z"/></svg>
        </div>
      )
    },
    {
      id: 'reimbursement',
      title: 'Reimbursement Management',
      color: 'bg-blue-50',
      icon: (
        <div className="bg-blue-100 p-4 rounded-lg">
           <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M14,17H7a1,1,0,0,1,0-2h7a1,1,0,0,1,0,2Zm3-4H7a1,1,0,0,1,0-2H17a1,1,0,0,1,0,2Zm0-4H7A1,1,0,0,1,7,7H17a1,1,0,0,1,0,2ZM19,3H5A3,3,0,0,0,2,6V18a3,3,0,0,0,3,3H19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V6A3,3,0,0,0,19,3Zm1,15a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V6A1,1,0,0,1,5,5H19a1,1,0,0,1,1,1Z"/></svg>
        </div>
      )
    },
    {
      id: 'financial',
      title: 'Financial Management',
      color: 'bg-green-50',
      icon: (
        <div className="bg-green-100 p-4 rounded-lg">
           <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
           </svg>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Admin Settings',
      color: 'bg-gray-50',
      icon: (
        <div className="bg-gray-100 p-4 rounded-lg">
           <svg className="w-12 h-12 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19.91,15.51,20.8,17a1,1,0,0,1-.37,1.36l-1.45.84a1,1,0,0,1-1.36-.37l-.89-1.55a6.74,6.74,0,0,1-1.41.34L15,19.37a1,1,0,0,1-1,.84H12.2a1,1,0,0,1-1-.84l-.32-1.75a6.74,6.74,0,0,1-1.41-.34L8.58,18.83a1,1,0,0,1-1.36.37l-1.45-.84a1,1,0,0,1-.37-1.36l.89-1.55a6.74,6.74,0,0,1-.34-1.41L4.2,13.72a1,1,0,0,1-.84-1V11.28a1,1,0,0,1,.84-1l1.75-.32a6.74,6.74,0,0,1,.34-1.41L5.4,7.1a1,1,0,0,1,.37-1.36L7.22,4.9a1,1,0,0,1,1.36.37l.89,1.55A6.74,6.74,0,0,1,10.88,6.48L11.2,4.73a1,1,0,0,1,1-.84h1.8a1,1,0,0,1,1,.84l.32,1.75a6.74,6.74,0,0,1,1.41.34l1.55-1a1,1,0,0,1,1.36-.37l1.45.84a1,1,0,0,1,.37,1.36l-.89,1.55a6.74,6.74,0,0,1,.34,1.41l1.75.32a1,1,0,0,1,.84,1V13.82a1,1,0,0,1-.84,1ZM12.2,12a1,1,0,0,0,0,2H11.8a1,1,0,0,0,0-2Z"/></svg>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onSelect(mod.id)}
            className="group relative flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-blue-200"
          >
            <div className={`w-24 h-24 mb-6 rounded-2xl ${mod.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              {mod.icon}
            </div>
            <span className="text-xl font-semibold text-gray-700">{mod.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelection;
