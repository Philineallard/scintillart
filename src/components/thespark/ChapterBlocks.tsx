import { Link } from 'react-router'
import { artistsPage, workshopArtists } from '../../content/artists'
import { thespark, type Block, type Fact } from '../../content/thespark'
import pageStyles from '../../pages/TheSparkPage.module.css'
import { RegisterButton } from './register'
import { Value } from './Tba'
import styles from './ChapterBlocks.module.css'

function H3({ children }: { children: string }) {
  return <h3 className={styles.h3}>{children}</h3>
}

export function Facts({ facts }: { facts: readonly Fact[] }) {
  return (
    <dl className={styles.facts}>
      {facts.map((f) => (
        <div key={f.term} className={styles.fact}>
          <dt className={styles.term}>{f.term}</dt>
          <dd className={styles.detail}>
            <Value value={f.detail} />
            {f.note ? <span className={styles.note}>{f.note}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** "With Igor Świeczak and Manu": each name links to that artist on /thespark-artists. */
function WorkshopBy({ workshopId, fallback, tabIndex }: { workshopId: string; fallback: string; tabIndex?: number }) {
  const people = workshopArtists(workshopId)
  if (people.length === 0) return <p className={styles.by}>With {fallback}</p>
  return (
    <p className={styles.by}>
      With{' '}
      {people.map((a, i) => (
        <span key={a.id}>
          {i > 0 && ' and '}
          <Link to={`${artistsPage.path}#${a.id}`} className={styles.artistLink} tabIndex={tabIndex}>
            {a.name}
          </Link>
        </span>
      ))}
    </p>
  )
}

function BlockView({ block, tabIndex }: { block: Block; tabIndex?: number }) {
  switch (block.type) {
    case 'text':
      return (
        <div className={styles.block}>
          {block.heading && <H3>{block.heading}</H3>}
          {block.paragraphs.map((p) => (
            <p key={p} className={styles.p}>
              {p}
            </p>
          ))}
        </div>
      )
    case 'list':
      return (
        <div className={styles.block}>
          {block.heading && <H3>{block.heading}</H3>}
          <ul className={styles.list}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )
    case 'facts':
      return (
        <div className={styles.block}>
          {block.heading && <H3>{block.heading}</H3>}
          <Facts facts={block.facts} />
        </div>
      )
    case 'pillars':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          <ul className={styles.pillars}>
            {block.items.map((item) => (
              <li key={item.title} className={styles.pillar}>
                <p className={styles.pillarTitle}>{item.title}</p>
                <p className={styles.small}>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'workshops':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          <ul className={styles.workshops}>
            {block.items.map((w) => (
              <li key={w.practice} className={styles.workshop}>
                <p className={styles.workshopName}>
                  {w.practice}
                  {w.title && <span className={styles.workshopTitle}>{w.title}</span>}
                </p>
                <WorkshopBy workshopId={w.id} fallback={w.by} tabIndex={tabIndex} />
                <p className={styles.small}>{w.text}</p>
              </li>
            ))}
          </ul>
          {block.more && (
            <Link to={block.more.href} className={styles.more} tabIndex={tabIndex}>
              {block.more.label}
            </Link>
          )}
        </div>
      )
    case 'people':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          <ul className={styles.people}>
            {block.items.map((person) => (
              <li key={person.name} className={styles.person}>
                <p className={styles.personName}>{person.name}</p>
                {person.role && <p className={styles.by}>{person.role}</p>}
                <p className={styles.small}>{person.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'schedule':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          <table className={styles.schedule}>
            <thead className="visually-hidden">
              <tr>
                <th scope="col">Time</th>
                <th scope="col">What happens</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.time}>
                  <th scope="row" className={styles.time}>
                    {row.time}
                  </th>
                  <td>{row.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'included':
      return (
        <div className={`${styles.block} ${styles.included}`}>
          {[block.included, block.excluded].map((group) => (
            <div key={group.heading}>
              <H3>{group.heading}</H3>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    case 'rooms':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          {/* Step 2 adds photo galleries, amenity tags and "Show more". */}
          <ul className={styles.rooms}>
            {block.items.map((room) => (
              <li key={room.id} className={styles.room}>
                <h4 className={styles.roomName}>{room.name}</h4>
                <p className={styles.roomTagline}>{room.tagline}</p>
                <p className={styles.roomPrice}>
                  <span className={styles.priceMain}>
                    {room.price.regular} <span className={styles.priceBasis}>{room.price.basis}</span>
                  </span>
                  <span className={styles.priceEarly}>
                    {thespark.interest.earlyBird} {room.price.earlyBird}
                  </span>
                </p>
                <p className={styles.small}>{room.details}</p>
                <p className={styles.roomBestFor}>
                  <span className={styles.by}>{thespark.interest.bestFor}</span> {room.bestFor}
                </p>
                <RegisterButton room={room.id} className={pageStyles.button} tabIndex={tabIndex}>
                  {thespark.interest.label}
                  <span className="visually-hidden">: {room.name}</span>
                </RegisterButton>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'faq':
      return (
        <div className={styles.block}>
          {block.items.map((item) => (
            <details key={item.q} className={styles.faq}>
              <summary className={styles.question} tabIndex={tabIndex}>
                {item.q}
                <span className={styles.marker} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      )
  }
}

/** A chapter's content blocks, in the order they appear in the content file. */
export function ChapterBlocks({ blocks, tabIndex }: { blocks: readonly Block[]; tabIndex?: number }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} tabIndex={tabIndex} />
      ))}
    </>
  )
}
