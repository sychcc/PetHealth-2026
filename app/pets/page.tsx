"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string;
  photo_url: string | null;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,600;1,600&display=swap');
  .pet-card:hover { border-color: #2ec4ba !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,91,83,0.1); }
  .add-card:hover { border-color: #2ec4ba !important; background: #f0fafa !important; }
  .featured-card:hover { border-color: #2ec4ba !important; }
  .featured-card { display: grid; grid-template-columns: 400px 1fr; }
  .featured-img { min-height: 280px; }
  .pets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 768px) {
    .featured-card { grid-template-columns: 1fr !important; }
    .featured-img { min-height: 220px !important; }
    .pets-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .page-title { font-size: 28px !important; }
  }
  @media (max-width: 480px) {
    .pets-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function PetsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/pets", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setPets(data);
          const last = localStorage.getItem("lastViewedPetId");
          if (last && data.find((p: Pet) => p.id === last)) {
            setFeaturedId(last);
          } else if (data.length > 0) {
            setFeaturedId(data[0].id);
          }
        });
    }
  }, [status]);

  if (status === "loading")
    return <p style={{ padding: "32px", color: "#4a6968" }}>Loading...</p>;

  const featured = pets.find((p) => p.id === featuredId) || pets[0];
  const getAge = (birthdate: string) => {
    const years = new Date().getFullYear() - new Date(birthdate).getFullYear();
    return `${years} years old`;
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#F1F4F4",
        minHeight: "100vh",
      }}
    >
      <style>{css}</style>

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "36px",
            fontWeight: 600,
            color: "#0f2423",
          }}
        >
          My Pets
        </div>
        <div
          style={{
            fontSize: "15px",
            color: "#4a6968",
            marginTop: "6px",
            fontWeight: 300,
            marginBottom: "32px",
          }}
        >
          Managing health and wellness for your pet family
        </div>

        {/* FEATURED */}
        {featured && (
          <div
            className="featured-card"
            style={{
              background: "white",
              borderRadius: "20px",
              border: "1px solid #e4eaeb",
              overflow: "hidden",
              marginBottom: "32px",
              transition: "border-color 0.2s",
            }}
          >
            <div
              className="featured-img"
              style={{
                background: featured.photo_url
                  ? "none"
                  : "linear-gradient(135deg, #0a3d3a, #0e7c74)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {featured.photo_url ? (
                <img
                  src={featured.photo_url}
                  alt={featured.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: "80px" }}>
                  {featured.species === "Cat" ? "🐱" : "🐶"}
                </span>
              )}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "99px",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Featured
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  background: "white",
                  color: "#0e7c74",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "99px",
                }}
              >
                Last viewed
              </div>
            </div>
            <div
              style={{
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Fraunces, serif",
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "#0f2423",
                }}
              >
                {featured.name}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#4a6968",
                  margin: "6px 0 24px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                {featured.breed || featured.species} ·{" "}
                {getAge(featured.birthdate)}
              </div>
              <Link
                href={`/pets/${featured.id}`}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "#0E7C86",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                View Full Profile →
              </Link>
            </div>
          </div>
        )}

        {/* GRID */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "22px",
              fontWeight: 600,
              color: "#0f2423",
            }}
          >
            Your Pet Family
          </div>
          <Link
            href="/pets/create"
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#0E7C86",
              color: "white",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            + Add New Pet
          </Link>
        </div>

        <div
          className="pets-grid"
          style={
            {
              // display: "grid",
              // gridTemplateColumns: "repeat(3, 1fr)",
              // gap: "16px",
            }
          }
        >
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="pet-card"
              onClick={() => localStorage.setItem("lastViewedPetId", pet.id)}
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e4eaeb",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
                display: "block",
              }}
            >
              <div
                style={{
                  height: "160px",
                  background:
                    pet.species === "Cat"
                      ? "linear-gradient(135deg, #fdf0e6, #fad6b0)"
                      : "linear-gradient(135deg, #f0fafa, #e0f5f4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "56px" }}>
                    {pet.species === "Cat" ? "🐱" : "🐶"}
                  </span>
                )}
              </div>
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#0f2423",
                  }}
                >
                  {pet.name}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#4a6968",
                    marginTop: "2px",
                  }}
                >
                  {pet.breed || pet.species} · {getAge(pet.birthdate)}
                </div>
              </div>
            </Link>
          ))}

          {/* ADD CARD */}
          <Link
            href="/pets/create"
            className="add-card"
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1.5px dashed #e4eaeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "250px",
              cursor: "pointer",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
          >
            <div style={{ textAlign: "center", color: "#4a6968" }}>
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "10px",
                  color: "#2ec4ba",
                }}
              >
                +
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                Add new pet
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
