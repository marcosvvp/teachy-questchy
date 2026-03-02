"use client";

import { Edit2, Play, AlignLeft, List, BarChart, BarChart3, Map } from "lucide-react";
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
            case "Map": return <Map size={24} />;
            case "OpenText":
            default: return <AlignLeft size={24} />;
        }
    };

    const getTypeName = () => {
        switch (question.type) {
            case "MultipleChoice": return "Múltipla Escolha";
            case "Ranking": return "Ranqueamento";
            case "Map": return "Mapa Interativo";
            case "OpenText": return "Texto Aberto";
        }
    };

    return (
        <div className="relative md:aspect-square w-full h-auto min-h-[160px] flex flex-col md:items-center md:justify-center p-4 md:p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>

            <div className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 relative z-10 w-full mb-12 md:mb-0">
                <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center md:mb-4 group-hover:-translate-y-1 transition-transform shadow-sm">
                    {getIcon()}
                </div>
                <div className="flex flex-col md:items-center flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1 md:mb-2 text-left md:text-center line-clamp-2 w-full pr-2 md:px-2">
                        {question.title}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-slate-400 text-left md:text-center w-full">
                        {getTypeName()}
                    </p>
                </div>
            </div>

            {/* Action Buttons - Always visible below content on mobile, hover overlay on desktop */}
            <div className="absolute inset-x-0 bottom-0 top-auto md:top-0 md:bg-white/90 bg-slate-50/90 border-t border-slate-100 md:border-none backdrop-blur-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-around md:justify-center gap-2 md:gap-4 p-3 md:p-0 z-20">
                <button
                    onClick={onEdit}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white md:bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors shadow-sm"
                    title="Editar"
                >
                    <Edit2 size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                    onClick={onPlay}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all shadow-md shadow-blue-600/20"
                    title="Apresentar"
                >
                    <Play size={20} className="md:w-6 md:h-6 ml-1" />
                </button>
                <button
                    onClick={onReport}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white md:bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors shadow-sm"
                    title="Relatórios"
                >
                    <BarChart3 size={18} className="md:w-5 md:h-5" />
                </button>
            </div>
        </div>
    );
}
