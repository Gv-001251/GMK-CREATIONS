import LoginForm from "./login-form";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

// Server component: renders the login form shell in the initial HTML (no
// client-only Suspense fallback), reading any auth error from the URL server-side.
export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return <LoginForm initialError={error ? decodeURIComponent(error) : ""} />;
}
