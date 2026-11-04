import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './App.css'

import muraPhoto from './assets/mura.jpg'
import shenalPhoto from './assets/shenal.jpg'
import ridzyPhoto from './assets/ridzy.jpg'

function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return [ref, visible]
}

function useHeroScroll() {
  const ref = useRef(null)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const scrollY = window.scrollY
            const vh = window.innerHeight
            const progress = Math.min(scrollY / (vh * 0.5), 1)
            ref.current.style.setProperty('--scroll', progress)
          }
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return ref
}

const tracks = [
  { title: 'Sereppuwa', spotify: '5A16odAsBtHavDJs5inAWH' },
  { title: 'Ada Ape Thaththa', spotify: '195l4MSZJXqsuFKa5Eu8vm' },
  { title: 'Watey Gihin', spotify: '4nX06dv7UyO06k0GhUrUkr' },
  { title: 'Hollala', spotify: '5WtyN9ckLqovq1ht8d955F' },
  { title: 'Doppi Nakin', spotify: '5hnHxcZ6xjJLXPSlRD9VdJ' },
  { title: 'Awidan Yanawa', spotify: '7s2fLyvgcSOzuA0rBHuFSE' },
  { title: 'Bus Eke', spotify: '421PPxgiHyH2qIe7rFxwuP' },
]

const members = [
  {
    name: 'Mura',
    full: 'Murshad Huvais',
    role: 'Vocalist · Lyricist · Rap',
    bio: 'The voice and pen of Funky Dirt. Mura writes the words, drops the rhymes and fronts the stage — from viral one-liners to full love letters in Sinhala.',
    handle: '@mura_funkydirt',
    social: 'https://www.instagram.com/mura_funkydirt/',
    initial: 'M',
    photo: muraPhoto,
  },
  {
    name: 'Shenal',
    full: 'Shenal Maddumage',
    role: 'Producer · Music · Mixing',
    bio: 'The sonic engineer. Shenal builds every beat, mix and master behind the Funky Dirt sound — the grooves that make Colombo dance.',
    handle: '@shenal_funkydirt',
    social: 'https://www.instagram.com/shenal_funkydirt/',
    initial: 'S',
    photo: shenalPhoto,
  },
  {
    name: 'Ridzy',
    full: 'Ridzy',
    role: 'DJ · Beatmaker · Live Energy',
    bio: 'The vibe setter. Ridzy keeps the party locked with heavy turntable energy that turns every show into a block party.',
    handle: '@ridzy_funkydirt',
    social: 'https://www.instagram.com/ridzy_funkydirt/',
    initial: 'R',
    photo: ridzyPhoto,
  },
]

const stats = [
  { value: '1.3M+', label: 'Views on Sereppuwa' },
  { value: '2007', label: 'Formed in Colombo' },
  { value: '3', label: 'Lifelong best friends' },
]

const galleryImages = Object.values(
  import.meta.glob('./assets/gallery/*.{jpg,jpeg,png,webp}', { eager: true }),
).map((m) => m.default)

const genres = ['Funk', 'Pop', 'Dance', 'Rap']

const socialLinks = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@FunkyDirt_Official',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/FunKyDirT/',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/funkydirtofficial/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/4EmQAPX89Zg1TUUaQut1IC',
    path: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z',
  },
]

function SocialLink({ link }) {
  return (
    <a href={link.href} target="_blank" rel="me noreferrer" aria-label={`Funky Dirt on ${link.label}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={link.path} />
      </svg>
      <span>{link.label}</span>
    </a>
  )
}

function Socials({ className }) {
  return (
    <div className={className}>
      {socialLinks.map((l) => (
        <SocialLink link={l} key={l.label} />
      ))}
    </div>
  )
}

function Avatar({ member }) {
  if (member.photo) {
    return (
      <div className="avatar avatar-photo">
        <img
          src={member.photo}
          alt={`${member.full} of Funky Dirt`}
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }
  return (
    <div className="avatar" aria-hidden="true">
      <span>{member.initial}</span>
    </div>
  )
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, delay = 0 }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Members', href: '#members' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Music', href: '#music' },
  { label: 'Contact', href: '#contact' },
  { label: 'FAQ', href: '#faq' },
]

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="nav">
      <a className="brand" href="#top">
        <img src="/logo.png" alt="" className="brand-logo" aria-hidden="true" />
        FUNKY DIRT
      </a>
      <ul className="nav-links">
        {navLinks.map((l) => (
          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`nav-toggle${open ? ' open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <ul className="nav-mobile">
          {navLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

function Hero() {
  const scrollRef = useHeroScroll()

  return (
    <header id="top" className="hero" ref={scrollRef}>
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-glow-2" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-badge hero-anim-item">
          <span className="hero-badge-dot" />
          Sri Lankan trio · Colombo
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line hero-anim-item">FUNKY</span>
          <span className="hero-title-line hero-title-accent hero-anim-item">DIRT</span>
        </h1>
        <p className="hero-tag hero-anim-item">
          Turning every stage into a place where music, movement, and madness collide.
        </p>
        <div className="hero-ctas hero-anim-item">
          <a className="btn btn-primary" href="#music">Listen now</a>
          <a className="btn btn-ghost-light" href="#contact">Book the band</a>
        </div>
        <ul className="hero-genres hero-anim-item">
          {genres.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero-scroll-line" />
      </div>
      <div className="hero-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </header>
  )
}

function About() {
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.1 })
  const [statsRef, statsVisible] = useScrollReveal({ threshold: 0.2 })

  return (
    <section id="about" className="section about">
      <div className="section-inner">
        <Reveal>
          <div className="section-head">
            <span className="kicker">About</span>
            <h2>Three schoolmates, one groove</h2>
          </div>
        </Reveal>
      <div ref={gridRef} className={`about-grid${gridVisible ? ' visible' : ''}`}>
          <div className="about-card">
            <h3>From the classroom to the stage</h3>
            <p>
              Funky Dirt started as a "just for fun" band called <strong>MACS</strong> at
              Isipathana College, Colombo — before becoming the unmistakable trio known
              today. Founded by <strong>Mura, Shenal &amp; Ridzy</strong> in 2007, the
              group is a collection of fun-loving, imaginative and mad-brilliant best
              friends.
            </p>
            <p>
              Their sound? A melting pot of funk, rap, dance and island pop — with lyrics
              that flip between laugh-out-loud and heartfelt in a single bar.
            </p>
            <p>
              Their debut video <strong>Ada Ape Thaththa</strong> earned the band
              <strong> Best New Artist</strong> and <strong>Best Upcoming Artist</strong> honours.
            </p>
          </div>
          <div className="about-card">
            <h3>The sound of the city by the sea</h3>
            <p>
              From viral anthems like <strong>Sereppuwa</strong> (1.3M+ views) to timeless
              classics like <strong>Ada Ape Thaththa</strong>, Funky Dirt soundtracks the
              island — headlining everything from Port City festivals to college stages.
            </p>
            <p>
              Collaborators include <strong>Yohani</strong>, whose global smash <strong>Awidan Yanawa</strong> features Shenal &amp; Murshad.
            </p>
          </div>
      </div>
      <div ref={statsRef} className={`stats${statsVisible ? ' visible' : ''}`}>
        {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
        ))}
      </div>
      </div>
    </section>
  )
}

function Members() {
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.1 })

  return (
    <section id="members" className="section members">
      <div className="section-inner">
        <Reveal>
          <div className="section-head">
            <span className="kicker">Members</span>
            <h2>The crew</h2>
          </div>
        </Reveal>
        <div ref={gridRef} className={`member-grid${gridVisible ? ' visible' : ''}`}>
          {members.map((m) => (
            <article className="member-card" key={m.name}>
              <Avatar member={m} />
              <h3 className="member-name">{m.name}</h3>
              <p className="member-full">{m.full}</p>
              <p className="member-role">{m.role}</p>
              <p className="member-bio">{m.bio}</p>
              <a className="member-social" href={m.social} target="_blank" rel="noreferrer">
                {m.handle}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function GalleryLightbox({ images, index, onClose, onPrev, onNext }) {
  const touchX = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) onNext()
      else onPrev()
    }
    touchX.current = null
  }

  return createPortal(
    <div className="gallery-lightbox" onClick={onClose}>
      <img
        src={images[index]}
        alt={`Funky Dirt photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
      <button
        type="button"
        className="lb-btn lb-prev"
        aria-label="Previous photo"
        onClick={(e) => { e.stopPropagation(); onPrev() }}
      >‹</button>
      <button
        type="button"
        className="lb-btn lb-next"
        aria-label="Next photo"
        onClick={(e) => { e.stopPropagation(); onNext() }}
      >›</button>
      <button
        type="button"
        className="lb-close"
        aria-label="Close gallery"
        onClick={(e) => { e.stopPropagation(); onClose() }}
      >×</button>
      <span className="lb-counter">{index + 1} / {images.length}</span>
    </div>,
    document.body,
  )
}

function Gallery() {
  const [index, setIndex] = useState(null)
  const [gridRef, gridVisible] = useScrollReveal({ threshold: 0.1 })
  const visible = galleryImages.slice(0, 6)
  const prev = () => setIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
  const next = () => setIndex((i) => (i + 1) % galleryImages.length)

  return (
    <section id="gallery" className="section gallery">
      <div className="section-inner">
        <Reveal>
          <div className="section-head">
            <span className="kicker">Gallery</span>
            <h2>Moments with Funky Dirt</h2>
          </div>
        </Reveal>
        <div ref={gridRef} className={`gallery-grid${gridVisible ? ' visible' : ''}`}>
          {visible.map((src, i) => (
            <button type="button" className="gallery-item" key={i} onClick={() => setIndex(i)}>
              <img src={src} alt={`Funky Dirt photo ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      {index !== null && (
        <GalleryLightbox
          images={galleryImages}
          index={index}
          onClose={() => setIndex(null)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  )
}

function SpotifyEmbed({ track }) {
  const ref = useRef(null)

  useEffect(() => {
    const iframe = ref.current
    const onMessage = (e) => {
      if (e.origin !== 'https://open.spotify.com') return
      if (e.data && typeof e.data === 'string') {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'resize' && data.height && iframe) {
            iframe.style.height = `${data.height}px`
          }
        } catch {
          /* ignore non-json messages */
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="spotify-embed">
      <iframe
        ref={ref}
        src={`https://open.spotify.com/embed/track/${track.spotify}?utm_source=generator&theme=1`}
        title={`${track.title} on Spotify`}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

function Music() {
  return (
    <section id="music" className="section music">
      <div className="section-inner">
        <div className="section-head">
          <span className="kicker">Discography</span>
          <h2>Select releases</h2>
        </div>
        <div className="spotify-grid">
          {tracks.map((t) => (
            <SpotifyEmbed track={t} key={t.title} />
          ))}
        </div>
        <ul className="track-list" aria-label="Funky Dirt releases on Spotify">
          {tracks.map((t, i) => (
            <li key={t.title}>
              <a
                href={`https://open.spotify.com/track/${t.spotify}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="track-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="track-name">{t.title}</span>
                <span className="track-cta">Listen on Spotify ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'Who are the members of Funky Dirt?',
    a: 'Funky Dirt is a trio: Murshad Huvais (Mura) on vocals, lyrics and rap; Shenal Maddumage as producer, composer and mixing engineer; and Ridzy as DJ and beatmaker. Mura, Shenal and Ridzy formed the band in 2007 at Isipathana College, Colombo.',
  },
  {
    q: 'Where is Funky Dirt from and when did the band form?',
    a: 'Funky Dirt is from Colombo, Sri Lanka. The trio formed in 2007 as a school band called MACS at Isipathana College before becoming Funky Dirt.',
  },
  {
    q: 'What songs is Funky Dirt known for?',
    a: 'Funky Dirt is known for Sereppuwa, Ada Ape Thaththa, Bus Eke, Watey Gihin, Hollala, Doppi Nakin, Eka Tamai Meka and Awidan Yanawa with Yohani. Their 2025 single Oba Dakmen was the PPL official theme song.',
  },
  {
    q: 'How can I listen to Funky Dirt?',
    a: 'Stream Funky Dirt on Spotify, Apple Music, YouTube Music and Deezer. Official music videos are on YouTube at @FunkyDirt_Official, and the band posts updates on Instagram and Facebook.',
  },
  {
    q: 'How far in advance should I book Funky Dirt?',
    a: 'Book at least 3–6 months in advance for private events such as weddings, and 6–12 months for major events or festivals. The band\'s calendar fills up quickly during peak season, so earlier is better.',
  },
  {
    q: 'How can I book Funky Dirt for an event?',
    a: 'Send a booking request through the form on this site. It opens WhatsApp with your event date, venue, event type and expected crowd, and the band replies with availability and a quote.',
  },
  {
    q: 'What performance packages does Funky Dirt offer?',
    a: 'Funky Dirt performs at weddings, private parties, birthdays, corporate events, festivals and college gigs. Set length, set list and setup are tailored to the venue and budget.',
  },
  {
    q: 'Does Funky Dirt perform outside Sri Lanka?',
    a: 'Yes. Funky Dirt takes international bookings and regularly performs overseas. International dates need more advance notice for travel and logistics.',
  },
  {
    q: 'What happens if I need to cancel or reschedule?',
    a: 'Contact the band on WhatsApp as early as possible. Funky Dirt will try to reschedule if availability allows, and cancellation terms are agreed up front at booking time.',
  },
  {
    q: 'Can I request specific songs for my event?',
    a: 'Yes. Send a must-play list when booking and the band will work it into the set. Live requests are also welcome on the night when the band knows the song.',
  },
]

function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section faq">
      <div className="section-inner">
        <div className="section-head">
          <span className="kicker">FAQ</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item${open === i ? ' open' : ''}`} key={i}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
              <div className="faq-a">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const eventTypes = [
  'Wedding',
  'Private party',
  'Birthday',
  'Corporate event',
  'Festival',
  'College / Gig',
  'Other',
]

const BOOKING_PHONE = '94707115523'

function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    eventType: eventTypes[0],
    date: '',
    location: '',
    crowd: '',
    budget: '',
    notes: '',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    const lines = [
      'Hey Funky Dirt! We\'d like to book you for an event.',
      '',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
    ]
    lines.push(`Event type: ${form.eventType}`)
    if (form.date) lines.push(`Event date: ${form.date}`)
    if (form.location) lines.push(`Location: ${form.location}`)
    if (form.crowd) lines.push(`Expected crowd: ${form.crowd}`)
    if (form.budget) lines.push(`Budget: ${form.budget}`)
    if (form.notes) lines.push('', `Notes: ${form.notes}`)
    const msg = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/${BOOKING_PHONE}?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="contact" className="section contact">
      <div className="section-inner">
        <div className="contact-card">
          <span className="kicker">Bookings &amp; collabs</span>
          <h2>Book Funky Dirt</h2>
          <p>
            Gigs, weddings, festivals and corporate events — if it moves, we groove it.
            Fill in the details and your booking request goes straight to the band on WhatsApp.
          </p>
          <form className="booking-form" onSubmit={onSubmit}>
            <label className="booking-field">
              <span>Your name</span>
              <input type="text" value={form.name} onChange={set('name')} required placeholder="Jane Perera" />
            </label>
            <label className="booking-field">
              <span>Your phone / WhatsApp</span>
              <input type="tel" value={form.phone} onChange={set('phone')} required placeholder="+94 7X XXX XXXX" />
            </label>
            <label className="booking-field">
              <span>Event type</span>
              <select value={form.eventType} onChange={set('eventType')}>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="booking-field">
              <span>Event date</span>
              <input type="date" value={form.date} onChange={set('date')} />
            </label>
            <label className="booking-field">
              <span>Venue / location</span>
              <input type="text" value={form.location} onChange={set('location')} placeholder="e.g. Mount Lavinia Hotel" />
            </label>
            <label className="booking-field">
              <span>Expected crowd</span>
              <input type="text" value={form.crowd} onChange={set('crowd')} placeholder="e.g. 500 guests" />
            </label>
            <label className="booking-field">
              <span>Budget (optional)</span>
              <input type="text" value={form.budget} onChange={set('budget')} placeholder="e.g. LKR 250,000" />
            </label>
            <label className="booking-field booking-full">
              <span>Anything else?</span>
              <textarea value={form.notes} onChange={set('notes')} placeholder="Set list requests, technical needs, timeline..." />
            </label>
            <button type="submit" className="btn btn-primary booking-submit">Send booking via WhatsApp</button>
          </form>
          <Socials className="socials" />
        </div>
      </div>
    </section>
  )
}

const termsText = [
  'This website is an unofficial, fan-made site for the Sri Lankan band Funky Dirt.',
  'All music, album artwork, images, video and trademarks displayed on this site remain the property of Funky Dirt and their respective labels, and are shown here for informational purposes only.',
  'The booking form collects the details you enter and opens WhatsApp to send your request directly to the band. By submitting the form you confirm that the information you provide is accurate and that you are authorised to make the booking.',
  'This site is provided on an "as is" basis without warranties of any kind. We are not liable for any errors, omissions, or unavailability of the site.',
  'Links to external platforms (YouTube, Spotify, Instagram, Facebook and others) lead to third-party websites that are governed by their own terms and policies.',
]

const privacyText = [
  'This site does not require an account and does not collect or store personal data on our own servers.',
  'Any details you enter in the booking form (name, phone, event information) are transmitted to the band directly through WhatsApp when you submit the form.',
  'We do not use tracking cookies or advertising scripts, and we do not sell or share your information with third parties.',
  'For questions about your data or this policy, please contact the band through the booking form or their listed channels.',
]

function LegalModal({ type, onClose }) {
  const title = type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'
  const body = type === 'terms' ? termsText : privacyText

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="legal-overlay" onClick={onClose}>
      <div
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="legal-close" onClick={onClose} aria-label="Close">×</button>
        <h3>{title}</h3>
        <div className="legal-body">
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Footer() {
  const [modal, setModal] = useState(null)

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-brand-col">
          <p className="footer-brand">FUNKY DIRT</p>
          <p className="footer-tag">
            Three schoolmates, one groove — funk, rap and island pop from Colombo, Sri Lanka.
          </p>
        </div>
        <div className="footer-col">
          <h3>Explore</h3>
          <a href="#top">Home</a>
          <a href="#about">About</a>
          <a href="#members">Members</a>
          <a href="#music">Music</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Book us</a>
        </div>
        <div className="footer-col">
          <h3>Legal</h3>
          <button type="button" onClick={() => setModal('terms')}>Terms &amp; Conditions</button>
          <button type="button" onClick={() => setModal('privacy')}>Privacy Policy</button>
        </div>
        <div className="footer-col">
          <h3>Follow</h3>
          <Socials className="footer-socials" />
        </div>
      </div>
      <div className="footer-bottom">
        <p>{`© ${new Date().getFullYear()} Funky Dirt · All music, images & trademarks belong to Funky Dirt and their labels.`}</p>
        <p className="footer-credit">
          Created by <a href="https://dilshanjagoda.github.io" target="_blank" rel="noreferrer">Dilshan Jagoda</a>
        </p>
      </div>
      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </footer>
  )
}

function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className={scrolled ? 'nav-holder scrolled' : 'nav-holder'}>
        <Nav />
      </div>
      <Hero />
      <main id="main" tabIndex={-1}>
        <Socials className="hero-socials" />
        <About />
        <Members />
        <Gallery />
        <Music />
        <Contact />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}

export default App
