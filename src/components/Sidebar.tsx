"use client";

import { BookOpen, HelpCircle, ListCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Sidebar() {
    return (
        <aside
            className="w-64 h-screen fixed left-0 top-0 flex flex-col p-6 shadow-sm z-50 transition-all duration-300"
            style={{ backgroundColor: "#f4f7fb", color: "#394357" }}
        >
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/5">
                <Image src="/lara-icon-talk.svg" alt="Logo" width={32} height={32} />
                <h1 className="text-xl font-bold tracking-tight">Teachy</h1>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                <NavItem href="/questions" icon={<ListCheck size={20} />} label="Questões" active />
                <NavItem href="#" icon={<BookOpen size={20} />} label="Aulas" />
                <NavItem href="#" icon={<Users size={20} />} label="Comunidade" />
            </nav>

            <div className="mt-auto pt-6 border-t border-black/5">
                <NavItem href="#" icon={<HelpCircle size={20} />} label="Ajuda" />
            </div>
        </aside>
    );
}

function NavItem({
    href,
    icon,
    label,
    active = false
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                ? "bg-white shadow-sm text-blue-600 font-bold"
                : "hover:bg-black/5 text-[#394357]"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
