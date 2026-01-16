import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onCancel} 
      />
      <div className="relative w-full max-w-sm bg-[#16191F] rounded-[32px] p-8 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-1 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[#00db9a]/10 text-[#00db9a]'}`}>
            {isDestructive ? <Trash2 size={36} strokeWidth={1.5} /> : <AlertTriangle size={36} strokeWidth={1.5} />}
          </div>
          
          <h3 className="text-xl font-black text-white mb-2">{title}</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col w-full space-y-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg ${
                isDestructive 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-[#00db9a] text-black shadow-[#00db9a]/20'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-4 rounded-2xl font-black text-sm text-zinc-500 hover:text-white transition-all active:scale-95"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;