import { Sidebar } from "@/components/Sidebar";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex font-quicksand">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-10 pb-20 md:pb-10 min-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
