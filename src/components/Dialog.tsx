import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  maxWidth?: string;
}

export function Dialog({ isOpen, onClose, children, title, maxWidth = 'max-w-sm' }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-[1] inset-0 bg-black bg-opacity-50 overflow-y-auto">
      <div className="min-h-full w-full flex items-center justify-center p-4">
        <div className={`bg-white dark:bg-[#2c2b2b]  text-black dark:text-white rounded-[20px] w-full ${maxWidth} relative`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 dark:text-white hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <div className="py-9 px-12 text-black dark:text-white">
            <h2 className="text-2xl font-medium mb-4">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}