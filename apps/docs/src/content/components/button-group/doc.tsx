import { Button, ButtonGroup } from '@elyri/ui';

import type { ComponentDoc, Lang } from '../../../lib/types';

/** 示例图标：线性风格，颜色与尺寸都继承按钮 */
function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h13" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M7 12h10M6 18h12" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M4 6h16M10 12h10M7 18h13" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const DEFAULTS = {
  orientation: 'horizontal',
  attached: 'true',
};

const copy = {
  zh: {
    description: '按钮组：把相邻按钮拼成一体，仅保留外侧圆角并自动补上淡分隔线，支持横向 / 纵向与拼接 / 分离。',
    exBasic: '基础用法',
    exBasicDesc: '三个按钮首尾相接，悬停时当前按钮浮到最上层。',
    exVariants: '配合不同变体',
    exVariantsDesc: 'primary / secondary / danger 等实心或描边按钮拼接后依然清晰可辨。',
    exLayout: '纵向与分离',
    exLayoutDesc: 'orientation="vertical" 纵向排列；attached={false} 保留间距，各自独立成形。',
    exIcons: '带图标',
    exIconsDesc: 'iconOnly 让每个分段变成正方形图标按钮；也可用 leadingIcon 让图标与文字并排。',
    descOrientation: '排列方向：horizontal / vertical',
    descAttached: '按钮是否首尾相接：true 拼成一体，false 保留间距',
    descChildren: '组内按钮，通常为 Button',
    descRest: '其余属性透传给原生 div',
  },
  en: {
    description:
      'Button groups that fuse adjacent buttons into one piece, keeping only the outer corners and adding subtle dividers. Horizontal or vertical, attached or detached.',
    exBasic: 'Basic',
    exBasicDesc: 'Three buttons joined end to end; the hovered button rises above its neighbors.',
    exVariants: 'With variants',
    exVariantsDesc: 'Solid and outlined buttons such as primary / secondary / danger stay legible when joined.',
    exLayout: 'Vertical & detached',
    exLayoutDesc: 'orientation="vertical" stacks them; attached={false} adds spacing so each keeps its own shape.',
    exIcons: 'With icons',
    exIconsDesc: 'iconOnly turns each segment into a square icon button; leadingIcon keeps an icon beside the label.',
    descOrientation: 'Layout direction: horizontal / vertical',
    descAttached: 'Whether buttons are joined: true fuses them, false keeps a gap',
    descChildren: 'Buttons inside the group, usually Button',
    descRest: 'Remaining props are forwarded to the native div',
  },
};

export const buttonGroupDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'button-group',
    title: 'ButtonGroup',
    category: 'Forms',
    pkg: 'ui',
    description: t.description,
    isNew: true,
    props: [
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: `'${DEFAULTS.orientation}'`,
        description: t.descOrientation,
      },
      { name: 'attached', type: 'boolean', default: DEFAULTS.attached, description: t.descAttached },
      { name: 'children', type: 'ReactNode', description: t.descChildren },
      { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', description: t.descRest },
    ],
    examples: [
      {
        title: t.exBasic,
        description: t.exBasicDesc,
        render: () => (
          <ButtonGroup aria-label="Text align">
            <Button variant="secondary">Left</Button>
            <Button variant="secondary">Center</Button>
            <Button variant="secondary">Right</Button>
          </ButtonGroup>
        ),
        code: `import { Button } from './components/elyri/Button';
import { ButtonGroup } from './components/elyri/ButtonGroup';

export function Example() {
  return (
    <ButtonGroup aria-label="Text align">
      <Button variant="secondary">Left</Button>
      <Button variant="secondary">Center</Button>
      <Button variant="secondary">Right</Button>
    </ButtonGroup>
  );
}`,
      },
      {
        title: t.exVariants,
        description: t.exVariantsDesc,
        render: () => (
          <div className="demo-ui-row">
            <ButtonGroup aria-label="Alignment">
              <Button>Left</Button>
              <Button>Center</Button>
              <Button>Right</Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Archive">
              <Button variant="danger">Delete</Button>
              <Button variant="danger">Archive</Button>
            </ButtonGroup>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { ButtonGroup } from './components/elyri/ButtonGroup';

export function Example() {
  return (
    <div className="demo-ui-row">
      <ButtonGroup aria-label="Alignment">
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Archive">
        <Button variant="danger">Delete</Button>
        <Button variant="danger">Archive</Button>
      </ButtonGroup>
    </div>
  );
}`,
      },
      {
        title: t.exLayout,
        description: t.exLayoutDesc,
        render: () => (
          <div className="demo-ui-row">
            <ButtonGroup orientation="vertical" aria-label="Zoom">
              <Button variant="secondary">Zoom in</Button>
              <Button variant="secondary">Zoom out</Button>
              <Button variant="secondary">Reset</Button>
            </ButtonGroup>
            <ButtonGroup attached={false} aria-label="Confirm">
              <Button variant="secondary">Cancel</Button>
              <Button>Save</Button>
            </ButtonGroup>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { ButtonGroup } from './components/elyri/ButtonGroup';

export function Example() {
  return (
    <div className="demo-ui-row">
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button variant="secondary">Zoom in</Button>
        <Button variant="secondary">Zoom out</Button>
        <Button variant="secondary">Reset</Button>
      </ButtonGroup>
      <ButtonGroup attached={false} aria-label="Confirm">
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </ButtonGroup>
    </div>
  );
}`,
      },
      {
        title: t.exIcons,
        description: t.exIconsDesc,
        render: () => (
          <div className="demo-ui-row">
            <ButtonGroup aria-label="Text align">
              <Button variant="secondary" iconOnly aria-label="Align left">
                <AlignLeftIcon />
              </Button>
              <Button variant="secondary" iconOnly aria-label="Align center">
                <AlignCenterIcon />
              </Button>
              <Button variant="secondary" iconOnly aria-label="Align right">
                <AlignRightIcon />
              </Button>
            </ButtonGroup>
            <ButtonGroup aria-label="Zoom">
              <Button variant="secondary" leadingIcon={<MinusIcon />}>
                Zoom out
              </Button>
              <Button variant="secondary" leadingIcon={<PlusIcon />}>
                Zoom in
              </Button>
            </ButtonGroup>
          </div>
        ),
        code: `import { Button } from './components/elyri/Button';
import { ButtonGroup } from './components/elyri/ButtonGroup';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, MinusIcon, PlusIcon } from './icons';

export function Example() {
  return (
    <div className="demo-ui-row">
      <ButtonGroup aria-label="Text align">
        <Button variant="secondary" iconOnly aria-label="Align left">
          <AlignLeftIcon />
        </Button>
        <Button variant="secondary" iconOnly aria-label="Align center">
          <AlignCenterIcon />
        </Button>
        <Button variant="secondary" iconOnly aria-label="Align right">
          <AlignRightIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Zoom">
        <Button variant="secondary" leadingIcon={<MinusIcon />}>
          Zoom out
        </Button>
        <Button variant="secondary" leadingIcon={<PlusIcon />}>
          Zoom in
        </Button>
      </ButtonGroup>
    </div>
  );
}`,
      },
    ],
  };
};
