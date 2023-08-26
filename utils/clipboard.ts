function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.display = "none";
  textArea.style.visibility = "none";
  textArea.style.width = "0px";
  textArea.style.height = "0px";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    window.navigator.clipboard.writeText(text);
  } catch {}

  document.body.removeChild(textArea);
}

export function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }

  navigator.clipboard.writeText(text).catch(() => {});
}
