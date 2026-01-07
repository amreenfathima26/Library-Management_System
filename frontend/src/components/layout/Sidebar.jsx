import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Home,
  BookOpen,
  GraduationCap,
  Book,
  UserCog,
  Settings,
} from 'lucide-react';
import { getMenuItems } from '../../utils/roleBasedAccess';

const iconMap = {
  LayoutDashboard,
  Users,
  DollarSign,
  Home,
  BookOpen,
  GraduationCap,
  Book,
  UserCog,
  Settings,
};

const Sidebar = () => {
  const { user } = useAuth();
  const menuItems = getMenuItems(user?.role || '');

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-80px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

