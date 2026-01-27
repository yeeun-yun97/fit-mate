import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <LoginForm message={message} />
    </div>
  );
}
