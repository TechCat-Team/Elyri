import { Badge, Button, Card } from '@elyri/ui';

export interface CardDemoProps {
  title: string;
  description: string;
}

export default function CardDemo({ title, description }: CardDemoProps) {
  return (
    <div className="demo-stack">
      <Card>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
        <Card.Content>
          <div className="demo-ui-row demo-ui-row--start">
            <Badge variant="accent">v0.0.1</Badge>
            <Badge variant="success">Stable</Badge>
            <Badge>Zero deps</Badge>
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
  );
}
