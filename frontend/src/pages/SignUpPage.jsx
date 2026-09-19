import { useState } from "react"
import { ShipWheelIcon } from "lucide-react"

import { Link } from "react-router"
import useSignUp from "../hooks/useSignUp.js";
import GoogleAuthButton from "../components/GoogleAuthButton";

 
const SignUpPage = () => {
  const [ signupData, setSignupData ] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  

  // const { mutate:signupMutation, isPending, error } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({
  //     queryKey: ["authUser"]
  //   }),
  // });

  const { isPending, error, signupMutation} = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };


  return (
    <div className="auth-shell flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="auth-card flex w-full max-w-5xl flex-col overflow-hidden md:flex-row">

    {/* SignUp Form - LEFT SIDE */}
      <div className="flex w-full flex-col p-6 sm:p-10 md:w-7/12 lg:p-12">
        {/* LOGO */}
        <div className="mb-8 flex items-center justify-start gap-2">
          <span className="brand-mark grid size-10 place-items-center rounded-lg"><ShipWheelIcon className="size-6" /></span>
          <span className="text-3xl font-extrabold tracking-tight">
            Lingofy
          </span>
        </div>

        {/* ERROR MESSAGE IF ANY */}

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error.response?.data?.message || "Unable to create account. Check your connection and try again."}</span>
          </div>
        )}


        <div className="w-full">
          <form onSubmit={handleSignup}>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Create an Account</h2>
                <p className="text-sm opacity-70">Join Lingofy and start your own language learning adventure!</p>
              </div>

              <div className="space-y-3">
                <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>

                    <input type="text"
                    placeholder="John Doe"
                    className="auth-input input input-bordered w-full"
                    value={signupData.fullname}
                    onChange={(e) => setSignupData({ ...signupData, fullname: e.target.value })}
                    required
                    />
                </div>
                {/* EMAIL */}
                <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>

                    <input type="email"
                    placeholder="JohnDoe@gmail.com"
                    className="auth-input input input-bordered w-full"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    />
                </div>
                {/* PASSWORD */}
                <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>

                    <input type="password"
                    placeholder="********"
                    className="auth-input input input-bordered w-full"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input 
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    required 
                    />
                    <span className="text-xs leading-tight">
                      I agree to the{" "}
                      <span className="link link-primary">terms of service</span> and{" "}
                      <span className="link link-primary">privacy policy</span>
                    </span>
                  </label>
                </div>
              </div>

              <button className="btn btn-primary w-full" type="submit">
                {isPending ? (
                  <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Loading...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* NEW: divider + Google sign-up */}
              <div className="divider my-1 text-xs">OR</div>
              <GoogleAuthButton />

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="link link-primary font-semibold">
                  Sign in
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* SignUp Form - LEFT SIDE */}
      <div className="auth-art hidden w-full items-center justify-center md:flex md:w-5/12">
        <div className="max-w-md p-8">
          {/* ILLUSTRATION */}
          <div className="relative aspect-square max-w-sm mx-auto">
            <img src="Halloween video call-cuate.png" alt="language connection illustration" className="w-full h-full" />
          </div>

          <div className="text-center space-y-3 mt-6">
            <h2 className="text-xl font-semibold">Build a language circle that sticks.</h2>
            <p className="opacity-70">Practice conversations, make friends, and improve your language skills together</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SignUpPage