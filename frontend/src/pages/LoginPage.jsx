import { useState } from "react"
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";


const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="auth-card flex w-full max-w-5xl flex-col overflow-hidden md:flex-row">
        {/* LOGIN FORM SECTION*/}
        <div className="flex w-full flex-col p-6 sm:p-10 md:w-7/12 lg:p-12">
          {/* LOGO */}
          <div className="mb-8 flex items-center justify-start gap-2">
            <span className="brand-mark grid size-10 place-items-center rounded-lg"><ShipWheelIcon className="size-6" /></span>
            <span className="text-3xl font-extrabold tracking-tight">
              Lingofy
            </span>
          </div>
          {/* ERROR MESSAGE DISPLAY SECTION*/}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message || "Unable to sign in. Check your connection and try again."}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="auth-copy text-sm">
                    Sign in to your account to continue your language journey
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="auth-input input input-bordered w-full"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="auth-input input input-bordered w-full"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                        <Link to="/signup" className="link link-primary font-semibold">
                        Create one
                      </Link>
                    </p>
                  </div>

                </div>
              </div>
            </form>
          </div>
        </div>

        
        {/* IMAGE SECTION */}
        <div className="auth-art hidden w-full items-center justify-center md:flex md:w-5/12">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/Halloween video call-cuate.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Your next conversation starts here.</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
