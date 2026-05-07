import React, { useState, useEffect } from "react";
import {
  FileText,
  FolderPlus,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  ShoppingBag,
  PenTool,
  Handshake,
  Settings,
  CalendarDays,
  CreditCard,
  Sparkles,
  ImageIcon,
  MessageSquare,
  MailOpen,
  Truck,
  Package,
  Wallet,
  Landmark,
  Receipt,
  FolderTree,
} from "lucide-react";
import logo from "../assets/logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "../slices/auth";
import { setUser } from "../slices/profile";
import { PERMISSION_CHECKERS } from "../utils/subscriptionAccess";

/**
 * Menu config. `permissionKey` maps to PERMISSION_CHECKERS.
 * Items with permissionKey === null are always visible.
 */
const ALL_MENU_ITEMS = [
  { name: "My Banners",    path: "/dashboard/banners",       icon: ImageIcon,            permissionKey: "bannerAccess" },
  { name: "My Posts",      path: "/dashboard/posts",         icon: FileText,             permissionKey: "postCreationAccess" },
  { name: "My Stories",    path: "/dashboard/stories",       icon: Sparkles,             permissionKey: "storyAccess" },
  { type: "boutiqueSection" },
  { name: "Studio",        path: "/dashboard/studio",        icon: PenTool,              permissionKey: "studioAccess" },
  { name: "Chat",          path: "/dashboard/chat",          icon: MessageSquare,        permissionKey: "chatAccess" },
  { type: "consultationsSection" },
  { name: "Projects",      path: "/dashboard/projects",      icon: FolderPlus,           permissionKey: "designKitAccess" },
  { name: "Invitations",   path: "/dashboard/invitations",   icon: MailOpen,             permissionKey: "designKitAccess" },
  { name: "My Subscription", path: "/dashboard/my-subscription", icon: CreditCard,      permissionKey: null },
];

/** Shown under expandable Finance when the matching permission applies */
const FINANCE_CHILD_ITEMS = [
  { name: "Payouts", path: "/dashboard/payouts", icon: Wallet, permissionKey: "payoutAccess" },
  { name: "Payments", path: "/dashboard/orders", icon: Receipt, permissionKey: "ecommerceAccess" },
  { name: "Shipping fees", path: "/dashboard/boutique/shipping-fees", icon: Truck, permissionKey: "ecommerceAccess" },
];

/** Under /dashboard/boutique but not shipping-fees and not categories (those live under their own items). */
function isBoutiqueProductsRoute(pathname) {
  if (!pathname.startsWith("/dashboard/boutique")) return false;
  if (pathname.startsWith("/dashboard/boutique/shipping-fees")) return false;
  if (pathname.startsWith("/dashboard/boutique/categories")) return false;
  return true;
}

function isBoutiqueCategoriesRoute(pathname) {
  return (
    pathname === "/dashboard/boutique/categories" ||
    pathname.startsWith("/dashboard/boutique/categories/")
  );
}

const BOUTIQUE_CHILD_ITEMS = [
  { name: "Products", path: "/dashboard/boutique", icon: Package, permissionKey: "ecommerceAccess", isActive: isBoutiqueProductsRoute },
  { name: "Categories", path: "/dashboard/boutique/categories", icon: FolderTree, permissionKey: "ecommerceAccess", isActive: isBoutiqueCategoriesRoute },
];

const CONSULTATIONS_SETTINGS_PATH = "/dashboard/consultations/settings";
const CONSULTATIONS_MEETINGS_PATH = "/dashboard/consultations/meetings";

function isConsultationsSettingsRoute(pathname) {
  return (
    pathname === CONSULTATIONS_SETTINGS_PATH ||
    pathname.startsWith(`${CONSULTATIONS_SETTINGS_PATH}/`)
  );
}

function isConsultationsMeetingsRoute(pathname) {
  return (
    pathname === CONSULTATIONS_MEETINGS_PATH ||
    pathname.startsWith(`${CONSULTATIONS_MEETINGS_PATH}/`)
  );
}

const CONSULTATIONS_CHILD_ITEMS = [
  {
    name: "Settings",
    path: CONSULTATIONS_SETTINGS_PATH,
    icon: Settings,
    permissionKey: "consultationAccess",
    isActive: isConsultationsSettingsRoute,
  },
  {
    name: "Meetings",
    path: CONSULTATIONS_MEETINGS_PATH,
    icon: CalendarDays,
    permissionKey: "consultationAccess",
    isActive: isConsultationsMeetingsRoute,
  },
];

const SUBSCRIPTION_PATH = "/dashboard/my-subscription";

function isBoutiqueSectionEntry(item) {
  return item?.type === "boutiqueSection";
}

function isConsultationsSectionEntry(item) {
  return item?.type === "consultationsSection";
}

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);
  const [consultationsOpen, setConsultationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const subscriptionState = useSelector((state) => state.subscription);
  const isLoading = subscriptionState?.loading;

  const gatedLoading =
    isLoading &&
    subscriptionState?.subscription == null;

  useEffect(() => {
    if (window.innerWidth < 1024) {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved === "true") setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      localStorage.setItem("sidebar_collapsed", collapsed);
    }
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const passesPermission = (item) => {
    if (!item.permissionKey) return true;
    const checker = PERMISSION_CHECKERS[item.permissionKey];
    if (!checker) return false;
    return checker(subscriptionState);
  };

  const menuCoreItems = ALL_MENU_ITEMS.filter((item) => item.path !== SUBSCRIPTION_PATH).filter(
    (item) => {
      if (isBoutiqueSectionEntry(item)) {
        return BOUTIQUE_CHILD_ITEMS.some(passesPermission);
      }
      if (isConsultationsSectionEntry(item)) {
        return CONSULTATIONS_CHILD_ITEMS.some(passesPermission);
      }
      return passesPermission(item);
    }
  );

  const boutiqueChildItems = BOUTIQUE_CHILD_ITEMS.filter(passesPermission);
  const boutiqueSectionActive = boutiqueChildItems.some((c) =>
    c.isActive(location.pathname)
  );

  useEffect(() => {
    if (boutiqueSectionActive) setBoutiqueOpen(true);
  }, [boutiqueSectionActive]);

  const showBoutiqueSection = boutiqueChildItems.length > 0;

  const consultationsChildItems = CONSULTATIONS_CHILD_ITEMS.filter(passesPermission);
  const onLegacyConsultationPath =
    location.pathname === "/dashboard/consultation" ||
    location.pathname.startsWith("/dashboard/consultation/");
  const consultationsSectionActive =
    consultationsChildItems.some((c) => c.isActive(location.pathname)) ||
    onLegacyConsultationPath;

  useEffect(() => {
    if (consultationsSectionActive) setConsultationsOpen(true);
  }, [consultationsSectionActive]);

  const subscriptionMenuItem = ALL_MENU_ITEMS.find((item) => item.path === SUBSCRIPTION_PATH);

  const financeChildItems = FINANCE_CHILD_ITEMS.filter(passesPermission);

  const financePaths = financeChildItems.map((c) => c.path);
  const financeSectionActive = financePaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (financeSectionActive) setFinanceOpen(true);
  }, [financeSectionActive]);

  const showFinanceSection = financeChildItems.length > 0;

  const handleLogout = () => {
    dispatch(setToken(null));
    dispatch(setUser(null));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("phone");
    navigate("/");
  };

  const SubscriptionIcon = subscriptionMenuItem?.icon;

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white border shadow-sm lg:hidden hover:bg-gray-50"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r flex flex-col shadow-sm z-50 transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:w-64`}
      >
        {/* Header */}
        <div
          className={`flex items-center px-4 py-[22px] border-b ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <>
              <span className="font-semibold text-base text-gray-800 tracking-tight">
                Khatwa Business
              </span>
              <img src={logo} alt="" className="w-6 h-6 text-blue-600" />
            </>
          )}

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 custom-scrollbar overflow-y-auto">
          {/* Loading skeleton for gated items */}
          {gatedLoading && (
            <div className="space-y-1 mb-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-9 rounded-md bg-gray-100 animate-pulse ${
                    collapsed ? "w-10 mx-auto" : "w-full"
                  }`}
                />
              ))}
            </div>
          )}
          <ul className="space-y-1">
            {menuCoreItems.map((item) => {
              if (isBoutiqueSectionEntry(item)) {
                return (
                  <li key="boutique-section" className="pt-1">
                    <button
                      type="button"
                      aria-expanded={boutiqueOpen}
                      onClick={() => setBoutiqueOpen((o) => !o)}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group w-full text-left
                        ${collapsed ? "justify-center" : ""}
                        ${
                          boutiqueSectionActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                    >
                      {boutiqueSectionActive && (
                        <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                      )}
                      <ShoppingBag
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          boutiqueSectionActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                        }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Boutique</span>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                              boutiqueOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden
                          />
                        </>
                      )}
                      {collapsed && (
                        <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Boutique
                        </span>
                      )}
                    </button>
                    {(boutiqueOpen || collapsed) && (
                      <ul
                        className={`mt-1 space-y-0.5 ${collapsed ? "pl-0" : "ml-3 pl-3 border-l border-gray-200"}`}
                      >
                        {boutiqueChildItems.map((child) => {
                          const Icon = child.icon;
                          const active = child.isActive(location.pathname);
                          return (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                onClick={() => setMobileOpen(false)}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                                  ${collapsed ? "justify-center" : ""}
                                  ${
                                    active
                                      ? "bg-blue-50 text-blue-600 font-semibold"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  }`}
                              >
                                {active && !collapsed && (
                                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                                )}
                                <Icon
                                  className={`w-5 h-5 shrink-0 transition-colors ${
                                    active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                                  }`}
                                />
                                {!collapsed && <span>{child.name}</span>}
                                {collapsed && (
                                  <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {child.name}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              if (isConsultationsSectionEntry(item)) {
                return (
                  <li key="consultations-section" className="pt-1">
                    <button
                      type="button"
                      aria-expanded={consultationsOpen}
                      onClick={() => setConsultationsOpen((o) => !o)}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group w-full text-left
                        ${collapsed ? "justify-center" : ""}
                        ${
                          consultationsSectionActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                    >
                      {consultationsSectionActive && (
                        <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                      )}
                      <Handshake
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          consultationsSectionActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                        }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Consultations</span>
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                              consultationsOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden
                          />
                        </>
                      )}
                      {collapsed && (
                        <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          Consultations
                        </span>
                      )}
                    </button>
                    {(consultationsOpen || collapsed) && (
                      <ul
                        className={`mt-1 space-y-0.5 ${collapsed ? "pl-0" : "ml-3 pl-3 border-l border-gray-200"}`}
                      >
                        {consultationsChildItems.map((child) => {
                          const Icon = child.icon;
                          const active = child.isActive(location.pathname);
                          return (
                            <li key={child.path}>
                              <Link
                                to={child.path}
                                onClick={() => setMobileOpen(false)}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                                  ${collapsed ? "justify-center" : ""}
                                  ${
                                    active
                                      ? "bg-blue-50 text-blue-600 font-semibold"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  }`}
                              >
                                {active && !collapsed && (
                                  <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                                )}
                                <Icon
                                  className={`w-5 h-5 shrink-0 transition-colors ${
                                    active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                                  }`}
                                />
                                {!collapsed && <span>{child.name}</span>}
                                {collapsed && (
                                  <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {child.name}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                      ${collapsed ? "justify-center" : ""}
                      ${
                        active
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                    )}
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    />
                    {!collapsed && <span>{item.name}</span>}
                    {collapsed && (
                      <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}

            {showFinanceSection && (
              <li className="pt-1">
                <button
                  type="button"
                  aria-expanded={financeOpen}
                  onClick={() => setFinanceOpen((o) => !o)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group w-full text-left
                    ${collapsed ? "justify-center" : ""}
                    ${
                      financeSectionActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                >
                  {financeSectionActive && (
                    <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                  )}
                  <Landmark
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      financeSectionActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Finance</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                          financeOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </>
                  )}
                  {collapsed && (
                    <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Finance
                    </span>
                  )}
                </button>
                {(financeOpen || collapsed) && (
                  <ul className={`mt-1 space-y-0.5 ${collapsed ? "pl-0" : "ml-3 pl-3 border-l border-gray-200"}`}>
                    {financeChildItems.map((item) => {
                      const Icon = item.icon;
                      const active =
                        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                              ${collapsed ? "justify-center" : ""}
                              ${
                                active
                                  ? "bg-blue-50 text-blue-600 font-semibold"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                              }`}
                          >
                            {active && !collapsed && (
                              <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                            )}
                            <Icon
                              className={`w-5 h-5 shrink-0 transition-colors ${
                                active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                              }`}
                            />
                            {!collapsed && <span>{item.name}</span>}
                            {collapsed && (
                              <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {item.name}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}

            {subscriptionMenuItem && SubscriptionIcon && (
              <li className={showFinanceSection ? "pt-1" : ""}>
                <Link
                  to={subscriptionMenuItem.path}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group
                    ${collapsed ? "justify-center" : ""}
                    ${
                      location.pathname.startsWith(subscriptionMenuItem.path)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                >
                  {location.pathname.startsWith(subscriptionMenuItem.path) && (
                    <span className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-md shadow-sm" />
                  )}
                  <SubscriptionIcon
                    className={`w-5 h-5 transition-colors ${
                      location.pathname.startsWith(subscriptionMenuItem.path)
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  />
                  {!collapsed && <span>{subscriptionMenuItem.name}</span>}
                  {collapsed && (
                    <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {subscriptionMenuItem.name}
                    </span>
                  )}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 text-sm text-gray-500 hover:text-red-600 transition-all duration-200 w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default SideBar;
