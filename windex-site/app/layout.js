import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import Nav from "../components/nav";

export const metadata = {
  title: "windex",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        {children}

        <footer>
          <p>Developed by: Sigurdur Haukur Birgisson</p>
          <p>Copyright © {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
