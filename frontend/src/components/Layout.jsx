import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen page-bg">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 page-bg">
                <Header onMenuToggle={() => setMobileMenuOpen(true)} />
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
