import React, { useState } from "react";

/**
 * Single-file, Skyscanner-inspired homepage with an inverted warm palette.
 * No UI libraries or external CSS required. Demo interactions are local only.
 * Drop into src/App.jsx of a Vite React project.
 */
export default function App() {
  const [tab, setTab] = useState("Flights");
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

  function handleSearch(e) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setSearchResult("Add a departure point and destination to search.");
      return;
    }
    if (!depart) {
      setSearchResult("Choose a departure date to continue.");
      return;
    }
    if (tripType === "Return" && back && back < depart) {
      setSearchResult("Your return date must be after your departure date.");
      return;
    }
    setSearchResult(`Demo search: ${origin} → ${destination} · ${depart}${tripType === "Return" && back ? ` to ${back}` : ""} · ${adults + children} traveller${adults + children === 1 ? "" : "s"}${direct ? " · direct only" : ""}. Connect a flights API for live results.`);
  }

  const ButtonIcon = ({ children }) => <span className="button-icon" aria-hidden="true">{children}</span>;

  return (
    <div className="site">
      <style>{`
        :root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#30231c;background:#fff9f1;font-synthesis:none}
        *{box-sizing:border-box} body{margin:0} button,input,select{font:inherit} button{cursor:pointer} a{color:inherit;text-decoration:none}
        .site{min-height:100vh;background:#fff9f1}.container{max-width:1200px;padding:0 28px;margin:auto}
        .header{background:#FADFC3;border-bottom:1px solid #eac59e}.header-inner{display:flex;align-items:center;justify-content:space-between;min-height:80px;gap:20px}
        .brand{display:flex;align-items:center;gap:10px;font-weight:850;font-size:28px;letter-spacing:-1.4px;color:#422d24}.logo{height:36px;width:36px;display:grid;place-items:center;background:#FF9D1C;border-radius:13px;color:#422d24;font-size:22px;transform:rotate(-9deg)}
        .topnav{display:flex;gap:9px;align-items:center}.topnav a,.icon-btn{padding:11px 14px;border:0;border-radius:12px;background:transparent;font-weight:650;color:#49372e}.topnav a:hover,.icon-btn:hover{background:#efcba7}.menu-btn{display:none}
        .hero{background:#FADFC3;padding:45px 0 70px;position:relative;overflow:hidden}.hero:before{content:"";position:absolute;border:2px solid #e8bd92;width:420px;height:420px;border-radius:50%;right:-170px;top:-220px}.hero:after{content:"";position:absolute;width:260px;height:260px;border:2px solid #e8bd92;border-radius:50%;left:-180px;bottom:-150px}
        .hero-inner{position:relative;z-index:1}.eyebrow{text-transform:uppercase;font-size:12px;letter-spacing:2px;font-weight:850;color:#925321;margin-bottom:11px}.hero h1{max-width:850px;font-size:clamp(35px,4.6vw,61px);line-height:1.075;letter-spacing:-2.6px;margin:0 0 16px;font-weight:850}.hero h1 em{font-style:normal;color:#a6591b}.hero-sub{font-size:17px;color:#6d4a34;margin:0 0 34px}
        .tabs{display:flex;gap:9px;margin-bottom:15px}.tab{display:flex;align-items:center;gap:9px;color:#50382a;background:#f2cfa9;border:1px solid #e6bd96;border-radius:13px;padding:13px 22px;font-weight:750}.tab.active{background:#3d2a21;color:#fff8ef;border-color:#3d2a21}.tab:hover:not(.active){background:#ffead0}
        .search-panel{background:#fff8ed;border:1px solid #e7caaa;border-radius:18px;box-shadow:0 15px 30px rgba(84,49,23,.12);padding:23px}
        .trip-options{display:flex;align-items:center;flex-wrap:wrap;gap:20px;margin:0 0 20px}.radio{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:650;cursor:pointer}.radio input,.check input{accent-color:#a75a18;width:16px;height:16px}
        .fields{display:grid;grid-template-columns:1.25fr 1.25fr 1fr 1fr 1.25fr;gap:10px;position:relative}.field{display:block;min-width:0;border:1px solid #d9c4af;border-radius:10px;background:white;padding:10px 13px;position:relative}.field:focus-within{outline:2px solid #FF9D1C;outline-offset:0;border-color:transparent}.field-name{display:block;font-size:12px;font-weight:800;color:#674c39;margin-bottom:7px}.field input{background:transparent;width:100%;outline:0;border:0;color:#30231c;font-size:15px;font-weight:650;min-height:24px}.field input::placeholder{color:#a18c7b;font-weight:500}.swap-wrap{position:relative}.swap{position:absolute;z-index:2;right:-21px;top:33px;display:grid;place-items:center;border-radius:50%;width:36px;height:36px;border:1px solid #d6b792;background:#fff4e5;box-shadow:0 2px 8px #aa7c562b;font-size:20px}
        .selector{width:100%;height:24px;text-align:left;background:transparent;border:0;color:#30231c;font-size:14px;font-weight:700;padding:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.traveller-anchor{position:relative}.popover{position:absolute;top:calc(100% + 10px);right:0;min-width:292px;background:#fffdf8;box-shadow:0 16px 35px #4a311b33;border:1px solid #ead5ba;border-radius:15px;padding:18px;z-index:10}.pop-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:15px}.pop-row small{display:block;color:#846956;font-size:11px}.stepper{display:flex;align-items:center;gap:10px}.stepper button{width:31px;height:31px;border:1px solid #dcc4a7;border-radius:8px;background:#fff1e0;font-weight:800}.stepper button:disabled{opacity:.35;cursor:not-allowed}.popover select{width:100%;padding:10px;border:1px solid #dcc4a7;background:white;border-radius:8px}.done-btn{margin-top:14px;width:100%;border:0;border-radius:9px;background:#FF9D1C;padding:12px;font-weight:800}
        .actions{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:19px}.checks{display:flex;flex-wrap:wrap;gap:21px}.check{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:650}.search-btn{background:#FF9D1C;border:0;color:#38271e;padding:15px 25px;min-height:52px;border-radius:12px;font-weight:850;font-size:16px;box-shadow:0 4px 0 #d77c05;white-space:nowrap}.search-btn:hover,.done-btn:hover{background:#ffae41}.search-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #d77c05}.result{margin-top:18px;border:1px solid #e4bc8f;background:#fff0db;padding:13px 16px;border-radius:10px;font-size:14px;line-height:1.6}
        .features{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:-29px;position:relative;z-index:2}.feature{border-radius:15px;background:#fffaf3;border:1px solid #f0e1cf;box-shadow:0 7px 25px #704a2410;padding:22px;display:flex;align-items:start;gap:14px}.feature-icon{min-width:43px;height:43px;display:grid;place-items:center;background:#fff0d9;border-radius:12px;font-size:24px}.feature b{font-size:15px}.feature p{font-size:13px;color:#796452;line-height:1.5;margin:7px 0 0}
        .section{padding-top:64px;padding-bottom:5px}.section-title{font-size:30px;letter-spacing:-1.2px;margin:0 0 8px}.section-sub{color:#776352;margin:0 0 26px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.card{background:white;border:1px solid #eee0d1;border-radius:18px;overflow:hidden;box-shadow:0 4px 16px #7954350f;transition:transform .18s,box-shadow .18s;text-align:left;padding:0}.card:hover{transform:translateY(-5px);box-shadow:0 15px 30px #7954352b}.card-art{height:175px;display:flex;align-items:center;justify-content:center;position:relative;font-size:72px}.card-tag{position:absolute;top:14px;left:14px;border-radius:50px;padding:7px 10px;font-size:11px;background:#fff8eedd;font-weight:800}.card-info{padding:18px}.card-info b{display:block;font-size:19px}.card-info span{color:#88705e;font-size:13px}.card-bottom{display:flex;justify-content:space-between;align-items:end;margin-top:16px}.price{font-size:21px;font-weight:850}.card-bottom small{color:#88705e;font-size:11px}.pill{background:#fff0dc;border-radius:100px;padding:8px 11px;font-size:12px;font-weight:800}
        .banner{background:#453024;color:#fff4e9;margin-top:64px;padding:40px;border-radius:21px;display:flex;align-items:center;justify-content:space-between;gap:22px}.banner h2{font-size:30px;letter-spacing:-.8px;margin:0 0 8px}.banner p{color:#e6cdb9;margin:0;max-width:600px;line-height:1.6}.banner button{border:0;border-radius:12px;padding:16px 20px;background:#FF9D1C;font-weight:850;white-space:nowrap}
        .footer{margin-top:70px;background:#f3e2ce;padding:27px 0;color:#745a47;font-size:12px}.footer-inner{display:flex;justify-content:space-between;align-items:center;gap:10px}.muted{font-size:12px;color:#826956;margin-top:12px}
        @media(max-width:1050px){.fields{grid-template-columns:repeat(2,minmax(0,1fr))}.traveller-anchor{grid-column:span 2}.features{grid-template-columns:repeat(3,1fr)}.cards{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:700px){.container{padding:0 17px}.header-inner{min-height:69px}.brand{font-size:23px}.logo{height:32px;width:32px}.topnav{display:none}.topnav.open{display:flex;position:absolute;z-index:20;top:68px;left:0;right:0;flex-direction:column;align-items:stretch;background:#f9dfc3;padding:12px 18px;box-shadow:0 10px 25px #6b421b20}.menu-btn{display:block}.hero{padding:35px 0 55px}.hero h1{letter-spacing:-1.5px}.hero-sub{font-size:15px}.tabs{gap:7px}.tab{padding:11px 14px;font-size:13px}.search-panel{padding:15px}.fields{grid-template-columns:1fr}.traveller-anchor{grid-column:auto}.swap{right:13px;top:auto;bottom:-24px;transform:rotate(90deg)}.actions{align-items:stretch;flex-direction:column}.search-btn{width:100%}.features{grid-template-columns:1fr;margin-top:18px}.feature{padding:15px}.section{padding-top:42px}.section-title{font-size:25px}.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.card-art{height:125px;font-size:48px}.card-info{padding:12px}.card-info b{font-size:16px}.price{font-size:18px}.banner{margin-top:46px;flex-direction:column;align-items:start;padding:25px}.banner h2{font-size:25px}.footer-inner{align-items:start;flex-direction:column}}
        @media(max-width:370px){.cards{grid-template-columns:1fr}.tab{padding:11px 9px}}
      `}</style>

      <header className="header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="Skyflip home"><span className="logo">✈</span>skyflip</a>
          <nav className={`topnav ${menu ? "open" : ""}`} aria-label="Main navigation">
            <a href="#explore">Explore</a><a href="#why">Why Skyflip?</a><a href="#inspiration">Get inspired</a>
            <button className="icon-btn" onClick={() => alert("Language and currency selection is a demo.")}>🌐 EN · GBP</button>
            <button className="icon-btn" onClick={() => alert("Sign-in is not connected in this demo.")}>Sign in</button>
          </nav>
          <button className="icon-btn menu-btn" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>☰</button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="container hero-inner">
            <div className="eyebrow">A brighter way to travel</div>
            <h1>Big adventures.<br/><em>Unexpectedly good prices.</em></h1>
            <p className="hero-sub">Search flights, find your next escape, and take the scenic route to somewhere new.</p>
            <div className="tabs" role="tablist" aria-label="Travel search type">
              {[['Flights','✈'],['Hotels','⌂'],['Car hire','🚘']].map(([label, icon]) => (
                <button role="tab" aria-selected={tab === label} key={label} className={`tab ${tab === label ? "active" : ""}`} onClick={() => {setTab(label);setSearchResult("")}}><ButtonIcon>{icon}</ButtonIcon>{label}</button>
              ))}
            </div>

            <form className="search-panel" onSubmit={handleSearch}>
              {tab === "Flights" ? (
                <>
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
                  <div className="actions"><div className="checks"><label className="check"><input type="checkbox" checked={nearby} onChange={e => setNearby(e.target.checked)}/>Add nearby airports</label><label className="check"><input type="checkbox" checked={direct} onChange={e => setDirect(e.target.checked)}/>Direct flights only</label></div><button className="search-btn" type="submit">Search flights →</button></div>
                </>
              ) : (
                <>
                  <div className="fields" style={{gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))"}}>
                    <label className="field"><span className="field-name">{tab === "Hotels" ? "Where do you want to stay?" : "Pick-up location"}</span><input placeholder="City, location or airport"/></label>
                    <label className="field"><span className="field-name">{tab === "Hotels" ? "Check-in" : "Pick-up date"}</span><input type="date" min={today}/></label>
                    <label className="field"><span className="field-name">{tab === "Hotels" ? "Check-out" : "Drop-off date"}</span><input type="date" min={today}/></label>
                  </div>
                  <div className="actions"><span className="muted">Explore a different way to get away.</span><button type="button" className="search-btn" onClick={() => setSearchResult(`${tab} search is a UI demo. Connect a provider API to fetch real availability.`)}>Search {tab.toLowerCase()} →</button></div>
                </>
              )}
              {searchResult && <div className="result" role="status">{searchResult}</div>}
            </form>
          </div>
        </section>

        <section id="why" className="container features" aria-label="Why choose Skyflip">
          <div className="feature"><span className="feature-icon">💰</span><div><b>Find a better price</b><p>Compare travel options in one simple search.</p></div></div>
          <div className="feature"><span className="feature-icon">🧭</span><div><b>Explore possibilities</b><p>Discover destinations you hadn't considered.</p></div></div>
          <div className="feature"><span className="feature-icon">✨</span><div><b>Plan your own way</b><p>Flexible dates, budgets, and a little spontaneity.</p></div></div>
        </section>

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

        <section id="inspiration" className="container"><div className="banner"><div><h2>Let the world surprise you.</h2><p>Not sure where to go? Discover fresh destinations, compare options, and turn a free weekend into a story worth telling.</p></div><button onClick={() => {setTab("Flights");setDestination("Everywhere");window.scrollTo({top:0,behavior:"smooth"})}}>Explore everywhere ↗</button></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} Skyflip · Independent UI concept</span><span>Skyscanner-inspired layout · Not affiliated with Skyscanner · Demo prices only</span></div></footer>
    </div>
  );
}
