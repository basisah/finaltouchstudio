/**
 * Static content for the landing page. Copy and imagery live here so the
 * section components stay purely presentational.
 */
import birthdayStage from "../assets/Category/Birthday_stage.jpg";
import marriageStage from "../assets/Category/Marriage_Stage.jpg";
import proposalStage from "../assets/Category/Proposal_Stage.jpg";
import galleryBirthday from "../assets/images/gallery_birthday.jpg";
import galleryHolud from "../assets/images/gallery_holud.jpg";
import galleryWedding from "../assets/images/gallery_wedding.jpg";

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

/** Cover photo per occasion, used when a category has no uploaded image. */
export const OCCASION_IMAGES = {
  birthday: birthdayStage,
  proposal: proposalStage,
  marriage: marriageStage,
  holud: galleryHolud,
  baby: unsplash("1768776183122-95c7d3adbf3e"),
  "baby-shower": unsplash("1768776183122-95c7d3adbf3e"),
  "bridal-shower": unsplash("1767070806009-152054f6edd5"),
  corporate: unsplash("1759873148521-c49d9497cf64"),
};

export const DEFAULT_OCCASION_IMAGE = marriageStage;

export const HOW_IT_WORKS = [
  {
    title: "Choose your pieces",
    text: "Browse by occasion or start from a styled package, then pick the arches, florals, lighting and tableware you love.",
  },
  {
    title: "Pick your dates",
    text: "Live availability shows what is free for your pickup and return dates, so there are no surprises later.",
  },
  {
    title: "Collect or have it delivered",
    text: "Pick up from our Saskatoon studio for free, or let our crew deliver to your venue anywhere in the city.",
  },
];

export const GALLERY = [
  { title: "Holud night", tag: "Holud", image: galleryHolud },
  { title: "Garden ceremony", tag: "Wedding", image: galleryWedding },
  { title: "Milestone birthday", tag: "Birthday", image: galleryBirthday },
  { title: "Reception tables", tag: "Reception", image: unsplash("1723832348105-2e69f948135a") },
  { title: "Bridal shower", tag: "Bridal shower", image: unsplash("1767070806009-152054f6edd5") },
  { title: "Sunset proposal", tag: "Proposal", image: unsplash("1763129636830-dd487ed1b5a8") },
];

export const TESTIMONIALS = [
  {
    quote:
      "FinalTouch transformed our reception stage into an absolute fairytale. The floral arch was gorgeous and the team was incredibly professional and detailed.",
    author: "Sarah M.",
    role: "Bride",
  },
  {
    quote:
      "We ordered the proposal package and everything was set up perfectly. The fairy lights, custom signs and staging made our moment truly unforgettable.",
    author: "David K.",
    role: "Groom",
  },
  {
    quote:
      "The balloon wall and stage setup were a massive hit at my daughter's birthday. The process was stress-free and the design was stunning.",
    author: "Aaliyah R.",
    role: "Host",
  },
];
