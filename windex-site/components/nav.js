import Link from "next/link";
import Img from "next/image";

export default function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/" className="logo">
            <span>Windex</span>
          </Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
}
