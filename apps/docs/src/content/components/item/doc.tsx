import { Avatar, Button, Card, Item, Tag } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description: '列表项：前置媒体 + 内容 + 尾部操作三段式，可分组堆叠成列表，也可直接嵌入卡片组合出信息丰富的场景。',
    exInbox: '收件箱卡片',
    exInboxDesc: '把 Item.Group 放进 Card，用头像、标题、摘要与状态标签拼出一份待办收件箱。',
    exBasic: '基础用法',
    exBasicDesc: '图标媒体 + 标题描述 + 尾部按钮，一行承载一条完整信息。',
    exVariants: '样式',
    exVariantsDesc: 'default 透明底 / outline 描边 / muted 填充，按场景挑选。',
    exSizes: '尺寸',
    exSizesDesc: 'sm / md / lg 三档，媒体尺寸与 Avatar 对齐，可直接嵌入头像。',
    exInteractive: '可交互列表',
    exInteractiveDesc: '开启 interactive 后悬停高亮，配合 tabIndex 支持键盘聚焦，适合可点击的设置项。',
    descVariant: '视觉样式',
    descSize: '内边距与字号尺寸',
    descInteractive: '可交互：悬停高亮、聚焦显示焦点环',
    descGroup: '分组容器，纵向堆叠多个 Item',
    descMedia: '前置媒体区，variant 控制底衬',
    descMediaVariant: 'default 无底衬 / icon 图标底衬 / image 图片裁切',
    descContent: '内容区，纵向排列标题与描述',
    descTitle: '标题',
    descDescription: '描述，最多两行截断',
    descActions: '尾部操作区',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'A list item with leading media, content and trailing actions. Stack them with Item.Group or drop them into a card to compose richer layouts.',
    exInbox: 'Inbox card',
    exInboxDesc: 'An Item.Group inside a Card, composed from avatars, titles, snippets and status tags.',
    exBasic: 'Basic',
    exBasicDesc: 'Icon media, title and description, plus a trailing button — one row per entry.',
    exVariants: 'Variants',
    exVariantsDesc: 'default transparent / outline bordered / muted filled.',
    exSizes: 'Sizes',
    exSizesDesc: 'sm / md / lg; media sizes line up with Avatar so avatars drop straight in.',
    exInteractive: 'Interactive list',
    exInteractiveDesc:
      'With interactive enabled the row highlights on hover; add tabIndex for keyboard focus — great for clickable settings.',
    descVariant: 'Visual style',
    descSize: 'Padding and font size',
    descInteractive: 'Interactive: highlight on hover, focus ring on focus',
    descGroup: 'Group container stacking multiple items vertically',
    descMedia: 'Leading media area; variant controls its backing',
    descMediaVariant: 'default plain / icon icon backing / image clipped image',
    descContent: 'Content area stacking the title and description',
    descTitle: 'Title',
    descDescription: 'Description, clamped to two lines',
    descActions: 'Trailing actions',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

const calendarIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

const bellIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
    <path d="M10.5 20a2 2 0 0 0 3 0" />
  </svg>
);

const shieldIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const sparkIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
  </svg>
);

const variants = ['default', 'outline', 'muted'] as const;

export const itemDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'item',
    title: 'Item',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'variant', type: "'default' | 'outline' | 'muted'", default: "'default'", description: t.descVariant },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t.descSize },
      { name: 'interactive', type: 'boolean', default: 'false', description: t.descInteractive },
      { name: 'Item.Group', type: 'HTMLAttributes<HTMLDivElement>', description: t.descGroup },
      { name: 'Item.Media', type: "{ variant?: 'default' | 'icon' | 'image' }", description: t.descMedia },
      { name: 'Item.Content', type: 'HTMLAttributes<HTMLDivElement>', description: t.descContent },
      { name: 'Item.Title', type: 'HTMLAttributes<HTMLHeadingElement>', description: t.descTitle },
      { name: 'Item.Description', type: 'HTMLAttributes<HTMLParagraphElement>', description: t.descDescription },
      { name: 'Item.Actions', type: 'HTMLAttributes<HTMLDivElement>', description: t.descActions },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    showcase: () => (
      <Card variant="elevated" size="sm" style={{ width: 'min(230px, 100%)' }}>
        <Card.Title>Team inbox</Card.Title>
        <Card.Description>3 conversations need a reply.</Card.Description>
        <Item.Group>
          <Item variant="muted" size="sm">
            <Item.Media>
              <Avatar name="Ada Lovelace" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Ada Lovelace</Item.Title>
            </Item.Content>
            <Item.Actions>
              <Tag size="sm" variant="success">
                Done
              </Tag>
            </Item.Actions>
          </Item>
          <Item variant="muted" size="sm">
            <Item.Media>
              <Avatar name="Alan Turing" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Alan Turing</Item.Title>
            </Item.Content>
            <Item.Actions>
              <Tag size="sm" variant="warning">
                New
              </Tag>
            </Item.Actions>
          </Item>
        </Item.Group>
      </Card>
    ),
    examples: [
      {
        title: t.exInbox,
        description: t.exInboxDesc,
        render: () => (
          <div className="demo-stack">
            <Card variant="elevated">
              <Card.Header>
                <div>
                  <Card.Title>Team inbox</Card.Title>
                  <Card.Description>3 conversations need a reply.</Card.Description>
                </div>
                <Card.Action>
                  <Tag size="sm" variant="accent">
                    3 new
                  </Tag>
                </Card.Action>
              </Card.Header>
              <Card.Content>
                <Item.Group>
                  <Item variant="muted" size="sm">
                    <Item.Media>
                      <Avatar name="Ada Lovelace" size="sm" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>Ada Lovelace</Item.Title>
                      <Item.Description>Shipped the analytics dashboard — ready for review.</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Tag size="sm" variant="success">
                        Done
                      </Tag>
                    </Item.Actions>
                  </Item>
                  <Item variant="muted" size="sm">
                    <Item.Media>
                      <Avatar name="Alan Turing" size="sm" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>Alan Turing</Item.Title>
                      <Item.Description>Can you look at the auth flow before Friday?</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Tag size="sm" variant="warning">
                        Pending
                      </Tag>
                    </Item.Actions>
                  </Item>
                  <Item variant="muted" size="sm">
                    <Item.Media>
                      <Avatar name="Grace Hopper" size="sm" />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>Grace Hopper</Item.Title>
                      <Item.Description>Left two comments on the design tokens PR.</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Tag size="sm">Open</Tag>
                    </Item.Actions>
                  </Item>
                </Item.Group>
              </Card.Content>
              <Card.Footer align="between">
                <span style={{ fontSize: 12, color: 'var(--elyri-ui-muted)' }}>Updated 2m ago</span>
                <Button size="sm" variant="ghost">
                  Open inbox
                </Button>
              </Card.Footer>
            </Card>
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';
import { Button } from './components/elyri/Button';
import { Card } from './components/elyri/Card';
import { Item } from './components/elyri/Item';
import { Tag } from './components/elyri/Tag';

export function Example() {
  return (
    <Card variant="elevated">
      <Card.Header>
        <div>
          <Card.Title>Team inbox</Card.Title>
          <Card.Description>3 conversations need a reply.</Card.Description>
        </div>
        <Card.Action>
          <Tag size="sm" variant="accent">
            3 new
          </Tag>
        </Card.Action>
      </Card.Header>
      <Card.Content>
        <Item.Group>
          <Item variant="muted" size="sm">
            <Item.Media>
              <Avatar name="Ada Lovelace" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Ada Lovelace</Item.Title>
              <Item.Description>Shipped the analytics dashboard — ready for review.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Tag size="sm" variant="success">
                Done
              </Tag>
            </Item.Actions>
          </Item>
          <Item variant="muted" size="sm">
            <Item.Media>
              <Avatar name="Alan Turing" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Alan Turing</Item.Title>
              <Item.Description>Can you look at the auth flow before Friday?</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Tag size="sm" variant="warning">
                Pending
              </Tag>
            </Item.Actions>
          </Item>
          <Item variant="muted" size="sm">
            <Item.Media>
              <Avatar name="Grace Hopper" size="sm" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Grace Hopper</Item.Title>
              <Item.Description>Left two comments on the design tokens PR.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Tag size="sm">Open</Tag>
            </Item.Actions>
          </Item>
        </Item.Group>
      </Card.Content>
      <Card.Footer align="between">
        <span style={{ fontSize: 12, color: 'var(--elyri-ui-muted)' }}>Updated 2m ago</span>
        <Button size="sm" variant="ghost">
          Open inbox
        </Button>
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
            <Item variant="outline">
              <Item.Media variant="icon">{calendarIcon}</Item.Media>
              <Item.Content>
                <Item.Title>Design review</Item.Title>
                <Item.Description>Thursday, 14:00 · Figma</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Button size="sm" variant="ghost">
                  Join
                </Button>
              </Item.Actions>
            </Item>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { Item } from './components/elyri/Item';

const calendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export function Example() {
  return (
    <Item variant="outline">
      <Item.Media variant="icon">{calendarIcon}</Item.Media>
      <Item.Content>
        <Item.Title>Design review</Item.Title>
        <Item.Description>Thursday, 14:00 · Figma</Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button size="sm" variant="ghost">
          Join
        </Button>
      </Item.Actions>
    </Item>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-grid">
            {variants.map((variant) => (
              <Item key={variant} variant={variant}>
                <Item.Media variant="icon">{sparkIcon}</Item.Media>
                <Item.Content>
                  <Item.Title>{variant}</Item.Title>
                  <Item.Description>variant=&quot;{variant}&quot;</Item.Description>
                </Item.Content>
              </Item>
            ))}
          </div>
        ),
        code: `import { Item } from './components/elyri/Item';

const variants = ['default', 'outline', 'muted'] as const;

const sparkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" />
  </svg>
);

export function Example() {
  return (
    <div className="demo-ui-grid">
      {variants.map((variant) => (
        <Item key={variant} variant={variant}>
          <Item.Media variant="icon">{sparkIcon}</Item.Media>
          <Item.Content>
            <Item.Title>{variant}</Item.Title>
            <Item.Description>variant="{variant}"</Item.Description>
          </Item.Content>
        </Item>
      ))}
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-stack">
            <Item size="sm" variant="muted">
              <Item.Media>
                <Avatar name="Ada Lovelace" size="sm" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Small</Item.Title>
                <Item.Description>Compact rows for dense lists.</Item.Description>
              </Item.Content>
            </Item>
            <Item size="md" variant="muted">
              <Item.Media>
                <Avatar name="Alan Turing" size="md" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Medium</Item.Title>
                <Item.Description>The default row size.</Item.Description>
              </Item.Content>
            </Item>
            <Item size="lg" variant="muted">
              <Item.Media>
                <Avatar name="Grace Hopper" size="lg" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Large</Item.Title>
                <Item.Description>Roomier rows for emphasis.</Item.Description>
              </Item.Content>
            </Item>
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';
import { Item } from './components/elyri/Item';

export function Example() {
  return (
    <>
      <Item size="sm" variant="muted">
        <Item.Media>
          <Avatar name="Ada Lovelace" size="sm" />
        </Item.Media>
        <Item.Content>
          <Item.Title>Small</Item.Title>
          <Item.Description>Compact rows for dense lists.</Item.Description>
        </Item.Content>
      </Item>
      <Item size="lg" variant="muted">
        <Item.Media>
          <Avatar name="Grace Hopper" size="lg" />
        </Item.Media>
        <Item.Content>
          <Item.Title>Large</Item.Title>
          <Item.Description>Roomier rows for emphasis.</Item.Description>
        </Item.Content>
      </Item>
    </>
  );
}`,
      },
      {
        title: t.exInteractive,
        description: t.exInteractiveDesc,
        render: () => (
          <div className="demo-stack">
            <Card>
              <Card.Header>
                <Card.Title>Preferences</Card.Title>
              </Card.Header>
              <Item.Group>
                <Item variant="muted" interactive tabIndex={0}>
                  <Item.Media variant="icon">{bellIcon}</Item.Media>
                  <Item.Content>
                    <Item.Title>Push notifications</Item.Title>
                    <Item.Description>Get pinged on new mentions.</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <span aria-hidden="true" style={{ color: 'var(--elyri-ui-muted)' }}>
                      ›
                    </span>
                  </Item.Actions>
                </Item>
                <Item variant="muted" interactive tabIndex={0}>
                  <Item.Media variant="icon">{shieldIcon}</Item.Media>
                  <Item.Content>
                    <Item.Title>Privacy</Item.Title>
                    <Item.Description>Manage who can see your activity.</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <span aria-hidden="true" style={{ color: 'var(--elyri-ui-muted)' }}>
                      ›
                    </span>
                  </Item.Actions>
                </Item>
              </Item.Group>
            </Card>
          </div>
        ),
        code: `import { Card } from './components/elyri/Card';
import { Item } from './components/elyri/Item';

const bellIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
    <path d="M10.5 20a2 2 0 0 0 3 0" />
  </svg>
);

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Preferences</Card.Title>
      </Card.Header>
      <Item.Group>
        <Item variant="muted" interactive tabIndex={0}>
          <Item.Media variant="icon">{bellIcon}</Item.Media>
          <Item.Content>
            <Item.Title>Push notifications</Item.Title>
            <Item.Description>Get pinged on new mentions.</Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    </Card>
  );
}`,
      },
    ],
  };
};
