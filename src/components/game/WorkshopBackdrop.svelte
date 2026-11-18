<div class="backdrop" aria-hidden="true">
  <svg
    viewBox="0 0 1600 1000"
    preserveAspectRatio="xMidYMid slice"
    role="presentation"
  >
    <defs>
      <linearGradient id="bg-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f8ecdd" />
        <stop offset="100%" stop-color="#eed8c1" />
      </linearGradient>
      <linearGradient id="bg-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d9ba97" />
        <stop offset="100%" stop-color="#c29870" />
      </linearGradient>
      <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#d7ecf1" />
        <stop offset="65%" stop-color="#f4e6c8" />
        <stop offset="100%" stop-color="#f8d9a5" />
      </linearGradient>
      <linearGradient id="bg-wood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c7956b" />
        <stop offset="100%" stop-color="#a9744e" />
      </linearGradient>
      <linearGradient id="bg-wood-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#93603f" />
        <stop offset="100%" stop-color="#754a31" />
      </linearGradient>
      <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff3c9" stop-opacity=".9" />
        <stop offset="100%" stop-color="#fff3c9" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="bg-lamp" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffe6a3" stop-opacity=".55" />
        <stop offset="100%" stop-color="#ffe6a3" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="bg-leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fa283" />
        <stop offset="100%" stop-color="#66795e" />
      </linearGradient>
      <linearGradient id="bg-rug" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f0d9c2" />
        <stop offset="100%" stop-color="#dfc2a5" />
      </linearGradient>
      <linearGradient id="bg-jar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf2" stop-opacity=".95" />
        <stop offset="100%" stop-color="#ecd9c4" stop-opacity=".75" />
      </linearGradient>
      <filter id="bg-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </defs>

    <rect width="1600" height="1000" fill="url(#bg-wall)" />
    <rect y="650" width="1600" height="180" fill="#e8d2ba" />
    {#each Array.from({ length: 32 }) as _, index}
      <path
        d={`M${index * 50} 650v180`}
        stroke="#dcc2a7"
        stroke-width="2"
        opacity=".55"
      />
    {/each}
    <rect y="810" width="1600" height="190" fill="url(#bg-floor)" />
    {#each [0, 1, 2] as row}
      <path
        d={`M0 ${835 + row * 48}h1600`}
        stroke="#b98a63"
        stroke-width="2"
        opacity=".35"
      />
    {/each}
    <path d="M0 810h1600" stroke="#9d704f" stroke-width="6" opacity=".35" />

    <path
      d="M1080 575V310a180 180 0 0 1 360 0v265Z"
      fill="#8f5f40"
      stroke="#6f452e"
      stroke-width="8"
    />
    <path
      d="M1100 558V315a160 160 0 0 1 320 0v243Z"
      fill="url(#bg-sky)"
      stroke="#d9b48a"
      stroke-width="4"
    />
    <circle cx="1330" cy="330" r="62" fill="#f8e1a4" opacity=".65" />
    <path d="M1100 430h320M1260 158v400" stroke="#8f5f40" stroke-width="9" />
    <path
      d="M1068 575h384"
      stroke="#6f452e"
      stroke-width="16"
      stroke-linecap="round"
    />
    <path d="M1070 575 760 810h180L1230 575Z" fill="#fff4d7" opacity=".18" />

    <g opacity=".95">
      <path d="M60 340h440v18H60z" fill="url(#bg-wood)" />
      <path
        d="M80 358h18v74H80zM462 358h18v74h-18z"
        fill="url(#bg-wood-dark)"
      />
      <path d="M60 500h440v18H60z" fill="url(#bg-wood)" />
      <path
        d="M80 518h18v74H80zM462 518h18v74h-18z"
        fill="url(#bg-wood-dark)"
      />

      <g transform="translate(120 250)">
        <rect
          width="58"
          height="88"
          rx="9"
          fill="url(#bg-jar)"
          stroke="#b99b7b"
          stroke-width="2.5"
        />
        <rect x="8" y="36" width="42" height="44" rx="5" fill="#d8b384" />
        <path d="M29 36V24" stroke="#3b2d25" stroke-width="2.5" />
        <path
          d="M29 16c6 6 8 10 8 14a8 8 0 1 1-16 0c0-4 2-8 8-14Z"
          fill="#e08a5f"
          class="bg-flame"
        />
      </g>
      <g transform="translate(210 270)">
        <rect
          width="46"
          height="68"
          rx="8"
          fill="url(#bg-jar)"
          stroke="#b99b7b"
          stroke-width="2.5"
        />
        <rect x="7" y="30" width="32" height="30" rx="4" fill="#9b8bb4" />
        <path d="M23 30v-8" stroke="#3b2d25" stroke-width="2.2" />
        <path
          d="M23 15c5 5 6 8 6 11a6 6 0 1 1-12 0c0-3 1-6 6-11Z"
          fill="#e08a5f"
          class="bg-flame"
        />
      </g>
      <g transform="translate(300 240)">
        <rect
          width="64"
          height="98"
          rx="10"
          fill="url(#bg-jar)"
          stroke="#b99b7b"
          stroke-width="2.5"
        />
        <rect x="9" y="42" width="46" height="48" rx="5" fill="#b4552f" />
        <path d="M32 42V28" stroke="#3b2d25" stroke-width="2.5" />
        <path
          d="M32 18c7 7 9 12 9 16a9 9 0 1 1-18 0c0-4 2-9 9-16Z"
          fill="#e08a5f"
          class="bg-flame"
        />
      </g>
      <g transform="translate(400 266)">
        <rect
          width="44"
          height="72"
          rx="8"
          fill="url(#bg-jar)"
          stroke="#b99b7b"
          stroke-width="2.5"
        />
        <rect x="7" y="34" width="30" height="30" rx="4" fill="#7c8b72" />
        <path d="M22 34v-8" stroke="#3b2d25" stroke-width="2.2" />
        <path
          d="M22 18c5 5 6 8 6 11a6 6 0 1 1-12 0c0-3 1-6 6-11Z"
          fill="#e08a5f"
          class="bg-flame"
        />
      </g>

      <g transform="translate(150 418)">
        <rect
          width="54"
          height="72"
          rx="8"
          fill="#f4e1cb"
          stroke="#c9a27d"
          stroke-width="2"
        />
        <rect x="8" y="12" width="38" height="48" rx="3" fill="#fff9f2" />
        <path
          d="M18 48c0-14 9-24 9-24s9 10 9 24a9 9 0 0 1-18 0Z"
          fill="#b4552f"
        />
      </g>
      <g transform="translate(270 420)">
        <rect
          width="40"
          height="60"
          rx="7"
          fill="url(#bg-jar)"
          stroke="#b99b7b"
          stroke-width="2"
        />
        <rect x="6" y="28" width="28" height="24" rx="4" fill="#c98a4b" />
      </g>
      <g transform="translate(360 410)">
        <rect width="72" height="16" rx="5" fill="#8f5f40" />
        <rect x="8" y="16" width="14" height="42" rx="4" fill="#e0b08a" />
        <rect x="28" y="24" width="14" height="34" rx="4" fill="#c98a4b" />
        <rect x="48" y="12" width="14" height="46" rx="4" fill="#7c8b72" />
      </g>
    </g>

    <g transform="translate(580 320)">
      <rect width="190" height="150" rx="8" fill="url(#bg-wood-dark)" />
      <rect x="10" y="10" width="170" height="130" rx="4" fill="#fff7ea" />
      <path d="M95 112V74" stroke="#8f5f40" stroke-width="4" />
      <path
        d="M95 74c11-11 17-20 17-29a17 17 0 1 0-34 0c0 9 6 18 17 29Z"
        fill="#b4552f"
      />
      <rect x="63" y="112" width="64" height="14" rx="4" fill="#b98963" />
      <path d="M40 124h110" stroke="#d2a77e" stroke-width="3" />
    </g>

    <g transform="translate(840 0)">
      <path d="M0 0v120" stroke="#3b2d25" stroke-width="5" />
      <path
        d="M-58 190c0-45 26-70 58-70s58 25 58 70Z"
        fill="#f6e3c9"
        stroke="#b98963"
        stroke-width="4"
      />
      <circle cx="0" cy="205" r="120" fill="url(#bg-lamp)" />
    </g>

    <g transform="translate(70 730)">
      <ellipse cx="70" cy="130" rx="76" ry="14" fill="#b98a63" opacity=".25" />
      <path d="M28 76h84l-10 56H38Z" fill="#b4552f" />
      <path d="M70 76V34" stroke="#66795e" stroke-width="4" />
      <path
        d="M70 42C42 42 28 20 28 0c30 0 52 18 52 42Z"
        fill="url(#bg-leaf)"
      />
      <path
        d="M70 52c26 0 42-20 42-42-28 0-48 18-48 42Z"
        fill="url(#bg-leaf)"
        opacity=".8"
      />
      <path
        d="M64 54c-22 0-34-16-34-32 24 0 38 14 38 32Z"
        fill="#66795e"
        opacity=".8"
      />
    </g>

    <g transform="translate(1370 720)">
      <ellipse cx="60" cy="140" rx="70" ry="14" fill="#b98a63" opacity=".25" />
      <path d="M22 86h76l-9 52H31Z" fill="#8f5f40" />
      <path d="M60 86V46" stroke="#66795e" stroke-width="4" />
      <path
        d="M60 52C36 52 22 34 22 16c26 0 46 14 46 36Z"
        fill="url(#bg-leaf)"
      />
      <path
        d="M62 62c26 0 42-18 42-36-26 0-44 14-44 36Z"
        fill="url(#bg-leaf)"
        opacity=".8"
      />
    </g>

    <g transform="translate(470 805)">
      <rect width="660" height="120" rx="30" fill="url(#bg-rug)" />
      <rect
        x="18"
        y="18"
        width="624"
        height="84"
        rx="22"
        fill="none"
        stroke="#c98a4b"
        stroke-width="3"
        opacity=".4"
      />
      {#each [0, 1, 2, 3] as row}
        <path
          d={`M60 ${30 + row * 18}h540`}
          stroke="#c98a4b"
          stroke-width="2"
          opacity=".18"
        />
      {/each}
    </g>

    <g transform="translate(120 735)">
      <path d="M0 30h1360v150H0z" fill="#6f452e" opacity=".22" />
      <path d="M0 0h1360v42H0z" fill="url(#bg-wood)" />
      <path d="M0 42h1360v18H0z" fill="#8f5f40" />
      {#each [80, 300, 520, 740, 960, 1180] as x}
        <path
          d={`M${x} 60v120`}
          stroke="#8f5f40"
          stroke-width="3"
          opacity=".4"
        />
      {/each}
    </g>

    <circle cx="800" cy="815" r="190" fill="url(#bg-glow)" opacity=".35" />
    <rect width="1600" height="1000" fill="#f8ecdd" opacity=".06" />
  </svg>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #f8ecdd;
  }

  .backdrop::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      rgba(42, 36, 30, 0.055) 0.6px,
      transparent 0.6px
    );
    background-size: 5px 5px;
    opacity: 0.4;
    mix-blend-mode: multiply;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .bg-flame {
    transform-origin: center bottom;
    animation: bg-flicker 2.4s ease-in-out infinite;
  }

  @keyframes bg-flicker {
    0%,
    100% {
      transform: scale(1) rotate(-1deg);
    }
    50% {
      transform: scale(1.06) rotate(1deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bg-flame {
      animation: none;
    }
  }
</style>
