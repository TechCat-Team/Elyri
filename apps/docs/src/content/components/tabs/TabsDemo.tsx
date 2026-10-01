import { Tabs } from '@elyri/ui';

export interface TabsDemoProps {
  orientation: 'horizontal' | 'vertical';
  variant: 'segmented' | 'underline';
  content: string;
}

export default function TabsDemo({ orientation, variant, content }: TabsDemoProps) {
  return (
    <Tabs defaultValue="overview" orientation={orientation} variant={variant} className="demo-ui-tabs">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">{content}</Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity shows up here.</Tabs.Panel>
      <Tabs.Panel value="settings">Preferences live in this panel.</Tabs.Panel>
    </Tabs>
  );
}
