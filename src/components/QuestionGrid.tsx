"use client";

import { Question, QuestionType } from "@/types/question";
import { AlignLeft, BarChart, CheckCircle2, List, Plus, RefreshCw, Trash2, Users, Copy, QrCode, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { QuestionGridItem } from "./QuestionGridItem";
import io from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";

interface Answer {
    id: string;
    questionId: string;
    value: string;
    authorName?: string;
    createdAt: string;
}

export function QuestionGrid() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalMode, setModalMode] = useState<"none" | "selectType" | "form" | "play" | "report">("none");
    const [draftType, setDraftType] = useState<QuestionType>("OpenText");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<{ title: string; options: string[]; correctAnswers: string[]; image: File | null }>({
        title: "",
        options: ["", ""],
        correctAnswers: [],
        image: null
    });

    const [socket, setSocket] = useState<any>(null);
    const [liveAnswers, setLiveAnswers] = useState<Answer[]>([]);
    const [showingResults, setShowingResults] = useState(false);
    const [showingCorrectAnswer, setShowingCorrectAnswer] = useState(false);
    const [studentsInRoom, setStudentsInRoom] = useState(0);
    const [maxStudents, setMaxStudents] = useState(0);
    const [copied, setCopied] = useState(false);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "teachy.com";
    const displayUrl = baseUrl.replace(/^https?:\/\//, '');

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/questions");
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (modalMode === "play" && editingId) {
            const question = questions.find(q => q.id === editingId);
            if (question) {
                const newSocket = io({
                    transports: ['websocket'],
                });
                setSocket(newSocket);

                newSocket.on("connect", () => {
                    newSocket.emit("join-room", { code: question.code, role: "professor" });
                });

                newSocket.on("new-answer", (answer: any) => {
                    setLiveAnswers((prev) => {
                        const exists = prev.find(a => a.id === answer.id || (a.value === answer.value && a.authorName === answer.authorName && a.questionId === question.id));
                        if (exists) return prev;

                        return [...prev, {
                            id: answer.id || Date.now().toString(),
                            questionId: question.id,
                            value: answer.value || answer,
                            authorName: answer.authorName,
                            createdAt: new Date().toISOString()
                        }];
                    });
                });

                newSocket.on("students-count-changed", (count: number) => {
                    setStudentsInRoom(count);
                    setMaxStudents(prev => Math.max(prev, count));
                });

                fetch(`/api/answers?questionId=${question.id}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data && data.answers && Array.isArray(data.answers)) {
                            setLiveAnswers(data.answers);
                        } else if (Array.isArray(data)) {
                            setLiveAnswers(data);
                        }
                    });

                return () => {
                    newSocket.disconnect();
                }
            }
        } else {
            setSocket(null);
            setLiveAnswers([]);
            setShowingResults(false);
            setStudentsInRoom(0);
            setMaxStudents(0);
        }
    }, [modalMode, editingId, questions]);

    const closeModal = () => {
        setModalMode("none");
    };

    const handleOpenCreateTypeSelection = () => {
        setEditingId(null);
        setModalMode("selectType");
    };

    const selectTypeAndContinue = (type: QuestionType) => {
        setDraftType(type);
        setFormData({ title: "", options: ["", "", ""], correctAnswers: [], image: null });
        setModalMode("form");
    };

    const handleOpenEdit = (q: Question) => {
        setEditingId(q.id);
        setDraftType(q.type);
        setFormData({
            title: q.title,
            options: "options" in q ? q.options : ["", ""],
            correctAnswers: q.correctAnswers || [],
            image: (q.image as unknown as File) || null
        });
        setModalMode("form");
    };

    const handleOpenPlay = async (q: Question) => {
        setEditingId(q.id);
        setModalMode("play");
        setShowingCorrectAnswer(false);
        try {
            await fetch(`/api/questions/${q.code}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true })
            });
        } catch (error) {
            console.error(error);
        }
    };

    const endPresentation = async () => {
        const question = questions.find(q => q.id === editingId);
        if (question) {
            try {
                await fetch(`/api/questions/${question.code}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isActive: false, studentsCount: maxStudents })
                });
                if (socket) {
                    socket.emit("end-session", question.code);
                }
                await fetchQuestions();
            } catch (err) {
                console.error(err);
            }
        }
        closeModal();
    };
    const handleOpenReport = async (q: Question) => {
        setEditingId(q.id);
        setModalMode("report");
        setShowingCorrectAnswer(true);
        try {
            await fetchQuestions();
            const res = await fetch(`/api/answers?questionId=${q.id}`);
            if (res.ok) {
                const data = await res.json();
                setLiveAnswers(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveForm = async () => {
        if (!formData.title.trim()) return;

        const filteredOptions = formData.options.map(O => O.trim()).filter(o => o.length > 0);

        let imagePayload: string | null = null;
        if (formData.image instanceof File) {
            const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            imagePayload = await fileToBase64(formData.image);
        } else if (typeof formData.image === "string") {
            imagePayload = formData.image;
        }

        if (editingId) {
            try {
                const res = await fetch(`/api/questions/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: formData.title,
                        type: draftType,
                        options: filteredOptions,
                        correctAnswers: draftType === "OpenText" ? formData.correctAnswers.filter(a => a.trim().length > 0) : formData.correctAnswers,
                        image: imagePayload
                    })
                });

                if (res.ok) {
                    const updatedQuestion = await res.json();
                    setQuestions(prev => prev.map(q => q.id === editingId ? updatedQuestion : q));
                }
            } catch (err) {
                console.error("Failed to update question", err);
            }
        } else {
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            try {
                const res = await fetch("/api/questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: formData.title,
                        type: draftType,
                        options: filteredOptions,
                        correctAnswers: draftType === "OpenText" ? formData.correctAnswers.filter(a => a.trim().length > 0) : formData.correctAnswers,
                        code: generatedCode,
                        image: imagePayload
                    })
                });

                if (res.ok) {
                    const newQuestion = await res.json();
                    setQuestions(prev => [newQuestion, ...prev]);
                }
            } catch (err) {
                console.error(err);
            }
        }

        closeModal();
    };

    const updateOption = (index: number, val: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = val;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 5) {
            setFormData({ ...formData, options: [...formData.options, ""] });
        }
    };

    const removeOption = (index: number) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const renderResultsView = (q: Question) => {
        if (q.type === "OpenText") {
            return (
                <div className="w-full flex flex-col gap-6">
                    {showingCorrectAnswer && q.correctAnswers && q.correctAnswers.length > 0 && (
                        <div className="w-full max-w-4xl mx-auto bg-green-50 border-2 border-green-500 rounded-xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-bl-full -z-0 opacity-50"></div>
                            <h3 className="text-green-800 font-bold mb-2 flex items-center gap-2 relative z-10"><CheckCircle2 size={24} /> Resposta Esperada:</h3>
                            <p className="text-xl font-bold text-green-700 relative z-10">{q.correctAnswers[0]}</p>
                        </div>
                    )}
                    <div className="w-full max-w-4xl grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8 max-h-[40vh] overflow-y-auto px-4">
                        {liveAnswers.map((ans, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                                <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">{ans.authorName || "Anônimo"}</p>
                                <p className="font-semibold text-slate-700 text-lg">{ans.value}</p>
                            </div>
                        ))}
                        {liveAnswers.length === 0 && (
                            <div className="col-span-full text-center text-slate-400 font-medium py-8">
                                Nenhuma resposta recebida.
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (q.type === "MultipleChoice") {
            const actualCounts = q.options.map((_, i) => {
                const letter = String.fromCharCode(65 + i);
                return liveAnswers.filter(a => typeof a.value === 'string' && a.value.includes(letter)).length;
            });
            const maxVotes = Math.max(...actualCounts, 1);

            return (
                <div className="w-full max-w-3xl mt-8 flex flex-col gap-4">
                    {q.options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const count = actualCounts[i];
                        const percentage = maxVotes === Math.max(1, 0) && liveAnswers.length === 0 ? 0 : (count / maxVotes) * 100;
                        const isCorrect = showingCorrectAnswer && q.correctAnswers && q.correctAnswers.length > 0 && q.correctAnswers.includes(letter);
                        const isIncorrect = showingCorrectAnswer && !isCorrect;
                        const studentsWhoChose = liveAnswers.filter(a => typeof a.value === 'string' && a.value.includes(letter)).map(a => a.authorName || "Anônimo");

                        return (
                            <div key={i} className={`relative border-2 p-4 rounded-xl overflow-hidden group transition-colors duration-500 flex flex-col gap-3 z-10 ${isCorrect ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.02] z-20' : isIncorrect ? 'bg-slate-50 opacity-50 border-slate-200' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>

                                {/* Progress Bar Background */}
                                <div
                                    className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out -z-10 ${isCorrect ? 'bg-green-200/50' : 'bg-blue-100/50'}`}
                                    style={{ width: `${percentage}%` }}
                                />

                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-4 relative z-10 font-bold min-w-0">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 border transition-colors ${isCorrect ? 'bg-green-500 text-white border-green-600' : 'bg-white border-slate-200 text-blue-600'}`}>
                                            {letter}
                                        </span>
                                        <span className={`text-lg truncate flex-1 text-left transition-colors ${isCorrect ? 'text-green-800' : 'text-slate-700'}`}>{opt}</span>
                                    </div>
                                    <div className={`relative z-10 font-extrabold text-2xl drop-shadow-sm bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg transition-colors shrink-0 ${isCorrect ? 'text-green-700' : 'text-blue-600'}`}>
                                        {count} <span className={`text-sm font-semibold ${isCorrect ? 'text-green-600/70' : 'text-slate-400'}`}>voto{count !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                {studentsWhoChose.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1 relative z-10">
                                        {studentsWhoChose.map((name, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-md text-xs font-semibold text-slate-600 shadow-sm animate-in fade-in slide-in-from-left-2">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        }

        if (q.type === "Ranking") {
            const firstPlaceCounts = q.options.map((_, i) => {
                const letter = String.fromCharCode(65 + i);
                return liveAnswers.filter(a => a.value.startsWith(letter)).length;
            });
            const rankedOptions = q.options.map((opt, i) => ({ opt, index: i, count: firstPlaceCounts[i] }))
                .sort((a, b) => b.count - a.count);

            return (
                <div className="w-full max-w-2xl mt-8 flex flex-col gap-3">
                    {rankedOptions.map((item, i) => (
                        <div key={i} className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm animate-in slide-in-from-bottom duration-500`} style={{ animationDelay: `${i * 100}ms` }}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-amber-600' : 'bg-slate-800'}`}>
                                {i + 1}º
                            </div>
                            <span className="font-bold text-slate-700 flex-1 text-left text-lg">{item.opt}</span>
                            <span className="font-semibold text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-lg">{item.count} votos em 1º</span>
                        </div>
                    ))}
                </div>
            )
        }
    };


    const currentPlayQuestion = questions.find(q => q.id === editingId);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#394357]">Questões</h1>
                    <p className="text-slate-500 mt-2">Crie e gerencie as questões para as atividades educacionais.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 text-slate-400 font-semibold gap-3 animate-pulse">
                    <RefreshCw className="animate-spin" /> Carregando base de dados...
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    {/* Create Button */}
                    <button
                        onClick={handleOpenCreateTypeSelection}
                        className="md:aspect-square w-full h-32 md:h-full md:min-h-[220px] flex flex-row md:flex-col items-center justify-center bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/80 transition-all duration-300 group hover:shadow-md gap-4 md:gap-0"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white shadow-sm rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform md:mb-4 border border-blue-100 relative group-hover:shadow-blue-200/50">
                            <Plus size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-blue-600 text-base md:text-lg group-hover:text-blue-700">Nova Pergunta</span>
                    </button>

                    {/* Existing Questions */}
                    {questions.map((q) => (
                        <QuestionGridItem
                            key={q.id}
                            question={q}
                            onEdit={() => handleOpenEdit(q)}
                            onPlay={() => handleOpenPlay(q)}
                            onReport={() => handleOpenReport(q)}
                        />
                    ))}
                </div>
            )}

            {/* Select Type Modal */}
            <Modal
                isOpen={modalMode === "selectType"}
                onClose={closeModal}
                title="Escolha o Tipo de Pergunta"
                size="md"
            >
                <div className="grid grid-cols-1 gap-4">
                    <button disabled className="flex items-center p-4 border-2 border-slate-100 rounded-xl bg-slate-50 text-left opacity-70 cursor-not-allowed relative overflow-hidden group">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold rounded-bl-lg">
                            EM BREVE
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">Criar com IA</h3>
                            <p className="text-sm text-slate-500">Gere perguntas automaticamente baseadas no seu conteúdo.</p>
                        </div>
                    </button>

                    <button onClick={() => selectTypeAndContinue("OpenText")} className="flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                            <AlignLeft size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Texto Aberto</h3>
                            <p className="text-sm text-slate-500">Resposta livre em formato de texto.</p>
                        </div>
                    </button>

                    <button onClick={() => selectTypeAndContinue("MultipleChoice")} className="flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                            <List size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Múltipla Escolha</h3>
                            <p className="text-sm text-slate-500">Alunos escolhem uma opção correta.</p>
                        </div>
                    </button>

                    <button onClick={() => selectTypeAndContinue("Ranking")} className="flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                            <BarChart size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Ranqueamento</h3>
                            <p className="text-sm text-slate-500">Alunos ordenam os itens por prioridade.</p>
                        </div>
                    </button>
                </div>
            </Modal>

            {/* Form Modal */}
            <Modal
                isOpen={modalMode === "form"}
                onClose={closeModal}
                title={editingId ? "Editar Pergunta" : "Criar Pergunta"}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 w-fit">
                        <span className="text-sm font-semibold text-slate-500">Tipo:</span>
                        <span className="text-sm font-bold text-blue-600">
                            {draftType === "OpenText" ? "Texto Aberto" : draftType === "MultipleChoice" ? "Múltipla Escolha" : "Ranqueamento"}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Título da Questão</label>
                        <textarea
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400 resize-none text-slate-800"
                            placeholder="Digite a pergunta aqui..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Imagem</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400 resize-none text-slate-800"
                            placeholder="Digite a descrição aqui..."
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setFormData({ ...formData, image: file || null });
                            }}
                        />
                        {formData.image && (
                            <div className="relative mt-4 w-full flex justify-start group">
                                <img
                                    src={typeof formData.image === "string" ? formData.image : URL.createObjectURL(formData.image)}
                                    alt="Preview"
                                    className="rounded-xl shadow-sm border border-slate-200 max-h-48 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: null })}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remover imagem"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {draftType === "OpenText" && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Resposta Correta (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400 text-slate-800"
                                placeholder="Digite a resposta esperada..."
                                value={formData.correctAnswers[0] || ""}
                                onChange={(e) => setFormData({ ...formData, correctAnswers: [e.target.value] })}
                            />
                        </div>
                    )}

                    {(draftType === "MultipleChoice" || draftType === "Ranking") && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Opções (Máx. 5)</label>
                            <div className="space-y-3">
                                {formData.options.map((opt, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    const isCorrect = formData.correctAnswers.includes(letter);
                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            {draftType === "MultipleChoice" && (
                                                <input
                                                    type="checkbox"
                                                    checked={isCorrect}
                                                    onChange={(e) => {
                                                        const newAc = e.target.checked
                                                            ? [...formData.correctAnswers, letter]
                                                            : formData.correctAnswers.filter(a => a !== letter);
                                                        setFormData({ ...formData, correctAnswers: newAc });
                                                    }}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    title="Marcar como correta"
                                                />
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                {letter}
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                                                placeholder={`Opção ${letter}`}
                                                value={opt}
                                                onChange={(e) => updateOption(idx, e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeOption(idx)}
                                                disabled={formData.options.length <= 2}
                                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-400"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            {formData.options.length < 5 && (
                                <button
                                    onClick={addOption}
                                    className="mt-4 flex items-center gap-2 text-blue-600 font-bold px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Plus size={18} />
                                    Adicionar Opção
                                </button>
                            )}
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button
                            onClick={closeModal}
                            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveForm}
                            disabled={!formData.title.trim() || formData.title.length < 3}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none"
                        >
                            Salvar Pergunta
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Play Modal */}
            <Modal
                isOpen={modalMode === "play"}
                onClose={closeModal}
                title="Modo de Apresentação"
                size="xl"
                hideHeader
                bottomAction={
                    <div className="flex items-center gap-4 justify-between w-full relative">
                        {/* Floating QR Code outside modal content */}
                        <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl flex items-center gap-4 group hover:bg-white/20 transition-all">
                            <div className="bg-white p-2 rounded-xl shadow-sm relative">
                                <QRCodeSVG
                                    value={currentPlayQuestion ? `${baseUrl}/q/${currentPlayQuestion.code}` : ""}
                                    size={80}
                                    level="L"
                                    fgColor="#1e293b"
                                />
                            </div>
                            <div className="flex flex-col hidden sm:flex text-left">
                                <h3 className="font-bold text-white text-lg leading-tight tracking-wide">Escaneie<br />para entrar</h3>
                                <p className="text-white/70 text-xs font-medium mt-1">Aponte a câmera</p>
                            </div>
                        </div>

                        <div className="flex flex-1 justify-end gap-4 ml-auto">
                            {currentPlayQuestion?.correctAnswers && currentPlayQuestion.correctAnswers.length > 0 && !showingCorrectAnswer && (
                                <button
                                    onClick={() => setShowingCorrectAnswer(true)}
                                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white backdrop-blur-md rounded-full font-bold shadow-xl transition-all"
                                >
                                    Exibir respostas
                                </button>
                            )}
                            <button
                                onClick={endPresentation}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full font-bold shadow-xl transition-all border border-white/20"
                            >
                                Encerrar apresentação
                            </button>
                        </div>
                    </div>
                }
            >
                {currentPlayQuestion && (
                    <div className="flex flex-col items-center justify-center py-10 min-h-[50vh]">
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 bg-slate-100/80 rounded-full font-bold text-slate-700 tracking-wider text-sm sm:text-base border border-slate-200 whitespace-nowrap overflow-hidden max-w-[90vw]">
                            <div className="truncate">Acesse: <span className="text-blue-600">{displayUrl}/q</span> • Código: <span className="text-blue-600">{currentPlayQuestion.code.slice(0, 3)} {currentPlayQuestion.code.slice(3)}</span></div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${baseUrl}/q/${currentPlayQuestion.code}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-blue-600 flex items-center group relative shrink-0"
                                title="Copiar link direto"
                            >
                                {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>

                        {/* Header/Title */}
                        <div className="w-full max-w-3xl text-center mb-12 mt-10">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight">
                                {currentPlayQuestion.title}
                            </h2>
                            {currentPlayQuestion.image && typeof currentPlayQuestion.image === "string" && (
                                <img src={currentPlayQuestion.image} alt="Question Image" className="mt-8 rounded-2xl mx-auto shadow-lg max-h-80 object-contain border border-slate-200" />
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                                <Users size={20} className={studentsInRoom > 0 ? "text-blue-500" : "text-slate-400"} />
                                <span className={`font-bold ${studentsInRoom > 0 ? "text-blue-700" : "text-slate-500"}`}>
                                    {studentsInRoom} {studentsInRoom === 1 ? 'aluno na sala' : 'alunos na sala'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                                <List size={20} className={liveAnswers.length > 0 ? "text-green-500" : "text-slate-400"} />
                                <span className={`font-bold ${liveAnswers.length > 0 ? "text-green-700" : "text-slate-500"}`}>
                                    {liveAnswers.length} {liveAnswers.length === 1 ? 'resposta recebida' : 'respostas recebidas'}
                                </span>
                            </div>
                        </div>

                        {/* Show Realtime Results Auto-Updated */}
                        <div className="w-full flex items-center justify-center animate-in fade-in duration-500 pb-16">
                            {(showingResults || liveAnswers.length > 0) ? (
                                renderResultsView(currentPlayQuestion)
                            ) : (
                                /* Empty state placeholders when no answers yet */
                                (currentPlayQuestion.type === "MultipleChoice" || currentPlayQuestion.type === "Ranking") && (
                                    <div className="w-full max-w-2xl grid gap-4">
                                        {(currentPlayQuestion.options).map((opt, i) => (
                                            <div key={i} className="bg-slate-50 border-2 border-slate-200 p-4 rounded-xl flex items-center justify-between opacity-50 relative overflow-hidden transition-all duration-300">
                                                <div className="flex items-center gap-4 relative z-10 w-full">
                                                    <span className="w-10 h-10 bg-white rounded-lg font-bold text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="font-semibold text-slate-700 text-lg truncate flex-1 text-left">{opt}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Report Modal */}
            <Modal
                isOpen={modalMode === "report"}
                onClose={closeModal}
                title="Relatório de Respostas"
                size="xl"
            >
                {currentPlayQuestion && (
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-full max-w-3xl text-center mb-6">
                            <h2 className="text-3xl font-bold text-slate-800">
                                {currentPlayQuestion.title}
                            </h2>
                        </div>

                        {/* Engagement Metrics */}
                        {(() => {
                            const totalStudents = currentPlayQuestion.studentsCount || 0;
                            const totalAnswersCount = liveAnswers.length;
                            const uniqueRespondents = new Set(liveAnswers.map(a => a.authorName || "Anônimo")).size;
                            const engagementPercentage = totalStudents > 0 ? Math.round((uniqueRespondents / totalStudents) * 100) : 0;

                            return (
                                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <p className="text-blue-500 font-semibold text-xs mb-1 uppercase tracking-wider">Alunos na Sala</p>
                                        <p className="text-3xl font-black text-blue-700">{totalStudents}</p>
                                    </div>
                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <p className="text-indigo-500 font-semibold text-xs mb-1 uppercase tracking-wider">Total de Respostas</p>
                                        <p className="text-3xl font-black text-indigo-700">{totalAnswersCount}</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                                        <p className="text-green-500 font-semibold text-xs mb-1 uppercase tracking-wider">Engajamento</p>
                                        <p className="text-3xl font-black text-green-700">{engagementPercentage}%</p>
                                    </div>
                                </div>
                            )
                        })()}

                        <div className="w-full flex items-center justify-center">
                            {renderResultsView(currentPlayQuestion)}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
