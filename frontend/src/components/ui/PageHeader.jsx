import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Container } from "./Layout";
import styles from "./ui.module.css";

/** crumbs: [{ label, to? }] — the last crumb is the current page. */
export function Breadcrumb({ crumbs = [] }) {
  if (!crumbs.length) return null;
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <Fragment key={`${crumb.label}-${index}`}>
            {crumb.to && !isLast ? (
              <Link to={crumb.to}>{crumb.label}</Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
            )}
            {!isLast && (
              <span className={styles.breadcrumbSep} aria-hidden="true">
                /
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/** Title band shown at the top of every inner page. */
export default function PageHeader({ eyebrow, title, lead, crumbs, actions }) {
  return (
    <header className={styles.pageHeader}>
      <Container>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageHeaderText}>
            {crumbs && <Breadcrumb crumbs={crumbs} />}
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.pageTitle}>{title}</h1>
            {lead && <p className={styles.pageLead}>{lead}</p>}
          </div>
          {actions}
        </div>
      </Container>
    </header>
  );
}
