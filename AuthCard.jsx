/* @yb-template AuthCard v2 id – from the YeshBe component library. This copy is the app's own: change it freely. */
function AuthCard({
  initialMode = "signin",
  showName = true,
  showPhone = false,
  phoneRequired = false,
  termsUrl,
  extraFields = [],
  minPassword = 8,
  background = "gradient",
  image,
  forgotPage,
  afterLogin,
  afterRegister,
  labels = {},
}) {
  const L = Object.assign({
    /* ★ id – this copy's own words; labels={{ … }} still overrides any of them */
    modes: "Masuk atau buat akun",
    tabSignIn: "Masuk",
    tabSignUp: "Buat akun",
    signInTitle: "Selamat datang kembali",
    signInSub: "Masuk ke akun Anda untuk melanjutkan.",
    signUpTitle: "Buat akun Anda",
    signUpSub: "Hanya perlu satu menit.",
    name: "Nama lengkap",
    namePh: "Siti Rahayu",
    email: "Email",
    emailPh: "you@example.com",
    password: "Kata sandi",
    passwordPh: "Kata sandi Anda",
    newPasswordPh: "Minimal {n} karakter",
    phone: "Telepon",
    phonePh: "",
    show: "Tampilkan kata sandi",
    hide: "Sembunyikan kata sandi",
    signIn: "Masuk",
    signingIn: "Sedang masuk…",
    create: "Buat akun",
    creating: "Membuat akun…",
    forgot: "Lupa kata sandi?",
    noAccount: "Belum punya akun?",
    register: "Buat akun",
    haveAccount: "Sudah punya akun?",
    toSignIn: "Masuk",
    required: "Wajib diisi",
    badEmail: "Masukkan alamat email yang valid",
    tooShort: "Gunakan minimal {n} karakter",
    badPhone: "Masukkan nomor telepon yang valid",
    agree: "Saya menyetujui",
    terms: "syarat dan ketentuan",
    mustAgree: "Setujui syarat dan ketentuan untuk melanjutkan",
    failed: "Gagal masuk. Periksa email dan kata sandi Anda.",
    registerFailed: "Kami tidak dapat membuat akun Anda. Silakan coba lagi.",
    weak: "Lemah",
    fair: "Cukup",
    good: "Baik",
    strong: "Kuat",
    strengthHint: "Gabungkan huruf besar dan kecil, angka, serta simbol agar kata sandi lebih kuat.",
    select: "Pilih…",
    optional: "opsional",
    forgotTitle: "Reset kata sandi Anda",
    forgotSub: "Masukkan email akun Anda dan kami akan mengirimkan tautan untuk membuat kata sandi baru.",
    sendLink: "Kirim tautan reset",
    sending: "Mengirim…",
    back: "Kembali ke halaman masuk",
    sentTitle: "Periksa kotak masuk Anda",
    sentSub: "Jika ada akun untuk {email}, tautan reset sedang dikirim. Mungkin perlu waktu sekitar satu menit hingga tiba.",
  }, labels);

  const app = typeof schema !== "undefined" && schema ? schema : {};
  const rtl = (typeof dir !== "undefined" && dir === "rtl") || (typeof document !== "undefined" && document.documentElement.dir === "rtl");
  const Social = typeof SocialLoginButtons !== "undefined" ? SocialLoginButtons : null;
  const socialErr = typeof authError !== "undefined" ? authError : null;
  const qp = typeof queryParams !== "undefined" && queryParams ? queryParams : {};
  const rp = typeof routeParams !== "undefined" && routeParams ? routeParams : {};
  /* ?mode=signup (or a "mode" route param) opens the sign-up side – e.g. from a "Start free trial" button */
  const urlMode = qp.mode || rp.mode;
  const startMode = urlMode === "signup" || urlMode === "signin" ? urlMode : initialMode === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState(startMode);
  const [step, setStep] = useState("form"); /* form | forgot | sent */
  const [anim, setAnim] = useState(""); /* "" on first paint – nothing animates on load */
  const [form, setForm] = useState(() => {
    const init = { name: "", email: "", password: "", phone: "", terms: false };
    (extraFields || []).forEach((f) => { init["x_" + f.key] = f.type === "checkbox" ? false : ""; });
    return init;
  });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const registered = useRef(""); /* the email already registered – a retry after a failed sign-in skips sdk.register */
  const tabRefs = useRef({});
  useEffect(() => () => { alive.current = false; }, []);

  const signup = mode === "signup";
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const fill = (s) => String(s).replace("{n}", minPassword);
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const strength = (p) => {
    if (!p) return 0;
    if (p.length < minPassword) return 1;
    let s = 1;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (p.length >= Math.max(12, minPassword + 4)) s++;
    return Math.min(4, s);
  };
  const score = strength(form.password);

  /* errors in on-screen order – the first one gets focus on submit */
  const blank = (v) => v == null || (typeof v === "string" && !v.trim()) || v === false;
  const errs = {};
  if (step === "form" && signup && showName && !form.name.trim()) errs.name = L.required;
  if (!form.email.trim()) errs.email = L.required;
  else if (!emailRe.test(form.email.trim())) errs.email = L.badEmail;
  if (step === "form") {
    if (signup && showPhone) {
      if (phoneRequired && !form.phone.trim()) errs.phone = L.required;
      else if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 6) errs.phone = L.badPhone;
    }
    if (!form.password) errs.password = L.required;
    else if (signup && form.password.length < minPassword) errs.password = fill(L.tooShort);
    if (signup) {
      (extraFields || []).forEach((f) => {
        const v = form["x_" + f.key];
        if (f.required && blank(v)) errs["x_" + f.key] = L.required;
        else if (f.type === "email" && v && !emailRe.test(v)) errs["x_" + f.key] = L.badEmail;
      });
      if (termsUrl && !form.terms) errs.terms = L.mustAgree;
    }
  }
  const show = (k) => (tried || touched[k]) && errs[k];

  function reset() { setError(""); setTried(false); setTouched({}); }
  function switchMode(next) {
    if (next === mode || busy) return;
    /* the form slides in from the side of the tab that was picked (mirrored in RTL) */
    const forward = next === "signup";
    setAnim(forward !== rtl ? "yb-auth-from-end" : "yb-auth-from-start");
    reset(); setStep("form"); setMode(next);
  }
  function go(next) { reset(); setAnim("yb-auth-step"); setStep(next); }
  function onTabKey(e) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? "signin" : e.key === "End" ? "signup" : signup ? "signin" : "signup";
    switchMode(next);
    const el = tabRefs.current[next];
    if (el && el.focus) el.focus();
  }

  function focusFirst() {
    const first = Object.keys(errs)[0];
    const el = first && typeof document !== "undefined" && document.getElementById("yb-auth-" + first);
    if (el && el.focus) el.focus();
  }

  async function onSubmit(e) {
    e.preventDefault();
    setTried(true); setError("");
    if (Object.keys(errs).length) { focusFirst(); return; }
    setBusy(true);
    const email = form.email.trim();
    try {
      if (signup) {
        const profile = {};
        if (showName) profile.name = form.name.trim();
        if (showPhone && form.phone.trim()) profile.phone = form.phone.trim();
        (extraFields || []).forEach((f) => {
          let v = form["x_" + f.key];
          if (f.type === "number" && v !== "") v = Number(v);
          if (v !== "" && v != null) profile[f.key] = v;
        });
        if (registered.current !== email) { await sdk.register(email, form.password, profile); registered.current = email; }
      }
      /* sign in through the engine so it knows the user – it routes home by itself */
      const res = await handleLogin(email, form.password);
      if (res === false) throw new Error(signup ? L.registerFailed : L.failed);
      const after = signup ? afterRegister || afterLogin : afterLogin;
      if (after) navigateTo(after);
    } catch (e2) {
      if (alive.current) setError((e2 && e2.message) || (signup ? L.registerFailed : L.failed));
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  async function onForgot(e) {
    e.preventDefault();
    setTried(true); setError("");
    if (errs.email) { focusFirst(); return; }
    setBusy(true);
    /* never reveal whether the address has an account – the "sent" state shows either way */
    try { await sdk.forgotPassword(form.email.trim()); } catch (e2) { /* swallowed on purpose */ }
    if (!alive.current) return;
    setBusy(false); go("sent");
  }

  /* ---------- render helpers (plain functions, not components – keeps input focus) ---------- */
  const mark = (cls0) => {
    const ic = app.icon;
    const cls = "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-semibold " + cls0;
    if (ic && /^(https?:|\/|data:)/.test(String(ic))) return <img src={ic} alt="" className={cls + " object-cover"} />;
    const txt = ic && String(ic).length <= 4 ? ic : ((app.title || "").trim()[0] || "•").toUpperCase();
    return <span className={cls}>{txt}</span>;
  };

  const ring = (err) => (err ? "border-error focus:ring-error/15" : "border-border focus:border-primary focus:ring-primary/15");
  const base = "w-full rounded-xl border bg-surface text-[15px] text-text shadow-sm transition placeholder:text-text-muted focus:outline-none focus:ring-4 ";
  const errLine = (id, err) => err ? <p id={id + "-err"} className="flex items-center gap-1 text-xs text-error"><AlertCircle size={13} className="shrink-0" />{err}</p> : null;

  const input = ({ k, label, type = "text", icon, auto, ph, end, req = true, extra, after }) => {
    const id = "yb-auth-" + k; const err = show(k);
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-text">
            {label}{!req && <span className="ms-1 font-normal text-text-muted">({L.optional})</span>}
          </label>
          {extra}
        </div>
        <div className="relative">
          {icon && <span className="pointer-events-none absolute inset-y-0 start-0 flex w-10 items-center justify-center text-text-muted">{icon}</span>}
          <input id={id} type={type} value={form[k]} placeholder={ph} autoComplete={auto}
                 inputMode={type === "email" ? "email" : type === "tel" ? "tel" : undefined}
                 onChange={(e) => set(k)(e.target.value)} onBlur={touch(k)}
                 aria-invalid={!!err} aria-describedby={err ? id + "-err" : undefined}
                 className={base + "h-11 " + (icon ? "ps-10 " : "ps-3 ") + (end ? "pe-11 " : "pe-3 ") + ring(err)} />
          {end}
        </div>
        {after}
        {errLine(id, err)}
      </div>
    );
  };

  const extraInput = (f) => {
    const k = "x_" + f.key; const id = "yb-auth-" + k; const err = show(k);
    const common = { id, onBlur: touch(k), "aria-invalid": !!err, "aria-describedby": err ? id + "-err" : undefined };
    let control;
    if (f.type === "checkbox") {
      return (
        <div key={k} className="flex flex-col gap-1">
          <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-text">
            <input type="checkbox" {...common} checked={!!form[k]} onChange={(e) => set(k)(e.target.checked)}
                   className="h-[18px] w-[18px] shrink-0 rounded accent-[var(--primary)]" />
            <span>{f.text || f.label}{f.required && <span className="text-error"> *</span>}</span>
          </label>
          {errLine(id, err)}
        </div>
      );
    }
    if (f.type === "textarea") {
      control = <textarea rows={3} {...common} value={form[k]} placeholder={f.placeholder} onChange={(e) => set(k)(e.target.value)} className={base + "px-3 py-2.5 " + ring(err)} />;
    } else if (f.type === "select") {
      control = (
        <div className="relative">
          <select {...common} value={form[k]} onChange={(e) => set(k)(e.target.value)} className={base + "h-11 appearance-none ps-3 pe-10 " + ring(err)}>
            <option value="">{f.placeholder || L.select}</option>
            {(f.options || []).map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
      );
    } else {
      control = <input type={f.type || "text"} {...common} value={form[k]} placeholder={f.placeholder} onChange={(e) => set(k)(e.target.value)} className={base + "h-11 px-3 " + ring(err)} />;
    }
    return (
      <div key={k} className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-text">
          {f.label}{!f.required && <span className="ms-1 font-normal text-text-muted">({L.optional})</span>}
        </label>
        {control}
        {errLine(id, err)}
      </div>
    );
  };

  const eye = (
    <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? L.hide : L.show} aria-pressed={showPw}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-xl text-text-muted transition hover:text-text">
      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  const levels = [null, { t: L.weak, c: "text-error" }, { t: L.fair, c: "text-warning" }, { t: L.good, c: "text-success" }, { t: L.strong, c: "text-success" }];
  const meter = signup && form.password ? (
    <div className="mt-1" aria-live="polite">
      <div className={"flex gap-1.5 " + levels[score].c}>
        {[1, 2, 3, 4].map((i) => <span key={i} className={"h-1 flex-1 rounded-full transition-colors duration-300 " + (i <= score ? "bg-current" : "bg-surface-2")} />)}
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
        <span className="text-text-muted">{score < 3 ? L.strengthHint : ""}</span>
        <span className={"shrink-0 font-medium " + levels[score].c}>{levels[score].t}</span>
      </div>
    </div>
  ) : null;

  const submit = (text, busyText) => (
    <button type="submit" disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-medium text-primary-text shadow-sm shadow-primary/20 transition hover:bg-primary-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70">
      {busy && <Loader2 size={17} className="animate-spin" />}
      {busy ? busyText : text}
    </button>
  );

  const banner = (msg) => msg ? (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-light px-3.5 py-3 text-sm text-error-text">
      <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{msg}</span>
    </div>
  ) : null;

  const head = (title, sub, center) => (
    <div className={"mb-5 " + (center ? "text-center" : "")}>
      <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{title}</h1>
      {sub && <p className="mt-1.5 text-sm leading-relaxed text-text-secondary sm:text-[15px]">{sub}</p>}
    </div>
  );

  const Back = rtl ? ChevronRight : ChevronLeft;
  const backLink = (
    <button type="button" onClick={() => go("form")}
            className="mx-auto mt-5 flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-medium text-text-secondary transition hover:text-text">
      <Back size={16} />{L.back}
    </button>
  );

  const tabs = (
    <div role="tablist" aria-label={L.modes} onKeyDown={onTabKey} className="relative mb-6 grid grid-cols-2 rounded-xl bg-surface-2 p-1">
      <span aria-hidden="true"
            className="yb-auth-pill absolute inset-y-1 start-1 w-[calc(50%-4px)] rounded-[10px] bg-surface shadow-sm ring-1 ring-border/70"
            style={{ transform: signup ? "translateX(" + (rtl ? "-100%" : "100%") + ")" : "translateX(0)" }} />
      {["signin", "signup"].map((m) => {
        const on = mode === m;
        return (
          <button key={m} type="button" role="tab" id={"yb-auth-tab-" + m} aria-selected={on} aria-controls="yb-auth-panel"
                  tabIndex={on ? 0 : -1} ref={(el) => { tabRefs.current[m] = el; }} onClick={() => switchMode(m)}
                  className={"relative z-10 min-h-[40px] rounded-[10px] px-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 " +
                             (on ? "text-text" : "text-text-secondary hover:text-text")}>
            {m === "signin" ? L.tabSignIn : L.tabSignUp}
          </button>
        );
      })}
    </div>
  );

  /* ---------- steps ---------- */
  let body;
  if (step === "sent") {
    body = (
      <div key="sent" className={"text-center " + anim}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary"><Mail size={26} /></div>
        <h1 className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{L.sentTitle}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {L.sentSub.split("{email}").map((part, i, arr) => (
            <React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="font-medium text-text">{form.email.trim()}</span>}</React.Fragment>
          ))}
        </p>
        {backLink}
      </div>
    );
  } else if (step === "forgot") {
    body = (
      <form key="forgot" onSubmit={onForgot} noValidate className={anim}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary"><Lock size={22} /></div>
        {head(L.forgotTitle, L.forgotSub, true)}
        <div className="flex flex-col gap-4">
          {banner(error)}
          {input({ k: "email", label: L.email, type: "email", icon: <Mail size={17} />, auto: "email", ph: L.emailPh })}
          {submit(L.sendLink, L.sending)}
        </div>
        {backLink}
      </form>
    );
  } else {
    body = (
      <div key="form">
        {tabs}
        <div key={mode} id="yb-auth-panel" role="tabpanel" aria-labelledby={"yb-auth-tab-" + mode} className={anim}>
          <form onSubmit={onSubmit} noValidate>
            {signup ? head(L.signUpTitle, L.signUpSub) : head(L.signInTitle, L.signInSub)}
            <div className="flex flex-col gap-3.5">
              {banner(error || socialErr)}
              {signup && showName && input({ k: "name", label: L.name, icon: <User size={17} />, auto: "name", ph: L.namePh })}
              {input({ k: "email", label: L.email, type: "email", icon: <Mail size={17} />, auto: "email", ph: L.emailPh })}
              {signup && showPhone && input({ k: "phone", label: L.phone, type: "tel", icon: <Phone size={17} />, auto: "tel", ph: L.phonePh, req: phoneRequired })}
              {input({
                k: "password", label: L.password, type: showPw ? "text" : "password", icon: <Lock size={17} />,
                auto: signup ? "new-password" : "current-password", ph: signup ? fill(L.newPasswordPh) : L.passwordPh, end: eye, after: meter,
                extra: signup ? null : (
                  <button type="button" onClick={() => (forgotPage ? navigateTo(forgotPage) : go("forgot"))}
                          className="-my-2 rounded-md py-2 text-sm font-medium text-primary transition hover:opacity-80">{L.forgot}</button>
                ),
              })}
              {signup && (extraFields || []).map(extraInput)}
              {signup && termsUrl && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="yb-auth-terms" className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-text-secondary">
                    <input id="yb-auth-terms" type="checkbox" checked={form.terms} onChange={(e) => set("terms")(e.target.checked)}
                           aria-invalid={!!show("terms")} aria-describedby={show("terms") ? "yb-auth-terms-err" : undefined}
                           className="h-[18px] w-[18px] shrink-0 rounded accent-[var(--primary)]" />
                    <span>
                      {L.agree}{" "}
                      <a href={termsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                         className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary">{L.terms}</a>
                    </span>
                  </label>
                  {errLine("yb-auth-terms", show("terms"))}
                </div>
              )}
              <div className="pt-1">{signup ? submit(L.create, L.creating) : submit(L.signIn, L.signingIn)}</div>
            </div>
          </form>
        </div>
        {Social && <div className="mt-5"><Social /></div>}
        <p className="mt-6 text-center text-sm text-text-secondary">
          {signup ? L.haveAccount : L.noAccount}{" "}
          <button type="button" onClick={() => switchMode(signup ? "signin" : "signup")}
                  className="inline-flex min-h-[32px] items-center font-medium text-primary transition hover:opacity-80">
            {signup ? L.toSignIn : L.register}
          </button>
        </p>
      </div>
    );
  }

  const css = (
    <style>{`
      .yb-auth-pill{transition:transform .38s cubic-bezier(.3,1.25,.4,1)}
      .yb-auth-from-end{animation:yb-auth-from-end .34s cubic-bezier(.2,.8,.2,1)}
      .yb-auth-from-start{animation:yb-auth-from-start .34s cubic-bezier(.2,.8,.2,1)}
      .yb-auth-step{animation:yb-auth-step .34s cubic-bezier(.2,.8,.2,1)}
      @keyframes yb-auth-from-end{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
      @keyframes yb-auth-from-start{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
      @keyframes yb-auth-step{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      .yb-auth-float{animation:yb-auth-float 18s ease-in-out infinite}
      @keyframes yb-auth-float{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(6%,8%,0) scale(1.1)}}
      @media (prefers-reduced-motion: reduce){.yb-auth-pill{transition:none}.yb-auth-from-end,.yb-auth-from-start,.yb-auth-step,.yb-auth-float{animation:none}}
    `}</style>
  );

  const photo = background === "image" && image;
  const bg = photo ? (
    <>
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
    </>
  ) : background === "plain" ? null : (
    <>
      <div aria-hidden="true" className="yb-auth-float pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[440px] w-[min(720px,140vw)] rounded-full bg-gradient-to-br from-primary to-accent opacity-[0.16] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-text opacity-[0.06]"
           style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1.2px)", backgroundSize: "24px 24px",
                    WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 0%, transparent 70%)", maskImage: "radial-gradient(ellipse at 50% 0%, #000 0%, transparent 70%)" }} />
    </>
  );

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-14">
      {css}
      {bg}
      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center gap-2.5">
          {mark("h-11 w-11 bg-gradient-to-br from-primary to-accent text-lg text-primary-text shadow-lg shadow-primary/25")}
          {app.title && <span className={"text-sm font-medium " + (photo ? "text-white/90" : "text-text-secondary")}>{app.title}</span>}
        </div>
        <div className={"rounded-3xl border border-border bg-surface p-5 sm:p-8 " + (photo ? "shadow-2xl shadow-black/40" : "shadow-xl shadow-black/5")}>
          {body}
        </div>
      </div>
    </div>
  );
}
