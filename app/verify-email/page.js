import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailClient />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">Verifying your email...</p>
    </div>
  );
}
