export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">ResumeForge AI</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Build ATS-friendly resumes. Powered by AI. Free forever.
      </p>
      <a
        href="/login"
        className="rounded-lg bg-[var(--primary)] px-6 py-3 text-[var(--primary-foreground)] font-medium hover:opacity-90"
      >
        Get Started
      </a>
    </main>
  );
}
