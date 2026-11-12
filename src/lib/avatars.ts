import nanaImg from "@/assets/avatars/nana.png";
import naniImg from "@/assets/avatars/nani.png";
import coupleSabitaDilip from "@/assets/avatars/couple-sabita-dilip.png";
import coupleSanjuVijay from "@/assets/avatars/couple-sanju-vijay.png";
import coupleManjuRajesh from "@/assets/avatars/couple-manju-rajesh.png";
import coupleRanjuSanjay from "@/assets/avatars/couple-ranju-sanjay.png";
import couplePunomShivander from "@/assets/avatars/couple-punom-shivander.png";
import couplePutulDharmendhar from "@/assets/avatars/couple-putul-dharmendhar.png";
import coupleShandyaMishikant from "@/assets/avatars/couple-shandya-mishikant.png";
import coupleBikeshKunti from "@/assets/avatars/couple-bikesh-kunti.png";
import coupleMitleshAsrita from "@/assets/avatars/couple-mitlesh-asrita.png";
import coupleRiteshNilu from "@/assets/avatars/couple-ritesh-nilu.png";
import kidAarav from "@/assets/avatars/kid-aarav.png";
import kidMyra from "@/assets/avatars/kid-myra.png";
import kidVihaan from "@/assets/avatars/kid-vihaan.png";

export { nanaImg, naniImg };

/** Couple avatars keyed by generation-2 member id. */
export const coupleImgs: Record<string, string> = {
  "g2-0": coupleSabitaDilip,
  "g2-1": coupleSanjuVijay,
  "g2-2": coupleManjuRajesh,
  "g2-3": coupleRanjuSanjay,
  "g2-4": couplePunomShivander,
  "g2-5": couplePutulDharmendhar,
  "g2-6": coupleShandyaMishikant,
  "g2-7": coupleBikeshKunti,
  "g2-8": coupleMitleshAsrita,
  "g2-9": coupleRiteshNilu,
};

/** Kid avatars keyed by first name. */
export const kidImgs: Record<string, string> = {
  Aarav: kidAarav,
  Myra: kidMyra,
  Vihaan: kidVihaan,
};
