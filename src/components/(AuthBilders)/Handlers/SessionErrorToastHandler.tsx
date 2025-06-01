'use client';
import { useEffect, useRef } from "react";
import { SessionErrorToast } from "@/components/(AuthBilders)/Alerts/Toasts";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { Session } from "@/app/lib/(AuthBilders)/defintions";

export default function SessionErrorToastHandler({
  data,
}: {
  data: Session | null;
}) {
  const toastShownRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (data || toastShownRef.current) return;

    toastShownRef.current = true;

    SessionErrorToast({
      endContent: (
        <Button
          size="sm"
          variant="flat"
          color="danger"
          onPress={() => router.push("/login")}
        >
          Login
        </Button>
      ),
    });
  }, [data, router]);

  return null;
}
