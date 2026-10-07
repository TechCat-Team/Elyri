import type { HTMLAttributes } from 'react';

import { DragonScales, FadeIn } from '@elyri/motion';
import { Button, Card, Checkbox, cn, Divider, Field, Input } from '@elyri/ui';

import './Login.css';

/** GitHub 图标（Simple Icons 路径） */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/** Google 图标（四色标识） */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.95H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.29A7.2 7.2 0 0 1 4.92 12c0-.8.14-1.57.38-2.29v-3.1H1.29a12 12 0 0 0 0 10.78l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.61l4.01 3.1C6.24 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

/** 登录区块：左侧龙鳞品牌面板 + 右侧登录表单，表单仅阻止默认提交，接上接口即可用 */
export function Login({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('elyri-block-login', className)} {...rest}>
      <div className="elyri-block-login__shell">
        <aside className="elyri-block-login__aside">
          <DragonScales
            className="elyri-block-login__aside-bg"
            color="#6d5bd0"
            highlightColor="#c4b5fd"
            scaleSize={110}
            speed={0.5}
            flare={0.4}
            interactive={false}
            scheme="dark"
          />
          <div className="elyri-block-login__aside-scrim" aria-hidden="true" />
          <div className="elyri-block-login__aside-inner">
            <span className="elyri-block-login__brand">Elyri</span>
            <h2 className="elyri-block-login__aside-title">欢迎回来</h2>
            <p className="elyri-block-login__aside-lead">登录以继续管理你的项目、组件与订阅。</p>
          </div>
        </aside>

        <FadeIn className="elyri-block-login__panel">
          <Card className="elyri-block-login__card" variant="elevated" size="lg">
            <Card.Header className="elyri-block-login__header">
              <div className="elyri-block-login__heading">
                <Card.Title>登录</Card.Title>
                <Card.Description>欢迎回来，选择你喜欢的方式继续。</Card.Description>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="elyri-block-login__socials">
                <Button variant="secondary" size="lg" leadingIcon={<GitHubIcon />}>
                  GitHub
                </Button>
                <Button variant="secondary" size="lg" leadingIcon={<GoogleIcon />}>
                  Google
                </Button>
              </div>

              <Divider className="elyri-block-login__divider" variant="gradient" spacing="md">
                或使用邮箱登录
              </Divider>

              <form className="elyri-block-login__form" onSubmit={(event) => event.preventDefault()}>
                <Field>
                  <Field.Label>邮箱</Field.Label>
                  <Input
                    type="email"
                    name="email"
                    size="lg"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>

                <Field>
                  <Field.Label>密码</Field.Label>
                  <Input
                    type="password"
                    name="password"
                    size="lg"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </Field>

                <div className="elyri-block-login__row">
                  <Checkbox defaultChecked>记住我</Checkbox>
                  <a className="elyri-block-login__link" href="#reset">
                    忘记密码？
                  </a>
                </div>

                <Button className="elyri-block-login__submit" type="submit" size="lg">
                  登录
                </Button>
              </form>

              <p className="elyri-block-login__signup">
                还没有账户？
                <a className="elyri-block-login__link" href="#signup">
                  立即注册
                </a>
              </p>
            </Card.Content>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}
