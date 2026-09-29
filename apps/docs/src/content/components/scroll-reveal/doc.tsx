import { lazy } from 'react';

import type { ScrollRevealBy } from '@elyri/motion';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

// 演示按需加载，让每个组件的 Demo 各自成为一个 chunk
const ScrollRevealDemo = lazy(() => import('./ScrollRevealDemo'));

const TEXT = {
  zh: [
    '老灯塔守了四十年，始终没数清海面上究竟有多少颗星。他只记得每一个起雾的夜晚，灯塔把光推出去，又慢慢收回来，像在黑暗里反复练习一句很短的问候。',
    '那年冬天，一个孩子踩着结冰的栈桥来找他，怀里抱着一只生锈的闹钟。孩子说，钟停在母亲离开的那个下午，想请他把时间修回去。',
    '老人没有答应，也没有拒绝。他把闹钟拆开，齿轮在桌面上摊成一小片沉默的森林。他说，有些零件是真的磨坏了，换掉就好；有些只是被灰尘堵住了，吹一口气又能走。',
    '孩子每天放学都来。他学会分辨游丝和发条，学会凭声音听出哪一颗齿轮走得太急。灯塔的光每隔十二秒扫过窗户一次，他们就数着那道光，把漫长的冬天切成许多整齐的小格。',
    '海风把盐分带进屋子，桌上很快结了一层薄薄的霜。老人用布一遍遍擦，孩子就在旁边看着，看那些细小的零件在他掌心重新安静下来。',
    '春天来的时候，闹钟终于又走了起来。指针笨拙地挪过母亲离开的那个时刻，没有停留太久，就径直往前去了。',
    '孩子捧着钟，忽然说：“它不知道她已经被带走了。”',
    '老人点点头。他说，钟只知道往前走，它把所有的失去都记成了时间。人也是这样，一边走，一边把舍不得的东西往行囊里塞，直到行囊重得再也迈不动步子，才终于学会放下一点。',
    '那天夜里有大风，灯塔的光被雨割成一片一片。孩子在窗边睡着了，闹钟放在他手心，走得又稳又慢。',
    '许多年后，孩子成了修钟的人。他见过各式各样的时间：有的走得快，有的走得慢，有的在某个寻常的下午忽然停住，再也没能醒来。',
    '每当有人深夜推门进来，怀里抱着什么坏掉的东西，他都会先请对方坐下，倒一杯热茶，然后慢慢拧开后盖——像当年那位老人一样，先听，再修。',
  ].join('\n\n'),
  en: [
    'For forty years the old lighthouse keeper had never managed to count how many stars lay on the water. All he remembered were the foggy nights when the lamp pushed its light out and drew it slowly back, like someone rehearsing a very short greeting in the dark.',
    'That winter a child came to him across the frozen pier, carrying a rusted alarm clock. She said it had stopped on the afternoon her mother left, and asked whether he could set the time back.',
    'The old man neither agreed nor refused. He took the clock apart, and the gears spread across the table into a small, silent forest. Some parts, he said, are truly worn out and only need replacing; others are merely clogged with dust, and one breath will set them going again.',
    'The child came every day after school. She learned to tell a hairspring from a mainspring, and to hear which gear was running too fast. Every twelve seconds the lighthouse swept its beam across the window, and they counted it, cutting the long winter into neat little squares.',
    'Sea wind carried salt indoors, and a thin frost soon gathered on the workbench. The old man wiped it away again and again, and the child watched the small parts settle quietly in his palm.',
    'When spring came, the clock ran again. Its hands crept awkwardly past the hour her mother had left, did not linger, and went straight on.',
    'Holding the clock, the child said suddenly, “It doesn’t know she was taken away.”',
    'The old man nodded. A clock only knows how to move forward, he said; it records every loss as time. People are like that too — walking on while stuffing the things they cannot bear to lose into their packs, until the packs grow so heavy they can no longer take a step, and only then do they learn to put a little of it down.',
    'That night the wind was high, and the lighthouse beam was sliced to pieces by the rain. The child fell asleep by the window, the clock in her hand, running steady and slow.',
    'Many years later the child became a clockmaker. She had seen every kind of time: some ran fast, some ran slow, and some stopped on an ordinary afternoon and never woke again.',
    'Whenever someone pushed the door open late at night with something broken in their arms, she would ask them to sit down first, pour a cup of hot tea, and then slowly unscrew the back — just like the old man, listening first, mending after.',
  ].join('\n\n'),
};

const DEFAULTS = {
  by: 'word' as ScrollRevealBy,
  height: 280,
  dimOpacity: 0.15,
  blur: 2,
};

const copy = {
  zh: {
    description: '文本置于可滚动的窗口中，随滚动从头至尾逐词点亮，未读到的部分保持暗淡甚至模糊，适合叙事段落。',
    textLabel: '文本',
    byLabel: '点亮单位',
    heightLabel: '窗口高度 (px)',
    dimOpacityLabel: '暗淡不透明度',
    blurLabel: '暗淡模糊 (px)',
    descChildren: '需要点亮的文本',
    descBy: '按单词还是按字符点亮',
    descHeight: '滚动窗口的高度（像素），文本超出后可滚动',
    descDimOpacity: '未点亮时的不透明度，0 为完全不可见',
    descBlur: '未点亮时的模糊半径（像素），0 为不模糊',
    descClassName: '自定义类名',
  },
  en: {
    description:
      'Text lives in a scrollable window and lights up word by word as you scroll, while the unread part stays dimmed or even blurred. Made for narrative paragraphs.',
    textLabel: 'Text',
    byLabel: 'Reveal by',
    heightLabel: 'Window height (px)',
    dimOpacityLabel: 'Dim opacity',
    blurLabel: 'Dim blur (px)',
    descChildren: 'Text to illuminate',
    descBy: 'Illuminate word by word or character by character',
    descHeight: 'Height of the scrollable window in pixels; overflowing text scrolls',
    descDimOpacity: 'Opacity before a unit lights up; 0 hides it completely',
    descBlur: 'Blur radius in pixels before a unit lights up; 0 disables the blur',
    descClassName: 'Extra class name',
  },
};

export const scrollRevealDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'scroll-reveal',
    title: 'ScrollReveal',
    category: 'Text',
    description: t.description,
    isNew: true,
    controls: [
      { type: 'text', name: 'text', label: t.textLabel, default: TEXT[lang] },
      { type: 'select', name: 'by', label: t.byLabel, default: DEFAULTS.by, options: ['word', 'char'] },
      { type: 'number', name: 'height', label: t.heightLabel, default: DEFAULTS.height, min: 160, max: 360, step: 20 },
      {
        type: 'number',
        name: 'dimOpacity',
        label: t.dimOpacityLabel,
        default: DEFAULTS.dimOpacity,
        min: 0,
        max: 0.8,
        step: 0.05,
      },
      { type: 'number', name: 'blur', label: t.blurLabel, default: DEFAULTS.blur, min: 0, max: 8, step: 0.5 },
    ],
    props: [
      { name: 'children', type: 'string', description: t.descChildren },
      { name: 'by', type: "'word' | 'char'", default: `'${DEFAULTS.by}'`, description: t.descBy },
      { name: 'height', type: 'number', default: String(DEFAULTS.height), description: t.descHeight },
      { name: 'dimOpacity', type: 'number', default: String(DEFAULTS.dimOpacity), description: t.descDimOpacity },
      { name: 'blur', type: 'number', default: String(DEFAULTS.blur), description: t.descBlur },
      { name: 'className', type: 'string', description: t.descClassName },
    ],
    render: (v) => (
      <ScrollRevealDemo
        text={v.text as string}
        by={v.by as ScrollRevealBy}
        height={v.height as number}
        dimOpacity={v.dimOpacity as number}
        blur={v.blur as number}
      />
    ),
    usage: (v, codeLang) =>
      usageExample(codeLang, {
        component: 'ScrollReveal',
        propsType: 'ScrollRevealProps',
        name: 'Story',
        props: {
          by: v.by === DEFAULTS.by ? undefined : (v.by as string),
          height: v.height === DEFAULTS.height ? undefined : v.height,
          dimOpacity: v.dimOpacity === DEFAULTS.dimOpacity ? undefined : v.dimOpacity,
          blur: v.blur === DEFAULTS.blur ? undefined : v.blur,
        },
        children: v.text as string,
      }),
  };
};
