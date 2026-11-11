import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPackage } from "../../api/packages.api";
import ItemImage from "../../components/catalog/ItemImage";
import PageLayout from "../../components/layout/PageLayout";
import { Badge, Button, Card, CloseIcon, Container, EmptyState, PageHeader, PageLoader, PlusIcon } from "../../components/ui";
import { formatMoney, titleCase } from "../../utils/format";
import styles from "./PackageDetailPage.module.css";

/** A customised package never drops below this share of its list price. */
const MIN_PRICE_RATIO = 0.3;

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [excludedIds, setExcludedIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getPackage(id)
      .then((data) => {
        if (!active) return;
        setPkg(data);
        setExcludedIds(new Set());
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [id]);

  const allItems = useMemo(() => pkg?.items || [], [pkg]);
  const included = allItems.filter((item) => !excludedIds.has(item.id));
  const excluded = allItems.filter((item) => excludedIds.has(item.id));

  // Price scales with the share of items kept, with a floor that covers design and transport.
  const basePrice = Number(pkg?.price) || 0;
  const price = allItems.length
    ? Math.max(basePrice * (included.length / allItems.length), basePrice * MIN_PRICE_RATIO)
    : basePrice;
  const customised = excluded.length > 0;

  const toggleItem = (itemId) =>
    setExcludedIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const handleCheckout = () =>
    navigate("/checkout", {
      state: {
        pkgName: pkg.name,
        pkgCategory: pkg.category_id,
        itemsCount: included.length,
        itemsList: included.map((item) => item.title),
        finalPrice: price,
      },
    });

  if (status === "loading") {
    return (
      <PageLayout>
        <PageLoader label="Loading package…" />
      </PageLayout>
    );
  }

  if (status === "error" || !pkg) {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <EmptyState
            title="Package not available"
            actions={
              <>
                <Button to="/items">Browse rentals</Button>
                <Button to="/" variant="secondary">
                  Back to home
                </Button>
              </>
            }
          >
            We do not have a styled package for this occasion yet. You can still build your own from the catalogue.
          </EmptyState>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        eyebrow={`${titleCase(pkg.category_id)} package`}
        title={pkg.name}
        lead={
          pkg.description ||
          "Everything you need for a complete setup. Remove any pieces you already have and the price adjusts for you."
        }
        crumbs={[{ label: "Home", to: "/" }, { label: "Packages", to: "/#packages" }, { label: pkg.name }]}
      />

      <Container className={styles.layout}>
        <section aria-label="Included pieces">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Included pieces <span>{included.length}</span>
            </h2>
            <p>Remove anything you do not need — you can add it back at any time.</p>
          </header>

          {included.length === 0 ? (
            <EmptyState title="Every piece has been removed">Add at least one piece back to continue.</EmptyState>
          ) : (
            <ul className={styles.items}>
              {included.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemMedia}>
                    <ItemImage src={item.image} alt="" width={300} />
                  </div>
                  <div className={styles.itemBody}>
                    <h3>{item.title}</h3>
                    <p>{item.description || "Premium rental piece from the FinalTouch Studio collection."}</p>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => toggleItem(item.id)} aria-label={`Remove ${item.title}`}>
                    <CloseIcon width={16} height={16} />
                    <span>Remove</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className={styles.sidebar}>
          <Card padded className={styles.summary}>
            <h2 className={styles.summaryTitle}>Package summary</h2>
            <dl className={styles.rows}>
              <div>
                <dt>Package price</dt>
                <dd className={customised ? styles.strike : undefined}>{formatMoney(basePrice)}</dd>
              </div>
              <div>
                <dt>Pieces included</dt>
                <dd>
                  {included.length} of {allItems.length}
                </dd>
              </div>
            </dl>

            {customised && <Badge tone="gold">Customised package</Badge>}

            <div className={styles.total}>
              <span>Your price</span>
              <strong>{formatMoney(price)}</strong>
            </div>

            <Button size="lg" block disabled={included.length === 0} onClick={handleCheckout}>
              Continue to checkout
            </Button>
            <p className={styles.note}>Delivery and setup within Saskatoon are confirmed after booking.</p>
          </Card>

          {excluded.length > 0 && (
            <Card padded className={styles.removed}>
              <h2 className={styles.removedTitle}>Removed pieces</h2>
              <ul>
                {excluded.map((item) => (
                  <li key={item.id}>
                    <span>{item.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => toggleItem(item.id)}>
                      <PlusIcon /> Add back
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </Container>
    </PageLayout>
  );
}
