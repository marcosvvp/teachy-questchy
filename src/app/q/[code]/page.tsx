"use client";

import { useState, use, useEffect } from "react";
import { CheckCircle2, ChevronRight, Lock, GripVertical } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import io from "socket.io-client";

interface QuestionData {
    id: string;
    title: string;
    type: string;
    options: string[];
    isActive?: boolean;
    image?: string | null;
}

function SortableItem(props: { id: string; option: string; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 bg-white flex items-center gap-4 cursor-grab hover:border-blue-300">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                {props.index + 1}º
            </div>
            <span className="font-semibold text-lg text-slate-700 flex-1">{props.option}</span>
            <GripVertical className="text-slate-400" />
        </div>
    );
}


export default function StudentQuestionPage({ params }: { params: Promise<{ code: string }> }) {
    const resolvedParams = use(params);
    const code = resolvedParams.code;

    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [textAnswer, setTextAnswer] = useState("");
    const [rankingItems, setRankingItems] = useState<{ id: string; text: string; originalLetter: string }[]>([]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [questionData, setQuestionData] = useState<QuestionData | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Identity state
    const [studentName, setStudentName] = useState("");
    const [hasName, setHasName] = useState(false);

    // Sync state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [socket, setSocket] = useState<any>(null);
    const [sessionEnded, setSessionEnded] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const storedName = localStorage.getItem("teachy_student_name");
        if (storedName) {
            setStudentName(storedName);
            setHasName(true);
        }
    }, []);

    useEffect(() => {
        if (!hasName) return;

        let activeSocket: any = null;
        let isPushed = false;

        fetch(`/api/questions/${code}`)
            .then(res => {
                if (!res.ok) throw new Error("Question not found");
                return res.json();
            })
            .then(data => {
                if (isPushed) return;
                setQuestionData({
                    id: data.id,
                    title: data.title,
                    type: data.type,
                    options: data.options || [],
                    isActive: data.isActive,
                    image: data.image
                });

                if (data.type === "Ranking") {
                    setRankingItems((data.options || []).map((opt: string, i: number) => ({
                        id: `item-${i}`,
                        text: opt,
                        originalLetter: String.fromCharCode(65 + i)
                    })));
                }

            })
            .catch(err => {
                if (isPushed) return;
                console.error("Invalid Code", err);
                setNotFound(true);
            });

        setTimeout(() => {
            if (isPushed) return;
            activeSocket = io({ transports: ['websocket'] });
            setSocket(activeSocket);

            activeSocket.emit("join-room", { code, role: "student" });

            activeSocket.on("session-ended", () => {
                if (isPushed) return;
                setSessionEnded(true);
            });
        }, 0);

        return () => {
            isPushed = true;
            if (activeSocket) {
                activeSocket.disconnect();
            }
        };
    }, [code, hasName]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setRankingItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = async () => {
        if (!questionData) return;

        let finalValue = "";
        if (questionData.type === "MultipleChoice" && selectedOptions.length > 0) {
            finalValue = selectedOptions.sort((a, b) => a - b).map(o => String.fromCharCode(65 + o)).join(",");
        } else if (questionData.type === "OpenText") {
            finalValue = textAnswer;
        } else if (questionData.type === "Ranking") {
            finalValue = rankingItems.map(i => i.originalLetter).join(",");
        }

        if (!finalValue) return;

        try {
            await fetch("/api/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: questionData.id,
                    value: finalValue,
                    authorName: studentName
                })
            });

            if (socket) {
                socket.emit("submit-answer", { code, value: finalValue, authorName: studentName });
            }

            setIsSubmitted(true);
        } catch (e) {
            console.error("Error submitting answer:", e);
        }
    };

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-3 text-center">
                    Questão Não Encontrada
                </h1>
                <p className="text-slate-500 text-center max-w-sm">
                    Verifique o código e tente novamente na página inicial.
                </p>
            </div>
        )
    }

    if (!hasName) {
        return (
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-3 text-center">
                    Identificação
                </h1>
                <p className="text-slate-500 mb-8 text-center max-w-sm">
                    A questão requer que você informe seu nome para participar.
                </p>

                <div className="w-full max-w-sm">
                    <div className="relative mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Nome</label>
                        <input
                            type="text"
                            className="w-full px-6 py-4 text-center text-xl font-bold rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                            placeholder="Ex: Carlos Silva"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && studentName.trim().length > 0) {
                                    localStorage.setItem("teachy_student_name", studentName.trim());
                                    setHasName(true);
                                }
                            }}
                        />
                    </div>

                    <button
                        onClick={() => {
                            localStorage.setItem("teachy_student_name", studentName.trim());
                            setHasName(true);
                        }}
                        disabled={studentName.trim().length === 0}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-1 disabled:transform-none"
                    >
                        Entrar na Sala
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    if (!questionData) {
        return <div className="text-center text-slate-500 py-10 animate-pulse">Buscando questão na rede...</div>;
    }

    if (questionData && questionData.isActive === false && !isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-slate-50">
                    <Lock size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3 text-center">
                    Sessão Inativa
                </h2>
                <p className="text-slate-500 text-center max-w-sm mb-6">
                    O professor não está apresentando esta pergunta no momento.
                </p>
            </div>
        );
    }

    if (sessionEnded) {
        return (
            <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-blue-50 border-t-blue-100 relative overflow-hidden">
                    <Lock size={32} className="relative z-10" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3 text-center">
                    Apresentação Encerrada
                </h2>
                <p className="text-slate-500 text-center max-w-sm mb-6">
                    O professor já encerrou esta sessão.
                </p>
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-8 animate-in slide-in-from-bottom-8 duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-green-50">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-3 text-center tracking-tight">
                    Resposta Enviada!
                </h2>
                <p className="text-slate-500 text-center max-w-sm">
                    Sua resposta foi enviada com sucesso. Acompanhe os resultados na lousa com o seu professor.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="mb-8 border-b border-slate-100 pb-8 text-center flex flex-col items-center">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-4 uppercase tracking-wider">
                    Questão {code.slice(0, 3)} {code.slice(3)}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight w-full max-w-2xl">
                    {questionData.title}
                </h1>
                {questionData.image && typeof questionData.image === "string" && (
                    <img src={questionData.image} alt="Imagem da questão" className="mt-8 rounded-2xl shadow-md max-h-64 object-contain border border-slate-200 mx-auto" />
                )}
            </div>

            {questionData.type === "MultipleChoice" && (
                <div className="flex flex-col gap-3 mb-10">
                    <p className="text-sm font-semibold text-slate-500 text-center mb-2">Você pode selecionar uma ou mais opções.</p>
                    {questionData.options.map((opt: string, i: number) => {
                        const isSelected = selectedOptions.includes(i);
                        return (
                            <button
                                key={i}
                                onClick={() => {
                                    setSelectedOptions(prev =>
                                        prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                                    );
                                }}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${isSelected
                                    ? "border-blue-500 bg-blue-50/50 shadow-sm"
                                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                                    }`}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className={`font-semibold text-lg ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                                    {opt}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {questionData.type === "OpenText" && (
                <div className="mb-10">
                    <textarea
                        rows={5}
                        className="w-full p-5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-slate-800 text-lg resize-none"
                        placeholder="Digite sua resposta aqui..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                    />
                </div>
            )}

            {(questionData.type === "Ranking") && (
                <div className="mb-10">
                    <div className="text-sm font-semibold text-slate-500 mb-4 text-center">Arraste os itens para ordená-los</div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={rankingItems.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-3">
                                {rankingItems.map((item, index) => (
                                    <SortableItem key={item.id} id={item.id} option={item.text} index={index} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={(questionData.type === "MultipleChoice" && selectedOptions.length === 0) || (questionData.type === "OpenText" && textAnswer.trim().length === 0)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:shadow-lg disabled:hover:shadow-none hover:-translate-y-1 disabled:transform-none"
            >
                Mandar Resposta
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
