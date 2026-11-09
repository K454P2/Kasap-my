/*  ★ The site's menu – its order and its labels, in every language.
      Change a label or move a line: the header, the mobile menu and the footer follow.
      A page that isn't listed still shows (at the end), so a new page is never lost.
      hidden: true keeps a page out of the menu.                                        */
function navigation(pages, lang) {
  const menu = [
    { page: "Home", label: { "id": "Beranda" } },
    { page: "MyStore", label: { "id": "Toko Saya" } },
  ];

  const mine = (pages || []).filter(p => p && p.lang === lang && p.type !== "login" &&
                                     p.type !== "register" && p.name !== "AdminLogin");
  const item = (p, label) => ({ name: p.name, route: p.route, label: label || p.title || p.name,
                                auth: !!p.auth, home: !!p.home });
  const out = [];
  menu.forEach(m => {
    const p = mine.find(x => x.name === m.page);
    if (p && !m.hidden) out.push(item(p, m.label && m.label[lang]));
  });
  mine.forEach(p => { if (!menu.some(m => m.page === p.name)) out.push(item(p)); });
  return out;
}
