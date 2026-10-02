import { Avatar, AvatarGroup } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

/** 示例头像统一使用站点 logo */
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`;

const copy = {
  zh: {
    description: '头像：图片加载失败自动回退首字母，可选形状、五档尺寸与在线状态，并含重叠的 AvatarGroup。',
    exBasic: '基础用法',
    exBasicDesc: '传入图片显示头像，或只给 name 用首字母回退。',
    exSizes: '尺寸',
    exSizesDesc: '五档尺寸：xs / sm / md / lg / xl。',
    exShape: '形状',
    exShapeDesc: 'circle 为圆形，square 为圆角方形。',
    exStatus: '在线状态',
    exStatusDesc: '右下角状态圆点：online / away / busy / offline。',
    exFallback: '回退内容',
    exFallbackDesc: '无 name 时显示默认人像图标，也可用 fallback 自定义。',
    exGroup: '头像组',
    exGroupDesc: '重叠排列，max 超出后折叠为 +N 计数。',
    descSrc: '图片地址，加载失败时回退到首字母或自定义内容',
    descAlt: '图片替代文本，作为无障碍名称，优先于 name',
    descName: '用户名，用于生成首字母回退与稳定配色',
    descSize: '尺寸：xs / sm / md / lg / xl，默认 md',
    descShape: '形状：circle / square，默认 circle',
    descFit: '图片填充方式：cover 铺满裁切（默认）/ contain 缩小居中完整显示，适合 logo',
    descStatus: '右下角在线状态圆点',
    descFallback: '自定义回退内容，优先级高于首字母',
    descMax: '最多展示的头像数量，超出显示 +N，省略则全部展示',
    descRest: '其余属性透传给原生 span / div',
  },
  en: {
    description:
      'Avatars that fall back to initials when the image fails, with shape, five sizes, presence and an overlapping AvatarGroup.',
    exBasic: 'Basic',
    exBasicDesc: 'Pass a src to show an image, or just a name for the initials fallback.',
    exSizes: 'Sizes',
    exSizesDesc: 'Five sizes: xs / sm / md / lg / xl.',
    exShape: 'Shapes',
    exShapeDesc: 'circle for round, square for a rounded square.',
    exStatus: 'Presence',
    exStatusDesc: 'Corner dot: online / away / busy / offline.',
    exFallback: 'Fallback',
    exFallbackDesc: 'A default user glyph when there is no name, or your own fallback.',
    exGroup: 'Avatar group',
    exGroupDesc: 'Overlapping avatars; max collapses the rest into a +N counter.',
    descSrc: 'Image URL; falls back to initials or custom content when it fails',
    descAlt: 'Image alt text, used as the accessible name, takes precedence over name',
    descName: 'User name, drives the initials fallback and a stable colour',
    descSize: 'Size: xs / sm / md / lg / xl, defaults to md',
    descShape: 'Shape: circle / square, defaults to circle',
    descFit: 'Image fit: cover to fill and crop (default) / contain to inset the whole image, good for logos',
    descStatus: 'Presence dot in the bottom-right corner',
    descFallback: 'Custom fallback content, takes precedence over the initials',
    descMax: 'Maximum avatars to show; the rest collapse into +N, all shown when omitted',
    descRest: 'Remaining props are forwarded to the native span / div',
  },
};

export const avatarDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'avatar',
    title: 'Avatar',
    category: 'Data Display',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      { name: 'src', type: 'string', description: t.descSrc },
      { name: 'alt', type: 'string', description: t.descAlt },
      { name: 'name', type: 'string', description: t.descName },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t.descSize },
      { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: t.descShape },
      { name: 'fit', type: "'cover' | 'contain'", default: "'cover'", description: t.descFit },
      {
        name: 'status',
        type: "'online' | 'offline' | 'away' | 'busy'",
        description: t.descStatus,
      },
      { name: 'fallback', type: 'ReactNode', description: t.descFallback },
      { name: 'AvatarGroup.max', type: 'number', description: t.descMax },
      { name: '...rest', type: 'HTMLAttributes', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <div className="demo-ui-row">
            <Avatar src={LOGO_SRC} alt="Ada Lovelace" fit="contain" />
            <Avatar name="Grace Hopper" />
            <Avatar src={LOGO_SRC} alt="Alan Turing" fit="contain" />
            <Avatar name="林徽因" />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Avatar src="/logo.svg" alt="Ada Lovelace" fit="contain" />
      <Avatar name="Grace Hopper" />
      <Avatar src="/logo.svg" alt="Alan Turing" fit="contain" />
      <Avatar name="林徽因" />
    </div>
  );
}`,
      },
      {
        title: t.exSizes,
        description: t.exSizesDesc,
        render: () => (
          <div className="demo-ui-row">
            <Avatar name="Ada" size="xs" />
            <Avatar name="Ada" size="sm" />
            <Avatar name="Ada" size="md" />
            <Avatar src={LOGO_SRC} alt="Grace" size="lg" fit="contain" />
            <Avatar src={LOGO_SRC} alt="Linus" size="xl" fit="contain" />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Avatar name="Ada" size="xs" />
      <Avatar name="Ada" size="sm" />
      <Avatar name="Ada" size="md" />
      <Avatar src="/logo.svg" alt="Grace" size="lg" fit="contain" />
      <Avatar src="/logo.svg" alt="Linus" size="xl" fit="contain" />
    </div>
  );
}`,
      },
      {
        title: t.exShape,
        description: t.exShapeDesc,
        render: () => (
          <div className="demo-ui-row">
            <Avatar src={LOGO_SRC} alt="Ada" shape="circle" fit="contain" />
            <Avatar src={LOGO_SRC} alt="Ada" shape="square" fit="contain" />
            <Avatar name="Grace Hopper" shape="circle" />
            <Avatar name="Grace Hopper" shape="square" />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Avatar src="/logo.svg" alt="Ada" shape="circle" fit="contain" />
      <Avatar src="/logo.svg" alt="Ada" shape="square" fit="contain" />
      <Avatar name="Grace Hopper" shape="circle" />
      <Avatar name="Grace Hopper" shape="square" />
    </div>
  );
}`,
      },
      {
        title: t.exStatus,
        description: t.exStatusDesc,
        render: () => (
          <div className="demo-ui-row">
            <Avatar src={LOGO_SRC} alt="Ada" status="online" fit="contain" />
            <Avatar src={LOGO_SRC} alt="Alan" status="away" fit="contain" />
            <Avatar src={LOGO_SRC} alt="Grace" status="busy" fit="contain" />
            <Avatar src={LOGO_SRC} alt="Linus" status="offline" fit="contain" />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Avatar src="/logo.svg" alt="Ada" status="online" fit="contain" />
      <Avatar src="/logo.svg" alt="Alan" status="away" fit="contain" />
      <Avatar src="/logo.svg" alt="Grace" status="busy" fit="contain" />
      <Avatar src="/logo.svg" alt="Linus" status="offline" fit="contain" />
    </div>
  );
}`,
      },
      {
        title: t.exFallback,
        description: t.exFallbackDesc,
        render: () => (
          <div className="demo-ui-row">
            <Avatar />
            <Avatar name="A" />
            <Avatar
              name="A"
              fallback={
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 3 6v6c0 5 3.8 8.5 9 10 5.2-1.5 9-5 9-10V6Z" />
                </svg>
              }
            />
          </div>
        ),
        code: `import { Avatar } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-ui-row">
      <Avatar />
      <Avatar name="A" />
      <Avatar
        name="A"
        fallback={
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2 3 6v6c0 5 3.8 8.5 9 10 5.2-1.5 9-5 9-10V6Z" />
          </svg>
        }
      />
    </div>
  );
}`,
      },
      {
        title: t.exGroup,
        description: t.exGroupDesc,
        render: () => (
          <div className="demo-stack">
            <AvatarGroup max={4} size="lg">
              <Avatar src={LOGO_SRC} alt="Ada" fit="contain" />
              <Avatar src={LOGO_SRC} alt="Alan" fit="contain" />
              <Avatar src={LOGO_SRC} alt="Grace" fit="contain" />
              <Avatar src={LOGO_SRC} alt="Linus" fit="contain" />
              <Avatar name="Grace Hopper" />
              <Avatar name="林徽因" />
            </AvatarGroup>
            <AvatarGroup size="md">
              <Avatar name="Ada Lovelace" />
              <Avatar name="Alan Turing" />
              <Avatar name="Grace Hopper" />
            </AvatarGroup>
          </div>
        ),
        code: `import { Avatar, AvatarGroup } from './components/elyri/Avatar';

export function Example() {
  return (
    <div className="demo-stack">
      <AvatarGroup max={4} size="lg">
        <Avatar src="/logo.svg" alt="Ada" fit="contain" />
        <Avatar src="/logo.svg" alt="Alan" fit="contain" />
        <Avatar src="/logo.svg" alt="Grace" fit="contain" />
        <Avatar src="/logo.svg" alt="Linus" fit="contain" />
        <Avatar name="Grace Hopper" />
        <Avatar name="林徽因" />
      </AvatarGroup>
      <AvatarGroup size="md">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Alan Turing" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>
    </div>
  );
}`,
      },
    ],
  };
};
