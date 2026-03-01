"use client";

import { BookOpen, HelpCircle, ListCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Sidebar() {
    return (
        <aside
            className="fixed md:w-64 md:h-screen w-full h-16 bottom-0 md:top-0 left-0 flex md:flex-col flex-row items-center md:items-stretch md:p-6 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-sm z-50 transition-all duration-300 md:border-r border-t md:border-t-0 border-black/5"
            style={{ backgroundColor: "#f4f7fb", color: "#394357" }}
        >
            <div className="hidden md:flex items-center gap-3 mb-10 pb-4 border-b border-black/5 shrink-0">
                <Image src="/lara-icon-talk.svg" alt="Logo" width={32} height={32} />
                <h1 className="text-xl font-bold tracking-tight">Teachy</h1>
            </div>

            <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start gap-2 w-full md:w-auto h-full items-center md:items-stretch">
                <NavItem href="/questions" icon={<ListCheck size={20} />} label="Questões" active />
                <NavItem href="#" icon={<BookOpen size={20} />} label="Aulas" disabled />
                <NavItem href="#" icon={<Users size={20} />} label="Comunidade" disabled />

                {/* Mobile Ajuda item inline with nav */}
                <div className="md:hidden flex h-full">
                    <NavItem href="#" icon={<HelpCircle size={20} />} label="Ajuda" hideLabelOnMobile={true} />
                </div>
            </nav>

            <div className="hidden md:block mt-auto pt-6 border-t border-black/5 shrink-0">
                <NavItem href="#" icon={<HelpCircle size={20} />} label="Ajuda" />
            </div>
        </aside>
    );
}

function NavItem({
    href,
    icon,
    label,
    active = false,
    hideLabelOnMobile = false,
    disabled = false
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    hideLabelOnMobile?: boolean;
    disabled?: boolean;
}) {
    return (
        <Link
            href={disabled ? "#" : href}
            onClick={(e) => disabled && e.preventDefault()}
            className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all font-medium h-full md:h-auto w-full md:w-auto overflow-hidden ${active
                ? "bg-white shadow-sm text-blue-600 font-bold"
                : disabled
                    ? "opacity-60 cursor-not-allowed text-[#394357]"
                    : "hover:bg-black/5 text-[#394357]"
                }`}
        >
            {disabled && (
                <div className="absolute top-0 right-0 md:hidden block px-1.5 py-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[7px] font-bold rounded-bl-md">
                    BREVE
                </div>
            )}
            {disabled && (
                <div className="absolute top-0 right-0 hidden md:block px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-bold rounded-bl-lg">
                    EM BREVE
                </div>
            )}
            {icon}
            <span className={`text-[10px] md:text-base md:block ${hideLabelOnMobile ? 'hidden' : 'block'}`}>{label}</span>
        </Link>
    );
}
