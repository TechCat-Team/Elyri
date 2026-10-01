import { Dialog } from '@elyri/ui';

export interface DialogDemoProps {
  title: string;
  description: string;
}

export default function DialogDemo({ title, description }: DialogDemoProps) {
  return (
    <Dialog>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <div className="demo-ui-dialog-actions">
          <Dialog.Close>Got it</Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
