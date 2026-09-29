import { lazy } from 'react';

import type { ComponentDoc, Lang } from '../../../lib/types';

const CardDemo = lazy(() => import('./CardDemo'));

const DEFAULTS = {
  title: 'Ship faster',
  description: 'A neutral card that inherits the host theme through CSS variables.',
};

const copy = {
  zh: {
    description: '卡片：容器与标题 / 描述 / 内容 / 底栏四段，可组合使用也可单独取用子组件。',
    titleLabel: '标题',
    descriptionLabel: '描述',
    descTitle: '标题区块',
    descDescription: '描述区块',
    descContent: '任意内容区',
    descFooter: '底栏，通常放操作按钮',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A card container with title, description, content and footer slots you can compose or use standalone.',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    descTitle: 'Title slot',
    descDescription: 'Description slot',
    descContent: 'Free-form content area',
    descFooter: 'Footer, usually for actions',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const cardDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'card',
    title: 'Card',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'title', label: t.titleLabel, default: DEFAULTS.title },
      { type: 'text', name: 'description', label: t.descriptionLabel, default: DEFAULTS.description },
    ],
    props: [
      { name: 'Card.Title', type: 'HTMLAttributes<HTMLHeadingElement>', description: t.descTitle },
      { name: 'Card.Description', type: 'HTMLAttributes<HTMLParagraphElement>', description: t.descDescription },
      { name: 'Card.Content', type: 'HTMLAttributes<HTMLDivElement>', description: t.descContent },
      { name: 'Card.Footer', type: 'HTMLAttributes<HTMLDivElement>', description: t.descFooter },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    render: (v) => <CardDemo title={v.title as string} description={v.description as string} />,
    usage: (v) =>
      `import { Button } from './components/elyri/Button';
import { Card } from './components/elyri/Card';

export function Example() {
  return (
    <Card>
      <Card.Title>${v.title}</Card.Title>
      <Card.Description>${v.description}</Card.Description>
      <Card.Content>Anything you like.</Card.Content>
      <Card.Footer>
        <Button size="sm">Get started</Button>
      </Card.Footer>
    </Card>
  );
}`,
  };
};
