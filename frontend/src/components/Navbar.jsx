import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();
  

  return (
    <nav className="sticky top-0 z-30 flex h-[4.5rem] items-center border-b border-base-content/10 bg-base-100/90 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className={`${isChatPage ? "" : "lg:hidden"} shrink-0`}>
          <Link to="/" className="group flex items-center gap-2" aria-label="Lingofy home">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <ShipWheelIcon className="size-5 text-primary" />
            </span>
            <span className="text-xl font-bold tracking-tight text-base-content sm:text-2xl">
              Lingofy<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/notifications"
            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
            aria-label="Notifications"
            title="Notifications"
          >
            <BellIcon className="size-5 text-base-content/70" />
          </Link>

          <ThemeSelector />

          <div className="ml-1 flex items-center gap-2 border-l border-base-content/10 pl-2 sm:ml-2 sm:pl-3">
            <div className="avatar">
              <div className="size-9 rounded-xl ring-2 ring-primary/15 ring-offset-1 ring-offset-base-100 sm:size-10">
                <img
                  src={authUser?.profilePicture || authUser?.profilePic}
                  alt={`${authUser?.fullname || "User"} avatar`}
                  rel="noreferrer"
                />
              </div>
            </div>
            <span className="hidden max-w-28 truncate text-sm font-semibold md:block">
              {authUser?.fullname}
            </span>
          </div>

          <button
            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
            onClick={logoutMutation}
            aria-label="Log out"
            title="Log out"
          >
            <LogOutIcon className="size-5 text-base-content/70" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
