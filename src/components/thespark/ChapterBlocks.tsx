import { Link } from 'react-router'
import { artists, artistsPage, workshopArtists } from '../../content/artists'
import { ArtistHover } from './ArtistHover'
import { thespark, type Block, type Fact, type Room } from '../../content/thespark'
import pageStyles from '../../pages/TheSparkPage.module.css'
import { RegisterButton } from './register'
import { Value } from './Tba'
import { Gallery } from './Gallery'
import { terms } from '../../content/terms'
import { Spread } from './Spread'
import { ArtistRow } from './ArtistRow'
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
          <ArtistHover artist={a}>
            <Link to={`${artistsPage.path}#${a.id}`} className={styles.artistLink} tabIndex={tabIndex}>
              {a.name}
            </Link>
          </ArtistHover>
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
          {block.caption && <p className={styles.listCaption}>{block.caption}</p>}
          <ul className={styles.list}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )
    case 'quotes':
      return (
        <div className={styles.block}>
          {block.heading && <H3>{block.heading}</H3>}
          {block.caption && <p className={styles.listCaption}>{block.caption}</p>}
          <div className={styles.quotes}>
            {block.items.map((q) => (
              <figure key={q.name} className={styles.quote}>
                <blockquote className={styles.quoteText}>
                  <p>“{q.text}”</p>
                </blockquote>
                <figcaption className={styles.quoteBy}>
                  <span className={styles.quoteName}>{q.name}</span>
                  {q.role ? <span className={styles.quoteRole}>{q.role}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
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
                {w.points ? (
                  <ul className={styles.workshopPoints}>
                    {w.points.map((pt) => (
                      <li key={pt} className={styles.small}>
                        {pt}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.small}>{w.text}</p>
                )}
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
    case 'artistRow':
      return <ArtistRow heading={block.heading} more={block.more} tabIndex={tabIndex} />
    case 'people':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          <ul className={styles.people}>
            {block.items.map((person) => {
              const artist = artists.find((a) => a.name === person.name)
              // Hosts with a portrait (Philine, November 2026): photo beside their description.
              return (
                <li key={person.name} className={artist?.portrait ? `${styles.person} ${styles.personWithPhoto}` : styles.person}>
                  {artist?.portrait && (
                    <img
                      className={styles.personPhoto}
                      src={`${import.meta.env.BASE_URL}artists/${artist.portrait.slug}-sm.webp`}
                      srcSet={`${import.meta.env.BASE_URL}artists/${artist.portrait.slug}-sm.webp 360w, ${import.meta.env.BASE_URL}artists/${artist.portrait.slug}.webp 900w`}
                      sizes="(max-width: 720px) 40vw, 12rem"
                      width={360}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      alt={artist.portrait.alt}
                    />
                  )}
                  <div>
                    <p className={styles.personName}>
                      {/* No hover portrait when the photo is already shown beside the text. */}
                      {artist?.portrait ? person.name : <ArtistHover artist={artist}>{person.name}</ArtistHover>}
                    </p>
                    {person.role && <p className={styles.by}>{person.role}</p>}
                    <p className={styles.small}>{person.text}</p>
                  </div>
                </li>
              )
            })}
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
      // One column: the included list, then what is not included as a plain sentence (Igor, 25 November 2026).
      return (
        <div className={styles.block}>
          <H3>{block.included.heading}</H3>
          <ul className={styles.list}>
            {block.included.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.small}>
            <span className={styles.by}>{block.excluded.heading}:</span> {block.excluded.items.join(', ')}.
          </p>
        </div>
      )
    case 'rooms':
      return (
        <div className={styles.block}>
          <H3>{block.heading}</H3>
          {/* All five rooms side by side before the cards (Igor, 25 November 2026). */}
          <RoomTable rooms={block.items} tabIndex={tabIndex} />
          <ul className={styles.rooms}>
            {block.items.map((room) => (
              <li key={room.id} id={`room-${room.id}`} className={styles.room}>
                <h4 className={styles.roomName}>{room.name}</h4>
                <p className={styles.roomTagline}>{room.tagline}</p>
                {room.photos && (
                  <Gallery label={`${room.name}: photos`} items={room.photos} folder="rooms" perView={1} tabIndex={tabIndex} />
                )}
                <p className={styles.roomPrice}>
                  <span className={styles.priceMain}>
                    {room.price.regular} <span className={styles.priceBasis}>{room.price.basis}</span>
                  </span>
                  {room.price.perPerson && (
                    <span className={styles.priceBasis}>
                      {room.price.perPerson} {thespark.interest.compare.perPerson}
                    </span>
                  )}
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
    case 'terms':
      return (
        <aside className={styles.termsBox} aria-labelledby="terms-box-title">
          <h3 id="terms-box-title" className={styles.termsTitle}>
            {terms.summary.heading}
          </h3>
          <dl className={styles.termsList}>
            {terms.summary.items.map((it) => (
              <div key={it.term} className={styles.termsRow}>
                <dt className={styles.term}>{it.term}</dt>
                <dd className={styles.termsText}>{it.text}</dd>
              </div>
            ))}
          </dl>
          <Link to={terms.path} className={styles.termsLink} tabIndex={tabIndex}>
            {terms.summary.link}
          </Link>
        </aside>
      )
    case 'figures':
      return (
        <div className={block.noPhone ? `${styles.figures} ${styles.noPhone}` : styles.figures}>
          <Spread figures={block.items} />
        </div>
      )
    case 'gallery':
      return <Gallery label={block.label} items={block.items} folder={block.folder} drift={block.drift} zoom={block.zoom} tabIndex={tabIndex} />
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
/** The rooms at a glance: one row per room, each name links to its card. Rows stack on phones. */
function RoomTable({ rooms, tabIndex }: { rooms: Room[]; tabIndex?: number }) {
  const t = thespark.interest.compare
  return (
    <table className={styles.compare}>
      <caption className={styles.compareCaption}>{t.caption}</caption>
      <thead>
        <tr>
          <th scope="col">{t.room}</th>
          <th scope="col">{t.guests}</th>
          <th scope="col">{t.bed}</th>
          <th scope="col">{t.bathroom}</th>
          <th scope="col">{t.shuttle}</th>
          <th scope="col">{t.price}</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id}>
            <th scope="row" className={styles.compareRoom}>
              <a href={`#room-${room.id}`} tabIndex={tabIndex}>
                {room.name}
              </a>
            </th>
            <td data-label={t.guests}>{room.compare.guests}</td>
            <td data-label={t.bed}>{room.compare.bed}</td>
            <td data-label={t.bathroom}>{room.compare.bathroom}</td>
            <td data-label={t.shuttle}>{room.compare.shuttle ? t.included : t.addOn}</td>
            <td data-label={t.price} className={styles.comparePrice}>
              <span>
                <span className={styles.priceMain}>{room.price.regular}</span>{' '}
                <span className={styles.priceBasis}>
                  {room.price.perPerson ? `per room (${room.price.perPerson} ${t.perPerson})` : room.price.basis}
                </span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ChapterBlocks({ blocks, tabIndex }: { blocks: readonly Block[]; tabIndex?: number }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} tabIndex={tabIndex} />
      ))}
    </>
  )
}
