import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable } from '../components/data-display/DataTable';
import type { DataTableColumn } from '../components/data-display/DataTable';

interface Person {
  id: number;
  name: string;
  age: number;
  role: string;
}

const data: Person[] = [
  { id: 1, name: 'Grace', age: 45, role: 'admin' },
  { id: 2, name: 'Ada', age: 36, role: 'user' },
  { id: 3, name: 'Alan', age: 41, role: 'admin' },
];

const columns: DataTableColumn<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' },
];

/** 读取表体每行首列文本，用于断言行顺序 */
const bodyNames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('tbody tr')).map((row) => row.querySelector('td')?.textContent ?? '');

describe('DataTable', () => {
  it('renders column headers and rows from the accessor', () => {
    const { container } = render(<DataTable columns={columns} data={data} caption="People" />);
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText('People')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeTruthy();
    expect(bodyNames(container)).toEqual(['Grace', 'Ada', 'Alan']);
  });

  it('sorts by a column through asc, desc, then clears', () => {
    const { container } = render(<DataTable columns={columns} data={data} />);
    const sortButton = screen.getByRole('button', { name: 'Name' });
    const header = screen.getByRole('columnheader', { name: 'Name' });

    fireEvent.click(sortButton);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(bodyNames(container)).toEqual(['Ada', 'Alan', 'Grace']);

    fireEvent.click(sortButton);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(bodyNames(container)).toEqual(['Grace', 'Alan', 'Ada']);

    fireEvent.click(sortButton);
    expect(header.getAttribute('aria-sort')).toBe('none');
    expect(bodyNames(container)).toEqual(['Grace', 'Ada', 'Alan']);
  });

  it('filters rows with the global search box and resets to the first page', () => {
    const { container } = render(<DataTable columns={columns} data={data} searchable pageSize={2} />);
    fireEvent.change(screen.getByLabelText('搜索'), { target: { value: 'ada' } });
    expect(bodyNames(container)).toEqual(['Ada']);
  });

  it('paginates rows and navigates pages', () => {
    const { container } = render(<DataTable columns={columns} data={data} pageSize={2} />);
    expect(bodyNames(container)).toEqual(['Grace', 'Ada']);

    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));
    expect(bodyNames(container)).toEqual(['Alan']);
  });

  it('selects a page, shows the mixed state and clears the selection', () => {
    render(<DataTable columns={columns} data={data} selectable pageSize={2} />);
    const selectAll = screen.getByLabelText('全选本页') as HTMLInputElement;
    const firstRow = screen.getByLabelText('选择第 1 行') as HTMLInputElement;

    fireEvent.click(firstRow);
    expect(firstRow.checked).toBe(true);
    expect(selectAll.getAttribute('aria-checked')).toBe('mixed');
    expect(screen.getByText('已选 1 行')).toBeTruthy();

    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(true);
    expect(screen.getByText('已选 2 行')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(selectAll.checked).toBe(false);
  });

  it('renders skeleton rows while loading', () => {
    const { container } = render(<DataTable columns={columns} data={[]} loading pageSize={3} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(container.querySelectorAll('.elyri-ui-data-table__skeleton').length).toBeGreaterThan(0);
    expect(container.querySelector('.elyri-ui-data-table')?.getAttribute('aria-busy')).toBe('true');
  });

  it('renders the empty state when there is no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  it('supports a custom cell renderer with the original row index', () => {
    const custom: DataTableColumn<Person>[] = [
      { id: 'name', header: 'Name', accessor: 'name', cell: (row, index) => `${index + 1}. ${row.name}` },
    ];
    const { container } = render(<DataTable columns={custom} data={data} />);
    expect(bodyNames(container)).toEqual(['1. Grace', '2. Ada', '3. Alan']);
  });
});
