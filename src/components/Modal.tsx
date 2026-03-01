"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "md" | "lg" | "xl";
    hideHeader?: boolean;
    bottomAction?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = "md", hideHeader, bottomAction }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        md: "max-w-lg",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={bottomAction ? undefined : onClose} />

            <div className={`relative z-10 bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}>
                {!hideHeader && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>

            {bottomAction && (
                <div className="relative z-10 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {bottomAction}
                </div>
            )}
        </div>
    );
}