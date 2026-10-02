import type { CSSProperties } from 'react';

import { MeshGradient } from '@elyri/motion';
import { Avatar, AvatarGroup, Button, Card, Progress, Tag } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '卡片：容器与媒体 / 头部 / 标题 / 描述 / 内容 / 底栏，支持多种样式、尺寸与可交互态，可组合使用也可单独取用子组件。',
    exShowcase: '项目卡片',
    exShowcaseDesc: '渐变媒体区、项目图标、关键指标、进度与成员头像组合成一张信息丰富的项目卡片。',
    exBasic: '基础用法',
    exBasicDesc: '标题、描述、内容与底栏四段组合成完整卡片。',
    exVariants: '样式',
    exVariantsDesc: 'outlined / elevated / filled / ghost 四种外观。',
    exInteractive: '可交互',
    exInteractiveDesc: '开启 interactive 后悬停上浮，配合 tabIndex 支持键盘聚焦。',
    exMinimal: '精简卡片',
    exMinimalDesc: '只取用标题与描述两个区块。',
    descVariant: '视觉样式',
    descSize: '内边距尺寸',
    descInteractive: '可交互：悬停上浮、聚焦显示焦点环',
    descMedia: '贴边铺满的媒体区，放在首位时与圆角对齐',
    descHeader: '头部，左侧放标题与描述，右侧放 Card.Action',
    descAction: '头部右侧操作区',
    descTitle: '标题区块',
    descDescription: '描述区块',
    descContent: '任意内容区',
    descFooter: '底栏，通常放操作按钮；align 控制对齐',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A card container with media, header, title, description, content and footer slots. Supports variants, sizes and an interactive state; compose or use slots standalone.',
    exShowcase: 'Project card',
    exShowcaseDesc:
      'A gradient media area, project icon, key metrics, progress and member avatars composed into a rich project card.',
    exBasic: 'Basic',
    exBasicDesc: 'Title, description, content and footer composed into a full card.',
    exVariants: 'Variants',
    exVariantsDesc: 'outlined / elevated / filled / ghost appearances.',
    exInteractive: 'Interactive',
    exInteractiveDesc: 'With interactive enabled the card lifts on hover; add tabIndex for keyboard focus.',
    exMinimal: 'Minimal',
    exMinimalDesc: 'Only the title and description slots.',
    descVariant: 'Visual style',
    descSize: 'Padding size',
    descInteractive: 'Interactive: lift on hover, focus ring on focus',
    descMedia: 'Full-bleed media area, aligned to the corners when placed first',
    descHeader: 'Header with title/description on the left and Card.Action on the right',
    descAction: 'Action area on the right of the header',
    descTitle: 'Title slot',
    descDescription: 'Description slot',
    descContent: 'Free-form content area',
    descFooter: 'Footer, usually for actions; align controls alignment',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

/** 项目图标统一使用站点 logo */
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`;

const meshColors: [string, string, string, string] = ['#6d5bd0', '#9b6bff', '#ff8fb1', '#38bdf8'];

const mediaStyle: CSSProperties = {
  position: 'relative',
  height: 148,
};

/** 缩略图里用更紧凑的一版：媒体更矮、去掉统计区，完整放进预览框 */
const showcaseCardStyle: CSSProperties = { width: 'min(230px, 100%)' };

const showcaseMediaStyle: CSSProperties = {
  position: 'relative',
  height: 64,
};

const identityStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };

const titleStackStyle: CSSProperties = { minWidth: 0 };

const statsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  padding: '4px 0 8px',
};

const statValueStyle: CSSProperties = { fontSize: 16, fontWeight: 700, lineHeight: 1.2 };

const statLabelStyle: CSSProperties = { marginTop: 2, fontSize: 12, color: 'var(--elyri-ui-muted)' };

const variants = ['outlined', 'elevated', 'filled', 'ghost'] as const;

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
      { name: 'variant', type: "'outlined' | 'elevated' | 'filled' | 'ghost'", default: "'outlined'", description: t.descVariant },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'interactive', type: 'boolean', default: 'false', description: t.descInteractive },
      { name: 'Card.Media', type: 'HTMLAttributes<HTMLDivElement>', description: t.descMedia },
      { name: 'Card.Header', type: 'HTMLAttributes<HTMLDivElement>', description: t.descHeader },
      { name: 'Card.Action', type: 'HTMLAttributes<HTMLDivElement>', description: t.descAction },
      { name: 'Card.Title', type: 'HTMLAttributes<HTMLHeadingElement>', description: t.descTitle },
      { name: 'Card.Description', type: 'HTMLAttributes<HTMLParagraphElement>', description: t.descDescription },
      { name: 'Card.Content', type: 'HTMLAttributes<HTMLDivElement>', description: t.descContent },
      { name: 'Card.Footer', type: "{ align?: 'start' | 'end' | 'between' }", default: "'start'", description: t.descFooter },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    showcase: () => (
      <Card variant="elevated" size="sm" style={showcaseCardStyle}>
        <Card.Media style={showcaseMediaStyle}>
          <MeshGradient colors={meshColors} speed={0.5} interactive={false} style={{ height: '100%' }} />
        </Card.Media>
        <Card.Title>Aurora Dashboard</Card.Title>
        <Card.Description>Realtime analytics for the growth team.</Card.Description>
        <Card.Footer align="between">
          <AvatarGroup size="sm">
            <Avatar name="Ada Lovelace" />
            <Avatar name="Alan Turing" />
            <Avatar name="Grace Hopper" />
          </AvatarGroup>
          <Button size="sm">Open</Button>
        </Card.Footer>
      </Card>
    ),
    examples: [
      {
        title: t.exShowcase,
        description: t.exShowcaseDesc,
        render: () => (
          <div className="demo-stack">
            <Card variant="elevated">
              <Card.Media style={mediaStyle}>
                <MeshGradient colors={meshColors} speed={0.5} interactive={false} style={{ height: '100%' }} />
              </Card.Media>
              <Card.Header>
                <div style={identityStyle}>
                  <Avatar src={LOGO_SRC} alt="Aurora" shape="square" size="lg" fit="contain" />
                  <div style={titleStackStyle}>
                    <Card.Title>Aurora Dashboard</Card.Title>
                    <Card.Description>Realtime analytics for the growth team.</Card.Description>
                  </div>
                </div>
                <Card.Action>
                  <Button size="sm" variant="ghost" iconOnly aria-label="More">
                    ⋯
                  </Button>
                </Card.Action>
              </Card.Header>
              <Card.Content>
                <div style={statsStyle}>
                  <div>
                    <div style={statValueStyle}>24</div>
                    <div style={statLabelStyle}>Tasks</div>
                  </div>
                  <div>
                    <div style={statValueStyle}>6</div>
                    <div style={statLabelStyle}>In review</div>
                  </div>
                  <div>
                    <div style={statValueStyle}>72%</div>
                    <div style={statLabelStyle}>Sprint</div>
                  </div>
                </div>
                <Progress value={72} size="sm" label="Sprint progress" />
              </Card.Content>
              <Card.Footer align="between">
                <AvatarGroup size="sm">
                  <Avatar name="Ada Lovelace" />
                  <Avatar name="Alan Turing" />
                  <Avatar name="Grace Hopper" />
                </AvatarGroup>
                <Button size="sm">Open project</Button>
              </Card.Footer>
            </Card>
          </div>
        ),
        code: `import type { CSSProperties } from 'react';

import { MeshGradient } from './components/elyri/MeshGradient';
import { Avatar, AvatarGroup } from './components/elyri/Avatar';
import { Button } from './components/elyri/Button';
import { Card } from './components/elyri/Card';
import { Progress } from './components/elyri/Progress';

const meshColors: [string, string, string, string] = ['#6d5bd0', '#9b6bff', '#ff8fb1', '#38bdf8'];

const mediaStyle: CSSProperties = {
  position: 'relative',
  height: 148,
};

const identityStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };

const titleStackStyle: CSSProperties = { minWidth: 0 };

const statsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12,
  padding: '4px 0 8px',
};

const statValueStyle: CSSProperties = { fontSize: 16, fontWeight: 700, lineHeight: 1.2 };

const statLabelStyle: CSSProperties = { marginTop: 2, fontSize: 12, color: 'var(--elyri-ui-muted)' };

export function Example() {
  return (
    <Card variant="elevated">
      <Card.Media style={mediaStyle}>
        <MeshGradient colors={meshColors} speed={0.5} interactive={false} style={{ height: '100%' }} />
      </Card.Media>
      <Card.Header>
        <div style={identityStyle}>
          <Avatar src="/logo.svg" alt="Aurora" shape="square" size="lg" fit="contain" />
          <div style={titleStackStyle}>
            <Card.Title>Aurora Dashboard</Card.Title>
            <Card.Description>Realtime analytics for the growth team.</Card.Description>
          </div>
        </div>
        <Card.Action>
          <Button size="sm" variant="ghost" iconOnly aria-label="More">
            ⋯
          </Button>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        <div style={statsStyle}>
          <div>
            <div style={statValueStyle}>24</div>
            <div style={statLabelStyle}>Tasks</div>
          </div>
          <div>
            <div style={statValueStyle}>6</div>
            <div style={statLabelStyle}>In review</div>
          </div>
          <div>
            <div style={statValueStyle}>72%</div>
            <div style={statLabelStyle}>Sprint</div>
          </div>
        </div>
        <Progress value={72} size="sm" label="Sprint progress" />
      </Card.Content>
      <Card.Footer align="between">
        <AvatarGroup size="sm">
          <Avatar name="Ada Lovelace" />
          <Avatar name="Alan Turing" />
          <Avatar name="Grace Hopper" />
        </AvatarGroup>
        <Button size="sm">Open project</Button>
      </Card.Footer>
    </Card>
  );
}`,
      },
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
                  <Tag variant="accent">v0.0.1</Tag>
                  <Tag variant="success">Stable</Tag>
                  <Tag>Zero deps</Tag>
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
        code: `import { Tag } from './components/elyri/Tag';
import { Button } from './components/elyri/Button';
import { Card } from './components/elyri/Card';

export function Example() {
  return (
    <Card>
      <Card.Title>Ship faster</Card.Title>
      <Card.Description>A neutral card that inherits the host theme through CSS variables.</Card.Description>
      <Card.Content>
        <div className="demo-ui-row demo-ui-row--start">
          <Tag variant="accent">v0.0.1</Tag>
          <Tag variant="success">Stable</Tag>
          <Tag>Zero deps</Tag>
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
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-grid">
            {variants.map((variant) => (
              <Card key={variant} variant={variant} size="sm">
                <Card.Title>{variant}</Card.Title>
                <Card.Description>variant=&quot;{variant}&quot;</Card.Description>
              </Card>
            ))}
          </div>
        ),
        code: `import { Card } from './components/elyri/Card';

const variants = ['outlined', 'elevated', 'filled', 'ghost'] as const;

export function Example() {
  return (
    <div className="demo-ui-grid">
      {variants.map((variant) => (
        <Card key={variant} variant={variant} size="sm">
          <Card.Title>{variant}</Card.Title>
          <Card.Description>variant="{variant}"</Card.Description>
        </Card>
      ))}
    </div>
  );
}`,
      },
      {
        title: t.exInteractive,
        description: t.exInteractiveDesc,
        render: () => (
          <div className="demo-ui-grid">
            <Card interactive tabIndex={0}>
              <Card.Header>
                <Card.Title>Starter</Card.Title>
                <Card.Action>
                  <Tag size="sm">Free</Tag>
                </Card.Action>
              </Card.Header>
              <Card.Description>Everything you need to prototype.</Card.Description>
            </Card>
            <Card interactive tabIndex={0}>
              <Card.Header>
                <Card.Title>Pro</Card.Title>
                <Card.Action>
                  <Tag size="sm" variant="accent">
                    Popular
                  </Tag>
                </Card.Action>
              </Card.Header>
              <Card.Description>Advanced components and priority support.</Card.Description>
            </Card>
          </div>
        ),
        code: `import { Tag } from './components/elyri/Tag';
import { Card } from './components/elyri/Card';

export function Example() {
  return (
    <div className="demo-ui-grid">
      <Card interactive tabIndex={0}>
        <Card.Header>
          <Card.Title>Starter</Card.Title>
          <Card.Action>
            <Tag size="sm">Free</Tag>
          </Card.Action>
        </Card.Header>
        <Card.Description>Everything you need to prototype.</Card.Description>
      </Card>
      <Card interactive tabIndex={0}>
        <Card.Header>
          <Card.Title>Pro</Card.Title>
          <Card.Action>
            <Tag size="sm" variant="accent">
              Popular
            </Tag>
          </Card.Action>
        </Card.Header>
        <Card.Description>Advanced components and priority support.</Card.Description>
      </Card>
    </div>
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
