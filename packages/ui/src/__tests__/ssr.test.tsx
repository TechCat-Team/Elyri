import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../components/feedback/Alert';
import { ToastProvider } from '../components/feedback/Toast';
import { DataTable } from '../components/data-display/DataTable';
import type { DataTableColumn } from '../components/data-display/DataTable';
import { Button } from '../components/forms/Button';
import { Checkbox } from '../components/forms/Checkbox';
import { Field } from '../components/forms/Field';
import { Input } from '../components/forms/Input';
import { RadioGroup } from '../components/forms/Radio';
import { Select } from '../components/forms/Select';
import { Accordion } from '../components/navigation/Accordion';
import { Tabs } from '../components/navigation/Tabs';
import { Pagination } from '../components/navigation/Pagination';
import { Dialog } from '../components/overlays/Dialog';

interface TableRow {
  id: number;
  name: string;
}

const tableColumns: DataTableColumn<TableRow>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
];

function App() {
  return (
    <div>
      <Button>Save</Button>
      <Field>
        <Field.Label>Email</Field.Label>
        <Input placeholder="you@example.com" />
        <Field.Description>Hint</Field.Description>
      </Field>
      <Checkbox defaultChecked>Remember me</Checkbox>
      <RadioGroup defaultValue="apple">
        <RadioGroup.Radio value="apple">Apple</RadioGroup.Radio>
      </RadioGroup>
      <Select placeholder="Pick a fruit" defaultValue="apple">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
        </Select.Content>
      </Select>
      <Alert variant="info" title="Note">
        Body
      </Alert>
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Trigger value="one">One</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">Panel</Tabs.Panel>
      </Tabs>
      <Accordion defaultValue="one">
        <Accordion.Item value="one">
          <Accordion.Trigger>One</Accordion.Trigger>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <Pagination total={5} defaultPage={2} showEdges />
      <DataTable
        columns={tableColumns}
        data={[
          { id: 1, name: 'Ada' },
          { id: 2, name: 'Alan' },
        ]}
        selectable
        searchable
      />
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
