import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../components/feedback/Alert';
import { ToastProvider } from '../components/feedback/Toast';
import { Button } from '../components/forms/Button';
import { Tabs } from '../components/navigation/Tabs';
import { Dialog } from '../components/overlays/Dialog';

function App() {
  return (
    <div>
      <Button>Save</Button>
      <Alert variant="info" title="Note">
        Body
      </Alert>
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">Panel</Tabs.Panel>
      </Tabs>
    </div>
  );
}

describe('SSR / StrictMode', () => {
  it('renders to HTML on the server', () => {
    expect(renderToString(<App />)).toContain('Save');
  });

  it('keeps portal content in the tree while rendering nothing into the DOM ahead of hydration', () => {
    // Portal 服务端快照为 false，children 正常渲染，浮层不挂载
    const html = renderToString(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );
    expect(html).toContain('Save');
  });

  it('hydrates the server HTML without errors', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<App />);
    document.body.appendChild(container);

    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });

    await act(async () => {
      hydrateRoot(container, <App />);
    });

    spy.mockRestore();
    container.remove();
    expect(errors).toEqual([]);
  });

  it('mounts an overlay under StrictMode without errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <StrictMode>
        <Dialog>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog>
      </StrictMode>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    const calls = spy.mock.calls.length;
    spy.mockRestore();
    expect(calls).toBe(0);
  });
});
