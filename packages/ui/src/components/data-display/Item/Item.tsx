import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Item.css';

export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'sm' | 'md' | 'lg';
export type ItemMediaVariant = 'default' | 'icon' | 'image';

export interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 视觉样式，默认 default */
  variant?: ItemVariant;
  /** 内边距与字号尺寸，默认 md */
  size?: ItemSize;
  /** 可交互：悬停高亮、键盘聚焦显示焦点环 */
  interactive?: boolean;
}

export interface ItemMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** 媒体样式：default 无底衬 / icon 图标底衬 / image 图片裁切，默认 default */
  variant?: ItemMediaVariant;
}

function ItemRoot({ variant = 'default', size = 'md', interactive = false, className, ...rest }: ItemProps) {
  return (
    <div
      className={cn('elyri-ui-item', `elyri-ui-item--${variant}`, `elyri-ui-item--${size}`, className)}
      data-interactive={interactive ? 'true' : undefined}
      {...rest}
    />
  );
}

function ItemGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-item-group', className)} {...rest} />;
}

function ItemMedia({ variant = 'default', className, ...rest }: ItemMediaProps) {
  return <div className={cn('elyri-ui-item__media', `elyri-ui-item__media--${variant}`, className)} {...rest} />;
}

function ItemContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-item__content', className)} {...rest} />;
}

function ItemTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('elyri-ui-item__title', className)} {...rest}>
      {children}
    </h3>
  );
}

function ItemDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('elyri-ui-item__description', className)} {...rest} />;
}

function ItemActions({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-item__actions', className)} {...rest} />;
}

/** 列表项：前置媒体 + 内容 + 尾部操作；可用 Item.Group 堆叠成列表，也常嵌入 Card 组合 */
export const Item = Object.assign(ItemRoot, {
  Group: ItemGroup,
  Media: ItemMedia,
  Content: ItemContent,
  Title: ItemTitle,
  Description: ItemDescription,
  Actions: ItemActions,
});
