import React, { useState } from "react";

import UserPortal from "./user/UserPortal";

import { getDemoEmail, saveDemoEmail, createRequest } from "./user/userData";
import { publishRequest } from "./airline/api.js";

import "./user/user.css";



import { Link } from "react-router-dom";



import logo from "./assets/logo.png";



/** Single-file BidScanner homepage. */



export default function App() {



  const [tab, setTab] = useState("Flights");

  const [accountEmail, setAccountEmail] = useState(getDemoEmail);

  const [userPortalOpen, setUserPortalOpen] = useState(false);

  const [maxBudget, setMaxBudget] = useState("");

  const [requestEmail, setRequestEmail] = useState(getDemoEmail);



  const [tripType, setTripType] = useState("Return");



  const [origin, setOrigin] = useState("Edinburgh (EDI)");



  const [destination, setDestination] = useState("");



  const [depart, setDepart] = useState("");



  const [back, setBack] = useState("");



  const [adults, setAdults] = useState(1);



  const [children, setChildren] = useState(0);



  const [cabin, setCabin] = useState("Economy");



  const [travellersOpen, setTravellersOpen] = useState(false);



  const [direct, setDirect] = useState(false);



  const [nearby, setNearby] = useState(false);



  const [searchResult, setSearchResult] = useState("");



  const [menu, setMenu] = useState(false);



  const today = new Date().toISOString().slice(0, 10);



  const cards = [



    { city: "Barcelona", country: "Spain", price: "£47", tag: "City break", emoji: "☀️", bg: "linear-gradient(135deg,#edaa77,#ffdbb0 46%,#bc654d)" },



    { city: "Rome", country: "Italy", price: "£54", tag: "Culture", emoji: "🏛️", bg: "linear-gradient(135deg,#bd7c60,#f5c19b 52%,#93664e)" },



    { city: "Lisbon", country: "Portugal", price: "£39", tag: "Great value", emoji: "🌊", bg: "linear-gradient(135deg,#7aa7a8,#f2c897 62%,#e08c63)" },



    { city: "Copenhagen", country: "Denmark", price: "£62", tag: "Weekend away", emoji: "🚲", bg: "linear-gradient(135deg,#8c9b9a,#e9b69a 60%,#b57a6a)" },



  ];



  async function handleSearch(e) {

    e.preventDefault();

    if (!origin.trim() || !destination.trim() || !depart) {

      setSearchResult("Enter your departure airport, destination and departure date.");

      return;

    }

    if (tripType === "Return" && (!back || back < depart)) {

      setSearchResult("Choose a return date on or after your departure date.");

      return;

    }

    const budget = Number(maxBudget);

    if (!maxBudget || !Number.isFinite(budget) || budget <= 0) {

      setSearchResult("Set a maximum total budget greater than £0 before publishing.");

      return;

    }

    const email = requestEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      setSearchResult("Enter a valid email address to associate with your flight request.");

      return;

    }

    try {

      const backendRequest = await publishRequest({
        origin: origin.trim(),
        destination: destination.trim(),
        earliest: depart,
        latest: tripType === "Return" ? back : depart,
        passengers: adults + children,
        maxPricePence: Math.round(budget * 100),
        checkedBags: 0,
        directOnly: direct,
      });

      const request = createRequest({
        id: backendRequest.id,
        email,
        origin: origin.trim(), destination: destination.trim(),
        depart, back: tripType === "Return" ? back : null,
        tripType, adults, children, cabin, direct, nearby,
        maxBudget: budget,
      });

      // The same email is used by the traveller dashboard to find this request.

      saveDemoEmail(email);

      setAccountEmail(email);

      setRequestEmail(email);

      setMaxBudget("");

      setSearchResult(`Request ${request.id.slice(-6)} published for ${email}.`);

      setUserPortalOpen(true);

    } catch (error) {

      setSearchResult(error.message || "Could not save your request.");

    }

  }



  function signInUser(email) {

    const cleaned = email.trim().toLowerCase();

    saveDemoEmail(cleaned);

    setAccountEmail(cleaned);

    setRequestEmail(cleaned);

    setUserPortalOpen(true);

  }



  function signOutUser() {

    saveDemoEmail("");

    setAccountEmail("");

    setRequestEmail("");

    setUserPortalOpen(false);

  }



  const ButtonIcon = ({ children }) => <span className="button-icon" aria-hidden="true">{children}</span>;



  const [openIndex, setOpenIndex] = useState(null);



  const faqs = [



    {



      question: "How does BidScanner work?",



      answer: "Instead of searching for flights, you publish your travel requirements and budget. Airline agents then compete to win your booking by sending personalised offers."



    },



    {



      question: "How can I get the best flight deal?",



      answer: "Set your maximum budget, choose your destination and publish your request. Compare the offers you receive based on price, timing and convenience."



    },



    {



      question: "Do I have to choose a destination?",



      answer: "You can specify your destination and indicate flexibility with your travel dates to receive a wider range of suitable offers."



    },



    {



      question: "Why do airlines compete for me?",



      answer: "BidScanner reverses traditional flight booking. Rather than you searching through airline offers, airline agents compete to match your requirements."



    },



    {



      question: "Can airlines offer me a lower price?",



      answer: "Simulated airline agents can adjust their offers within their pricing rules, helping you compare competitive deals."



    },



    {



      question: "Do I book my flight directly with BidScanner?",



      answer: "BidScanner is currently a prototype. Offers and bookings are simulated, so no real flights or payments are processed."



    },



    {



      question: "What happens after I accept an offer?",



      answer: "Your selected offer is marked as accepted and its details are displayed. Real booking confirmation is not yet supported."



    },



    {



      question: "Can I request flexible travel dates?",



      answer: "Yes. Flexible dates give airline agents more opportunities to propose flights that match your budget."



    },



    {



      question: "Can I choose flights with lower CO₂ emissions?",



      answer: "Environmental preferences could be added in the future to help prioritise flights with lower estimated emissions."



    }



  ];



  return (



    <div className="site">



      <style>{`



  /* # ---------- GLOBAL STYLES ---------- */



  :root {



    font-family: Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;



    color: #30231c;



    background: black;



    font-synthesis: none;



  }



  * {



    box-sizing: border-box;



  }



  body {



    margin: 0;



  }



  button,input,select {



    font: inherit;



  }



  button {



    cursor: pointer;



  }



  a {



    color: inherit;



    text-decoration: none;



  }



  /* # ---------- PAGE CONTAINER ---------- */



  .site {



    min-height: 100vh;



    background: black;



  }



  .container {



    max-width: 1200px;



    padding: 0 28px;



    margin: auto;



  }



  /* # ---------- HEADER AND NAVIGATION ---------- */



  .header {



    background: #FADFC3;



  }



  .header-inner {



    display: flex;



    align-items: center;



    justify-content: space-between;



    min-height: 60px;



    gap: 20px;



  }



  .brand {



    display: flex;



    align-items: center;



    gap: 10px;



    font-weight: 850;



    font-size: 28px;



    letter-spacing: -1.4px;



    color: #422d24;



  }



  .logo {



    height: 36px;



    width: 36px;



    display: grid;



    place-items: center;



    background: #FF9D1C;



    border-radius: 13px;



    color: #422d24;



    font-size: 22px;



    transform: rotate(-9deg);



  }



  /* # ---------- BRAND LOGO IMAGE ---------- */



  .brand-logo {



    display: block;



    height: 40px;



    width: auto;



    max-width: 160px;



    object-fit: contain;



  }



  .topnav {



    display: flex;



    gap: 9px;



    align-items: center;



  }



  .topnav a,.icon-btn {



    padding: 11px 14px;



    border: 0;



    border-radius: 12px;



    background: transparent;



    font-weight: 650;



    color: #49372e;



  }



  .topnav a:hover,.icon-btn:hover {



    background: #efcba7;



  }



  .live-link {



    display: inline-flex;



    align-items: center;



    gap: 8px;



  }



  .live-dot {



    width: 8px;



    height: 8px;



    border-radius: 50%;



    background: #16a34a;



    animation: live-dot-pulse 1.6s ease-out infinite;



  }



  @keyframes live-dot-pulse {



    0% { box-shadow: 0 0 0 0 rgb(22 163 74 / 55%); }



    100% { box-shadow: 0 0 0 7px rgb(22 163 74 / 0%); }



  }



  @media (prefers-reduced-motion: reduce) {



    .live-dot { animation: none; }



  }



  .menu-btn {



    display: none;



  }



  /* # ---------- HERO SECTION ---------- */



  .hero {



    background: #FADFC3;



    padding: 45px 0 70px;



    position: relative;



    overflow: hidden;



  }



  .hero-inner {



    position: relative;



    z-index: 1;



  }



  .eyebrow {



    text-transform: uppercase;



    font-size: 12px;



    letter-spacing: 2px;



    font-weight: 850;



    color: #925321;



    margin-bottom: 10px;



  }



  .hero h1 {



    max-width: 850px;



    font-size: clamp(35px,4.6vw,61px);



    line-height: 1.075;



    letter-spacing: -2.6px;



    margin: 0 0 16px;



    font-weight: 850;



  }



  .hero h1 em {



    font-style: normal;



    color: #a6591b;



  }



  .hero-sub {



    font-size: 17px;



    color: #6d4a34;



    margin: 0 0 34px;



  }



  /* # ---------- SEARCH TABS ---------- */



  .tabs {



    display: flex;



    align-items: center;



    flex-wrap: wrap;



    gap: 5px;



    height: auto;



    margin-bottom: 28px;



  }



  .tab {



    display: flex;



    align-items: center;



    gap: 9px;



    min-height: 38px;



    padding: 9px 17px;



    border: 1px solid #b98b64;



    border-radius: 30px;



    background: transparent;



    color: #50382a;



    font-size: 14px;



    font-weight: 750;



  }



  .tab.active {



    background: #3d2a21;



    border-color: #3d2a21;



    color: #fff8ef;



  }



  .tab:hover:not(.active) {



    background: #ffead0;



  }



  /* # ---------- SEARCH FORM ---------- */



  .search-panel {



    background: transparent;



    border: 0;



    border-radius: 0;



    box-shadow: none;



    padding: 0;



  }



  /* Keep the button in the form's grid without changing the JSX. */



  .search-panel:has(.trip-options) {



    display: grid;



    grid-template-columns: minmax(0, 1fr) 100px;



    column-gap: 10px;



    align-items: stretch;



  }



  .trip-options {



    display: flex;



    align-items: center;



    flex-wrap: wrap;



    gap: 8px;



    margin: 0 0 9px;



    grid-column: 1 / -1;



  }



  .radio {



    display: inline-flex;



    align-items: center;



    gap: 8px;



    min-height: 34px;



    padding: 6px 12px;



    border: 1px solid #c49a72;



    border-radius: 8px;



    background: #fff0df;



    font-size: 13px;



    font-weight: 650;



    cursor: pointer;



  }



  .radio input,



  .check input {



    accent-color: #a75a18;



    width: 16px;



    height: 16px;



  }



  /* # ---------- FORM INPUTS ---------- */



  .fields {



    display: grid;



    grid-template-columns: 1.15fr 1.15fr 1fr 1fr 1.1fr;



    gap: 3px;



    position: relative;



    min-width: 0;



  }



  .search-panel:has(.trip-options) .fields {



    grid-column: 1;



    grid-row: 2;



  }



  .field {



    display: block;



    min-width: 0;



    min-height: 73px;



    padding: 14px 13px 11px;



    position: relative;



    background: white;



    border: 0;



    border-radius: 3px;



  }



  .swap-wrap { position: relative; min-width: 0; }



  .swap-wrap > .field {



    height: 100%;



    border-radius: 11px 3px 3px 11px;



  }



  .traveller-anchor {



    position: relative;



    border-radius: 3px 11px 11px 3px;



  }



  .field:focus-within {



    outline: 2px solid #FF9D1C;



    outline-offset: -2px;



  }



  .field-name {



    display: block;



    font-size: 12px;



    font-weight: 800;



    color: #674c39;



    margin-bottom: 5px;



  }



  .field input {



    display: block;



    width: 100%;



    min-width: 0;



    min-height: 24px;



    padding: 0;



    background: transparent;



    border: 0;



    outline: 0;



    color: #30231c;



    font-size: 14px;



    font-weight: 650;



  }



  .field input::placeholder {



    color: #a18c7b;



    font-weight: 500;



  }



  .swap {



    position: absolute;



    z-index: 3;



    right: -21px;



    top: 18px;



    display: grid;



    place-items: center;



    width: 40px;



    height: 40px;



    border: 3px solid #FADFC3;



    border-radius: 50%;



    background: #fff8ef;



    color: #3d2a21;



    font-size: 20px;



  }



  /* # ---------- TRAVELLER SELECTOR ---------- */



  .selector {



    width: 100%;



    min-width: 0;



    height: 24px;



    padding: 0;



    text-align: left;



    background: transparent;



    border: 0;



    color: #30231c;



    font-size: 14px;



    font-weight: 700;



    white-space: nowrap;



    overflow: hidden;



    text-overflow: ellipsis;



  }



  .popover {



    position: absolute;



    top: calc(100% + 10px);



    right: 0;



    min-width: 292px;



    padding: 18px;



    z-index: 10;



    background: #fffdf8;



    border: 1px solid #ead5ba;



    border-radius: 15px;



    box-shadow: 0 16px 35px #4a311b33;



  }



  .pop-row {



    display: flex;



    align-items: center;



    justify-content: space-between;



    margin-bottom: 16px;



    gap: 15px;



  }



  .pop-row small { display: block; color: #846956; font-size: 11px; }



  .stepper { display: flex; align-items: center; gap: 10px; }



  .stepper button {



    width: 31px;



    height: 31px;



    border: 1px solid #dcc4a7;



    border-radius: 8px;



    background: #fff1e0;



    font-weight: 800;



  }



  .stepper button:disabled { opacity: 0.35; cursor: not-allowed; }



  .popover select {



    width: 100%;



    padding: 10px;



    border: 1px solid #dcc4a7;



    background: white;



    border-radius: 8px;



  }



  .done-btn {



    margin-top: 14px;



    width: 100%;



    border: 0;



    border-radius: 9px;



    background: #FF9D1C;



    padding: 12px;



    font-weight: 800;



  }



  /* # ---------- FORM ACTIONS ---------- */



  .actions {



    display: flex;



    justify-content: space-between;



    align-items: center;



    gap: 15px;



    margin-top: 10px;



  }



  /* Direct children of .actions participate in the parent form grid. */



  .search-panel:has(.trip-options) .actions { display: contents; }



  .checks {



    display: flex;



    flex-wrap: wrap;



    gap: 21px;



  }



  .search-panel:has(.trip-options) .checks {



    grid-column: 1 / -1;



    grid-row: 3;



    margin-top: 10px;



  }



  .check {



    display: flex;



    align-items: center;



    gap: 8px;



    font-size: 13px;



    font-weight: 650;



  }



  .search-btn {



    background: #FF9D1C;



    border: 0;



    color: #38271e;



    padding: 12px;



    min-height: 52px;



    border-radius: 11px;



    font-weight: 850;



    font-size: 14px;



    box-shadow: none;



    white-space: normal;



  }



  .search-panel:has(.trip-options) .search-btn {



    grid-column: 2;



    grid-row: 2;



    width: 100%;



    height: 100%;



  }



  .search-btn:hover,



  .done-btn:hover { background: #ffae41; }



  .search-btn:active { transform: translateY(1px); }



  .result {



    margin-top: 18px;



    border: 1px solid #e4bc8f;



    background: #fff0db;



    padding: 13px 16px;



    border-radius: 10px;



    font-size: 14px;



    line-height: 1.6;



  }



  .search-panel:has(.trip-options) .result { grid-column: 1 / -1; }



  /* # ---------- FEATURE CARDS ---------- */



  .features {



    display: grid;



    grid-template-columns: repeat(3,1fr);



    gap: 16px;



    margin-top: -29px;



    position: relative;



    z-index: 2;



  }



  .feature {



    border-radius: 15px;



    background: #fffaf3;



    border: 1px solid #f0e1cf;



    box-shadow: 0 7px 25px #704a2410;



    padding: 22px;



    display: flex;



    align-items: start;



    gap: 14px;



  }



  .feature-icon {



    min-width: 43px;



    height: 43px;



    display: grid;



    place-items: center;



    background: #fff0d9;



    border-radius: 12px;



    font-size: 24px;



  }



  .feature b {



    font-size: 15px;



  }



  .feature p {



    font-size: 13px;



    color: #796452;



    line-height: 1.5;



    margin: 7px 0 0;



  }



  /* # ---------- DESTINATION SECTION ---------- */



  .section {



    padding-top: 64px;



    padding-bottom: 5px;



  }



  .section-title {



    font-size: 30px;



    letter-spacing: -1.2px;



    margin: 0 0 8px;



  }



  .section-sub {



    color: #776352;



    margin: 0 0 26px;



  }



  .cards {



    display: grid;



    grid-template-columns: repeat(4,1fr);



    gap: 18px;



  }



  .card {



    background: white;



    border: 1px solid #eee0d1;



    border-radius: 18px;



    overflow: hidden;



    box-shadow: 0 4px 16px #7954350f;



    transition: transform .18s,box-shadow .18s;



    text-align: left;



    padding: 0;



  }



  .card:hover {



    transform: translateY(-5px);



    box-shadow: 0 15px 30px #7954352b;



  }



  .card-art {



    height: 175px;



    display: flex;



    align-items: center;



    justify-content: center;



    position: relative;



    font-size: 72px;



  }



  .card-tag {



    position: absolute;



    top: 14px;



    left: 14px;



    border-radius: 50px;



    padding: 7px 10px;



    font-size: 11px;



    background: #fff8eedd;



    font-weight: 800;



  }



  .card-info {



    padding: 18px;



  }



  .card-info b {



    display: block;



    font-size: 19px;



  }



  .card-info span {



    color: #88705e;



    font-size: 13px;



  }



  .card-bottom {



    display: flex;



    justify-content: space-between;



    align-items: end;



    margin-top: 16px;



  }



  .price {



    font-size: 21px;



    font-weight: 850;



  }



  .card-bottom small {



    color: #88705e;



    font-size: 11px;



  }



  .pill {



    background: #fff0dc;



    border-radius: 100px;



    padding: 8px 11px;



    font-size: 12px;



    font-weight: 800;



  }



  /* # ---------- INSPIRATION BANNER ---------- */



  .banner {



    background: #453024;



    color: #fff4e9;



    margin-top: 64px;



    padding: 40px;



    border-radius: 21px;



    display: flex;



    align-items: center;



    justify-content: space-between;



    gap: 22px;



  }



  .banner h2 {



    font-size: 30px;



    letter-spacing: -.8px;



    margin: 0 0 8px;



  }



  .banner p {



    color: #e6cdb9;



    margin: 0;



    max-width: 600px;



    line-height: 1.6;



  }



  .banner button {



    border: 0;



    border-radius: 12px;



    padding: 16px 20px;



    background: #FF9D1C;



    font-weight: 850;



    white-space: nowrap;



  }



  /* # ---------- FOOTER ---------- */



  .footer {



    margin-top: 70px;



    background: #f3e2ce;



    padding: 27px 0;



    color: #745a47;



    font-size: 12px;



  }



  .footer-inner {



    display: flex;



    justify-content: space-between;



    align-items: center;



    gap: 10px;



  }



  .muted {



    font-size: 12px;



    color: #826956;



    margin-top: 12px;



  }



  /* # ---------- RESPONSIVE STYLES ---------- */



  @media(max-width:1050px) {



    .fields {



      grid-template-columns: repeat(2,minmax(0,1fr));



    }



    .traveller-anchor {



      grid-column: span 2;



    }



    .features {



      grid-template-columns: repeat(3,1fr);



    }



    .cards {



      grid-template-columns: repeat(2,1fr);



    }



  }



  @media(max-width:700px) {



    .container {



      padding: 0 17px;



    }



    .header-inner {



      min-height: 69px;



    }



    .brand {



      font-size: 23px;



    }



    .logo {



      height: 32px;



      width: 32px;



    }



    .topnav {



      display: none;



    }



    .topnav.open {



      display: flex;



      position: absolute;



      z-index: 20;



      top: 68px;



      left: 0;



      right: 0;



      flex-direction: column;



      align-items: stretch;



      background: #f9dfc3;



      padding: 12px 18px;



      box-shadow: 0 10px 25px #6b421b20;



    }



    .menu-btn {



      display: block;



    }



    .hero {



      padding: 35px 0 55px;



    }



    .hero h1 {



      letter-spacing: -1.5px;



    }



    .hero-sub {



      font-size: 15px;



    }



    .tabs {



      gap: 7px;



    }



    .tab {



      padding: 11px 14px;



      font-size: 13px;



    }



    .search-panel {



      padding: 15px;



    }



    .fields {



      grid-template-columns: 1fr;



    }



    .traveller-anchor {



      grid-column: auto;



    }



    .swap {



      right: 13px;



      top: auto;



      bottom: -24px;



      transform: rotate(90deg);



    }



    .actions {



      align-items: stretch;



      flex-direction: column;



    }



    .search-btn {



      width: 100%;



    }



    .features {



      grid-template-columns: 1fr;



      margin-top: 18px;



    }



    .feature {



      padding: 15px;



    }



    .section {



      padding-top: 42px;



    }



    .section-title {



      font-size: 25px;



    }



    .cards {



      grid-template-columns: repeat(2,minmax(0,1fr));



      gap: 11px;



    }



    .card-art {



      height: 125px;



      font-size: 48px;



    }



    .card-info {



      padding: 12px;



    }



    .card-info b {



      font-size: 16px;



    }



    .price {



      font-size: 18px;



    }



    .banner {



      margin-top: 46px;



      flex-direction: column;



      align-items: start;



      padding: 25px;



    }



    .banner h2 {



      font-size: 25px;



    }



    .footer-inner {



      align-items: start;



      flex-direction: column;



    }



  }



  @media(max-width:370px) {



    .cards {



      grid-template-columns: 1fr;



    }



    .tab {



      padding: 11px 9px;



    }



  }



  /* # ---------- FAQ ACCORDION ---------- */



  .faq-section {



    max-width: 1100px;



    margin: 80px auto;



    padding: 0 28px;



  }



  .faq-section h2 {



    font-size: 32px;



    font-weight: 800;



    color: white;



    margin: 0 0 28px;



  }



  .faq-list { border-top: 1px solid #e2c4a5; }



  .faq-item { border-bottom: 1px solid #e2c4a5; }



  .faq-question {



    display: flex;



    justify-content: space-between;



    align-items: center;



    gap: 20px;



    width: 100%;



    padding: 22px 4px;



    border: none;



    background: transparent;



    color: white;



    text-align: left;



    font-size: 17px;



    font-weight: 650;



    cursor: pointer;



  }



  .faq-question:hover { color: #a6591b; }



  .faq-arrow {



    display: flex;



    align-items: center;



    justify-content: center;



    min-width: 30px;



    height: 30px;



    border-radius: 50%;



    background: #FADFC3;



    color: #3D2A21;



    font-size: 22px;



  }



  .faq-question[aria-expanded="true"] .faq-arrow { background: #FF9D1C; }



  .faq-answer { padding: 0 45px 22px 4px; }



  .faq-answer p { margin: 0; color: #6d4a34; line-height: 1.7; font-size: 15px; }



  @media (max-width: 700px) {



    .faq-section { margin: 50px auto; padding: 0 17px; }



    .faq-section h2 { font-size: 26px; }



    .faq-question { font-size: 15px; padding: 18px 0; }



  }



  /* # ---------- CONNECTED FORM: RESPONSIVE OVERRIDES ---------- */



  @media (max-width: 1050px) {



    .search-panel:has(.trip-options) {



      grid-template-columns: minmax(0, 1fr);



    }



    .search-panel:has(.trip-options) .fields {



      grid-column: 1;



      grid-row: 2;



      grid-template-columns: repeat(2, minmax(0, 1fr));



      gap: 8px;



    }



    .search-panel:has(.trip-options) .traveller-anchor { grid-column: span 2; }



    .search-panel:has(.trip-options) .search-btn {



      grid-column: 1;



      grid-row: 4;



      width: 100%;



      height: auto;



      margin-top: 12px;



    }



    .search-panel:has(.trip-options) .checks { grid-column: 1; grid-row: 3; }



    .swap-wrap > .field, .traveller-anchor, .field { border-radius: 9px; }



  }



  @media (max-width: 700px) {



    .tabs { height: auto; flex-wrap: wrap; }



    .search-panel { padding: 0; }



    .search-panel:has(.trip-options) .fields { grid-template-columns: 1fr; }



    .search-panel:has(.trip-options) .traveller-anchor { grid-column: 1; }



    .search-panel:has(.trip-options) .swap {



      top: auto;



      right: 12px;



      bottom: -22px;



      transform: rotate(90deg);



    }



  }



  /* # ---------- NAVY / WHITE COLOUR INVERSION ---------- */



  /* Only colour-related properties change; dimensions and layout are untouched. */



  :root { color: #05203c; background: #05203c; }



  .site { background: #05203c; color: #ffffff; }



  .header, .hero { background: #ffffff; color: #05203c; }



  .brand, .topnav a, .icon-btn, .hero h1, .hero-sub, .eyebrow { color: #05203c; }



  .topnav a:hover, .icon-btn:hover { background: #e7edf3; }



  .tab { color: #05203c; border-color: #05203c; background: #ffffff; }



  .tab.active { background: #05203c; color: #ffffff; border-color: #05203c; }



  .tab:hover:not(.active) { background: #e7edf3; }



  .radio { background: #ffffff; color: #05203c; border-color: #05203c; }



  .radio input, .check input { accent-color: #0069e3; }



  .field, .swap-wrap > .field, .traveller-anchor { background: #05203c; color: #ffffff; }



  .field-name, .field input, .selector { color: #ffffff; }



  .field input::placeholder { color: #cfdaea; }



  .field:focus-within { outline-color: #0069e3; }



  .swap { background: #ffffff; color: #05203c; border-color: #05203c; }



  .popover { background: #05203c; color: #ffffff; border-color: #ffffff; }



  .pop-row small { color: #d4e0eb; }



  .stepper button, .popover select { background: #ffffff; color: #05203c; border-color: #05203c; }



  .check { color: #05203c; }



  .search-btn, .done-btn { background: #0069e3; color: #ffffff; }



  .search-btn:hover, .done-btn:hover { background: #0057bd; }



  .result { background: #05203c; color: #ffffff; border-color: #ffffff; }



  .feature, .card { background: #05203c; color: #ffffff; border-color: #ffffff; }



  .feature-icon, .pill, .card-tag { background: #ffffff; color: #05203c; }



  .feature p, .card-info span, .card-bottom small, .section-sub { color: #d4e0eb; }



  .banner { background: #ffffff; color: #05203c; }



  .banner p { color: #05203c; }



  .banner button { background: #0069e3; color: #ffffff; }



  .footer { background: #ffffff; color: #05203c; }



  .faq-section h2, .faq-question { color: #ffffff; }



  .faq-list, .faq-item { border-color: #ffffff; }



  .faq-answer p { color: #d4e0eb; }



  .faq-arrow { background: #ffffff; color: #05203c; }



  .faq-question[aria-expanded="true"] .faq-arrow { background: #0069e3; color: #ffffff; }



  @media (max-width: 700px) { .topnav.open { background: #ffffff; } }





  /* # ---------- USER REQUEST BUDGET ---------- */

  .budget-control {

    display: flex;

    gap: 12px;

    align-items: center;

    flex-wrap: wrap;

    color: #05203c;

    font-weight: 750;

    margin-top: 14px;

  }

  .budget-control strong { color: #0069e3; }

  .budget-control input {

    border: 1px solid #05203c;

    color: #05203c;

    background: #ffffff;

    border-radius: 9px;

    padding: 10px 12px;

    width: 180px;

    max-width: 100%;

  }

  .budget-control input:focus-visible { outline: 2px solid #0069e3; }

  /* # ---------- EMAIL-LINKED REQUEST DETAILS ---------- */

  .request-details {

    grid-column: 1 / -1;

    grid-row: 4;

    display: flex;

    flex-wrap: wrap;

    align-items: center;

    gap: 14px 24px;

    margin-top: 14px;

  }

  .request-email-control {

    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 12px;

    font-weight: 750;

    color: #05203c;

  }

  .request-email-control strong { color: #0069e3; }

  .request-email-control input {

    width: 230px;

    max-width: 100%;

    padding: 10px 12px;

    border-radius: 9px;

    border: 1px solid #05203c;

    background: white;

    color: #05203c;

  }

  .request-email-control input:focus-visible { outline: 2px solid #0069e3; }

  .request-details .budget-control { margin-top: 0; }

  .request-email-hint {

    flex-basis: 100%;

    margin: 0;

    color: #475569;

    font-size: 12px;

  }

  @media (max-width: 1050px) {

    .search-panel:has(.trip-options) .search-btn { grid-row: 5; }

  }

`}</style>



      {/* # ---------- HEADER / NAVIGATION ---------- */}



      <header className="header">



        <div className="container header-inner">



          <a className="brand" href="#home" aria-label="BidScanner home"><img className="brand-logo" src={logo} alt="" />bidscanner</a>



          <nav className={`topnav ${menu ? "open" : ""}`} aria-label="Main navigation">



            <button className="icon-btn" onClick={() => alert("Language and currency selection is a demo.")}>🌐 EN · GBP</button>



            <Link to="/live" className="live-link"><span className="live-dot" aria-hidden="true" />Live bidding</Link>
<Link to="/airline">Airline login</Link>

              <button type="button" className="icon-btn" onClick={() => setUserPortalOpen(true)}>{accountEmail ? "My requests" : "Traveller sign in"}</button>



          </nav>



          <button className="icon-btn menu-btn" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>☰</button>



        </div>



      </header>



      {/* # ---------- MAIN CONTENT ---------- */}



      {userPortalOpen ? (

        <UserPortal

          email={accountEmail}

          onSignIn={signInUser}

          onSignOut={signOutUser}

          onBack={() => setUserPortalOpen(false)}

        />

      ) : <main id="home">



        {/* # ---------- HERO / TRAVEL SEARCH ---------- */}



        <section className="hero">



          <div className="container hero-inner">



              {/* # ---------- TRAVEL TABS ---------- */}



              <div className="tabs" role="tablist" aria-label="Travel search type">



              {[['Flights','✈']].map(([label, icon]) => (



                <button role="tab" aria-selected={tab === label} key={label} className={`tab ${tab === label ? "active" : ""}`} onClick={() => {setTab(label);setSearchResult("")}}><ButtonIcon>{icon}</ButtonIcon>{label}</button>



              ))}



            </div>



            <h1>Tell airlines what you need. Let them bid for you. </h1>



            {/* # ---------- SEARCH FORM ---------- */}



            <form className="search-panel" onSubmit={handleSearch}>



<div className="trip-options">



                    {["Return", "One way", "Multi-city"].map(type => <label className="radio" key={type}><input type="radio" checked={tripType === type} onChange={() => setTripType(type)} name="trip"/>{type}</label>)}



                  </div>



                  <div className="fields">



                    <div className="swap-wrap"><label className="field"><span className="field-name">From</span><input aria-label="From" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="City or airport"/></label><button type="button" className="swap" title="Swap locations" aria-label="Swap locations" onClick={() => {setOrigin(destination);setDestination(origin)}}>⇄</button></div>



                    <label className="field"><span className="field-name">To</span><input aria-label="To" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Country, city or airport"/></label>



                    <label className="field"><span className="field-name">Depart</span><input aria-label="Departure date" type="date" min={today} value={depart} onChange={e => setDepart(e.target.value)}/></label>



                    <label className="field"><span className="field-name">Return</span><input aria-label="Return date" type="date" min={depart || today} value={back} disabled={tripType !== "Return"} onChange={e => setBack(e.target.value)}/></label>



                    <div className="field traveller-anchor"><span className="field-name">Travellers and cabin class</span><button className="selector" type="button" aria-expanded={travellersOpen} onClick={() => setTravellersOpen(!travellersOpen)}>{adults + children} traveller{adults + children === 1 ? "" : "s"}, {cabin} ▾</button>



                      {travellersOpen && <div className="popover">



                        <div className="pop-row"><div><b>Adults</b><small>Age 16+</small></div><div className="stepper"><button type="button" disabled={adults <= 1} onClick={() => setAdults(adults - 1)}>−</button>{adults}<button type="button" disabled={adults + children >= 9} onClick={() => setAdults(adults + 1)}>+</button></div></div>



                        <div className="pop-row"><div><b>Children</b><small>Age 0–15</small></div><div className="stepper"><button type="button" disabled={children <= 0} onClick={() => setChildren(children - 1)}>−</button>{children}<button type="button" disabled={adults + children >= 9} onClick={() => setChildren(children + 1)}>+</button></div></div>



                        <label><span className="field-name">Cabin class</span><select value={cabin} onChange={e => setCabin(e.target.value)}><option>Economy</option><option>Premium economy</option><option>Business</option><option>First</option></select></label>



                        <button type="button" className="done-btn" onClick={() => setTravellersOpen(false)}>Done</button>



                      </div>}



                    </div>



                  </div>



                  {/* # ---------- REQUEST OWNER EMAIL AND MAXIMUM BUDGET ---------- */}

                  <div className="request-details">

                    <label className="request-email-control">

                      <span>Email address <strong>*</strong></span>

                      <input

                        type="email"

                        autoComplete="email"

                        value={requestEmail}

                        onChange={(e) => setRequestEmail(e.target.value)}

                        placeholder="you@example.com"

                        required

                      />

                    </label>

                    <label className="budget-control">

                      <span>Maximum total budget (£) <strong>*</strong></span>

                      <input type="number" min="1" step="1" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="e.g. 150" required />

                    </label>

                    <p className="request-email-hint">Your request will appear in My requests when you use this email. Mock demo, no email verification.</p>

                  </div>

                  <div className="actions"><div className="checks"><label className="check"><input type="checkbox" checked={nearby} onChange={e => setNearby(e.target.checked)}/>Add nearby airports</label><label className="check"><input type="checkbox" checked={direct} onChange={e => setDirect(e.target.checked)}/>Direct flights only</label></div><button className="search-btn" type="submit">Publish request</button></div>



              {searchResult && <div className="result" role="status">{searchResult}</div>}



            </form>



          </div>



        </section>



        {/* # ---------- DESTINATION CARDS ---------- */}



        <section id="explore" className="container section">



          <h2 className="section-title">Where to next?</h2>



          <p className="section-sub">A little inspiration for your next getaway. Prices below are illustrative.</p>



          <div className="cards">



            {cards.map(card => <button className="card" key={card.city} onClick={() => {setTab("Flights");setDestination(card.city);window.scrollTo({top:0,behavior:"smooth"})}}>



              <div className="card-art" style={{background:card.bg}}><span className="card-tag">{card.tag}</span><span aria-hidden="true">{card.emoji}</span></div>



              <div className="card-info"><b>{card.city}</b><span>{card.country}</span><div className="card-bottom"><div><small>Flights from</small><div className="price">{card.price}</div></div><span className="pill">Explore ↗</span></div></div>



            </button>)}



          </div>



        </section>



        {/* # ---------- WHY SKY FLIP ---------- */}



            <section className="faq-section">



      <h2>Booking flights with BidScanner</h2>



      <div className="faq-list">



        {faqs.map((faq, index) => (



          <div className="faq-item" key={index}>



            <button



              type="button"



              className="faq-question"



              aria-expanded={openIndex === index}



              onClick={() =>



                setOpenIndex(openIndex === index ? null : index)



              }



            >



              <span>{faq.question}</span>



              <span className="faq-arrow">



                {openIndex === index ? "−" : "+"}



              </span>



            </button>



            {openIndex === index && (



              <div className="faq-answer">



                <p>{faq.answer}</p>



              </div>



            )}



          </div>



        ))}



      </div>



    </section>



      </main>}



      {/* # ---------- FOOTER ---------- */}



      <footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} BidScanner · Independent UI concept</span><span>Skyscanner-inspired layout · Not affiliated with Skyscanner · Demo prices only</span></div></footer>



    </div>



  );



}
