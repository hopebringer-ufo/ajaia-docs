import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-sm ring-1 ring-foreground/5">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Ajaia Docs
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start writing and sharing documents in minutes.
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
