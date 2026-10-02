import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarGroup } from '../components/data-display/Avatar';

describe('Avatar', () => {
  it('derives latin initials from the name and exposes it as the accessible name', () => {
    render(<Avatar name="Ada Lovelace" />);

    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar.className).toContain('elyri-ui-avatar--md');
    expect(avatar.textContent).toBe('AL');
  });

  it('keeps the first two characters for CJK names', () => {
    render(<Avatar name="张三" />);

    expect(screen.getByRole('img', { name: '张三' }).textContent).toBe('张三');
  });

  it('applies variant modifiers and a stable hue from the name', () => {
    const { container } = render(<Avatar name="Ada" size="lg" shape="square" />);

    const avatar = screen.getByRole('img', { name: 'Ada' });
    expect(avatar.className).toContain('elyri-ui-avatar--lg');
    expect(avatar.className).toContain('elyri-ui-avatar--square');
    expect(avatar.style.getPropertyValue('--elyri-ui-avatar-hue')).not.toBe('');
    expect(container.querySelector('.elyri-ui-avatar__fallback')?.getAttribute('data-hue')).toBe('true');
  });

  it('renders the image when a src is given', () => {
    const { container } = render(<Avatar src="https://example.com/ada.png" name="Ada" />);

    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://example.com/ada.png');
    expect(container.querySelector('.elyri-ui-avatar__fallback')).toBeNull();
  });

  it('marks contain fit so the image is inset instead of cropped', () => {
    const { container } = render(<Avatar src="https://example.com/logo.svg" alt="Logo" fit="contain" />);

    expect(container.querySelector('.elyri-ui-avatar')?.getAttribute('data-fit')).toBe('contain');
  });

  it('leaves the fit attribute off for the default cover mode', () => {
    const { container } = render(<Avatar src="https://example.com/ada.png" alt="Ada" />);

    expect(container.querySelector('.elyri-ui-avatar')?.getAttribute('data-fit')).toBeNull();
  });

  it('falls back to initials when the image fails to load', () => {
    const { container } = render(<Avatar src="https://example.com/ada.png" name="Ada" />);

    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.elyri-ui-avatar__fallback')?.textContent).toBe('A');
  });

  it('renders a custom fallback with priority over initials', () => {
    const { container } = render(<Avatar name="Ada" fallback={<span data-testid="icon" />} />);

    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(container.querySelector('.elyri-ui-avatar__fallback')?.textContent).toBe('');
  });

  it('renders the status dot with its variant', () => {
    const { container } = render(<Avatar name="Ada" status="online" />);

    expect(container.querySelector('.elyri-ui-avatar__status')?.getAttribute('data-status')).toBe('online');
  });

  it('stays decorative when no name or alt is given', () => {
    const { container } = render(<Avatar />);

    const avatar = container.querySelector('.elyri-ui-avatar') as HTMLElement;
    expect(avatar.getAttribute('role')).toBeNull();
    expect(container.querySelector('.elyri-ui-avatar__fallback svg')).toBeTruthy();
  });
});

describe('AvatarGroup', () => {
  it('propagates size and shape to the children', () => {
    const { container } = render(
      <AvatarGroup size="sm" shape="square">
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>,
    );

    const avatars = container.querySelectorAll('.elyri-ui-avatar');
    expect(avatars).toHaveLength(2);
    avatars.forEach((avatar) => {
      expect(avatar.className).toContain('elyri-ui-avatar--sm');
      expect(avatar.className).toContain('elyri-ui-avatar--square');
    });
  });

  it('lets an explicit child prop win over the group default', () => {
    const { container } = render(
      <AvatarGroup size="sm">
        <Avatar name="A" size="xl" />
      </AvatarGroup>,
    );

    expect(container.querySelector('.elyri-ui-avatar--xl')).toBeTruthy();
    expect(container.querySelector('.elyri-ui-avatar--sm')).toBeNull();
  });

  it('collapses the overflow into a +N counter', () => {
    render(
      <AvatarGroup max={3} size="sm">
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
        <Avatar name="E" />
      </AvatarGroup>,
    );

    const group = screen.getByRole('group');
    expect(group.querySelectorAll('.elyri-ui-avatar')).toHaveLength(4);
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('shows every avatar when max is omitted', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>,
    );

    expect(container.querySelectorAll('.elyri-ui-avatar')).toHaveLength(3);
  });
});
