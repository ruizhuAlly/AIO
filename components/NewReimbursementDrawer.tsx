
import React, { useState } from 'react';

interface NewReimbursementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewReimbursementDrawer: React.FC<NewReimbursementDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([{ id: 1 }]);

  const addItem = () => {
    setItems([...items, { id: items.length + 1 }]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl transition-transform duration-300 ease-out z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-hidden flex flex-col`}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">New Reimbursement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center">
                <span className="text-red-500 mr-1">*</span> Department
              </label>
              <select className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50">
                <option>Development</option>
                <option>Sales</option>
                <option>HR</option>
                <option>Buying</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center">
                <span className="text-red-500 mr-1">*</span> GST Inclusive
              </label>
              <select className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50">
                <option>Select</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg bg-gray-50 relative">
                <div className="absolute top-4 left-4 font-bold text-gray-400">Item {index + 1}</div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">* Expense Category</label>
                    <select className="w-full p-2 border rounded text-sm bg-white">
                      <option>Select</option>
                      <option>Travel</option>
                      <option>Meals</option>
                      <option>Supplies</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">* Invoice Date</label>
                    <input type="date" className="w-full p-2 border rounded text-sm bg-white" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                    <textarea rows={2} className="w-full p-2 border rounded text-sm bg-white" placeholder="Optional remark" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">* Currency Type</label>
                    <select className="w-full p-2 border rounded text-sm bg-white">
                      <option>AUD</option>
                      <option>USD</option>
                      <option>CNY</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">* Amount</label>
                    <input type="number" defaultValue={0} className="w-full p-2 border rounded text-sm bg-white" />
                  </div>
                  <div className="col-span-2 space-y-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase">Invoice Attachment</label>
                     <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-colors cursor-pointer bg-white">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span className="text-xs text-gray-400 mt-2">JPEG files are not allowed. Maximum file size: 3 MB</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-blue-200 rounded-lg text-blue-500 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add More Items
          </button>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 border rounded hover:bg-white text-sm transition-colors">Cancel</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shadow-md transition-colors">Submit</button>
        </div>
      </div>
    </>
  );
};

export default NewReimbursementDrawer;
