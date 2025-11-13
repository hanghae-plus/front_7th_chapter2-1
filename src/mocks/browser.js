import { handlers } from '@/mocks/handlers';
import { setupWorker } from 'msw/browser';

// MSW 워커 설정
export const worker = setupWorker(...handlers);
