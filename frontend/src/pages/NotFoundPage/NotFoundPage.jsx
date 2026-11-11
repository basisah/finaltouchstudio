import PageLayout from "../../components/layout/PageLayout";
import { Button, Container, EmptyState } from "../../components/ui";

export default function NotFoundPage() {
  return (
    <PageLayout>
      <Container narrow style={{ paddingBlock: "var(--section-y)" }}>
        <EmptyState
          title="Page not found"
          actions={
            <>
              <Button to="/">Back to home</Button>
              <Button to="/items" variant="secondary">
                Browse rentals
              </Button>
            </>
          }
        >
          The page you are looking for has moved or no longer exists.
        </EmptyState>
      </Container>
    </PageLayout>
  );
}
