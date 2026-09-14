import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon } from "lucide-react";

const Sidebar = () => {
    const { authUser } = useAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;



    const navigationItems = [
        { to: "/", label: "Home", icon: HomeIcon },
        { to: "/friends", label: "Friends", icon: UsersIcon },
        { to: "/notifications", label: "Notifications", icon: BellIcon },
    ];

    return (
        <aside className="lingofy-sidebar sticky top-0 hidden h-screen shrink-0 flex-col border-r lg:flex">
            <div className="border-b border-neutral-content/10 px-6 py-6">
                <Link to="/" className="group flex items-center gap-3" aria-label="Lingofy home">
                        <span className="brand-mark-sidebar grid size-10 place-items-center rounded-lg transition-transform group-hover:-rotate-6">
                        <ShipWheelIcon className="size-6" />
                    </span>
                    <span className="text-2xl font-bold tracking-tight">
                        Lingofy<span className="brand-dot">.</span>
                    </span>
                </Link>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">
                    Language community
                </p>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6" aria-label="Main navigation">
                {navigationItems.map(({ to, label, icon: Icon }) => {
                    const isActive = currentPath === to;

                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`group flex h-12 w-full items-center gap-3 rounded-lg px-4 text-sm font-semibold transition-all ${
                                isActive
                                    ? "sidebar-link-active"
                                    : "text-neutral-content/60 hover:bg-neutral-content/10 hover:text-neutral-content"
                            }`}
                        >
                            <Icon className={`size-5 ${isActive ? "" : "text-base-content/45 group-hover:text-accent"}`} />
                            <span>{label}</span>
                            {isActive && <span className="sidebar-link-dot ml-auto size-1.5 rounded-full" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-neutral-content/10 p-4">
                <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                    <div className="avatar shrink-0">
                        <div className="size-10 rounded-xl ring-2 ring-primary/15 ring-offset-1 ring-offset-base-100">
                            <img
                                src={authUser?.profilePicture || authUser?.profilePic}
                                alt={`${authUser?.fullname || "User"} avatar`}
                            />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-content">{authUser?.fullname}</p>
                        <p className="sidebar-status mt-0.5 flex items-center gap-1.5 text-xs">
                            <span className="sidebar-status-dot size-1.5 rounded-full" />
                            Online
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar
