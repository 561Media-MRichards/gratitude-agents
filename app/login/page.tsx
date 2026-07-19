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
          background: "radial-gradient(ellipse, rgba(236, 114, 17, 0.12) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-reveal px-6 w-full">
        {/* Logo */}
        <Image
          src="/gratitude-white.svg"
          alt="Gratitude"
          width={220}
          height={44}
          priority
        />

        <p className="text-white/40 text-[13px] tracking-wide mt-5 mb-9">
          Sign in to your team workspace
        </p>

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
