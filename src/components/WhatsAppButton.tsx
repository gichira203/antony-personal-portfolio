"use client";

export function WhatsAppButton() {
  // WhatsApp click-to-chat uses international format without the leading + or 00.
  // Kenya country code is 254, so 0726 815 333 becomes 254726815333.
  const whatsappLink = "https://wa.me/254726815333";

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with antoh on WhatsApp (0726 815 333)"
      title="Chat on WhatsApp"
      className="fixed left-4 bottom-4 z-[60] w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2"
    >
      <i className="bi bi-whatsapp text-[22px] leading-none" aria-hidden="true" />
    </a>
  );
}
