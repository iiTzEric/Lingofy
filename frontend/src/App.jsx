import { Route, Routes, Navigate } from "react-router"

import HomePage from "./pages/HomePage.jsx"
import SignUpPage from "./pages/SignUpPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import NotificationsPage from "./pages/NotificationsPage.jsx"
import CallPage from "./pages/CallPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import OnboardingPage from "./pages/OnboardingPage.jsx"

import { Toaster } from "react-hot-toast"

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js"

const App = () => {
  // tanstack query
 const {isLoading, authUser} = useAuthUser()

 const isAunthenticated = Boolean(authUser)
 const isOnboarded = authUser?.isOnboarded


  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  return (
    <div className="h-screen"  data-theme="coffee">
      <Routes>
        <Route path="/" element={isAunthenticated && isOnboarded ? (
          <HomePage />
        ) : (
          <Navigate to={!isAunthenticated ? "/login" : "/onboarding"} />
        )
        } />
        <Route path="/signup" element={!isAunthenticated ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!isAunthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/notifications" element={isAunthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
        <Route path="/call" element={isAunthenticated ? <CallPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isAunthenticated ? <ChatPage /> : <Navigate to="/login" />} />
        <Route
          path="/onboarding"
          element={
            isAunthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App