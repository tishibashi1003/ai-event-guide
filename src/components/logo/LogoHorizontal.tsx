import type React from 'react';

interface LogoHorizontalProps {
  width?: number;
  height?: number;
}

const LogoHorizontal: React.FC<LogoHorizontalProps> = ({
  width = 160,
  height = 40,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 160 40'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* 子供のアイコン */}
      <g transform='translate(2, 2)'>
        {/* 顔の輪郭（柔らかな曲線） */}
        <path
          d='M18 2C9.16344 2 2 9.16344 2 18C2 26.8366 9.16344 34 18 34C26.8366 34 34 26.8366 34 18C34 9.16344 26.8366 2 18 2Z'
          stroke='#FFD700'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />

        {/* 目（かわいらしい形） */}
        <path
          d='M12 14C12 14 10 12 8 14'
          stroke='#FFD700'
          strokeWidth='2'
          strokeLinecap='round'
        />
        <path
          d='M24 14C24 14 26 12 28 14'
          stroke='#FFD700'
          strokeWidth='2'
          strokeLinecap='round'
        />

        {/* 笑顔（遊び心のある形） */}
        <path
          d='M10 22C10 22 14 26 18 25C22 24 26 22 26 22'
          stroke='#FFD700'
          strokeWidth='2.5'
          strokeLinecap='round'
        />

        {/* 頬の赤み */}
        <circle cx='8' cy='18' r='2' fill='#FFD700' opacity='0.5' />
        <circle cx='28' cy='18' r='2' fill='#FFD700' opacity='0.5' />

        {/* 遊び心のある要素（頭の上のアホ毛） */}
        <path
          d='M18 2C18 2 20 0 22 2C24 4 22 6 22 6'
          stroke='#FFD700'
          strokeWidth='2'
          strokeLinecap='round'
          fill='none'
        />
      </g>

      {/* テキスト */}
      <text
        x='45'
        y='28'
        fontFamily="'M PLUS Rounded 1c', 'Hiragino Maru Gothic ProN', sans-serif"
        fontSize='24'
        fontWeight='700'
        fill='#FFD700'
        letterSpacing='0.05em'
      >
        ココいこ
      </text>
    </svg>
  );
};

export default LogoHorizontal;
