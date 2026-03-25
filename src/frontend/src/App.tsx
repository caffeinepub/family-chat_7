import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import LandingPage from "./components/LandingPage";
import MainApp from "./components/MainApp";
import RegistrationForm from "./components/RegistrationForm";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerRole } from "./hooks/useQueries";

export default function App() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { isFetching: actorLoading } = useActor();
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const queryClient = useQueryClient();

  const isLoggedIn = !!identity;

  const handleRegistered = () => {
    queryClient.invalidateQueries({ queryKey: ["callerRole"] });
  };

  // Full-screen loader while checking auth state
  const isCheckingAuth =
    isInitializing || (isLoggedIn && (actorLoading || roleLoading));

  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "oklch(0.93 0.04 75)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
        >
          <Heart className="w-7 h-7 text-white" />
        </div>
        <div
          className="flex items-center gap-2"
          style={{ color: "oklch(0.22 0.05 213)" }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Loading Family Chat...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  if (role === "unregistered" || role === "guest") {
    return (
      <>
        <RegistrationForm onRegistered={handleRegistered} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainApp />
      <Toaster />
    </>
  );
}
