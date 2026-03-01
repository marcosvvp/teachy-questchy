export default function StudentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-slate-50 font-quicksand flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="w-full max-w-xl relative shrink-0">
                <div className="absolute top-0 right-10 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 -left-4 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
                    <div className="p-8 sm:p-12">
                        {children}
                    </div>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-400">
                    <span className="font-semibold tracking-wide">TEACHY</span>
                    <span>•</span>
                    <span className="text-sm">Ambiente do Estudante</span>
                </div>
            </div>
        </div>
    );
}
