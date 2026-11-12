import { coupleImgs, kidImgs } from "@/lib/avatars";

export type Member = {
  id: string;
  name: string;
  spouse?: string | undefined;
  relation: string;
  img?: string | undefined;
  children: Member[];
};


const couples: [string, string, string][] = [
  ["Sabita Sharma", "Dilip Sharma", "Moushi"],
  ["Sanju Sharma", "Vijay Sharma", "Moushi"],
  ["Manju Sharma", "Rajesh Sharma", "Moushi"],
  ["Ranju Sharma", "Sanjay Sharma", "Moushi"],
  ["Punom Sharma", "Shivander Sharma", "Moushi"],
  ["Putul Sharma", "Dharmendhar Sharma", "Moushi"],
  ["Shandya Sharma", "Mishikant Sharma", "Moushi"],
  ["Bikesh Sharma", "Kunti Sharma", "Mama"],
  ["Mitlesh Sharma", "Asrita Sharma", "Mama"],
  ["Ritesh Sharma", "Nilu Sharma", "Mama"],
];

export const familyRoot: Member = {
  id: "root",
  name: "Nana",
  spouse: "Nani",
  relation: "Grandparents",
  children: couples.map(([a, b, r], i) => ({
    id: `g2-${i}`,
    name: a,
    spouse: b,
    relation: r,
    img: coupleImgs[`g2-${i}`],
    children:
      i === 5
        ? (["Aarav", "Myra", "Vihaan"] as const).map((kid, k) => ({
            id: `g2-5-kid-${k}`,
            name: `${kid} Sharma`,
            relation: "Child",
            img: kidImgs[kid],
            children: [],
          }))
        : [],
  })),
};

export const firstName = (n: string) => n.split(" ")[0] ?? "";
