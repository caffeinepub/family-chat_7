import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSetMemberName } from "../hooks/useQueries";

interface RegistrationFormProps {
  onRegistered: () => void;
}

export default function RegistrationForm({
  onRegistered,
}: RegistrationFormProps) {
  const [name, setName] = useState("");
  const setMemberName = useSetMemberName();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await setMemberName.mutateAsync(trimmed);
      toast.success(`Welcome to the family, ${trimmed}! 🎉`);
      onRegistered();
    } catch (err) {
      const msg = String(err);
      if (msg.toLowerCase().includes("full")) {
        toast.error("Sorry, the family is full! No more spots available.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "oklch(0.93 0.04 75)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
          >
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "oklch(0.22 0.05 213)" }}
          >
            Welcome to Family Chat!
          </h1>
          <p className="mt-2 text-sm" style={{ color: "oklch(0.45 0.04 213)" }}>
            Tell us your name so the family knows it's you
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle
              className="font-display"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              What's your name?
            </CardTitle>
            <CardDescription>
              This is how other family members will see you in chat and the
              members list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: "oklch(0.22 0.05 213)" }}>
                  Your name
                </Label>
                <Input
                  id="name"
                  data-ocid="registration.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grandma Rose, Uncle Mike..."
                  className="text-base"
                  autoFocus
                  maxLength={50}
                />
              </div>
              <Button
                type="submit"
                data-ocid="registration.submit_button"
                disabled={!name.trim() || setMemberName.isPending}
                className="w-full rounded-full text-white font-semibold"
                style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
              >
                {setMemberName.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join the Family
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
