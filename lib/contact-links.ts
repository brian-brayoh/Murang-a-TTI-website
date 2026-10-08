// Pure helpers (safe to import from client components)
/** "0748 108 000" -> "+254748108000" for tel: links */
export function telHref(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("254")) return "+" + d;
  if (d.startsWith("0")) return "+254" + d.slice(1);
  return d;
}

export function waHref(whatsapp: string, text?: string) {
  const n = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
