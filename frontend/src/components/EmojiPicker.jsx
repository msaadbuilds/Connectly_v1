import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const RECENT_KEY = 'chat_recent_emojis'
const MAX_RECENT = 24

// --- Category tab icons (kept as inline SVGs, matching the rest of the app's icon style) ---
const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SmileyIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 10h.01M15.5 10h.01M8 14.5c1.2 1.2 2.5 1.8 4 1.8s2.8-.6 4-1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const LeafIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M5 20c8 0 14-6 14-14 0 0-11-2-14 6-1.6 4.2 0 8 0 8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 20c0-4 2-7 6-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CupIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M5 5h11v7a5.5 5.5 0 0 1-11 0V5z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7h1.5a2.5 2.5 0 0 1 0 5H16" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 20h13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const BallIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CarIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M4 16V11l2-4h12l2 4v5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16h16M7 16v2M17 16v2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="16" r="1.4" /><circle cx="16" cy="16" r="1.4" />
  </svg>
)
const BulbIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M9 18h6M10 21h4" strokeLinecap="round" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.7V16h5.4v-.4c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const HashIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M9 4l-2 16M17 4l-2 16M4 9h16M3 15h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const FlagIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
    <path d="M5 21V4" strokeLinecap="round" />
    <path d="M5 5c2-1.5 4-1.5 6 0s4 1.5 6 0v9c-2 1.5-4 1.5-6 0s-4-1.5-6 0V5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
  </svg>
)

const CATEGORIES = [
  {
    id: 'recent',
    label: 'Recent',
    icon: ClockIcon,
  },
  {
    id: 'smileys',
    label: 'Smileys & People',
    icon: SmileyIcon,
    emojis: [
      ['😀', 'grinning happy smile'], ['😃', 'happy smile'], ['😄', 'happy smile laugh'], ['😁', 'grin happy'],
      ['😆', 'laugh haha'], ['😅', 'sweat laugh nervous'], ['🤣', 'rofl lol funny'], ['😂', 'joy tears laugh lol'],
      ['🙂', 'slight smile'], ['🙃', 'upside down silly'], ['😉', 'wink'], ['😊', 'blush smile happy'],
      ['😇', 'angel innocent halo'], ['🥰', 'love smile hearts'], ['😍', 'heart eyes love'], ['🤩', 'star struck wow'],
      ['😘', 'kiss love'], ['😗', 'kiss'], ['😚', 'kiss closed eyes'], ['😙', 'kiss smile'],
      ['😋', 'yum tasty tongue'], ['😛', 'tongue playful'], ['😜', 'wink tongue silly'], ['🤪', 'zany crazy silly'],
      ['😝', 'tongue closed eyes'], ['🤑', 'money rich'], ['🤗', 'hug'], ['🤭', 'giggle oops'],
      ['🤫', 'shh quiet secret'], ['🤔', 'think thinking hmm'], ['🤐', 'zip lips quiet secret'], ['🤨', 'raised eyebrow suspicious'],
      ['😐', 'neutral meh'], ['😑', 'expressionless blank'], ['😶', 'no mouth quiet'], ['😏', 'smirk'],
      ['😒', 'unamused annoyed'], ['🙄', 'eye roll annoyed'], ['😬', 'grimace awkward'], ['🤥', 'lying pinocchio'],
      ['😌', 'relieved calm'], ['😔', 'sad pensive'], ['😪', 'sleepy tired'], ['🤤', 'drool'],
      ['😴', 'sleep zzz tired'], ['😷', 'sick mask ill'], ['🤒', 'sick fever thermometer'], ['🤕', 'hurt bandage injured'],
      ['🤢', 'nausea sick'], ['🤮', 'vomit sick'], ['🤧', 'sneeze sick'], ['🥵', 'hot sweat'],
      ['🥶', 'cold freezing'], ['🥴', 'woozy dizzy'], ['😵', 'dizzy shocked'], ['🤯', 'mind blown shocked'],
      ['🤠', 'cowboy'], ['🥳', 'party celebrate'], ['😎', 'cool sunglasses'], ['🤓', 'nerd glasses'],
      ['🧐', 'monocle curious'], ['😕', 'confused'], ['😟', 'worried'], ['🙁', 'frown sad'],
      ['😮', 'wow surprised open mouth'], ['😯', 'surprised'], ['😲', 'astonished shocked'], ['😳', 'flushed embarrassed'],
      ['🥺', 'pleading puppy eyes'], ['😦', 'frown open mouth'], ['😧', 'anguished'], ['😨', 'fearful scared'],
      ['😰', 'anxious sweat scared'], ['😥', 'sad relieved'], ['😢', 'cry sad tear'], ['😭', 'sob crying loud'],
      ['😱', 'scream scared'], ['😖', 'confounded frustrated'], ['😣', 'persevere struggling'], ['😞', 'disappointed sad'],
      ['😓', 'sweat downcast'], ['😩', 'weary tired'], ['😫', 'tired exhausted'], ['🥱', 'yawn tired sleepy'],
      ['😤', 'triumph angry huff'], ['😡', 'angry mad rage'], ['😠', 'angry mad'], ['🤬', 'cursing swear angry'],
      ['😈', 'devil smile mischief'], ['👿', 'devil angry'], ['💀', 'skull dead'], ['💩', 'poop funny'],
      ['🤡', 'clown'], ['👻', 'ghost halloween'], ['👽', 'alien'], ['🤖', 'robot'],
      ['❤️', 'love heart red'], ['🧡', 'heart orange'], ['💛', 'heart yellow'], ['💚', 'heart green'],
      ['💙', 'heart blue'], ['💜', 'heart purple'], ['🖤', 'heart black'], ['🤍', 'heart white'],
      ['💔', 'broken heart sad'], ['❣️', 'heart exclamation'], ['💕', 'two hearts love'], ['💞', 'revolving hearts love'],
      ['💓', 'beating heart love'], ['💗', 'growing heart love'], ['💖', 'sparkling heart love'], ['💘', 'heart arrow love'],
      ['👍', 'thumbs up like good yes'], ['👎', 'thumbs down dislike bad no'], ['👏', 'clap applause'], ['🙌', 'raise hands celebrate praise'],
      ['🙏', 'pray please thanks'], ['🤝', 'handshake deal'], ['💪', 'muscle strong flex'], ['✌️', 'peace victory'],
      ['🤞', 'fingers crossed luck'], ['👌', 'ok okay perfect'], ['👋', 'wave hello bye'], ['🤙', 'call me'],
      ['👊', 'fist bump punch'], ['✊', 'fist power'], ['🫶', 'heart hands love'], ['😴', 'sleep'],
    ],
  },
  {
    id: 'nature',
    label: 'Animals & Nature',
    icon: LeafIcon,
    emojis: [
      ['🐶', 'dog puppy'], ['🐱', 'cat kitten'], ['🐭', 'mouse'], ['🐹', 'hamster'],
      ['🐰', 'rabbit bunny'], ['🦊', 'fox'], ['🐻', 'bear'], ['🐼', 'panda'],
      ['🐨', 'koala'], ['🐯', 'tiger'], ['🦁', 'lion'], ['🐮', 'cow'],
      ['🐷', 'pig'], ['🐸', 'frog'], ['🐵', 'monkey'], ['🙈', 'monkey see no evil'],
      ['🐔', 'chicken'], ['🐧', 'penguin'], ['🐦', 'bird'], ['🦄', 'unicorn'],
      ['🐝', 'bee'], ['🦋', 'butterfly'], ['🐢', 'turtle'], ['🐍', 'snake'],
      ['🐙', 'octopus'], ['🐳', 'whale'], ['🐬', 'dolphin'], ['🐟', 'fish'],
      ['🦈', 'shark'], ['🐊', 'crocodile'], ['🐘', 'elephant'], ['🦒', 'giraffe'],
      ['🐫', 'camel'], ['🦓', 'zebra'], ['🦍', 'gorilla'], ['🐎', 'horse'],
      ['🐕', 'dog'], ['🐈', 'cat'], ['🐓', 'rooster'], ['🦉', 'owl'],
      ['🌵', 'cactus plant'], ['🌲', 'tree pine'], ['🌳', 'tree'], ['🌴', 'palm tree'],
      ['🌱', 'seedling plant'], ['🌿', 'herb leaf plant'], ['☘️', 'shamrock luck'], ['🍀', 'clover luck'],
      ['🍁', 'maple leaf autumn'], ['🍂', 'fallen leaf autumn'], ['🌷', 'tulip flower'], ['🌹', 'rose flower love'],
      ['🌻', 'sunflower'], ['🌸', 'cherry blossom flower'], ['💐', 'bouquet flowers'], ['🌼', 'flower'],
      ['🌞', 'sun happy'], ['🌝', 'moon face'], ['🌙', 'moon night'], ['⭐', 'star'],
      ['🌟', 'glowing star'], ['✨', 'sparkles shiny'], ['⚡', 'lightning bolt'], ['🔥', 'fire hot lit'],
      ['🌈', 'rainbow'], ['☀️', 'sun sunny'], ['☁️', 'cloud'], ['🌧️', 'rain cloud'],
      ['❄️', 'snowflake snow'], ['⛄', 'snowman'], ['🌊', 'wave ocean water'], ['🌍', 'earth globe world'],
    ],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: CupIcon,
    emojis: [
      ['🍏', 'green apple'], ['🍎', 'red apple'], ['🍐', 'pear'], ['🍊', 'orange'],
      ['🍋', 'lemon'], ['🍌', 'banana'], ['🍉', 'watermelon'], ['🍇', 'grapes'],
      ['🍓', 'strawberry'], ['🍈', 'melon'], ['🍒', 'cherries'], ['🍑', 'peach'],
      ['🥭', 'mango'], ['🍍', 'pineapple'], ['🥥', 'coconut'], ['🥝', 'kiwi'],
      ['🍅', 'tomato'], ['🥑', 'avocado'], ['🍆', 'eggplant'], ['🥔', 'potato'],
      ['🥕', 'carrot'], ['🌽', 'corn'], ['🌶️', 'chili pepper spicy'], ['🥒', 'cucumber'],
      ['🍞', 'bread'], ['🥐', 'croissant'], ['🥖', 'baguette bread'], ['🧀', 'cheese'],
      ['🥚', 'egg'], ['🍳', 'fried egg cooking'], ['🥞', 'pancakes'], ['🥓', 'bacon'],
      ['🍔', 'burger hamburger'], ['🍟', 'fries'], ['🍕', 'pizza'], ['🌭', 'hot dog'],
      ['🥪', 'sandwich'], ['🌮', 'taco'], ['🌯', 'burrito'], ['🥙', 'pita wrap'],
      ['🍝', 'pasta spaghetti'], ['🍜', 'noodles ramen soup'], ['🍲', 'stew soup'], ['🍛', 'curry rice'],
      ['🍣', 'sushi'], ['🍱', 'bento box'], ['🍤', 'shrimp fried'], ['🍚', 'rice'],
      ['🍦', 'ice cream soft serve'], ['🍩', 'donut'], ['🍪', 'cookie'], ['🎂', 'birthday cake'],
      ['🍰', 'cake slice'], ['🧁', 'cupcake'], ['🍫', 'chocolate'], ['🍬', 'candy'],
      ['🍭', 'lollipop candy'], ['🍿', 'popcorn'], ['🍩', 'donut'], ['☕', 'coffee'],
      ['🍵', 'tea'], ['🧃', 'juice box'], ['🥤', 'soda drink'], ['🍺', 'beer'],
      ['🍻', 'cheers beer'], ['🍷', 'wine'], ['🍹', 'cocktail tropical drink'], ['🥂', 'champagne cheers'],
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: BallIcon,
    emojis: [
      ['⚽', 'soccer football'], ['🏀', 'basketball'], ['🏈', 'american football'], ['⚾', 'baseball'],
      ['🎾', 'tennis'], ['🏐', 'volleyball'], ['🏉', 'rugby'], ['🎱', 'pool billiards'],
      ['🏓', 'ping pong table tennis'], ['🏸', 'badminton'], ['🥊', 'boxing'], ['🥋', 'martial arts'],
      ['⛳', 'golf'], ['🎣', 'fishing'], ['🎯', 'dart target'], ['🎳', 'bowling'],
      ['🎮', 'video game controller'], ['🕹️', 'joystick game'], ['🎲', 'dice game'], ['♟️', 'chess'],
      ['🎨', 'art paint palette'], ['🎭', 'theater masks drama'], ['🎬', 'movie clapper film'], ['🎤', 'microphone sing karaoke'],
      ['🎧', 'headphones music'], ['🎼', 'music score'], ['🎹', 'piano keyboard'], ['🥁', 'drum music'],
      ['🎸', 'guitar music'], ['🎺', 'trumpet music'], ['🎻', 'violin music'], ['🏆', 'trophy win'],
      ['🥇', 'gold medal first'], ['🥈', 'silver medal second'], ['🥉', 'bronze medal third'], ['🏅', 'medal award'],
      ['🎉', 'party popper celebrate'], ['🎊', 'confetti ball celebrate'], ['🎁', 'gift present'], ['🎈', 'balloon party'],
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: CarIcon,
    emojis: [
      ['🚗', 'car'], ['🚕', 'taxi'], ['🚙', 'suv car'], ['🚌', 'bus'],
      ['🚎', 'trolley bus'], ['🏎️', 'race car fast'], ['🚓', 'police car'], ['🚑', 'ambulance'],
      ['🚒', 'fire truck'], ['🚚', 'truck delivery'], ['🚲', 'bike bicycle'], ['🛵', 'scooter'],
      ['🏍️', 'motorcycle'], ['✈️', 'plane airplane flight travel'], ['🛫', 'plane departure'], ['🛬', 'plane arrival'],
      ['🚀', 'rocket space'], ['🚁', 'helicopter'], ['⛵', 'sailboat boat'], ['🚤', 'speedboat'],
      ['🚢', 'ship cruise'], ['⛴️', 'ferry boat'], ['🚂', 'train locomotive'], ['🚆', 'train'],
      ['🚇', 'metro subway'], ['🚊', 'tram'], ['🗽', 'statue of liberty'], ['🗼', 'tower'],
      ['🏰', 'castle'], ['🏯', 'castle japanese'], ['🏟️', 'stadium'], ['🎡', 'ferris wheel'],
      ['🎢', 'roller coaster'], ['🏖️', 'beach'], ['🏝️', 'island'], ['🏔️', 'mountain snow'],
      ['⛰️', 'mountain'], ['🌋', 'volcano'], ['🗻', 'mount fuji mountain'], ['🏕️', 'camping tent'],
      ['🏠', 'house home'], ['🏢', 'office building'], ['🕌', 'mosque'], ['🕋', 'kaaba'],
      ['🌃', 'night city'], ['🌆', 'city sunset'], ['🌉', 'bridge night'], ['🗺️', 'map'],
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: BulbIcon,
    emojis: [
      ['💡', 'idea light bulb'], ['🔦', 'flashlight torch'], ['🕯️', 'candle'], ['📱', 'phone mobile'],
      ['💻', 'laptop computer'], ['⌨️', 'keyboard'], ['🖥️', 'desktop computer'], ['🖨️', 'printer'],
      ['🖱️', 'mouse computer'], ['💽', 'disk'], ['💾', 'save disk'], ['💿', 'cd disc'],
      ['📷', 'camera photo'], ['📸', 'camera flash photo'], ['🎥', 'video camera film'], ['📺', 'tv television'],
      ['📻', 'radio'], ['⌚', 'watch time'], ['⏰', 'alarm clock'], ['⏱️', 'stopwatch timer'],
      ['🔋', 'battery'], ['🔌', 'plug charger'], ['💰', 'money bag'], ['💵', 'dollar money cash'],
      ['💳', 'credit card payment'], ['💎', 'diamond gem'], ['🔧', 'wrench tool'], ['🔨', 'hammer tool'],
      ['🛠️', 'tools'], ['🔒', 'lock secure'], ['🔓', 'unlock'], ['🔑', 'key'],
      ['📌', 'pin push pin'], ['📎', 'paperclip attach'], ['✏️', 'pencil write'], ['🖊️', 'pen write'],
      ['📝', 'memo note write'], ['📖', 'book open'], ['📚', 'books'], ['📄', 'document page file'],
      ['📁', 'folder file'], ['📦', 'package box'], ['📧', 'email envelope'], ['📨', 'incoming mail'],
      ['📩', 'envelope arrow mail'], ['📮', 'mailbox post'], ['🗑️', 'trash bin delete'], ['🔍', 'magnifying glass search'],
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: HashIcon,
    emojis: [
      ['✅', 'check mark done ok'], ['❌', 'cross wrong no'], ['❓', 'question mark'], ['❗', 'exclamation mark'],
      ['⁉️', 'exclamation question'], ['💯', 'hundred perfect score'], ['🔔', 'bell notification'], ['🔕', 'bell mute silent'],
      ['♻️', 'recycle recycling'], ['⚠️', 'warning caution'], ['🚫', 'prohibited banned no'], ['🔞', 'no minors 18'],
      ['🆗', 'ok'], ['🆕', 'new'], ['🔝', 'top'], ['🔥', 'fire lit hot'],
      ['💤', 'sleep zzz'], ['💬', 'speech bubble chat'], ['💭', 'thought bubble think'], ['🕐', 'clock one'],
      ['➕', 'plus add'], ['➖', 'minus subtract'], ['➗', 'divide'], ['✖️', 'multiply'],
      ['♥️', 'heart suit'], ['♦️', 'diamond suit'], ['♠️', 'spade suit'], ['♣️', 'club suit'],
      ['🔴', 'red circle'], ['🟠', 'orange circle'], ['🟡', 'yellow circle'], ['🟢', 'green circle'],
      ['🔵', 'blue circle'], ['🟣', 'purple circle'], ['⚫', 'black circle'], ['⚪', 'white circle'],
    ],
  },
  {
    id: 'flags',
    label: 'Flags',
    icon: FlagIcon,
    emojis: [
      ['🏳️', 'white flag'], ['🏴', 'black flag'], ['🏁', 'checkered flag finish'], ['🚩', 'triangular flag'],
      ['🇵🇰', 'pakistan flag'], ['🇺🇸', 'usa united states flag'], ['🇬🇧', 'uk britain flag'], ['🇮🇳', 'india flag'],
      ['🇨🇦', 'canada flag'], ['🇦🇺', 'australia flag'], ['🇩🇪', 'germany flag'], ['🇫🇷', 'france flag'],
      ['🇮🇹', 'italy flag'], ['🇯🇵', 'japan flag'], ['🇨🇳', 'china flag'], ['🇸🇦', 'saudi arabia flag'],
      ['🇦🇪', 'uae dubai flag'], ['🇹🇷', 'turkey flag'], ['🇧🇩', 'bangladesh flag'], ['🇧🇷', 'brazil flag'],
    ],
  },
]

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // storage unavailable — recents just won't persist, not fatal
  }
}

const EmojiPicker = ({ onSelect, pickerRef }) => {
  const [activeCategory, setActiveCategory] = useState('smileys')
  const [search, setSearch] = useState('')
  const [recent, setRecent] = useState(loadRecent)
  const gridRef = useRef()

  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 })
  }, [activeCategory, search])

  const handlePick = (emoji) => {
    onSelect(emoji)
    setRecent((prev) => {
      const next = [emoji, ...prev.filter((e) => e !== emoji)].slice(0, MAX_RECENT)
      saveRecent(next)
      return next
    })
  }

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    const results = []
    CATEGORIES.forEach((cat) => {
      (cat.emojis || []).forEach(([emoji, keywords]) => {
        if (keywords.includes(q) || q.includes(keywords.split(' ')[0])) {
          if (!results.includes(emoji)) results.push(emoji)
        }
      })
    })
    return results
  }, [search])

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory)
  const gridEmojis = search
    ? searchResults
    : activeCategory === 'recent'
      ? recent
      : (activeCat?.emojis || []).map(([emoji]) => emoji)

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-13 left-0 w-77 sm:w-84 h-96 flex flex-col bg-[#1a1730]/97 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden z-50"
    >
      {/* Category tabs */}
      <div className="flex items-center gap-0.5 px-2 pt-2 shrink-0 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = !search && activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setSearch(''); setActiveCategory(cat.id) }}
              title={cat.label}
              className={`relative shrink-0 p-2 rounded-lg transition-colors ${isActive ? 'text-fuchsia-400' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            >
              <Icon className="w-4.5 h-4.5" />
              {isActive && (
                <motion.div
                  layoutId="emoji-tab-underline"
                  className="absolute left-1 right-1 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/8 border border-white/10 focus-within:border-fuchsia-400/50 transition-colors">
          <SearchIcon className="w-4 h-4 text-white/50 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search emoji"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder-white/40"
          />
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-1 pb-1 shrink-0">
        <p className="text-xs font-medium text-white/50">
          {search ? 'Search results' : activeCategory === 'recent' ? 'Recent' : activeCat?.label}
        </p>
      </div>

      {/* Emoji grid */}
      <div ref={gridRef} className="flex-1 overflow-y-auto px-2 pb-2">
        {gridEmojis && gridEmojis.length > 0 ? (
          <div className="grid grid-cols-7 gap-0.5">
            {gridEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                onClick={() => handlePick(emoji)}
                className="text-2xl leading-none aspect-square flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/40 text-sm px-6 text-center">
            {search ? 'No emoji found' : 'No recent emoji yet'}
          </div>
        )}
      </div>

      {/* Bottom bar - visual parity with WhatsApp's picker (GIF/stickers not wired up) */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 border-t border-white/10 shrink-0">
        <div className="p-1.5 rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 text-fuchsia-300">
          <SmileyIcon className="w-4.5 h-4.5" />
        </div>
        <div title="Coming soon" className="px-3 py-1 rounded-full text-xs font-medium text-white/30 border border-white/10 cursor-not-allowed select-none">
          GIF
        </div>
        <div title="Coming soon" className="p-1.5 rounded-full text-white/30 cursor-not-allowed">
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

export default EmojiPicker