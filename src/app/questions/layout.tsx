import { Sidebar } from "@/components/Sidebar";

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-slate-800 flex font-quicksand">
            <Sidebar />
            <main className="flex-1 ml-64 p-10 max-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
