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
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-base-content/10 bg-base-200/70 lg:flex">
            <div className="border-b border-base-content/10 px-6 py-6">
                <Link to="/" className="group flex items-center gap-3" aria-label="Lingofy home">
                    <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <ShipWheelIcon className="size-6 text-primary" />
                    </span>
                    <span className="text-2xl font-bold tracking-tight">
                        Lingofy<span className="text-primary">.</span>
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
                            className={`group flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-all ${
                                isActive
                                    ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                                    : "text-base-content/65 hover:bg-base-content/5 hover:text-base-content"
                            }`}
                        >
                            <Icon className={`size-5 ${isActive ? "" : "text-base-content/55 group-hover:text-primary"}`} />
                            <span>{label}</span>
                            {isActive && <span className="ml-auto size-1.5 rounded-full bg-primary-content" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-base-content/10 p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-base-100/70 p-3 shadow-sm">
                    <div className="avatar shrink-0">
                        <div className="size-10 rounded-xl ring-2 ring-primary/15 ring-offset-1 ring-offset-base-100">
                            <img
                                src={authUser?.profilePicture || authUser?.profilePic}
                                alt={`${authUser?.fullname || "User"} avatar`}
                            />
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{authUser?.fullname}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-success">
                            <span className="size-1.5 rounded-full bg-success" />
                            Online
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar
