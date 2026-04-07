import LoginForm from "@/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-dark-950">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Hero gradient layers */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      {/* Glow orbs — GPU promoted like gratitude.com */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none will-change-transform"
        style={{
          background: "radial-gradient(ellipse, rgba(254, 49, 132, 0.2) 0%, transparent 70%)",
          filter: "blur(150px)",
          opacity: 0.6,
        }}
      />
      <div
        className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none will-change-transform"
        style={{
          background: "radial-gradient(ellipse, rgba(236, 114, 17, 0.15) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none will-change-transform"
        style={{
          background: "radial-gradient(ellipse, rgba(254, 49, 132, 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 animate-reveal">
        {/* Logo */}
        <Image
          src="/gratitude-white.svg"
          alt="Gratitude"
          width={260}
          height={52}
          priority
        />

        {/* Title section */}
        <div className="text-center space-y-3">
          <h1 className="font-display text-5xl uppercase tracking-wide text-gradient">
            PORTAL
          </h1>
          <p className="text-white/50 text-sm tracking-wide">
            Partner-safe access to Gratitude Agents, resources, and knowledge
          </p>
        </div>

        {/* Login form card — matches gratitude.com modal styling */}
        <div
          className="w-full max-w-sm p-8 rounded-2xl backdrop-blur-md"
          style={{
            background: "linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(13, 13, 13, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(254, 49, 132, 0.05)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
