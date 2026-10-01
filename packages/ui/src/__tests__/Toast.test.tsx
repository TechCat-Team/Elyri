import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from '../components/feedback/Toast';

function Trigger() {
  const { toast } = useToast();

  return (
    <button type="button" onClick={() => toast({ title: 'Saved', description: 'All good', duration: 0 })}>
      Fire
    </button>
  );
}

function LoadingTrigger() {
  const { toast, update } = useToast();
  const idRef = useRef('');

  return (
    <>
      <button type="button" onClick={() => (idRef.current = toast({ title: 'Uploading', variant: 'loading' }))}>
        Start
      </button>
      <button type="button" onClick={() => update(idRef.current, { title: 'Uploaded', variant: 'success' })}>
        Finish
      </button>
    </>
  );
}

function LifecycleTrigger() {
  const { toast } = useToast();

  return (
    <>
      <button type="button" onClick={() => toast({ title: 'AutoMsg', duration: 20 })}>
        Auto
      </button>
      <button type="button" onClick={() => toast({ title: 'StayMsg', duration: 0 })}>
        Stay
      </button>
    </>
  );
}

function BulkTrigger() {
  const { toast, dismiss } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          toast({ title: 'One', duration: 0 });
          toast({ title: 'Two', duration: 0 });
        }}
      >
        Add
      </button>
      <button type="button" onClick={() => dismiss()}>
        Clear
      </button>
    </>
  );
}

function SilentTrigger() {
  const { toast } = useToast();

  return (
    <button type="button" onClick={() => toast({ title: 'Silent', duration: 0, dismissible: false })}>
      Fire
    </button>
  );
}

function PromiseTrigger() {
  const { promise } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          promise(Promise.resolve('42'), {
            loading: { title: 'Loading' },
            success: (data) => ({ title: `Done ${data}`, duration: 0 }),
            error: { title: 'Failed', duration: 0 },
          })
        }
      >
        Resolve
      </button>
      <button
        type="button"
        onClick={() =>
          promise(Promise.reject(new Error('boom')), {
            loading: { title: 'Pending' },
            success: { title: 'Won', duration: 0 },
            error: { title: 'Failed', duration: 0 },
          }).catch(() => {})
        }
      >
        Reject
      </button>
    </>
  );
}

describe('Toast', () => {
  it('pushes a toast into the viewport and dismisses it after the exit animation', async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    expect(screen.queryByText('Saved')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('All good');
    expect(screen.getByRole('status').hasAttribute('duration')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.getByText('Saved').closest('[data-state]')?.getAttribute('data-state')).toBe('closed');

    await waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  });

  it('renders a loading toast that can be updated in place', () => {
    render(
      <ToastProvider>
        <LoadingTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    const loading = screen.getByText('Uploading').closest('.elyri-ui-toast');
    expect(loading?.getAttribute('aria-busy')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    const updated = screen.getByText('Uploaded').closest('.elyri-ui-toast');
    expect(updated?.getAttribute('aria-busy')).toBeNull();
  });

  it('reports why a toast closed via onClose', async () => {
    const onClose = vi.fn();
    render(
      <ToastProvider onClose={onClose}>
        <LifecycleTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(expect.any(String), 'timeout'));
    await waitFor(() => expect(screen.queryByText('AutoMsg')).toBeNull());

    fireEvent.click(screen.getByRole('button', { name: 'Stay' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(expect.any(String), 'manual'));
  });

  it('closes every toast when dismiss is called without an id', async () => {
    render(
      <ToastProvider>
        <BulkTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('One')).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(screen.queryByText('One')).toBeNull());
    expect(screen.queryByText('Two')).toBeNull();
  });

  it('hides the close button when dismissible is false', () => {
    render(
      <ToastProvider>
        <SilentTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(screen.getByText('Silent')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('tracks a promise from loading to success or error', async () => {
    render(
      <ToastProvider>
        <PromiseTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Resolve' }));
    expect(screen.getByText('Loading')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Done 42')).toBeTruthy());
    expect(screen.getByText('Done 42').closest('.elyri-ui-toast')?.className).toContain('elyri-ui-toast--success');

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByText('Pending')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Failed')).toBeTruthy());
    expect(screen.getByText('Failed').closest('.elyri-ui-toast')?.className).toContain('elyri-ui-toast--danger');
  });
});
