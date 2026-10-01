import { Badge, Button, Card } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '卡片：容器与标题 / 描述 / 内容 / 底栏四段，可组合使用也可单独取用子组件。',
    exBasic: '基础用法',
    exBasicDesc: '标题、描述、内容与底栏四段组合成完整卡片。',
    exMinimal: '精简卡片',
    exMinimalDesc: '只取用标题与描述两个区块。',
    descTitle: '标题区块',
    descDescription: '描述区块',
    descContent: '任意内容区',
    descFooter: '底栏，通常放操作按钮',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A card container with title, description, content and footer slots you can compose or use standalone.',
    exBasic: 'Basic',
    exBasicDesc: 'Title, description, content and footer composed into a full card.',
    exMinimal: 'Minimal',
    exMinimalDesc: 'Only the title and description slots.',
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
    props: [
      { name: 'Card.Title', type: 'HTMLAttributes<HTMLHeadingElement>', description: t.descTitle },
      { name: 'Card.Description', type: 'HTMLAttributes<HTMLParagraphElement>', description: t.descDescription },
      { name: 'Card.Content', type: 'HTMLAttributes<HTMLDivElement>', description: t.descContent },
      { name: 'Card.Footer', type: 'HTMLAttributes<HTMLDivElement>', description: t.descFooter },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-stack">
            <Card>
              <Card.Title>Ship faster</Card.Title>
              <Card.Description>A neutral card that inherits the host theme through CSS variables.</Card.Description>
              <Card.Content>
                <div className="demo-ui-row demo-ui-row--start">
                  <Badge variant="accent">v0.0.1</Badge>
                  <Badge variant="success">Stable</Badge>
                  <Badge>Zero deps</Badge>
                </div>
              </Card.Content>
              <Card.Footer>
                <Button size="sm">Get started</Button>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
              </Card.Footer>
            </Card>
          </div>
        ),
        code: `import { Badge } from './components/elyri/Badge';
import { Button } from './components/elyri/Button';
import { Card } from './components/elyri/Card';

export function Example() {
  return (
    <Card>
      <Card.Title>Ship faster</Card.Title>
      <Card.Description>A neutral card that inherits the host theme through CSS variables.</Card.Description>
      <Card.Content>
        <div className="demo-ui-row demo-ui-row--start">
          <Badge variant="accent">v0.0.1</Badge>
          <Badge variant="success">Stable</Badge>
          <Badge>Zero deps</Badge>
        </div>
      </Card.Content>
      <Card.Footer>
        <Button size="sm">Get started</Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </Card.Footer>
    </Card>
  );
}`,
      },
      {
        title: t.exMinimal,
        description: t.exMinimalDesc,
        render: () => (
          <div className="demo-stack">
            <Card>
              <Card.Title>Zero config</Card.Title>
              <Card.Description>Sensible defaults, no setup required.</Card.Description>
            </Card>
          </div>
        ),
        code: `import { Card } from './components/elyri/Card';

export function Example() {
  return (
    <Card>
      <Card.Title>Zero config</Card.Title>
      <Card.Description>Sensible defaults, no setup required.</Card.Description>
    </Card>
  );
}`,
      },
    ],
  };
};
