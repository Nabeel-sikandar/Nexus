import React, { useState, useRef } from 'react';
import {
  FileText, Upload, Download, Trash2, Share2,
  PenTool, Eye, CheckCircle, Clock, Edit3, X, Check
} from 'lucide-react';

type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocStatus;
}

const statusConfig: Record<DocStatus, { color: string; icon: React.ReactNode }> = {
  'Draft':     { color: 'bg-gray-100 text-gray-600',   icon: <Edit3 size={12} /> },
  'In Review': { color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
  'Signed':    { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
};

const initialDocs: Document[] = [
  { id: 1, name: 'Pitch Deck 2024.pdf',         type: 'PDF',         size: '2.4 MB', lastModified: '2024-02-15', shared: true,  status: 'Signed' },
  { id: 2, name: 'Financial Projections.xlsx',  type: 'Spreadsheet', size: '1.8 MB', lastModified: '2024-02-10', shared: false, status: 'In Review' },
  { id: 3, name: 'Business Plan.docx',          type: 'Document',    size: '3.2 MB', lastModified: '2024-02-05', shared: true,  status: 'Draft' },
  { id: 4, name: 'Market Research.pdf',         type: 'PDF',         size: '5.1 MB', lastModified: '2024-01-28', shared: false, status: 'Draft' },
  { id: 5, name: 'Investment Agreement.pdf',    type: 'PDF',         size: '1.1 MB', lastModified: '2024-01-20', shared: true,  status: 'In Review' },
];

export const DocumentChamberPage: React.FC = () => {
  const [docs, setDocs]                   = useState<Document[]>(initialDocs);
  const [activeFilter, setActiveFilter]   = useState<DocStatus | 'All'>('All');
  const [signModal, setSignModal]         = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc]       = useState<Document | null>(null);
  const [isSigning, setIsSigning]         = useState(false);
  const [hasSigned, setHasSigned]         = useState(false);
  const [toast, setToast]                 = useState('');
  const [dragOver, setDragOver]           = useState(false);
  const canvasRef                         = useRef<HTMLCanvasElement>(null);
  const isDrawing                         = useRef(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = activeFilter === 'All' ? docs : docs.filter(d => d.status === activeFilter);

  const updateStatus = (id: number, status: DocStatus) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    showToast(`Status updated to "${status}"`);
  };

  const deleteDoc = (id: number) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    showToast('Document deleted.');
  };

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : file.type.includes('sheet') ? 'Spreadsheet' : 'Document',
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        lastModified: new Date().toISOString().split('T')[0],
        shared: false,
        status: 'Draft',
      };
      setDocs(prev => [newDoc, ...prev]);
    });
    showToast('Document uploaded successfully!');
  };

  // Canvas drawing
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSigned(false);
  };

  const applySignature = () => {
    if (!signModal || !hasSigned) { showToast('Please draw your signature first.'); return; }
    updateStatus(signModal.id, 'Signed');
    setSignModal(null);
    setHasSigned(false);
    clearCanvas();
    showToast('Document signed successfully! ✅');
  };

  const counts = {
    All: docs.length,
    Draft: docs.filter(d => d.status === 'Draft').length,
    'In Review': docs.filter(d => d.status === 'In Review').length,
    Signed: docs.filter(d => d.status === 'Signed').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <Check size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-sm text-gray-500 mt-1">Manage deals, contracts, and important files</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={16} /> Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Storage */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Storage</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Used</span><span className="font-medium">12.5 GB</span></div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }}></div></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Available</span><span className="font-medium">7.5 GB</span></div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Filter by Status</h3>
            <div className="space-y-1">
              {(['All', 'Draft', 'In Review', 'Signed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeFilter === f ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>{f}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activeFilter === f ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} className={`mx-auto mb-2 ${dragOver ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="text-xs text-gray-500">Drop files here or <span className="text-primary-600 font-medium">browse</span></p>
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {activeFilter === 'All' ? 'All Documents' : activeFilter} <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
              </h2>
            </div>

            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400">No documents in this category.</div>
            )}

            <div className="divide-y divide-gray-50">
              {filtered.map(doc => (
                <div key={doc.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-primary-50 rounded-lg mr-4 flex-shrink-0">
                    <FileText size={22} className="text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                      {doc.shared && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Shared</span>
                      )}
                      {/* Status Badge */}
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[doc.status].color}`}>
                        {statusConfig[doc.status].icon}
                        {doc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{doc.type}</span><span>{doc.size}</span><span>Modified {doc.lastModified}</span>
                    </div>
                  </div>

                  {/* Status change */}
                  <select
                    value={doc.status}
                    onChange={e => updateStatus(doc.id, e.target.value as DocStatus)}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 mr-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-600"
                  >
                    <option>Draft</option>
                    <option>In Review</option>
                    <option>Signed</option>
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-1">
                    <button onClick={() => setPreviewDoc(doc)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Preview">
                      <Eye size={17} />
                    </button>
                    <button onClick={() => { setSignModal(doc); setHasSigned(false); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="E-Sign">
                      <PenTool size={17} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                      <Download size={17} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                      <Share2 size={17} />
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 truncate">{previewDoc.name}</h2>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-100 rounded-xl h-52 flex flex-col items-center justify-center gap-3">
                <FileText size={48} className="text-gray-400" />
                <p className="text-sm text-gray-500">Document preview</p>
                <p className="text-xs text-gray-400">{previewDoc.type} · {previewDoc.size}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Status</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[previewDoc.status].color}`}>{previewDoc.status}</span>
                </div>
                <div><span className="text-gray-500">Modified</span><span className="ml-2 font-medium">{previewDoc.lastModified}</span></div>
                <div><span className="text-gray-500">Size</span><span className="ml-2 font-medium">{previewDoc.size}</span></div>
                <div><span className="text-gray-500">Type</span><span className="ml-2 font-medium">{previewDoc.type}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setSignModal(previewDoc); setPreviewDoc(null); setHasSigned(false); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <PenTool size={15} /> Sign Document
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Download size={15} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {signModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">E-Signature</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{signModal.name}</p>
              </div>
              <button onClick={() => setSignModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <PenTool size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Draw your signature in the box below. This will be applied to the document.</span>
              </div>

              {/* Signature Pad */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={160}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{hasSigned ? '✅ Signature drawn' : 'Draw your signature above'}</p>
                <button onClick={clearCanvas} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear</button>
              </div>

              {/* Signing status toggle */}
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isSigning} onChange={e => setIsSigning(e.target.checked)} className="rounded" />
                  <span className="text-gray-600">I agree to sign this document electronically</span>
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setSignModal(null)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={applySignature}
                  disabled={!hasSigned || !isSigning}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${hasSigned && isSigning ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <CheckCircle size={16} /> Apply Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};