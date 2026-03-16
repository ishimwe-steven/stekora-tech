import React from "react";
import logo from "../assets/image/logoo.png";

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          
          {/* Column 1 */}
          <div className="footer-col">
            <div className="logo-area">
              <img src={logo} alt="Stekora Tech logo" className="logo" />
              <div>
                <div className="brand">Stekora Tech</div>
                <div className="tag">
                  where ideas become digital solutions
                </div>
              </div>
            </div>

            <p className="desc">
              Stekora Tech provides modern IT services from custom web
              applications to automation and embedded systems helping businesses
              turn technical ideas into reliable digital products.
            </p>

            <div className="social">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-twitter"></i>
              <a href="https://instagram.com/stekoratech"  target="_blank"><i className="fab fa-instagram"></i></a>
              <a href="https://www.tiktok.com/stekoratech" target="_blank"><i class="fab fa-tiktok"></i></a>
              <i className="fab fa-linkedin-in"></i> 
              
               
            </div>
          </div>

          {/* Column 2 */}
          <div className="footer-col">
            <h3>Contact Us</h3>
            <ul>
              <li>
                <i className="fas fa-phone"></i>
                Phone: <span>+250 780 959 065</span>
              </li>

              <li>
                <i className="fas fa-envelope"></i>
                Email: <span>stekoratech@gmail.com</span>
              </li>

              <li>
                <i className="fas fa-map-marker-alt"></i>
                Location: <span>Musanze, Rwanda</span>
              </li>

              <li className="social-text">
                Social: <span>LinkedIn, GitHub, Instagram</span>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-col">
            <h3>Support</h3>
            <ul>
              <li>Help & FAQs</li>
              <li>Project Support</li>
              <li>Service Level & Maintenance</li>
              <li>Contact Support: support@stekoratech.com</li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} Stekora Tech. All rights reserved.
        </div>
      </footer>

      <style>{`
        .footer{
          background:#1f2d3a;
          color:#d1d5db;
          margin-top:40px;
          font-family:Arial, Helvetica, sans-serif;
        }

        .footer-container{
          max-width:1200px;
          margin:auto;
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:40px;
          padding:50px 20px;
        }

        .footer-col h3{
          color:white;
          margin-bottom:15px;
        }

        .logo-area{
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:15px;
        }

        .logo{
          height:40px;
        }

        .brand{
          color:white;
          font-weight:bold;
        }

        .tag{
          font-size:12px;
          color:#9ca3af;
        }

        .desc{
          font-size:14px;
          margin:15px 0;
          line-height:1.6;
        }

        .social{
          display:flex;
          gap:10px;
        }

        .social i{
          background:white;
          color:black;
          padding:10px;
          border-radius:6px;
          cursor:pointer;
        }

        ul{
          list-style:none;
          padding:0;
          margin:0;
        }

        ul li{
          margin-bottom:10px;
          font-size:14px;
        }

        ul li i{
          margin-right:10px;
          color:#f59e0b;
        }

        ul li span{
          color:white;
        }

        .copyright{
          text-align:center;
          border-top:1px solid #2c3e50;
          padding:15px;
          font-size:12px;
          color:#9ca3af;
        }

        @media(max-width:900px){
          .footer-container{
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </>
  );
}