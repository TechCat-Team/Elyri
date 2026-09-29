import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个用例后卸载组件，避免 DOM 在用例间泄漏
afterEach(cleanup);
