import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Image,
  Loader2,
  Megaphone,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemberCount } from "../hooks/useQueries";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function LandingPage({
  onLogin,
  isLoggingIn,
}: LandingPageProps) {
  const { data: memberCount, isLoading } = useMemberCount();

  const current = memberCount ? Number(memberCount.current) : 0;
  const max = memberCount ? Number(memberCount.max) : 20;
  const isFull = current >= max;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.93 0.04 75)" }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "oklch(0.93 0.04 75 / 0.95)",
          borderColor: "oklch(0.85 0.04 70)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
            >
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display font-bold text-xl"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              Family Chat
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              <Badge
                variant="outline"
                className="hidden sm:flex"
                style={{
                  borderColor: "oklch(0.22 0.05 213)",
                  color: "oklch(0.22 0.05 213)",
                }}
              >
                <Users className="w-3 h-3 mr-1" />
                {current} / {max} members
              </Badge>
            )}
            {!isFull ? (
              <Button
                onClick={onLogin}
                disabled={isLoggingIn}
                data-ocid="nav.primary_button"
                className="rounded-full text-white font-semibold"
                style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Join Family
              </Button>
            ) : (
              <Badge
                style={{
                  backgroundColor: "oklch(0.577 0.245 27.325)",
                  color: "white",
                }}
              >
                Family Full
              </Badge>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <Badge
                className="mb-4 text-white"
                style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
              >
                Private & Secure
              </Badge>
              <h1
                className="font-display text-5xl sm:text-6xl font-bold leading-tight"
                style={{ color: "oklch(0.22 0.05 213)" }}
              >
                Your Family's Private Home Online.
              </h1>
            </div>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "oklch(0.35 0.04 213)" }}
            >
              A cozy, invitation-free space for up to 20 family members. Chat
              together, share precious photos, and post announcements — all in
              one warm, private place.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {!isLoading && (
                <div
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "oklch(0.35 0.04 213)" }}
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {current} of {max} spots filled
                  </span>
                  {!isFull && (
                    <span style={{ color: "oklch(0.65 0.115 28)" }}>
                      · {max - current} remaining
                    </span>
                  )}
                </div>
              )}
            </div>
            {isFull ? (
              <div
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: "oklch(0.90 0.06 30)",
                  border: "1px solid oklch(0.80 0.08 28)",
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: "oklch(0.40 0.12 28)" }}
                >
                  Our family is full! 💛
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "oklch(0.50 0.08 28)" }}
                >
                  All 20 spots have been taken. Please contact a family member
                  to learn more.
                </p>
              </div>
            ) : (
              <Button
                onClick={onLogin}
                disabled={isLoggingIn}
                size="lg"
                data-ocid="hero.primary_button"
                className="rounded-full text-white font-semibold text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
                style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5 mr-2" />
                )}
                {isLoggingIn ? "Connecting..." : "Join the Family"}
              </Button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ transform: "rotate(2deg)" }}
            >
              <img
                src="/assets/generated/family-hero.dim_800x600.jpg"
                alt="A family spending time together"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div
              className="absolute -bottom-4 -left-4 rounded-2xl p-4 shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.65 0.115 28 / 0.15)" }}
                >
                  <Shield
                    className="w-4 h-4"
                    style={{ color: "oklch(0.65 0.115 28)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.22 0.05 213)" }}
                  >
                    Private & Safe
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.50 0.03 213)" }}
                  >
                    Family only access
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="relative" style={{ height: "80px", overflow: "hidden" }}>
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          aria-hidden="true"
        >
          <path
            d="M0 80L60 66.7C120 53.3 240 26.7 360 20C480 13.3 600 26.7 720 33.3C840 40 960 40 1080 33.3C1200 26.7 1320 13.3 1380 6.7L1440 0V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="oklch(0.97 0.015 75)"
          />
        </svg>
      </div>

      {/* Features Section */}
      <section
        className="py-20"
        style={{ backgroundColor: "oklch(0.97 0.015 75)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="font-display text-4xl font-bold mb-4"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              Everything your family needs
            </h2>
            <p className="text-lg" style={{ color: "oklch(0.45 0.04 213)" }}>
              Three simple tools to keep everyone connected
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "Group Chat",
                description:
                  "Real-time messaging for all family members. Share updates, plan gatherings, and stay in touch every day.",
                color: "oklch(0.65 0.115 28)",
                bg: "oklch(0.97 0.04 28)",
              },
              {
                icon: Image,
                title: "Photo Gallery",
                description:
                  "Upload and browse precious family moments. From birthday parties to everyday snapshots — all in one place.",
                color: "oklch(0.22 0.05 213)",
                bg: "oklch(0.94 0.04 213)",
              },
              {
                icon: Megaphone,
                title: "Announcements",
                description:
                  "Post family news, event invites, or important reminders. Everyone stays informed and in the loop.",
                color: "oklch(0.55 0.10 150)",
                bg: "oklch(0.94 0.04 150)",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  className="h-full border-0 shadow-md hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: "white" }}
                >
                  <CardContent className="pt-6 space-y-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: feature.bg }}
                    >
                      <feature.icon
                        className="w-6 h-6"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h3
                      className="font-display text-xl font-bold"
                      style={{ color: "oklch(0.22 0.05 213)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "oklch(0.45 0.04 213)" }}
                    >
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Equal Access Section */}
      <section
        className="py-20"
        style={{ backgroundColor: "oklch(0.93 0.04 75)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { emoji: "💬", label: "Chat", count: "∞ messages" },
                { emoji: "📸", label: "Photos", count: "Share freely" },
                { emoji: "📢", label: "Announce", count: "Everyone sees" },
                { emoji: "👨‍👩‍👧‍👦", label: "Members", count: `Up to ${max}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "white" }}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.22 0.05 213)" }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: "oklch(0.50 0.04 213)" }}
                  >
                    {item.count}
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2
                className="font-display text-4xl font-bold"
                style={{ color: "oklch(0.22 0.05 213)" }}
              >
                Everyone is Equal
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "oklch(0.35 0.04 213)" }}
              >
                No admins, no permissions, no gatekeeping. Every family member
                has full access to chat, share photos, and post announcements.
                Family should be simple.
              </p>
              <ul className="space-y-3">
                {[
                  "No approval required",
                  "No permission levels",
                  "Join instantly after sign-up",
                  "Everyone can do everything",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium"
                    style={{ color: "oklch(0.35 0.04 213)" }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              {!isFull && (
                <Button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  data-ocid="equal.primary_button"
                  className="rounded-full text-white font-semibold"
                  style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Join Now — It's Free
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{ backgroundColor: "oklch(0.20 0.05 213)" }}
        className="py-12"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
                >
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  Family Chat
                </span>
              </div>
              <p className="text-sm" style={{ color: "oklch(0.65 0.03 213)" }}>
                A private space for the people who matter most.
              </p>
            </div>
            <div className="sm:text-center">
              <div className="space-y-2">
                {[
                  "Group Chat",
                  "Photo Gallery",
                  "Announcements",
                  "Members",
                ].map((link) => (
                  <div
                    key={link}
                    className="text-sm"
                    style={{ color: "oklch(0.65 0.03 213)" }}
                  >
                    {link}
                  </div>
                ))}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm" style={{ color: "oklch(0.65 0.03 213)" }}>
                © {new Date().getFullYear()}. Built with{" "}
                <Heart
                  className="inline w-3 h-3"
                  style={{ color: "oklch(0.65 0.115 28)" }}
                />{" "}
                using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "oklch(0.75 0.06 213)" }}
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
