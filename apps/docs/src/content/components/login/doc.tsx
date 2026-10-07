import { Login } from '@elyri/blocks';

import { usageExample } from '../../../lib/code';
import type { ComponentDoc, Lang } from '../../../lib/types';

const copy = {
  zh: {
    description:
      '登录区块：左侧龙鳞（DragonScales）动态品牌面板，右侧登录表单（邮箱、密码、记住我与注册入口）。表单当前仅阻止默认提交，接上你的接口即可真正登录。基于 @elyri/ui 与 @elyri/motion，拷走后替换文案与链接即可用。',
    descClassName: '自定义类名，便于加边距或定位',
    descRest: '其余属性透传给根 <section>',
  },
  en: {
    description:
      'A login block with a DragonScales animated brand panel on the left and a sign-in form on the right (email, password, remember me and a sign-up link). The form only prevents the default submit for now; wire it to your API to sign in. Built on @elyri/ui and @elyri/motion — copy it and edit the copy and links.',
    descClassName: 'Extra class name for spacing or positioning',
    descRest: 'Remaining props are forwarded to the root <section>',
  },
};

export const loginDoc = (lang: Lang): ComponentDoc => {
  const t = copy[lang];

  return {
    slug: 'login',
    title: 'Login',
    category: 'Auth',
    pkg: 'blocks',
    description: t.description,
    isNew: true,
    dependencies: ['@elyri/ui', '@elyri/motion'],
    props: [
      { name: 'className', type: 'string', description: t.descClassName },
      { name: '...rest', type: 'HTMLAttributes<HTMLElement>', description: t.descRest },
    ],
    render: () => <Login />,
    usage: (_values, codeLang) =>
      usageExample(codeLang, { component: 'Login', propsType: 'LoginProps', props: {} }),
  };
};
