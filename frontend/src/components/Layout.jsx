import Sidebar from "./Sidebar";
import Navbar from "./Navbar"

const Layout = ({ children, showSidebar=false }) => {
  return (
    <div className="lingofy-shell min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

      <div className="flex min-h-screen flex-1 flex-col">
            <Navbar />

        <main className="flex-1">
                {children}
            </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
