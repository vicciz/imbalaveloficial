'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { decodeProductCode } from '@/src/utils/linkMask';

export default function PRedirectClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      router.replace('/');
      return;
    }
    const id = decodeProductCode(code);
    if (!id) {
      router.replace('/');
      return;
    }
    router.replace(`/produto/${id}`);
  }, [searchParams, router]);

  return null;
}
