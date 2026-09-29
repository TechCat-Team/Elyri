import type { HTMLAttributes } from 'react';

import { cn } from '../../../core';

import './Card.css';

export type CardProps = HTMLAttributes<HTMLDivElement>;

function CardRoot({ className, ...rest }: CardProps) {
  return <div className={cn('elyri-ui-card', className)} {...rest} />;
}

function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('elyri-ui-card__title', className)} {...rest} />;
}

function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('elyri-ui-card__description', className)} {...rest} />;
}

function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__content', className)} {...rest} />;
}

function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('elyri-ui-card__footer', className)} {...rest} />;
}

/** 卡片：容器 + 标题 / 描述 / 内容 / 底栏四段，可组合也可单独使用子组件 */
export const Card = Object.assign(CardRoot, {
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
