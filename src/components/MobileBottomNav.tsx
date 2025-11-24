import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, PlusCircle, User, BookOpen } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuthContext();

  const navItems = [
    {
      name: 'Ana Sayfa',
      path: '/',
      icon: Home,
      requiresAuth: false,
    },
    {
      name: 'İlanlarım',
      path: '/ilanlarim',
      icon: Briefcase,
      requiresAuth: true,
    },
    {
      name: 'İlan Ver',
      path: '/ilan-ver',
      icon: PlusCircle,
      requiresAuth: false,
    },
    {
      name: 'Blog',
      path: '/blog',
      icon: BookOpen,
      requiresAuth: false,
    },
    {
      name: user ? 'Hesabım' : 'Giriş',
      path: user ? '/hesap-ayarlari' : '/giris',
      icon: User,
      requiresAuth: false,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
