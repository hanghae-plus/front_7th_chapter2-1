import { Router } from '@/core/router';

declare global {
  interface Window {
    router: Router;
  }

  const router: Router;
}
