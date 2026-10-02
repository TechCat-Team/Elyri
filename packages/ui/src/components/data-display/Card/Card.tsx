import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Card.css';

export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'ghost';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardFooterAlign = 'start' | 'end' | 'between';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 视觉样式，默认 outlined */
  variant?: CardVariant;
  /** 内边距尺寸，默认 md */
  size?: CardSize;
  /** 可交互：悬停上浮、键盘聚焦显示焦点环 */
  interactive?: boolean;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** 底栏对齐方式，默认 start */
  align?: CardFooterAlign;
}

function CardRoot({ variant = 'outlined', size = 'md', interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn('elyri-ui-card', `elyri-ui-card--${variant}`, `elyri-ui-card--${size}`, className)}
      data-interactive={interactive ? 'true' : undefined}
      {...rest}
    />
  );
}

function CardMedia({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__media', className)} {...rest} />;
}

function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__header', className)} {...rest} />;
}

function CardAction({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__action', className)} {...rest} />;
}

function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('elyri-ui-card__title', className)} {...rest}>
      {children}
    </h3>
  );
}

function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('elyri-ui-card__description', className)} {...rest} />;
}

function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__content', className)} {...rest} />;
}

function CardFooter({ align = 'start', className, ...rest }: CardFooterProps) {
  return <div className={cn('elyri-ui-card__footer', `elyri-ui-card__footer--${align}`, className)} {...rest} />;
}

/** 卡片：容器 + 媒体 / 头部 / 标题 / 描述 / 内容 / 底栏，可组合也可单独使用子组件 */
export const Card = Object.assign(CardRoot, {
  Media: CardMedia,
  Header: CardHeader,
  Action: CardAction,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
