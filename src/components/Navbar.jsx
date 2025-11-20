import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext.jsx";
import { FiLogOut } from 'react-icons/fi';

// Simple icon component for inline SVG paths (Heroicons-like)
const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const NavbarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((v) => !v);
  const { logoutUser, user } = useContext(AuthContext);
  const userName = user?.name || user?.username || 'User';
  const userRole = user?.role || 'Normal';
  const initial = (user?.name || user?.username || user?.email || 'U').charAt(0).toUpperCase();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Icon path="M2.25 12l8.954-8.955a1.125 1.125 0 011.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
    { to: '/hr-control', label: 'Quick Interview', icon: <Icon path="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z" /> },
    { to: '/scheduled-interviews', label: 'Schedules', icon: <Icon path="M6.75 3v2.25m10.5 0V3M3.75 8.25h16.5m-15 3.75h3.75m-3.75 3h3.75m3 0h3.75m-3.75-3h3.75" /> },
    // { to: '/job-descriptions', label: 'Job Descriptions', icon: <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
    { to: '/requirements', label: 'Requirement', icon: <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
    // { to: '/chat', label: 'Chat', icon: <Icon path="M2.25 12.75c0 3.728 3.364 6.75 7.5 6.75a8.7 8.7 0 003.463-.689L21 21l-1.19-3.095A6.75 6.75 0 0019.5 12.75c0-3.728-3.364-6.75-7.5-6.75s-7.5 3.022-7.5 6.75z" /> },
    { to: '/resume', label: 'Resume', icon: <Icon path="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm8 7V3.5L18.5 9H14z" /> },
    { to: '/login', label: 'Login', icon: <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" /> },
    { to: '/signup', label: 'Signup', icon: <Icon path="M12 4.5v15m-7.5-7.5h15" /> },
    ...(user?.role === 'Admin' ? [{ to: '/users', label: 'Users', icon: <Icon path="M15 19a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0h3a2 2 0 002-2v-1a4 4 0 00-4-4h-1M7 19H4a2 2 0 01-2-2v-1a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0z" /> }] : []),
  ];

  // Determine authentication from localStorage token
  const isAuthenticated = !!localStorage.getItem('token');
  const visibleItems = isAuthenticated
    ? navItems.filter(item => item.to !== '/login' && item.to !== '/signup')
    : navItems.filter(item => item.to === '/login' || item.to === '/signup');

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <div className='border-2 absolute'>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 rounded-md p-2 bg-gray-900 text-gray-200 shadow border border-gray-800"
        aria-label="Toggle sidebar"
      >
        <span className="block w-5 h-[2px] bg-gray-200 mb-1"></span>
        <span className="block w-5 h-[2px] bg-gray-200 mb-1"></span>
        <span className="block w-5 h-[2px] bg-gray-200"></span>
      </button>

      {/* Overlay on mobile */}
      <div
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Persistent desktop toggle at sidebar edge */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden md:flex fixed z-50 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900 text-gray-200 border border-gray-800 shadow hover:bg-white/5"
        style={{ left: isOpen ? '18rem' : '4rem' }}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-pressed={isOpen}
      >
        {isOpen ? (
          <Icon path="M15.75 19.5L8.25 12l7.5-7.5" />
        ) : (
          <Icon path="M8.25 4.5L15.75 12l-7.5 7.5" />
        )}
      </button>

      {/* Edge hotspot to expand when collapsed (desktop) */}
      <div
        className="hidden md:block fixed top-0 left-0 h-screen w-6 z-40 cursor-ew-resize hover:bg-white/5"
        onClick={() => !isOpen && setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (!isOpen && (e.key === 'Enter' || e.key === ' ')) setIsOpen(true); }}
        aria-label="Expand sidebar"
        aria-hidden={false}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen transition-[width,transform] duration-300 ease-in-out relative
          bg-[#0f1115] text-gray-200 border-r border-gray-800 shadow-xl
          ${isOpen ? 'w-72 translate-x-0' : 'w-16 -translate-x-0'} md:translate-x-0`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">UI</div>
            <div className={`${isOpen ? 'block' : 'hidden md:hidden'}`}>
              <div className="text-sm font-semibold tracking-wide">Interview Bot</div>
            </div>

        {/* Internal edge toggle (desktop) */}
        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-3 z-40">
          <button onClick={toggleSidebar} className="p-2 rounded-full bg-gray-900 text-gray-200 border border-gray-800 shadow hover:bg-white/5">
            {isOpen ? (
              <Icon path="M15.75 19.5L8.25 12l7.5-7.5" />
            ) : (
              <Icon path="M8.25 4.5L15.75 12l-7.5 7.5" />
            )}
          </button>
        </div>
          </div>
          <button onClick={toggleSidebar} className="md:inline-flex p-2 rounded hover:bg-white/5">
            <Icon path="M4 6h16M4 12h16M4 18h16" />
          </button>
        </div>

        {/* Search */}
        <div className={`px-3 py-3 border-b border-gray-800/60 ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'} transition-opacity`}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon path="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#12151b] border border-gray-800 rounded-md pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-3 overflow-y-auto h-[calc(100vh-16rem)]">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mb-1
                ${isActive(item.to) ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-gray-300'}`}
              title={!isOpen ? item.label : undefined}
            >
              <span className="w-5 h-5 flex items-center justify-center text-gray-300">{item.icon}</span>
              <span className={`whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'} transition-opacity`}>{item.label}</span>
            </Link>
          ))}
        </nav>       

        {/* Bottom profile section */}
        {isAuthenticated && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800/60 p-3 bg-[#0f1115]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initial}
                </div>
                <div className={`${isOpen ? 'block' : 'hidden md:hidden'} min-w-0`}>
                  <div className="text-sm font-medium text-gray-100 truncate">{userName}</div>
                  <div className="text-xs text-gray-400 truncate">{userRole}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-white/5 text-gray-300 border border-transparent hover:border-gray-700"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </aside>
      {/* Desktop spacer to push content right so sidebar doesn't cover content */}
      <div
        aria-hidden
        className="hidden md:block md:float-left"
        style={{ width: isOpen ? '18rem' : '4rem', height: 0 }}
      />
    </div>
  );
};

export default NavbarComponent;
