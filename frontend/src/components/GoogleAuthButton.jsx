import { GoogleLogin } from "@react-oauth/google";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { googleLogin } from "../lib/api";

const GoogleAuthButton = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: googleLogin,
    // Refetch /auth/me: once the cookie is set, this returns the user and
    // your existing routing redirects to onboarding or home
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Google sign-in failed"),
  });

  return (
    <div className="space-y-2">
      <div className={`flex justify-center ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        <GoogleLogin
          onSuccess={(res) => mutate(res.credential)}
          onError={() => toast.error("Google sign-in failed")}
        />
      </div>

      {/* NEW: consent notice, since Google sign-in can also create an account */}
      <p className="text-center text-xs opacity-70">
        By continuing with Google, you agree to the{" "}
        <span className="link link-primary">terms of service</span> and{" "}
        <span className="link link-primary">privacy policy</span>.
      </p>
    </div>
  );
};

export default GoogleAuthButton;