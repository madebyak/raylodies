import { Instagram, Linkedin, Twitter } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/raylodies/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/in/ranya-hamawandy-2bb4011b3",
    label: "LinkedIn",
    icon: Linkedin,
  },
  { href: "https://x.com/rno_jay", label: "X", icon: Twitter },
] as const;
