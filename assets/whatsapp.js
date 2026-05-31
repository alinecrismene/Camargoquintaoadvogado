(function () {
  const WHATSAPP_NUMBER = "5527981153181";

  function normalizeWaLinks() {
    document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        const text = url.searchParams.get("text");
        link.href = text
          ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
          : `https://wa.me/${WHATSAPP_NUMBER}`;
      } catch {
        link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
      }
    });
  }

  window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
  window.buildWaLink = function (text) {
    const msg = encodeURIComponent(String(text || "").trim());
    return msg
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
      : `https://wa.me/${WHATSAPP_NUMBER}`;
  };

  normalizeWaLinks();
})();
