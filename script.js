(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Тема ---------- */
  var toggle = document.querySelector('[data-theme-toggle]');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncMeta(theme) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', theme === 'dark' ? '#1E201B' : '#F6F1E7');
  }
  syncMeta(currentTheme());
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncMeta(next);
    });
  }

  /* ---------- Меню на телефоне ---------- */
  var burger = document.querySelector('[data-burger]');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Появление блоков (IntersectionObserver) ---------- */
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Форма (демо, ничего не отправляет) ---------- */
  var form = document.getElementById('lead-form');
  if (!form) return;

  var nameInput = form.elements.name;
  var contactInput = form.elements.contact;
  var nameErr = document.getElementById('e-name');
  var contactErr = document.getElementById('e-contact');
  var success = document.getElementById('success');

  function setError(input, box, msg) {
    box.textContent = msg;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validName() {
    var v = nameInput.value.trim();
    if (!v) return 'Укажите, как к вам обращаться.';
    if (v.length < 2) return 'Имя слишком короткое.';
    return '';
  }

  function validContact() {
    var v = contactInput.value.trim();
    if (!v) return 'Оставьте Telegram или телефон, чтобы я могла вам ответить.';
    var tg = /^(?:@|https?:\/\/t\.me\/|t\.me\/)[A-Za-z0-9_]{5,32}$/.test(v);
    var digits = v.replace(/\D/g, '');
    var phone = /^[+\d][\d\s().-]{9,}$/.test(v) && digits.length >= 10 && digits.length <= 15;
    if (!tg && !phone) return 'Не получилось распознать контакт. Telegram в виде @имя или телефон с кодом, например +7 900 000-00-00.';
    return '';
  }

  nameInput.addEventListener('blur', function () { setError(nameInput, nameErr, validName()); });
  contactInput.addEventListener('blur', function () { setError(contactInput, contactErr, validContact()); });
  nameInput.addEventListener('input', function () { if (nameErr.textContent) setError(nameInput, nameErr, validName()); });
  contactInput.addEventListener('input', function () { if (contactErr.textContent) setError(contactInput, contactErr, validContact()); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var en = validName();
    var ec = validContact();
    setError(nameInput, nameErr, en);
    setError(contactInput, contactErr, ec);
    if (en) { nameInput.focus(); return; }
    if (ec) { contactInput.focus(); return; }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Отправляем';
    // демо: имитация отправки, данные никуда не уходят
    window.setTimeout(function () {
      form.hidden = true;
      success.hidden = false;
      success.focus();
    }, 600);
  });
})();
