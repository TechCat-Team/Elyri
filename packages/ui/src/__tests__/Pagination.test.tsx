import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '../components/navigation/Pagination';

type PaginationTestProps = Partial<ComponentProps<typeof Pagination>>;

const renderPagination = (props: PaginationTestProps = {}) => render(<Pagination total={10} {...props} />);

const currentPage = () => {
  const active = screen.getAllByRole('button').find((button) => button.getAttribute('aria-current') === 'page');
  return active?.textContent ?? null;
};

describe('Pagination', () => {
  it('exposes a named navigation landmark with prev / next controls', () => {
    renderPagination({ defaultPage: 3 });

    expect(screen.getByRole('navigation', { name: '分页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '上一页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下一页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '第 3 页' }).getAttribute('aria-current')).toBe('page');
  });

  it('collapses the middle range into ellipses', () => {
    renderPagination({ total: 50, defaultPage: 25 });

    expect(screen.getAllByText('…')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '第 1 页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '第 50 页' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '第 25 页' })).toBeTruthy();
  });

  it('disables previous at the first page and next at the last page', () => {
    const { unmount } = renderPagination({ defaultPage: 1 });
    expect((screen.getByRole('button', { name: '上一页' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: '下一页' }) as HTMLButtonElement).disabled).toBe(false);
    unmount();

    renderPagination({ defaultPage: 10 });
    expect((screen.getByRole('button', { name: '下一页' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('updates the current page on click when uncontrolled', () => {
    renderPagination({ defaultPage: 1 });

    fireEvent.click(screen.getByRole('button', { name: '第 2 页' }));

    expect(currentPage()).toBe('2');
  });

  it('reports changes without mutating a controlled page', () => {
    const onPageChange = vi.fn();
    renderPagination({ page: 4, onPageChange });

    fireEvent.click(screen.getByRole('button', { name: '第 5 页' }));

    expect(onPageChange).toHaveBeenCalledWith(5);
    expect(currentPage()).toBe('4');
  });

  it('jumps to the first and last page from the edge buttons', () => {
    renderPagination({ defaultPage: 5, showEdges: true });

    expect(screen.getByRole('button', { name: '第一页' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '最后一页' }));

    expect(currentPage()).toBe('10');
  });

  it('renders the page-size selector and reports changes', () => {
    const onPageSizeChange = vi.fn();
    renderPagination({ pageSizeOptions: [10, 20, 50], onPageSizeChange });

    const select = screen.getByRole('combobox', { name: '每页' }) as HTMLSelectElement;
    expect(select.value).toBe('10');

    fireEvent.change(select, { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('jumps to the typed page on Enter and clamps out-of-range input', () => {
    const onPageChange = vi.fn();
    renderPagination({ page: 1, showJump: true, onPageChange });

    const input = screen.getByRole('textbox', { name: '跳至' });
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it('disables every control when disabled', () => {
    renderPagination({ disabled: true, showEdges: true, showJump: true, pageSizeOptions: [10] });

    screen.getAllByRole('button').forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
    expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(true);
  });

  it('applies variant and size modifiers', () => {
    const { container } = render(<Pagination total={5} variant="filled" size="sm" />);
    const nav = container.querySelector('nav');

    expect(nav?.className).toContain('elyri-ui-pagination--filled');
    expect(nav?.className).toContain('elyri-ui-pagination--sm');
  });
});
