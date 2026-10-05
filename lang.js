// 表示する言語を選ぶ（日本語・英語）。原本は非公開リポジトリにある。ここは直接編集しない
// 優先順: URL の #ja・#en（他のページからのリンク）> 切り替えボタンで選んだ言語 > ブラウザの言語 > 英語。
// <head> の最後で読み、本文を描く前に決める（ちらつかせない）。
// - 日英を 1 ページに持つページ（<html data-bilingual>）: [data-l] の要素のうち、選んだ言語のものだけを出す
// - 言語ごとに別のページ（ヘルプ）: 選んだ言語が違えば、<link rel="alternate" hreflang> のページへ移る
(function () {
  var KEY = "jotteo-lang";
  var root = document.documentElement;
  var bilingual = root.hasAttribute("data-bilingual");

  function load() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "ja" || v === "en" ? v : null;
    } catch (e) {
      return null;
    }
  }
  function save(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
  }
  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i]).toLowerCase();
      if (tag === "ja" || tag.indexOf("ja-") === 0) return "ja";
      if (tag === "en" || tag.indexOf("en-") === 0) return "en";
    }
    return "en";
  }
  function alternate(lang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    return link ? link.getAttribute("href") : null;
  }
  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.lang = lang;
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
  }

  var hash = location.hash === "#ja" || location.hash === "#en" ? location.hash.slice(1) : null;
  if (hash) {
    save(hash);
    // 見出しへ飛ばさずに先頭から見せる（#ja・#en は言語の指定として使った）。file:// などで
    // 書き換えられなくても、言語は決める
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) {}
  }
  var lang = hash || load() || fromBrowser();

  if (!bilingual && lang !== root.lang) {
    var href = alternate(lang);
    if (href) {
      location.replace(href + location.hash);
      return;
    }
  }
  if (bilingual) apply(lang);

  document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll("[data-switch-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (event) {
        var to = this.getAttribute("data-switch-lang");
        save(to);
        if (bilingual) {
          event.preventDefault();
          apply(to);
          // 押したボタンは隠れるので、キーボードの焦点をもう一方のボタンへ移す
          var other = document.querySelector('[data-switch-lang="' + (to === "ja" ? "en" : "ja") + '"]');
          if (other) other.focus();
          return;
        }
        var target = alternate(to);
        if (!target) return;
        // 同じ見出しのまま、もう一方の言語のページへ。見出しがなければ #ja・#en で言語を渡す
        // （localStorage が使えないと、移った先でブラウザの言語に戻ってしまう）
        target += location.hash || "#" + to;
        this.setAttribute("href", target);
        // 新しいタブ・ウィンドウで開く操作は、ブラウザに任せる
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        // 履歴に足さない（戻ると、覚えた言語でこちらへ移り直してしまう）
        event.preventDefault();
        location.replace(target);
      });
    }
  });
})();
