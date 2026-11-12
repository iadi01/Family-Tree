export function HeartFrame() {
  return <svg className="heart-frame" viewBox="0 0 440 310" aria-hidden="true"><path className="heart-fill" d="M220 300C195 280 12 177 12 99C12-7 160-24 220 48C280-24 428-7 428 99C428 177 245 280 220 300Z" /><path className="heart-stitch" d="M220 285C193 264 26 169 26 99C26 7 157-8 220 66C283-8 414 7 414 99C414 169 247 264 220 285Z" /></svg>;
}

export function Branches() {
  const points = Array.from({ length: 10 }, (_, i) => 98 + i * 156);
  return <svg className="family-branches" viewBox="0 0 1600 210" aria-hidden="true">
    <path className="branch-shadow" d="M800 5C670 75 310 57 98 140M800 5C930 75 1290 57 1502 140" />
    <path className="branch-line" d="M800 5C670 75 310 57 98 140M800 5C930 75 1290 57 1502 140" />
    {points.map((x, i) => <g key={x}>
      <path className="branch-line" d={`M${x + (i < 5 ? 24 : -24)} ${i < 5 ? 105 - i * 12 : 105 - (9 - i) * 12} Q${x - 14} 121 ${x} 184`} />
      <path className="branch-leaf" d={`M${x} 159q-35-33-27-42q33 0 27 42M${x} 150q26-35 38-28q-3 27-38 28`} />
      <path className="branch-leaf" d={`M${x + 43} 97q-26-17-20-31q25 3 20 31`} />
      <text x={x} y="187" textAnchor="middle" fontSize="25">{i === 5 ? "💗" : "♥"}</text>
    </g>)}
  </svg>;
}

export function WoodenSign({ bottom = false }: { bottom?: boolean }) {
  return <div className={`wooden-sign ${bottom ? "bottom-sign" : "hanging-sign"}`} aria-hidden="true"><span className="sign-leaf left-leaf">🌿</span><span className="sign-leaf right-leaf">🌿</span>{bottom ? <>More Branches<br />More Love</> : <>Different Branches<br />Same Roots<br />Always a Family</>}<span className="block text-primary">♥</span></div>;
}