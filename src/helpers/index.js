export function loadScript(src) {
  return new Promise((res, rej) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const scr = document.createElement("script");
      scr.src = src;
      document.body.appendChild(scr);
      scr.onload = () => res(true);
      scr.onerror = () => rej(true);
    } else {
      res(true);
    }
  });
}
