import type { Brand } from "@/components/world/BrandIcon";

export interface Social {
  id: "email" | Brand;
  label: string;
  handle: string;
  href: string;
}

export interface Fact {
  label: string;
  value: string;
  /** Shown with a dashed TODO tag until Angelo fills it in. */
  todo?: boolean;
}

export const PROFILE = {
  name: "Angelo Mouawad",
  firstName: "Angelo",
  lastName: "Mouawad",
  email: "angelo.mouawad@gmail.com",
  roles: ["Applied Computer Science student", "Freelance web designer"],

  about: {
    statement: "I'm Angelo. I study Applied Computer Science at UCLL in Leuven, on the AI track, and I design and build websites for people and companies on the side.",
    // TODO(angelo): this second line is my guess at how you'd put it. Rewrite it in your own words.
    detail: "I like the whole path from an idea to something people can open and use: the backend that holds it up, the model that makes it smart, and the interface that makes it feel good.",
    facts: [
      { label: "Studying", value: "Applied Computer Science" },
      { label: "School", value: "UCLL, Leuven" },
      { label: "Track", value: "Artificial Intelligence" },
      { label: "Also", value: "Freelance web designer" },
      { label: "Year", value: "Third year" },
      { label: "Based in", value: "Leuven, Belgium" },
      { label: "Languages", value: "English, French" },
    ] satisfies Fact[],
  },

  /** Shown as the last card in the facts grid. Replace the file in public/cv to update it. */
  cv: {
    href: "/cv/angelo-mouawad-cv.pdf",
    fileName: "Angelo Mouawad CV.pdf",
  },

  contact: {
    heading: "Let's build something.",
    lead: "Always open to collaboration, internships and interesting problems.",
  },

  socials: [
    { id: "email", label: "Email", handle: "angelo.mouawad@gmail.com", href: "mailto:angelo.mouawad@gmail.com" },
    { id: "linkedin", label: "LinkedIn", handle: "/in/angelo-mouawad", href: "https://www.linkedin.com/in/angelo-mouawad-02089329a/" },
    { id: "github", label: "GitHub", handle: "github.com/angelo-mouawad", href: "https://github.com/angelo-mouawad" },
    { id: "instagram", label: "Instagram", handle: "@angelomouawad", href: "https://www.instagram.com/angelomouawad" },
  ] satisfies Social[],
};
