import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import heroImage from "../assets/image/hero.jpg";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [current, setCurrent] = useState(0);

  const banners = [
    '/banners/bunner1.png',
    '/banners/banner4.png',
    '/banners/stevo.png',
  ];

  // LOAD PRODUCTS
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/products');
        setProducts(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // AUTO SLIDER
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 🔍 FILTER PRODUCTS (LIVE SEARCH)
  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      {/* ===== INTERNAL CSS ===== */}
      <style>
        {`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --lightgray: #9ca3af;
          --cyan: #22d3ee;
          --indigo: #6366f1;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: var(--palegray);
          color: var(--richblue);
        }

        /* ===== SLIDER ===== */
        .ad-slider {
          position: relative;
          width: 100vw;
          height: 140px;
          overflow: hidden;
          margin-left: calc(50% - 50vw);
        }

        .ad-slide {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: none;
        }

        .ad-slide.active {
          display: block;
        }

        .ad-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.4);
          color: #fff;
          border: none;
          font-size: 1.5rem;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          border-radius: 50%;
          z-index: 5;
        }

        .ad-arrow.left { left: 1rem; }
        .ad-arrow.right { right: 1rem; }

        .ad-dots {
          position: absolute;
          bottom: 0.75rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.4rem;
        }

        .ad-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          cursor: pointer;
        }

        .ad-dot.active {
          background: yellow;
        }
        @media (max-width: 480px) {
        .ad-slider {
           height: 100%;
           width: 100%;
           
         }
          .ad-slide {
            height: 100%;
            
          }
        
        .ad-arrow {
          font-size: 1.1rem;
          padding: 0.2rem 0.4rem;
         }

        .ad-dots {
          bottom: 0.4rem;
         }

        .ad-dot {
          width: 6px;
          height: 6px;
         }
        }
        @media (max-width: 768px) {
       .ad-slider {
         width: 100%;
        height:90%;
    
  }
}


        /* ===== PAGE ===== */
        .home-container {
          max-width: 72rem;
          margin: 0 auto;
          padding: 2.5rem 1rem;
        }
          @media (min-width: 768px) {

        /* ===== HERO ===== */
        .hero-section {
          display: grid;
          gap: 2.5rem;
          grid-template-columns: 1fr;
          margin-bottom: 2.5rem;
        }

        @media(min-width: 768px) {
          .hero-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }
           .hero-pretitle {
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--cyan);
            margin-bottom: 0.75rem;
          }


        .hero-title {
          font-size: 2.25rem;
          font-weight: 700;
        }

        .gradient-text {
          background: linear-gradient(to right, var(--cyan), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-image {
          width: 100%;
          height: 4rem;
          border-radius: 1rem;
          object-fit: cover;
          border: 1px solid var(--richblue);
        }

        @media(min-width: 768px) {
          .hero-image {
            height: 20rem;
          }
        }


        /* ===== FEATURED ===== */
        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .search-input {
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--lightgray);
          font-size: 0.85rem;
          outline: none;
          min-width: 620px;
        }

        .search-input:focus {
          border-color: var(--richblue);
        }

        .products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media(min-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(min-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .no-products {
          font-size: 0.875rem;
          color: var(--lightgray);
        }}
        @media (max-width: 480px) {
           .hero-pretitle {
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 500;
            font-size: 0.875rem;
            color: var(--cyan);
            margin-bottom: 0.25rem;
          }
          .hero-title {
          font-size: 1.5rem; 
          }
          .hero-description {
           font-size: 0.9rem;
            }
          .gradient-text {
          background: linear-gradient(to right, var(--cyan), var(--indigo));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
          .inline-block {
            margin-bottom: 1rem;
          }
        `}
      </style>

      {/* ===== SLIDER ===== */}
      <div className="ad-slider">
        {banners.map((img, index) => (
          <img
            key={index}
            src={img}
            className={`ad-slide ${index === current ? 'active' : ''}`}
            alt="Advertisement"
          />
        ))}
         <button
          className="ad-arrow left"
          onClick={() =>
            setCurrent((current - 1 + banners.length) % banners.length)
          }
        >
          ‹
        </button>

        <button
          className="ad-arrow right"
          onClick={() =>
            setCurrent((current + 1) % banners.length)
          }
        >
          ›
        </button>

      </div>

      {/* ===== PAGE CONTENT ===== */}
      <div className="home-container">
        {/* HERO */}
        <section className="hero-section">
          <div>
             <p className="hero-pretitle">Stekora Tech</p>
            <h1 className="hero-title">
              Where ideas become <span className="gradient-text">digital solutions</span>
            </h1>
            <p className="hero-description">
              We are an IT services studio delivering web applications, embedded
              systems and automation. From concept to deployment, we help you
              design, build and manage reliable digital products.
            </p>
            <div className="pt-4">
              <a
                href="Contact" // or real link
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Get in Touch
              </a>
            </div>
          </div>

          <img src={heroImage} alt="Hero" className="hero-image" />
        </section>

        {/* FEATURED */}
        <section>
          <div className="featured-header">
            <div>
              <h2>Featured products & services</h2>
              <span>Good quality and reliability</span>
            </div>

            {/* 🔍 SEARCH */}
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}

            {filteredProducts.length === 0 && (
              <p className="no-products">No matching products found.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
