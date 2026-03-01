"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";

export default function StudentEnterCodePage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCode = code.replace(/\s/g, "");
        if (cleanCode.length >= 6 && name.trim().length > 0) {
            localStorage.setItem("teachy_student_name", name.trim());
            router.push(`/q/${cleanCode}`);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <KeyRound size={32} />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-800 mb-3 text-center">
                Digite seu Código
            </h1>
            <p className="text-slate-500 mb-8 text-center max-w-sm">
                Insira o código de 6 dígitos fornecido pelo seu professor para acessar a questão.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="relative mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Nome</label>
                    <input
                        type="text"
                        className="w-full px-6 py-4 text-center text-xl font-bold rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                        placeholder="Ex: João Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Código da Questão</label>
                    <input
                        type="text"
                        className="w-full px-6 py-4 text-center text-4xl font-bold tracking-widest rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-blue-600 uppercase"
                        placeholder="000 000"
                        maxLength={7}
                        value={code}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (val.length === 3 && code.length === 2) {
                                setCode(val + " ");
                            } else {
                                setCode(val);
                            }
                        }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={code.replace(/\s/g, "").length < 6 || name.trim().length === 0}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-1 disabled:transform-none"
                >
                    Acessar Questão
                    <ArrowRight size={20} />
                </button>
            </form>
        </div>
    );
}
