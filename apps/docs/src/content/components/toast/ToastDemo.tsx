import { Button, ToastProvider, useToast } from '@elyri/ui';
import type { ToastPosition, ToastVariant } from '@elyri/ui';

export interface ToastDemoProps {
  title: string;
  variant: ToastVariant;
  duration: number;
  position: ToastPosition;
  showDescription: boolean;
}

function Trigger({ title, variant, duration, showDescription }: Omit<ToastDemoProps, 'position'>) {
  const { toast, update, dismiss, promise } = useToast();

  const description = showDescription ? 'Saved to your workspace.' : undefined;

  const showPromise = () => {
    promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: { title: 'Submitting', description: showDescription ? 'Hang tight…' : undefined },
      success: { title: 'Submitted', description, duration },
      error: { title: 'Submit failed', description: 'Please try again.' },
    });
  };

  const showPinned = () => {
    const id = toast({
      title: 'Syncing',
      description: showDescription ? 'Closed by the app when the task finishes.' : undefined,
      variant: 'loading',
      persistent: true,
    });
    setTimeout(() => dismiss(id), 3000);
  };

  const showLoading = () => {
    const id = toast({ title: 'Uploading file', description: showDescription ? 'Please wait…' : undefined, variant: 'loading' });
    setTimeout(
      () =>
        update(id, {
          title,
          description,
          // 语义选 loading 时没有"结束状态"可言，退回 success
          variant: variant === 'loading' ? 'success' : variant,
          duration,
        }),
      1500,
    );
  };

  return (
    <div className="demo-ui-row">
      <Button onClick={() => toast({ title, description, variant, duration })}>Show toast</Button>
      <Button variant="secondary" onClick={showLoading}>
        Loading
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Heads up',
            description: 'This one stays until you close it.',
            variant: 'warning',
            duration: 0,
          })
        }
      >
        Persistent
      </Button>
      <Button variant="secondary" onClick={showPinned}>
        Programmatic
      </Button>
      <Button variant="secondary" onClick={showPromise}>
        Promise
      </Button>
    </div>
  );
}

export default function ToastDemo({ title, variant, duration, position, showDescription }: ToastDemoProps) {
  return (
    <ToastProvider position={position}>
      <Trigger title={title} variant={variant} duration={duration} showDescription={showDescription} />
    </ToastProvider>
  );
}
