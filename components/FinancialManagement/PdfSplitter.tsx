
import React, { useState, useEffect, useRef } from 'react';

interface SubPdf {
  name: string;
  start: number;
  end: number;
}

interface PdfSplitterProps {
  onBack: () => void;
  onConfirmSplit: (subPdfs: SubPdf[]) => void;
  sourceFileName: string;
  totalPages?: number;
  initialSubPdfs?: { name: string; pages: number }[];
}

const PdfSplitter: React.FC<PdfSplitterProps> = ({ 
  onBack, 
  onConfirmSplit, 
  sourceFileName, 
  totalPages = 12,
  initialSubPdfs = []
}) => {
  const [pages, setPages] = useState<number[]>(Array.from({ length: totalPages }, (_, i) => i + 1));
  const [splitPoints, setSplitPoints] = useState<number[]>([]); 
  const [selectedSplitId, setSelectedSplitId] = useState<number | null>(0);
  const [subPdfs, setSubPdfs] = useState<SubPdf[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // 用于追踪是否正在初始化，避免在加载初始计划时触发自动命名逻辑
  const isInitializing = useRef(true);

  // 初始化：从已有子文件还原分割点和名称
  useEffect(() => {
    if (initialSubPdfs && initialSubPdfs.length > 0) {
      const points: number[] = [];
      const reconstructed: SubPdf[] = [];
      let currentIdx = -1;
      let startVal = 1;

      initialSubPdfs.forEach((p, i) => {
        const endVal = startVal + p.pages - 1;
        reconstructed.push({
          name: p.name,
          start: startVal,
          end: endVal
        });
        
        // 分割点是页面的索引位置（0 到 n-2）
        if (i < initialSubPdfs.length - 1) {
          currentIdx += p.pages;
          points.push(currentIdx);
        }
        startVal += p.pages;
      });

      setSplitPoints(points);
      setSubPdfs(reconstructed);
    }
    
    // 延迟结束初始化状态，确保第一个计算周期能正确处理
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, [initialSubPdfs]);

  // 核心逻辑：当分割点变化时，重新计算区间，并尽可能保留名称
  useEffect(() => {
    if (isInitializing.current || pages.length === 0) return;
    
    const results: SubPdf[] = [];
    let startIdx = 0;
    const sortedPoints = [...splitPoints].sort((a, b) => a - b);
    const baseName = sourceFileName.replace(/\.[^/.]+$/, "");
    
    sortedPoints.forEach((pointIdx, index) => {
      // 尝试保留对应位置现有的名称
      const existingName = subPdfs[index]?.name;
      results.push({ 
        name: existingName || `${baseName}_Part_${index + 1}`, 
        start: pages[startIdx], 
        end: pages[pointIdx] 
      });
      startIdx = pointIdx + 1;
    });
    
    // 处理最后一个区间
    const lastExistingName = subPdfs[results.length]?.name;
    results.push({ 
      name: lastExistingName || `${baseName}_Part_${results.length + 1}`, 
      start: pages[startIdx], 
      end: pages[pages.length - 1] 
    });
    
    setSubPdfs(results);
  }, [splitPoints, sourceFileName, pages]);

  const toggleSplit = (index: number) => {
    setSplitPoints(prev => 
      prev.includes(index) ? prev.filter(p => p !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const deletePage = (pageNumber: number) => {
    const pageIndex = pages.indexOf(pageNumber);
    if (pageIndex === -1) return;

    const newPages = pages.filter(p => p !== pageNumber);
    const newSplitPoints = splitPoints
      .filter(p => p !== pageIndex)
      .map(p => p > pageIndex ? p - 1 : p)
      .filter(p => p < newPages.length - 1);

    setPages(newPages);
    setSplitPoints(newSplitPoints);
  };

  const handleRename = (index: number, newName: string) => {
    const updated = [...subPdfs];
    if (updated[index]) {
      updated[index].name = newName;
      setSubPdfs(updated);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-8 duration-500">
      {/* 顶部工具栏 */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} title="Back to Hub (Cancel)" className="text-gray-400 hover:text-blue-500 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Split PDF</h2>
            <div className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 text-[10px] font-black text-gray-500 uppercase">
              {sourceFileName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase">Cancel</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：页面预览与分割操作 */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#f8faff]">
          {pages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
               <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <p className="font-black uppercase tracking-widest text-xs">All pages removed</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-4 gap-y-16 gap-x-12 relative">
              {pages.map((page, idx) => {
                const isSplitPoint = splitPoints.includes(idx);
                const currentSubPdf = subPdfs.find(pdf => page >= pdf.start && page <= pdf.end);
                const belongsToSelected = selectedSplitId !== null && currentSubPdf === subPdfs[selectedSplitId];

                return (
                  <div key={`page-${page}`} className="relative group">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePage(page); }}
                      className="absolute -top-3 -right-3 w-7 h-7 bg-white rounded-full border border-red-100 text-red-400 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-30"
                      title="Remove Page"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    <div className="flex flex-col items-center gap-3">
                      <div 
                        onClick={() => {
                          const targetIdx = subPdfs.indexOf(currentSubPdf!);
                          setSelectedSplitId(targetIdx);
                        }}
                        className={`w-full aspect-[1/1.4] bg-white rounded-xl shadow-sm border-2 transition-all p-3 flex flex-col cursor-pointer hover:shadow-2xl ${belongsToSelected ? 'border-blue-500 ring-8 ring-blue-50 shadow-xl -translate-y-1' : 'border-transparent hover:border-blue-200'}`}
                      >
                         <div className="flex-1 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                           <div className="w-full h-full p-4 space-y-3 opacity-10 grayscale">
                              <div className="h-2 bg-gray-400 w-3/4 rounded-full"></div>
                              <div className="flex-1 bg-gray-300 rounded-md"></div>
                              <div className="h-2 bg-gray-400 w-1/2 rounded-full"></div>
                           </div>
                         </div>
                         <div className={`mt-3 text-center text-[10px] font-black py-2 rounded-lg transition-colors uppercase ${belongsToSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                           Page {page}
                         </div>
                      </div>
                    </div>

                    {idx < pages.length - 1 && (
                      <div className={`absolute -right-6 top-0 bottom-0 flex items-center justify-center z-10 ${ (idx + 1) % 4 === 0 ? 'hidden' : '' }`}>
                        <div className={`h-full border-l-2 transition-all ${isSplitPoint ? 'border-blue-500' : 'border-blue-200 border-dashed opacity-40 group-hover:opacity-100'}`}></div>
                        <button 
                          onClick={() => toggleSplit(idx)}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-125 z-20 ${isSplitPoint ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white text-blue-300 hover:text-blue-600 hover:border-blue-500 border'}`}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                             <circle cx="6" cy="6" r="3" />
                             <circle cx="6" cy="18" r="3" />
                             <line x1="20" y1="4" x2="8.12" y2="15.88" />
                             <line x1="14.47" y1="14.48" x2="20" y2="20" />
                             <line x1="8.12" y1="8.12" x2="12" y2="12" />
                           </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧：生成的子文件列表 */}
        <div className="w-80 bg-white border-l flex flex-col shadow-xl z-20">
          <div className="p-6 border-b flex items-center justify-between bg-gray-50/30">
            <h3 className="font-black text-gray-700 text-sm tracking-tight uppercase">GENERATED PARTS</h3>
            <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-md">{subPdfs.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {subPdfs.map((pdf, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedSplitId(idx)}
                className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 relative group/item ${selectedSplitId === idx ? 'bg-white border-blue-500 shadow-lg ring-1 ring-blue-500' : 'border-transparent hover:bg-gray-50'}`}
              >
                {selectedSplitId === idx && <div className="absolute inset-1 border-2 border-dashed border-blue-400/40 rounded-xl pointer-events-none"></div>}
                <div className="flex items-start gap-3 relative z-10">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedSplitId === idx ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-col">
                      {editingId === idx ? (
                        <input 
                          autoFocus
                          type="text"
                          value={pdf.name}
                          onChange={(e) => handleRename(idx, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                          className="w-full bg-white border border-blue-300 rounded px-2 py-0.5 text-xs font-black text-gray-800 focus:outline-none ring-2 ring-blue-100"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-black text-gray-800 truncate tracking-tight uppercase cursor-text" onClick={(e) => { e.stopPropagation(); setEditingId(idx); }}>{pdf.name}</div>
                          <button onClick={(e) => { e.stopPropagation(); setEditingId(idx); }} className="opacity-0 group-hover/item:opacity-100 text-blue-400 transition-all">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                        </div>
                      )}
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">PAGES: {pdf.start} - {pdf.end}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t bg-gray-50/30">
            <button 
              disabled={subPdfs.length === 0}
              onClick={() => onConfirmSplit(subPdfs)}
              className="w-full py-4 bg-[#0a1529] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-20"
            >
              CONFIRM SPLIT SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSplitter;
