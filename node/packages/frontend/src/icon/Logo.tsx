export function Logo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="172"
            height="173"
            viewBox="0 0 172 173"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g filter="url(#filter0_d_66_713)">
                <rect
                    x="29.4219"
                    y="16.9008"
                    width="113.156"
                    height="113.156"
                    rx="29.0145"
                    fill="white"
                />
                <g clip-path="url(#clip0_66_713)">
                    <circle
                        cx="86.2968"
                        cy="73.7134"
                        r="44.026"
                        transform="rotate(-180 86.2968 73.7134)"
                        fill="#626AE9"
                    />
                    <path
                        d="M16.4739 117.739C16.4739 85.1758 32.5845 58.7778 86.2333 58.7778C139.882 58.7778 155.993 85.1758 155.993 117.739C155.993 150.303 124.76 176.701 86.2333 176.701C47.7063 176.701 16.4739 150.303 16.4739 117.739Z"
                        fill="#54A6F3"
                    />
                    <path
                        d="M16.4739 144.08C16.4739 111.517 32.5845 85.1186 86.2333 85.1186C139.882 85.1186 155.993 111.517 155.993 144.08C155.993 176.644 124.76 203.042 86.2333 203.042C47.7063 203.042 16.4739 176.644 16.4739 144.08Z"
                        fill="#4CF3CC"
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_d_66_713"
                    x="0.407389"
                    y="0.942883"
                    width="171.185"
                    height="171.185"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="13.0565" />
                    <feGaussianBlur stdDeviation="14.5072" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.384314 0 0 0 0 0.415686 0 0 0 0 0.913725 0 0 0 0.1 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_66_713"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_66_713"
                        result="shape"
                    />
                </filter>
                <clipPath id="clip0_66_713">
                    <rect
                        x="130.323"
                        y="117.739"
                        width="88.1765"
                        height="88.052"
                        rx="44.026"
                        transform="rotate(-180 130.323 117.739)"
                        fill="white"
                    />
                </clipPath>
            </defs>
        </svg>
    )
}
