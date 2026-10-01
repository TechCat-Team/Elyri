import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import { Alert } from '../components/feedback/Alert';
import { Progress } from '../components/feedback/Progress';
import { ToastProvider, useToast } from '../components/feedback/Toast';
import { Button } from '../components/forms/Button';
import { Input } from '../components/forms/Input';
import { Switch } from '../components/forms/Switch';
import { Tabs } from '../components/navigation/Tabs';
import { Dialog } from '../components/overlays/Dialog';
import { DropdownMenu } from '../components/overlays/DropdownMenu';

/** jsdom 无布局，color-contrast 与 region 规则不可用，关闭以避免误报 */
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

async function expectNoViolations(context: HTMLElement) {
  const results = await axe.run(context, AXE_OPTIONS);
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

function ToastTrigger() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: 'Saved', duration: 0 })}>
      Fire
    </button>
  );
}

describe('accessibility (axe)', () => {
  it('passes for forms and feedback components', async () => {
    const { container } = render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" invalid />
        <Button>Save</Button>
        <Switch aria-label="Notifications" />
        <Progress value={40} label="Upload" showValue />
        <Alert variant="warning" title="Heads up">
          Check the field
        </Alert>
      </div>,
    );

    await expectNoViolations(container);
  });

  it('passes for tabs', async () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">Panel one</Tabs.Panel>
        <Tabs.Panel value="two">Panel two</Tabs.Panel>
      </Tabs>,
    );

    await expectNoViolations(container);
  });

  it('passes when a dialog is open (named by its title)', async () => {
    render(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <Dialog.Close>Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes when a menu is open', async () => {
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Item danger>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeTruthy());

    await expectNoViolations(document.body);
  });

  it('passes when a toast is shown', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fire' }));
    await waitFor(() => expect(screen.getByText('Saved')).toBeTruthy());

    await expectNoViolations(document.body);
  });
});
