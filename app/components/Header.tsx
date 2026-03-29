// "use client";

// import { useSession, signOut } from "next-auth/react";
// import Link from "next/link";

// export default function Header() {
//   const { data: session } = useSession();

//   return (
//     <header
//       style={{
//         background: "white",
//         borderBottom: "1px solid #e4eaeb",
//         padding: "0 48px",
//         height: "56px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         position: "sticky",
//         top: 0,
//         zIndex: 100,
//         fontFamily: "'DM Sans', sans-serif",
//       }}
//     >
//       <Link
//         href="/"
//         style={{
//           textDecoration: "none",
//           fontFamily: "Fraunces, serif",
//           fontSize: "18px",
//           fontWeight: 600,
//           color: "#0e5c57",
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//         }}
//       >
//         🐾 PetHealth
//       </Link>

//       <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//         {session ? (
//           <>
//             <span style={{ color: "#4a6968", fontSize: "14px" }}>
//               {session.user?.name}
//             </span>
//             <Link
//               href="/pets"
//               style={{
//                 color: "#2d4a49",
//                 textDecoration: "none",
//                 fontSize: "14px",
//                 fontWeight: 500,
//                 padding: "6px 12px",
//                 borderRadius: "8px",
//                 background: "#f0fafa",
//               }}
//             >
//               My Pets
//             </Link>
//             <button
//               onClick={() => signOut({ callbackUrl: "/auth/signin" })}
//               style={{
//                 background: "#F1F4F4",
//                 color: "#2d4a49",
//                 padding: "7px 14px",
//                 borderRadius: "8px",
//                 border: "1px solid #e4eaeb",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 fontWeight: 500,
//               }}
//             >
//               Sign Out
//             </button>
//           </>
//         ) : (
//           <Link
//             href="/auth/signin"
//             style={{
//               color: "#2d4a49",
//               textDecoration: "none",
//               fontSize: "14px",
//             }}
//           >
//             Sign In
//           </Link>
//         )}
//       </div>
//     </header>
//   );
// }

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  const css = `
    .nav-header {
      background: white;
      border-bottom: 1px solid #e4eaeb;
      padding: 0 48px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      zIndex: 100;
      font-family: 'DM Sans', sans-serif;
    }

    .user-name {
      color: #4a6968;
      font-size: 14px;
    }

    /* 手機版 RWD 修正 (480px 以下) */
    @media (max-width: 480px) {
      .nav-header {
        padding: 0 16px; /* 縮小左右邊距 */
      }
      .user-name {
        display: none; /* 隱藏 */
      }
      .nav-links {
        gap: 8px !important; /* 縮小間距 */
      }
      .btn-my-pets {
        padding: 6px 10px !important;
        font-size: 13px !important;
      }
      .btn-sign-out {
        padding: 6px 10px !important;
        font-size: 12px !important;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <header className="nav-header">
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontFamily: "Fraunces, serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#0e5c57",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🐾 <span style={{ display: "inline-block" }}>PetHealth</span>
        </Link>

        <div
          className="nav-links"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          {session ? (
            <>
              <span className="user-name">{session.user?.name}</span>
              <Link
                href="/pets"
                className="btn-my-pets"
                style={{
                  color: "#2d4a49",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#f0fafa",
                  whiteSpace: "nowrap",
                }}
              >
                My Pets
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="btn-sign-out"
                style={{
                  background: "#F1F4F4",
                  color: "#2d4a49",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e4eaeb",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              style={{
                color: "#2d4a49",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
