import React from 'react';
import logo from '../assets/image/logoo.png'; // Same logo as header

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Stekora Tech logo"
              className="h-10 w-auto rounded-lg bg-slate-900/80 p-1 border border-slate-700"
            />
            <div>
              <div className="font-semibold text-slate-50">Stekora Tech</div>
              <div className="text-[11px] text-slate-400">
                where ideas become digital solutions
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Stekora Tech provides modern IT services — from custom web
            applications to automation and embedded systems — helping businesses
            turn technical ideas into reliable digital products.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100 mb-2">
            Contact Us
          </h3>
          <ul className="text-sm space-y-1">
            <li>Phone: <span className="text-slate-200">+000 000 0000</span></li>
            <li>Email: <span className="text-slate-200">info@stekoratech.com</span></li>
            <li>Location: <span className="text-slate-200">Your City, Country</span></li>
            <li className="pt-2">
              Social:{' '}
              <span className="text-slate-200">
                LinkedIn, GitHub, Instagram
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-100 mb-2">Support</h3>
          <ul className="text-sm space-y-1">
            <li>Help &amp; FAQs</li>
            <li>Project Support</li>
            <li>Service Level &amp; Maintenance</li>
            <li>Contact Support: support@stekoratech.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-900 py-3 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Stekora Tech. All rights reserved.
      </div>
    </footer>
  );
}

