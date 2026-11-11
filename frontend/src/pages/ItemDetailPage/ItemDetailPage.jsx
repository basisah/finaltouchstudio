import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { get } from "../../api/client";
import ItemImage from "../../components/catalog/ItemImage";
import DateRangePickerModal from "../../components/DateRangePickerModal/DateRangePickerModal";
import PageLayout from "../../components/layout/PageLayout";
import {
  Badge,
  BoxIcon,
  Breadcrumb,
  Button,
  CalendarIcon,
  CartIcon,
  Container,
  EmptyState,
  ShieldIcon,
  Skeleton,
  Toast,
  TruckIcon,
} from "../../components/ui";
import { useCart } from "../../context/CartContext";
import { useCatalog } from "../../hooks/useCatalog";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatPrice, titleCase } from "../../utils/format";
import { parseGallery } from "../../utils/images";
import { getItemStockQuantity, isItemRentable } from "../../utils/itemStock";
import styles from "./ItemDetailPage.module.css";

const ASSURANCES = [
  { Icon: TruckIcon, title: "Pickup or delivery", text: "Free studio pickup, or delivery across Saskatoon." },
  { Icon: ShieldIcon, title: "Cleaned & checked", text: "Inspected and sanitised before every rental." },
  { Icon: BoxIcon, title: "Setup guide included", text: "Step-by-step instructions for every piece." },
];

function DetailSkeleton() {
  return (
    <div className={styles.layout} aria-busy="true" aria-label="Loading item">
      <Skeleton height="auto" radius="var(--radius-lg)" style={{ aspectRatio: "4 / 3" }} />
      <div className={styles.info}>
        <Skeleton width="30%" height="14px" />
        <Skeleton width="80%" height="44px" />
        <Skeleton width="35%" height="32px" />
        <Skeleton height="96px" />
        <Skeleton height="56px" radius="var(--radius-pill)" />
      </div>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories } = useCatalog();
  const [toast, showToast] = useToast();

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [bookedRanges, setBookedRanges] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [goToCartAfter, setGoToCartAfter] = useState(false);
  const [selection, setSelection] = useState(null); // { pickupDate, returnDate, quantity }

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setItem(null);
    setActivePhoto(null);
    setSelection(null);

    get(`/items/${id}`)
      .then((data) => {
        if (!active) return;
        setItem(data);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));

    get(`/items/${id}/booked-dates`)
      .then((data) => active && Array.isArray(data?.bookedRanges) && setBookedRanges(data.bookedRanges))
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [id]);

  const photos = useMemo(() => (item ? [item.image, ...parseGallery(item.gallery_images)].filter(Boolean) : []), [item]);
  const category = useMemo(() => categories.find((c) => c.id === item?.categoryId), [categories, item]);

  const openPicker = (thenCart) => {
    setGoToCartAfter(thenCart);
    setPickerOpen(true);
  };

  const handleConfirmDates = ({ pickupDate, returnDate, quantity, item: picked }) => {
    setSelection({ pickupDate, returnDate, quantity });
    setPickerOpen(false);
    addToCart(picked, pickupDate, returnDate, quantity);
    if (goToCartAfter) navigate("/cart");
    else showToast(`Added ${quantity} × ${picked.title} to your cart`);
  };

  if (status === "error") {
    return (
      <PageLayout>
        <Container narrow className={styles.state}>
          <EmptyState
            title="We could not find that rental"
            actions={<Button to="/items">Back to the catalogue</Button>}
          >
            It may have been removed, or the link is incorrect.
          </EmptyState>
        </Container>
      </PageLayout>
    );
  }

  const title = item?.title || item?.name;
  const rentable = item ? isItemRentable(item) : false;
  const stock = item ? getItemStockQuantity(item) : 0;
  const categoryLabel = category?.label || titleCase(item?.categoryId);
  const subcategoryLabel =
    category?.subcategories?.find((sub) => sub.id === item?.subCategoryId)?.label || titleCase(item?.subCategoryId);

  return (
    <PageLayout>
      <Container className={styles.page}>
        {status === "loading" || !item ? (
          <DetailSkeleton />
        ) : (
          <>
            <Breadcrumb
              crumbs={[
                { label: "Home", to: "/" },
                { label: "Rentals", to: "/items" },
                { label: categoryLabel, to: `/items?category=${item.categoryId}` },
                { label: title },
              ]}
            />

            <div className={styles.layout}>
              {/* Gallery */}
              <div className={styles.gallery}>
                <div className={styles.mainPhoto}>
                  <ItemImage
                    key={activePhoto || item.image}
                    src={activePhoto || item.image}
                    alt={title}
                    width={1200}
                    sizes="(max-width: 900px) 100vw, 600px"
                    eager
                  />
                </div>
                {photos.length > 1 && (
                  <div className={styles.thumbs} role="group" aria-label="Photos">
                    {photos.map((photo, index) => {
                      const selected = (activePhoto || item.image) === photo;
                      return (
                        <button
                          key={photo}
                          type="button"
                          className={`${styles.thumb} ${selected ? styles.thumbActive : ""}`}
                          onClick={() => setActivePhoto(photo)}
                          aria-label={`Show photo ${index + 1}`}
                          aria-pressed={selected}
                        >
                          <ItemImage src={photo} alt="" width={200} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className={styles.info}>
                <div className={styles.meta}>
                  <span className={styles.category}>{categoryLabel}</span>
                  <Badge tone={rentable ? "success" : "danger"} dot>
                    {rentable ? "Available to rent" : "Currently unavailable"}
                  </Badge>
                </div>

                <h1 className={styles.title}>{title}</h1>

                <p className={styles.price}>
                  {formatPrice(item.price)}
                  <span> per day</span>
                </p>

                <p className={styles.description}>
                  {item.description ||
                    "Part of our rental collection. Contact us for dimensions, colour options and styling ideas for this piece."}
                </p>

                <dl className={styles.specs}>
                  <div>
                    <dt>Occasion</dt>
                    <dd>{categoryLabel}</dd>
                  </div>
                  {subcategoryLabel && (
                    <div>
                      <dt>Type</dt>
                      <dd>{subcategoryLabel}</dd>
                    </div>
                  )}
                  <div>
                    <dt>In stock</dt>
                    <dd>
                      {stock} {stock === 1 ? "unit" : "units"}
                    </dd>
                  </div>
                  <div>
                    <dt>Rental</dt>
                    <dd>Priced per day</dd>
                  </div>
                </dl>

                <div className={styles.booking}>
                  <div className={styles.bookingSummary}>
                    <CalendarIcon />
                    {selection ? (
                      <p>
                        <strong>
                          {formatDate(selection.pickupDate)} – {formatDate(selection.returnDate || selection.pickupDate)}
                        </strong>
                        <span>Quantity {selection.quantity} · added to your cart</span>
                      </p>
                    ) : (
                      <p>
                        <strong>Choose your rental dates</strong>
                        <span>See live availability for this piece</span>
                      </p>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <Button size="lg" disabled={!rentable} onClick={() => openPicker(false)}>
                      <CartIcon /> {selection ? "Add more dates" : "Add to cart"}
                    </Button>
                    <Button size="lg" variant="secondary" disabled={!rentable} onClick={() => openPicker(true)}>
                      Book now
                    </Button>
                  </div>
                </div>

                <ul className={styles.assurances}>
                  {ASSURANCES.map(({ Icon, title: heading, text }) => (
                    <li key={heading}>
                      <span className={styles.assuranceIcon}>
                        <Icon />
                      </span>
                      <span>
                        <strong>{heading}</strong>
                        <span>{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </Container>

      {pickerOpen && item && (
        <DateRangePickerModal
          item={item}
          bookedRanges={bookedRanges}
          onClose={() => setPickerOpen(false)}
          onConfirm={handleConfirmDates}
        />
      )}
      <Toast message={toast} />
    </PageLayout>
  );
}
