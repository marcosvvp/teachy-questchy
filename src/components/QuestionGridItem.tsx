"use client";

import { Edit2, Play, AlignLeft, List, BarChart, BarChart3 } from "lucide-react";
import { Question } from "@/types/question";

interface QuestionGridItemProps {
    question: Question;
    onEdit: () => void;
    onPlay: () => void;
    onReport: () => void;
}

export function QuestionGridItem({ question, onEdit, onPlay, onReport }: QuestionGridItemProps) {
    const getIcon = () => {
        switch (question.type) {
            case "MultipleChoice": return <List size={24} />;
            case "Ranking": return <BarChart size={24} />;
            case "OpenText":
            default: return <AlignLeft size={24} />;
        }
    };

    const getTypeName = () => {
        switch (question.type) {
            case "MultipleChoice": return "Múltipla Escolha";
            case "Ranking": return "Ranqueamento";
            case "OpenText": return "Texto Aberto";
        }
    };

    return (
        <div className="relative aspect-square flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>

            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform relative z-10 shadow-sm">
                {getIcon()}
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2 text-center line-clamp-2 relative z-10 w-full px-2">
                {question.title}
            </h3>
            <p className="text-sm font-medium text-slate-400 relative z-10">
                {getTypeName()}
            </p>

            {/* Hover Overlay with Buttons */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
                <button
                    onClick={onEdit}
                    className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors shadow-sm"
                    title="Editar"
                >
                    <Edit2 size={20} />
                </button>
                <button
                    onClick={onPlay}
                    className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all shadow-md shadow-blue-600/20"
                    title="Apresentar"
                >
                    <Play size={24} className="ml-1" />
                </button>
                <button
                    onClick={onReport}
                    className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors shadow-sm"
                    title="Relatórios"
                >
                    <BarChart3 size={20} />
                </button>
            </div>
        </div>
    );
}
