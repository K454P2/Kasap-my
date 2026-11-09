function AppShell({ children, isLoggedIn, user, navigateTo, onLogout, currentPage,
                    activeLang, langs, switchLang, dir, schema }) {
  const t = {
    root: "flex min-h-screen flex-col bg-background text-text pb-16 md:pb-0",
    header: "sticky top-0 z-40 border-b border-border bg-surface",
    bar: "mx-auto flex h-16 md:h-20 w-full max-w-[1200px] items-center gap-4 md:gap-8 px-4 md:px-6",
    brand: "flex shrink-0 items-center gap-2 rounded-lg text-xl md:text-2xl font-extrabold tracking-tight text-text",
    dot: "h-2 w-2 rounded-full bg-primary",
    search: "relative hidden md:flex flex-1 max-w-xl items-center",
    input: "h-11 w-full rounded-full border border-input-border bg-surface-2 ps-11 pe-4 text-sm text-text placeholder:text-input-placeholder outline-none transition focus:border-primary focus:bg-surface",
    searchIcon: "pointer-events-none absolute start-4 text-text-muted",
    links: "hidden md:flex items-center gap-7 ms-auto",
    link: "relative py-2 text-sm font-semibold text-text-secondary transition hover:text-text",
    linkOn: "relative py-2 text-sm font-semibold text-text",
    underline: "absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-5 rounded-full bg-primary",
    pill: "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-btn-primary-bg px-5 text-sm font-bold text-btn-primary-text transition hover:bg-btn-primary-hover",
    iconBtn: "inline-flex h-11 w-11 items-center justify-center rounded-full text-text transition hover:bg-surface-2",
    avatarBtn: "flex items-center gap-2 rounded-full border border-border bg-surface ps-1 pe-3 py-1 transition hover:border-primary",
    avatar: "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-text",
    drop: "absolute end-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-menu-border bg-menu-bg shadow-shadow-lg",
    dropItem: "flex w-full min-h-11 items-center gap-3 px-4 text-sm font-medium text-menu-item-text transition hover:bg-menu-item-hover",
    role: "inline-block rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary",
    tabbar: "fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface md:hidden",
    tab: "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-text-muted transition active:bg-surface-2",
    tabOn: "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold text-primary",
    tabBar: "absolute top-0 h-0.5 w-8 rounded-full bg-primary",
    backdrop: "fixed inset-0 z-50 bg-black/50",
    sheet: "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8 shadow-shadow-xl",
    sheetItem: "flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-base font-semibold text-text transition hover:bg-surface-2",
    sheetItemOn: "flex min-h-12 w-full items-center justify-between rounded-xl bg-primary-light px-4 text-base font-bold text-primary",
    lang: "rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-secondary transition hover:border-primary",
    langOn: "rounded-full border border-primary bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-text",
    footer: "mt-auto bg-sidebar-bg text-sidebar-text",
    fWrap: "mx-auto grid w-full max-w-[1200px] gap-10 px-4 md:px-6 py-12 md:grid-cols-12",
    fEyebrow: "mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary",
    fLink: "text-sm font-medium text-sidebar-text transition hover:text-sidebar-text-active",
    seal: "inline-flex items-center gap-2 rounded-full border border-sidebar-border px-4 py-2 text-sm font-semibold text-sidebar-text-active",
    fBottom: "border-t border-sidebar-border"
  };

  const ROLES = [{ id: 1, label: "Pembeli" }, { id: 2, label: "Penjual" }, { id: 3, label: "Admin Platform" }];
  const ribbon = { backgroundImage: "repeating-linear-gradient(45deg, var(--primary) 0 2px, transparent 2px 7px), repeating-linear-gradient(-45deg, var(--primary) 0 2px, transparent 2px 7px)" };

  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const items = useMemo(() => navigation((schema && schema.pages) || [], activeLang), [schema, activeLang]);
  const visible = items.filter(i => !i.auth || isLoggedIn);
  const home = items.find(i => i.home) || items[0];
  const homeName = home ? home.name : "Home";
  const loginPage = ((schema && schema.pages) || []).find(p => p.type === "login" && p.lang === activeLang)
    || ((schema && schema.pages) || []).find(p => p.type === "login");
  const storeItem = items.find(i => i.auth);
  const title = schema ? schema.title : "";
  const roleLabel = user ? (ROLES.find(r => r.id === Number(user.role)) || {}).label : null;
  const multiLang = langs && langs.length > 1;

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") { setSheet(false); setSearchOpen(false); setMenu(false); } };
    const onDown = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  useEffect(() => { if (searchOpen && searchRef.current) searchRef.current.focus(); }, [searchOpen]);

  const go = (name) => { setSheet(false); setMenu(false); setSearchOpen(false); navigateTo(name); };
  const goLogin = () => { if (loginPage) go(loginPage.name); };
  const submit = (e) => {
    e.preventDefault();
    setSheet(false); setMenu(false); setSearchOpen(false);
    const v = q.trim();
    navigateTo(homeName, {}, activeLang, v ? { q: v } : {});
  };
  const logout = () => { setSheet(false); setMenu(false); onLogout(); };

  const Avatar = () => (
    <span className={t.avatar}>
      {user && user.avatar_url
        ? <img src={user.avatar_url} alt={user.name || ""} className="h-full w-full object-cover" />
        : (user && user.name ? user.name.charAt(0).toUpperCase() : "?")}
    </span>
  );

  const Langs = () => multiLang ? (
    <div className="flex items-center gap-2">
      {langs.map(l => {
        const code = l.code || l;
        return <button key={code} type="button" onClick={() => switchLang(code)} className={code === activeLang ? t.langOn : t.lang}>{code}</button>;
      })}
    </div>
  ) : null;

  const SearchField = ({ inputRef }) => (
    <form onSubmit={submit} className="relative flex w-full items-center" role="search">
      <Search size={18} className={t.searchIcon} />
      <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Cari produk, toko, atau pulsa" aria-label="Cari" className={t.input} />
    </form>
  );

  const tabs = [
    { key: "home", label: "Beranda", icon: Home, on: currentPage === homeName, run: () => go(homeName) },
    { key: "search", label: "Cari", icon: Search, on: searchOpen, run: () => { setSheet(false); setSearchOpen(o => !o); window.scrollTo({ top: 0, behavior: "smooth" }); } },
    storeItem ? { key: "store", label: storeItem.label, icon: Store, on: currentPage === storeItem.name, run: () => (isLoggedIn ? go(storeItem.name) : (loginPage ? goLogin() : go(storeItem.name))) } : null,
    { key: "acc", label: "Akun", icon: User, on: sheet, run: () => { setSearchOpen(false); setSheet(true); } }
  ].filter(Boolean);

  return (
    <div dir={dir} className={t.root}>
      <header className={t.header}>
        <div className={t.bar}>
          <button type="button" onClick={() => go(homeName)} className={t.brand} aria-label={title}>
            {schema && schema.icon ? <img src={schema.icon} alt={title} className="h-8 w-auto" /> : null}
            <span>{title}</span>
            <span className={t.dot} aria-hidden="true" />
          </button>

          <div className={t.search}><SearchField /></div>

          <nav className={t.links} aria-label="Navigasi utama">
            {visible.map(i => (
              <button key={i.name} type="button" onClick={() => go(i.name)} className={currentPage === i.name ? t.linkOn : t.link} aria-current={currentPage === i.name ? "page" : undefined}>
                {i.label}
                {currentPage === i.name ? <span className={t.underline} /> : null}
              </button>
            ))}
            <Langs />
            {isLoggedIn && user ? (
              <div className="relative" ref={menuRef}>
                <button type="button" onClick={() => setMenu(m => !m)} className={t.avatarBtn} aria-expanded={menu} aria-label="Menu akun">
                  <Avatar />
                  <span className="max-w-[110px] truncate text-sm font-semibold">{user.name}</span>
                  <ChevronDown size={16} className="text-text-muted" />
                </button>
                <AnimatePresence>
                  {menu ? (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className={t.drop}>
                      <div className="border-b border-menu-border p-4">
                        <p className="truncate text-sm font-bold text-text">{user.name}</p>
                        <p className="truncate text-xs text-text-muted">{user.email}</p>
                        {roleLabel ? <span className={t.role + " mt-2"}>{roleLabel}</span> : null}
                      </div>
                      {storeItem ? <button type="button" className={t.dropItem} onClick={() => go(storeItem.name)}><Store size={16} />{storeItem.label}</button> : null}
                      <button type="button" className={t.dropItem} onClick={logout}><LogOut size={16} />Keluar</button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (loginPage ? (
              <button type="button" onClick={goLogin} className={t.pill}><LogIn size={16} />{loginPage.title || "Masuk"}</button>
            ) : null)}
          </nav>

          <div className="ms-auto flex items-center gap-1 md:hidden">
            <button type="button" onClick={() => setSearchOpen(o => !o)} className={t.iconBtn} aria-label="Cari" aria-expanded={searchOpen}>
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {!isLoggedIn && loginPage ? (
              <button type="button" onClick={goLogin} className={t.pill}>{loginPage.title || "Masuk"}</button>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {searchOpen ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-border bg-surface md:hidden">
              <div className="p-3"><SearchField inputRef={searchRef} /></div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className={t.footer}>
        <div className="h-2 w-full opacity-70" style={ribbon} aria-hidden="true" />
        <div className={t.fWrap}>
          <div className="md:col-span-6">
            <p className="text-2xl font-extrabold tracking-tight text-sidebar-text-active">{title}<span className="text-primary">.</span></p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">Pasar daring dengan penjual yang disetujui admin, produk yang dimoderasi, serta pulsa, token listrik, dan tagihan dalam satu tempat.</p>
            <span className={t.seal + " mt-5"}><BadgeCheck size={16} className="text-primary" />Penjual terverifikasi admin</span>
          </div>
          <div className="md:col-span-3">
            <p className={t.fEyebrow}>Jelajahi</p>
            <ul className="flex flex-col gap-3">
              {visible.map(i => (
                <li key={i.name}><button type="button" onClick={() => go(i.name)} className={t.fLink}>{i.label}</button></li>
              ))}
              {!isLoggedIn && loginPage ? <li><button type="button" onClick={goLogin} className={t.fLink}>{loginPage.title || "Masuk"}</button></li> : null}
            </ul>
          </div>
          {multiLang ? (
            <div className="md:col-span-3">
              <p className={t.fEyebrow}>Bahasa</p>
              <Langs />
            </div>
          ) : null}
        </div>
        <div className={t.fBottom}>
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6 py-5 text-xs">
            <span>© {new Date().getFullYear()} {title}</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Belanja aman, penjual terverifikasi</span>
          </div>
        </div>
      </footer>

      <nav className={t.tabbar} aria-label="Navigasi bawah">
        {tabs.map(tab => {
          const Ico = tab.icon;
          return (
            <button key={tab.key} type="button" onClick={tab.run} className={tab.on ? t.tabOn : t.tab} aria-current={tab.on ? "page" : undefined}>
              {tab.on ? <span className={t.tabBar} /> : null}
              <Ico size={22} />
              <span className="max-w-full truncate px-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {sheet ? (
          <React.Fragment>
            <motion.div key="bd" className={t.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div key="sh" className={t.sheet} role="dialog" aria-modal="true" aria-label="Akun" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.25 }}>
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
              <div className="mb-4 flex items-center justify-between gap-3">
                {isLoggedIn && user ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar />
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-text">{user.name}</p>
                      <p className="truncate text-xs text-text-muted">{user.email}</p>
                      {roleLabel ? <span className={t.role + " mt-1"}>{roleLabel}</span> : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-extrabold tracking-tight text-text">{title}</p>
                )}
                <button type="button" onClick={() => setSheet(false)} className={t.iconBtn} aria-label="Tutup"><X size={20} /></button>
              </div>
              <div className="flex flex-col gap-1">
                {visible.map(i => (
                  <button key={i.name} type="button" onClick={() => go(i.name)} className={currentPage === i.name ? t.sheetItemOn : t.sheetItem}>
                    {i.label}<ChevronRight size={18} className={dir === "rtl" ? "rotate-180" : ""} />
                  </button>
                ))}
              </div>
              {!isLoggedIn && loginPage ? (
                <button type="button" onClick={goLogin} className={t.pill + " mt-4 w-full min-h-12"}><LogIn size={18} />{loginPage.title || "Masuk"}</button>
              ) : null}
              {isLoggedIn ? (
                <button type="button" onClick={logout} className={t.sheetItem + " mt-3 text-error-text"}>Keluar<LogOut size={18} /></button>
              ) : null}
              {multiLang ? <div className="mt-5"><Langs /></div> : null}
            </motion.div>
          </React.Fragment>
        ) : null}
      </AnimatePresence>
    </div>
  );
}