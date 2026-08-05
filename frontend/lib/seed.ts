import type { Board, Card } from "./types";

type SeedCard = { title: string; details: string };

const seedColumns: { title: string; cards: SeedCard[] }[] = [
  {
    title: "Backlog",
    cards: [
      {
        title: "Define product vision",
        details: "Draft a one-page vision statement and share with stakeholders for feedback.",
      },
      {
        title: "Competitive research",
        details: "Review three competing products and summarise strengths and gaps.",
      },
      {
        title: "Set up analytics",
        details: "Decide on key metrics to track for the first release.",
      },
    ],
  },
  {
    title: "To Do",
    cards: [
      {
        title: "Design board layout",
        details: "Create wireframes for the five-column board and card interactions.",
      },
      {
        title: "Pick colour palette",
        details: "Finalise the brand palette and apply it across the interface.",
      },
    ],
  },
  {
    title: "In Progress",
    cards: [
      {
        title: "Build drag and drop",
        details: "Implement smooth card movement between columns with keyboard support.",
      },
      {
        title: "Card composer",
        details: "Inline form to add a new card with a title and details.",
      },
    ],
  },
  {
    title: "Review",
    cards: [
      {
        title: "Accessibility pass",
        details: "Check colour contrast, focus states and keyboard navigation.",
      },
    ],
  },
  {
    title: "Done",
    cards: [
      {
        title: "Project scaffolding",
        details: "Next.js app created with Tailwind, testing and tooling configured.",
      },
      {
        title: "Repository setup",
        details: "Initialised the repo with a sensible .gitignore.",
      },
    ],
  },
];

export function createSeedBoard(): Board {
  const cards: Record<string, Card> = {};
  const columns = seedColumns.map((col, colIndex) => {
    const cardIds = col.cards.map((c, cardIndex) => {
      const id = `seed-${colIndex}-${cardIndex}`;
      cards[id] = { id, title: c.title, details: c.details };
      return id;
    });
    return { id: `col-${colIndex}`, title: col.title, cardIds };
  });
  return { columns, cards };
}
