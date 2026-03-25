import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Image, FileText, Calendar, ShoppingBag,
  MessageSquare, Users, GitBranch, BarChart3, Megaphone,
  Award, BookOpen, Settings, LogOut, Menu, X, ChevronRight,
  Bell, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Sub-modules ───────────────────────────────────────────
import { CommandCenter }      from '../components/admin/CommandCenter';
import { DashboardOverview }  from '../components/admin/DashboardOverview';
import { GalleryManager }     from '../components/admin/GalleryManager';
import { MomentsManager }     from '../components/admin/MomentsManager';
import { EventsManager }      from '../components/admin/EventsManager';
import { OrdersManager }      from '../components/admin/OrdersManager';
import { MessagesManager }    from '../components/admin/MessagesManager';
import { CollectorCRM }       from '../components/admin/CollectorCRM';
import { CommissionPipeline } from '../components/admin/CommissionPipeline';
import { RevenueAnalytics }   from '../components/admin/RevenueAnalytics';
import { MarketingHub }       from '../components/admin/MarketingHub';
import { GalleryReadiness }   from '../components/admin/GalleryReadiness';
import { WorkshopsManager }   from '../components/admin/WorkshopsManager';
import { AdminSettings }       from '../components/admin/AdminSettings';

interface AdminDashboardProps {
  onNavigate: (page: any) => void;
}

export type AdminView =
  | 'command' | 'gallery' | 'moments' | 'events'
  | 'orders' | 'messages' | 'collectors' | 'commissions'
  | 'analytics' | 'marketing' | 'readiness' | 'workshops'
  | 'settings';

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string;
  group: 'main' | 'studio' | 'growth';
}

const NAV: NavItem[] = [
  { id: 'command',     label: 'Command Centre', icon: LayoutDashboard, group: 'main' },
  { id: 'analytics',  label: 'Revenue',         icon: BarChart3,       group: 'main' },
  { id: 'collectors', label: 'Collectors',      icon: Users,           group: 'main', badge: 'CRM' },
  { id: 'commissions',label: 'Commissions',     icon: GitBranch,       group: 'main', badge: '3' },
  { id: 'gallery',    label: 'Gallery',         icon: Image,           group: 'studio' },
  { id: 'moments',    label: 'Moments',         icon: FileText,        group: 'studio' },
  { id: 'events',     label: 'Events',          icon: Calendar,        group: 'studio' },
  { id: 'workshops',  label: 'Workshops',       icon: BookOpen,        group: 'studio' },
  { id: 'orders',     label: 'Orders',          icon: ShoppingBag,     group: 'studio', badge: '2' },
  { id: 'messages',   label: 'Messages',        icon: MessageSquare,   group: 'studio', badge: '5' },
  { id: 'marketing',  label: 'Marketing',       icon: Megaphone,       group: 'growth' },
  { id: 'readiness',  label: 'Gallery Readiness', icon: Award,         group: 'growth' },
  { id: 'settings',   label: 'Settings',        icon: Settings,        group: 'growth' },
];

const GROUP_LABELS: Record<string, string> = {
  main:   'Overview',
  studio: 'Studio',
  growth: 'Growth',
};

function renderView(view: AdminView, onNav: (v: AdminView) => void) {
  switch (view) {
    case 'command':      return <CommandCenter onNavigate={onNav} />;
    case 'analytics':   return <RevenueAnalytics />;
    case 'collectors':  return <CollectorCRM />;
    case 'commissions': return <CommissionPipeline />;
    case 'gallery':     return <GalleryManager />;
    case 'moments':     return <MomentsManager />;
    case 'events':      return <EventsManager />;
    case 'workshops':   return <WorkshopsManager />;
    case 'orders':      return <OrdersManager />;
    case 'messages':    return <MessagesManager />;
    case 'marketing':   return <MarketingHub />;
    case 'readiness':   return <GalleryReadiness />;
    case 'settings':    return <AdminSettings />;
    default:            return <CommandCenter onNavigate={onNav} />;
  }
}



export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [view, setView]           = useState<AdminView>('command');
  const [sidebarOpen, setSidebar] = useState(true);
  const [mobileOpen, setMobile]   = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const { user, logout }          = useAuth();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebar(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNav = (v: AdminView) => {
    setView(v);
    if (isMobile) setMobile(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const activeItem = NAV.find(n => n.id === view);
  const groups = ['main', 'studio', 'growth'] as const;

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full"
      style={{ background: '#1A1815', borderRight: '1px solid rgba(250,247,242,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5"
        style={{ borderBottom: '1px solid rgba(250,247,242,0.06)' }}>
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="font-serif text-2xl italic"
            style={{ color: '#FAF7F2' }}
          >
            Mapheane
          </button>
          <p className="text-xs uppercase tracking-[0.2em] mt-0.5" style={{ color: 'rgba(250,247,242,0.3)' }}>
            Studio Admin
          </p>
        </div>
        {!isMobile && (
          <button onClick={() => setSidebar(o => !o)}
            className="p-1 hover:opacity-60 transition-opacity"
            style={{ color: 'rgba(250,247,242,0.4)' }}>
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map(group => {
          const items = NAV.filter(n => n.group === group);
          return (
            <div key={group} className="mb-5">
              {sidebarOpen && (
                <p className="text-xs uppercase px-2 mb-2"
                  style={{ color: 'rgba(250,247,242,0.25)', letterSpacing: '0.15em' }}>
                  {GROUP_LABELS[group]}
                </p>
              )}
              {items.map(item => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 mb-0.5 transition-all duration-200 group"
                    style={{
                      background: active ? 'rgba(160,82,45,0.18)' : 'transparent',
                      borderRadius: 4,
                    }}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-terracotta' : ''}`}
                      style={{ color: active ? '#A0522D' : 'rgba(250,247,242,0.45)' }}
                    />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-sans"
                          style={{ color: active ? '#FAF7F2' : 'rgba(250,247,242,0.55)' }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-sans px-1.5 py-0.5"
                            style={{
                              background: active ? '#A0522D' : 'rgba(250,247,242,0.1)',
                              color: active ? '#FAF7F2' : 'rgba(250,247,242,0.5)',
                              borderRadius: 2,
                            }}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(250,247,242,0.06)' }}>
        {sidebarOpen ? (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center text-sm font-sans font-500 flex-shrink-0"
              style={{ background: '#A0522D', color: '#FAF7F2' }}>
              {user?.name?.[0]?.toUpperCase() ?? 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans truncate" style={{ color: 'rgba(250,247,242,0.8)' }}>
                {user?.name ?? 'Mapheane'}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(250,247,242,0.35)' }}>
                {user?.email ?? 'hello@mapheane.art'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center text-sm font-sans font-500 mx-auto mb-3"
            style={{ background: '#A0522D', color: '#FAF7F2' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'M'}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(250,247,242,0.4)' }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span className="font-sans">Sign out</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F0EB' }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <motion.div
          animate={{ width: sidebarOpen ? 220 : 56 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-shrink-0 h-full overflow-hidden"
        >
          <Sidebar />
        </motion.div>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgba(26,24,21,0.6)' }}
              onClick={() => setMobile(false)} />
            <motion.div initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed left-0 top-0 bottom-0 w-56 z-50">
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-7 py-3.5 bg-background border-b border-charcoal/8">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setMobile(true)} className="p-1 text-muted hover:text-charcoal transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl italic text-charcoal" style={{ letterSpacing: '-0.01em' }}>
                {activeItem?.label ?? 'Command Centre'}
              </h1>
              <p className="text-xs font-sans uppercase tracking-widest text-muted hidden md:block">
                Studio Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick pulse indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-charcoal/8 bg-parchment/40">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-soft" />
              <span className="text-xs font-sans text-muted">Studio active</span>
            </div>

            {/* Notification bell */}
            <button className="relative p-2 text-muted hover:text-charcoal transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-terracotta text-background text-[8px] font-sans rounded-full flex items-center justify-center">
                7
              </span>
            </button>

            {/* View public site */}
            <button onClick={() => onNavigate('home')}
              className="hidden md:flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted hover:text-terracotta transition-colors">
              <Zap className="w-3.5 h-3.5" />
              View Site
            </button>
          </div>
        </header>

        {/* View content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {renderView(view, handleNav)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
