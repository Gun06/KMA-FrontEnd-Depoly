import {
  advisors,
  branches,
  counsel,
  departments,
  directors,
  doctor,
  hospital,
  president,
  referee,
  type RolePerson,
} from './chart';
import styles from './OrganizationalChart.module.css';

function SoftBox({ role, name }: RolePerson) {
  return (
    <div className={styles.box}>
      <p className={styles.boxHeader}>{role}</p>
      <p className={styles.boxName}>{name}</p>
    </div>
  );
}

export function OrganizationalChart() {
  return (
    <div className="mx-auto max-w-5xl px-2 pb-12 sm:px-4">
      <section className={styles.section} aria-labelledby="org-chart">
        <h2 id="org-chart" className={styles.sectionTitle}>
          조직도
        </h2>

        <div className={styles.president}>
          <p className={styles.presidentRole}>{president.role}</p>
          <p className={styles.presidentName}>{president.name}</p>
        </div>

        <div className={`${styles.stem} ${styles.stemToDepartments}`} aria-hidden />

        <div className={styles.deptBlock}>
          <ul className={`${styles.tree} ${styles.departments}`}>
            {departments.map(item => (
              <li key={item.role} className={styles.node}>
                <SoftBox {...item} />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.branchRow}>
          <p className={styles.branchLabel}>지사</p>
          <ul className={styles.branchList}>
            {branches.map(item => (
              <li key={item.role}>
                <SoftBox {...item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} mt-14`} aria-labelledby="org-advisors">
        <h2 id="org-advisors" className={styles.sectionTitle}>
          임원 · 자문
        </h2>

        <div className={styles.pairGrid}>
          <SoftBox {...counsel} />
          <SoftBox {...referee} />
        </div>

        <div className={`${styles.box} mt-3`}>
          <p className={styles.boxHeader}>{directors.role}</p>
          <ul className={styles.directorsBody}>
            {directors.names.map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>

        <div className={`${styles.advisorBar} mt-3`}>
          <p className={styles.advisorLabel}>{advisors.role}</p>
          <ul className={styles.advisorNames}>
            {advisors.names.map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>

        <div className={`${styles.pairGrid} mt-3`}>
          <SoftBox {...hospital} />
          <SoftBox {...doctor} />
        </div>
      </section>
    </div>
  );
}
