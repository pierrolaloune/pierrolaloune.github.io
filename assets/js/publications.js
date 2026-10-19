/* ---- My publications ---------------------------------------------
   One entry per paper. Add a new one anywhere in the list: entries are
   sorted by date, so the most recent automatically becomes the
   "New paper" highlight on the home page and tops the Publications page.

   Fields (leave out any you don't have):
     date      "YYYY-MM-DD"  publication date, used for sorting
     title, authors, journal, volume
     doi       without https://doi.org/
     pdf       path to a file in /papers
     code      code repository (GitHub, Zenodo...)
     data      data archive
     image     featured image in /images
     summary   one or two sentences shown on the card
     scholar   your Google Scholar link for this paper; when absent the
               button runs a Google Scholar search on the exact title,
               which starts working as soon as Scholar indexes the paper.
   Papers listed here are hidden from the automatic ORCID list below them
   (matched by DOI), so nothing appears twice. */

window.PUBLICATIONS = [
  {
    date: "2026-10-19",
    title: "Human targeting of morphologically unique fishes amplifies the risk of functional erosion",
    authors: "<strong>Bouchet, P.</strong>, Brosse, S. &amp; Toussaint, A.",
    journal: "Nature Communications",
    volume: "17, 10697",
    doi: "10.1038/s41467-026-78568-9",
    pdf: "papers/Bouchet2026_NatCommun.pdf",
    code: "https://github.com/pierrolaloune/FishUsage",
    data: "https://doi.org/10.5281/zenodo.21873314",
    image: "images/pub_bouchet2026.jpg",
    imageAlt: "Freshwater fishes used by humans: fish markets and an aquarium",
    summary: "Humans use a quarter of freshwater fish species, and these species hold almost half of the global range of fish morphologies. Used species carry unique trait combinations that are often linked to threatened species, so losing them would erode the morphological spectrum in a non-random way."
  }
];
