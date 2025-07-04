import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Menu, 
  X, 
  Home,
  Users,
  Briefcase,
  MessageCircle,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield
} from 'lucide-react';
import { Avatar, Badge, Button } from './ModernComponents';

// Enhanced Navigation Styles
const NavigationWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => props.scrolled && `
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  `}
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 2rem;
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5fbf, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(motion.a)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    color: #8b5fbf;
    background: rgba(139, 95, 191, 0.05);
  }

  ${props => props.active && `
    color: #8b5fbf;
    background: rgba(139, 95, 191, 0.1);
  `}

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #8b5fbf, #ec4899);
    border-radius: 1px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${props => props.active && `
    &::after {
      width: 100%;
    }
  `}
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 300px;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.75rem;
  background: white;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #8b5fbf;
    box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.1);
    width: 350px;
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: var(--gray-400);
  pointer-events: none;
`;

const NotificationButton = styled(motion.button)`
  position: relative;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 0.75rem;
  background: rgba(139, 95, 191, 0.05);
  color: var(--gray-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(139, 95, 191, 0.1);
    color: #8b5fbf;
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(139, 95, 191, 0.05);
  }
`;

const UserInfo = styled.div`
  text-align: left;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const UserName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-900);
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 220px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  z-index: 1001;
`;

const DropdownItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(139, 95, 191, 0.05);
    color: #8b5fbf;
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 0.75rem;
  background: rgba(139, 95, 191, 0.05);
  color: var(--gray-700);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover {
    background: rgba(139, 95, 191, 0.1);
    color: #8b5fbf;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1002;
  display: flex;
  padding: 1rem;
`;

const MobileMenuContent = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const MobileMenuClose = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 0.5rem;
  background: rgba(139, 95, 191, 0.1);
  color: #8b5fbf;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const MobileNavLink = styled(motion.a)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: #8b5fbf;
    background: rgba(139, 95, 191, 0.05);
  }

  ${props => props.active && `
    color: #8b5fbf;
    background: rgba(139, 95, 191, 0.1);
  `}
`;

const EnhancedNavigation = ({ 
  user, 
  notifications = 3, 
  onNavigate,
  activeSection = 'home' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation handler
  const handleNavigation = (itemId) => {
    if (onNavigate) {
      onNavigate(itemId);
    } else {
      // Default navigation using React Router
      switch (itemId) {
        case 'home':
          navigate('/');
          break;
        case 'network':
          navigate('/network'); // Will need to implement this
          break;
        case 'jobs':
          navigate('/jobs');
          break;
        case 'messages':
          navigate('/messages');
          break;
        default:
          navigate('/');
      }
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'network', label: 'Network', icon: <Users size={18} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageCircle size={18} /> },
  ];

  const dropdownItems = [
    { label: 'Profile', icon: <User size={16} /> },
    { label: 'Settings', icon: <Settings size={16} /> },
    { label: 'Privacy', icon: <Shield size={16} /> },
    { label: 'Log out', icon: <LogOut size={16} /> },
  ];

  return (
    <>
      <NavigationWrapper scrolled={scrolled}>
        <NavContainer>
          <Logo
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('home')}
          >
            <LogoIcon>
              <Sparkles size={20} />
            </LogoIcon>
            Linker
          </Logo>

          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                active={activeSection === item.id}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                onClick={() => handleNavigation(item.id)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </NavLinks>

          <NavActions>
            <SearchContainer>
              <SearchIcon>
                <Search size={18} />
              </SearchIcon>
              <SearchInput
                placeholder="Search professionals, jobs, companies..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </SearchContainer>

            <NotificationButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={18} />
              {notifications > 0 && (
                <Badge
                  color="error"
                  size="sm"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '20px',
                    height: '20px',
                  }}
                >
                  {notifications}
                </Badge>
              )}
            </NotificationButton>

            <UserMenu>
              <UserButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="sm"
                  status="online"
                />
                <UserInfo>
                  <UserName>{user?.name}</UserName>
                  <UserRole>{user?.role}</UserRole>
                </UserInfo>
                <ChevronDown size={16} />
              </UserButton>

              <AnimatePresence>
                {showUserMenu && (
                  <DropdownMenu
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {dropdownItems.map((item, index) => (
                      <DropdownItem
                        key={item.label}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate?.(item.label.toLowerCase());
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                )}
              </AnimatePresence>
            </UserMenu>

            <MobileMenuButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={20} />
            </MobileMenuButton>
          </NavActions>
        </NavContainer>
      </NavigationWrapper>

      <AnimatePresence>
        {showMobileMenu && (
          <MobileMenu
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
          >
            <MobileMenuContent
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MobileMenuHeader>
                <Logo>
                  <LogoIcon>
                    <Sparkles size={20} />
                  </LogoIcon>
                  Linker
                </Logo>
                <MobileMenuClose onClick={() => setShowMobileMenu(false)}>
                  <X size={20} />
                </MobileMenuClose>
              </MobileMenuHeader>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem',
                background: 'rgba(139, 95, 191, 0.05)',
                borderRadius: '1rem',
                marginBottom: '2rem'
              }}>
                <Avatar
                  src={user?.avatar}
                  name={user?.name}
                  size="md"
                  status="online"
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {user?.role}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--gray-50)',
                borderRadius: '0.75rem',
                marginBottom: '2rem'
              }}>
                <Search size={18} color="var(--gray-400)" />
                <input
                  placeholder="Search..."
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <MobileNavLinks>
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.id}
                    active={activeSection === item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onNavigate?.(item.id);
                      setShowMobileMenu(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </MobileNavLink>
                ))}
                
                <div style={{ 
                  height: '1px', 
                  background: 'var(--gray-200)', 
                  margin: '1rem 0' 
                }} />

                {dropdownItems.map((item) => (
                  <MobileNavLink
                    key={item.label}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onNavigate?.(item.label.toLowerCase());
                      setShowMobileMenu(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </MobileNavLink>
                ))}
              </MobileNavLinks>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '1rem',
                background: 'rgba(139, 95, 191, 0.05)',
                borderRadius: '1rem',
                marginTop: '1rem'
              }}>
                <Bell size={18} color="#8b5fbf" />
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  {notifications} new notifications
                </span>
                {notifications > 0 && (
                  <Badge color="error" size="sm">
                    {notifications}
                  </Badge>
                )}
              </div>
            </MobileMenuContent>
          </MobileMenu>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default EnhancedNavigation;
