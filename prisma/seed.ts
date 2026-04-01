import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword && process.env.NODE_ENV === "production") {
    throw new Error("❌ ADMIN_PASSWORD must be set in production. Aborting seed.");
  }
  const password = adminPassword || "admin2027!";
  if (password.length < 8) {
    throw new Error("❌ ADMIN_PASSWORD must be at least 8 characters.");
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@presidentielle2027.fr" },
    update: {},
    create: {
      email: "admin@presidentielle2027.fr",
      password: hashedPassword,
      name: "Administrateur",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);
  if (!adminPassword) {
    console.warn("⚠️  Mot de passe admin par défaut utilisé. Définissez ADMIN_PASSWORD en production.");
  }

  // Create parties
  const en_marche = await prisma.parti.upsert({
    where: { slug: "renaissance" },
    update: {},
    create: {
      slug: "renaissance",
      nom: "Renaissance",
      sigle: "RE",
      couleur: "#FFCA0D",
      ideologie: "Centre / Libéral",
      fondation: 2016,
      description:
        "Parti politique français centriste et libéral fondé par Emmanuel Macron en 2016, anciennement appelé La République En Marche puis LREM.",
      histoire:
        "Fondé en avril 2016 par Emmanuel Macron alors ministre de l'Économie, le mouvement La République En Marche a bouleversé le paysage politique français en permettant l'élection de son fondateur à la présidence de la République en 2017. Renommé Renaissance en 2022, le parti incarne une ligne politique centriste, pro-européenne et libérale.",
      published: true,
    },
  });

  const rn = await prisma.parti.upsert({
    where: { slug: "rn" },
    update: {},
    create: {
      slug: "rn",
      nom: "Rassemblement National",
      sigle: "RN",
      couleur: "#003189",
      ideologie: "Droite nationaliste",
      fondation: 1972,
      description:
        "Parti politique français d'extrême droite nationaliste, fondé en 1972 sous le nom de Front National par Jean-Marie Le Pen.",
      histoire:
        "Fondé en 1972 par Jean-Marie Le Pen, le Front National a été renommé Rassemblement National en 2018 sous la présidence de Marine Le Pen. Le parti prône une ligne souverainiste, anti-immigration et de préférence nationale. Il a obtenu des scores historiques lors des présidentielles de 2017 et 2022.",
      published: true,
    },
  });

  const lfi = await prisma.parti.upsert({
    where: { slug: "lfi" },
    update: {},
    create: {
      slug: "lfi",
      nom: "La France Insoumise",
      sigle: "LFI",
      couleur: "#CC2443",
      ideologie: "Gauche radicale / Populisme de gauche",
      fondation: 2016,
      description:
        "Mouvement politique français de gauche radicale fondé par Jean-Luc Mélenchon en 2016.",
      histoire:
        "Fondée en 2016 par Jean-Luc Mélenchon suite à son départ du Parti Socialiste, La France Insoumise s'est rapidement imposée comme la principale force de la gauche radicale française. Le mouvement prône une VIe République, la sortie des traités européens libéraux et une politique économique interventionniste.",
      published: true,
    },
  });

  const lr = await prisma.parti.upsert({
    where: { slug: "lr" },
    update: {},
    create: {
      slug: "lr",
      nom: "Les Républicains",
      sigle: "LR",
      couleur: "#0066CC",
      ideologie: "Droite / Centre-droit",
      fondation: 2015,
      description:
        "Parti politique français de droite et de centre-droit, héritier du gaullisme et du RPR.",
      histoire:
        "Les Républicains ont été fondés en 2015 par Nicolas Sarkozy à partir de l'Union pour un Mouvement Populaire (UMP). Héritier d'une longue tradition gaulliste et libérale-conservatrice, le parti a traversé de nombreuses turbulences depuis la présidentielle de 2017 et cherche à se repositionner sous la présidence d'Éric Ciotti.",
      published: true,
    },
  });

  console.log("✅ Parties created");

  // Create candidates
  const macron = await prisma.candidat.upsert({
    where: { slug: "emmanuel-macron" },
    update: {},
    create: {
      slug: "emmanuel-macron",
      prenom: "Emmanuel",
      nom: "Macron",
      age: 49,
      partiId: en_marche.id,
      biographie:
        "Emmanuel Macron est né le 21 décembre 1977 à Amiens. Diplômé de Sciences Po Paris et de l'ENA, il a débuté sa carrière comme inspecteur des finances avant de rejoindre la banque Rothschild. Ministre de l'Économie sous François Hollande de 2014 à 2016, il fonde La République En Marche en avril 2016 et est élu Président de la République en mai 2017, puis réélu en avril 2022 face à Marine Le Pen.",
      programme: {
        économie: "Maintien du cap libéral avec investissements dans l'industrie verte et le numérique",
        education: "Réforme du baccalauréat et du lycée professionnel, développement de l'apprentissage",
        sante: "Investissement dans les déserts médicaux et prévention",
        environnement: "Transition écologique avec maintien du nucléaire",
        securite: "Renforcement des forces de l'ordre et réforme pénale",
        immigration: "Maîtrise des flux migratoires dans le cadre européen",
        europe: "Approfondissement de l'intégration européenne",
        logement: "Réforme du marché locatif et aide à l'accession",
      },
      positions: {
        "Immigration": "Contrôle renforcé mais dans le cadre européen",
        "Europe fédérale": "Favorable",
        "Retraites": "Réforme à 64 ans maintenue",
        "Nucléaire": "Favorable — investissement dans l'EPR",
        "Service national": "SNU maintenu",
        "TVA alimentaire": "Non favorable à la réduction",
        "ISF": "Contre le rétablissement",
        "Cannabis": "Contre la légalisation",
      },
      published: true,
      featured: true,
    },
  });

  const lepen = await prisma.candidat.upsert({
    where: { slug: "marine-le-pen" },
    update: {},
    create: {
      slug: "marine-le-pen",
      prenom: "Marine",
      nom: "Le Pen",
      age: 56,
      partiId: rn.id,
      biographie:
        "Marine Le Pen est née le 5 août 1968 à Neuilly-sur-Seine. Avocate de formation, elle succède à son père Jean-Marie Le Pen à la tête du Front National en 2011, qu'elle renomme Rassemblement National en 2018. Candidate à la présidentielle en 2012, 2017 et 2022, elle a atteint le second tour lors de ces deux derniers scrutins. Elle représente la ligne souverainiste et nationaliste du RN.",
      programme: {
        économie: "Préférence nationale, protectionnisme intelligent, baisse de la TVA sur l'énergie",
        education: "Retour aux fondamentaux, uniforme scolaire, autorité",
        sante: "Remboursement à 100% des soins essentiels, lutte contre les déserts médicaux",
        environnement: "Priorité au nucléaire, scepticisme sur l'agenda écologique européen",
        securite: "Tolérance zéro, augmentation des effectifs policiers",
        immigration: "Immigration choisie, quotas stricts, priorité nationale",
        europe: "Europe des nations, sortie de la tutelle de Bruxelles",
        logement: "Priorité aux nationaux pour le logement social",
      },
      positions: {
        "Immigration": "Très restrictive — quotas annuels",
        "Europe fédérale": "Contre — Europe des nations",
        "Retraites": "Retour à 60 ans pour les carrières longues",
        "Nucléaire": "Très favorable",
        "Service national": "Pour le rétablissement",
        "TVA alimentaire": "Zéro TVA sur les produits essentiels",
        "ISF": "Pour le rétablissement",
        "Cannabis": "Contre — répression accrue",
      },
      published: true,
      featured: true,
    },
  });

  const melenchon = await prisma.candidat.upsert({
    where: { slug: "jean-luc-melenchon" },
    update: {},
    create: {
      slug: "jean-luc-melenchon",
      prenom: "Jean-Luc",
      nom: "Mélenchon",
      age: 73,
      partiId: lfi.id,
      biographie:
        "Jean-Luc Mélenchon est né le 19 août 1951 à Tanger au Maroc. Militant socialiste puis dissident, il fonde La France Insoumise en 2016. Candidat à la présidentielle en 2012, 2017 et 2022, il arrive troisième lors de ces deux derniers scrutins avec des scores historiques. Ancien sénateur et député européen, il est depuis 2022 président du groupe LFI à l'Assemblée nationale.",
      programme: {
        économie: "Rupture avec le néolibéralisme, planification écologique, augmentation du SMIC",
        education: "Service public renforcé, gratuité totale, création de postes d'enseignants",
        sante: "Sécurité sociale universelle, fin des déserts médicaux, déprivatisation",
        environnement: "Bifurcation écologique urgente, sortie du nucléaire, 100% renouvelables",
        securite: "Police de proximité, justice réparatrice",
        immigration: "Régularisation des sans-papiers, droit d'asile renforcé",
        europe: "Réécriture des traités européens, désobéissance si nécessaire",
        logement: "Encadrement strict des loyers, office public du foncier",
      },
      positions: {
        "Immigration": "Favorable à la régularisation",
        "Europe fédérale": "Contre les traités actuels",
        "Retraites": "Retour à 60 ans",
        "Nucléaire": "Pour la sortie progressive",
        "Service national": "Contre",
        "TVA alimentaire": "Zéro TVA sur produits de première nécessité",
        "ISF": "Pour le rétablissement et renforcement",
        "Cannabis": "Pour la légalisation",
      },
      published: true,
      featured: true,
    },
  });

  const ciotti = await prisma.candidat.upsert({
    where: { slug: "eric-ciotti" },
    update: {},
    create: {
      slug: "eric-ciotti",
      prenom: "Éric",
      nom: "Ciotti",
      age: 58,
      partiId: lr.id,
      biographie:
        "Éric Ciotti est né le 14 août 1965 à Nice. Diplômé de Sciences Po Paris et de l'ENA, il est élu député des Alpes-Maritimes depuis 2007. Président des Républicains depuis décembre 2022, il incarne la droite dure du parti et a noué des rapprochements controversés avec le Rassemblement National en 2024.",
      programme: {
        économie: "Baisse des impôts, simplification administrative, soutien aux PME",
        education: "Autorité, mérite, uniforme, cours d'instruction civique renforcés",
        sante: "Lutte contre les déserts médicaux, revalorisation des soignants",
        environnement: "Nucléaire comme pilier de la transition, pragmatisme écologique",
        securite: "Fermeté pénale, plus de policiers, peines planchers",
        immigration: "Immigration zéro, expulsion des délinquants étrangers",
        europe: "Europe protectrice mais souveraineté nationale préservée",
        logement: "Choc d'offre, simplification des permis de construire",
      },
      positions: {
        "Immigration": "Très restrictive",
        "Europe fédérale": "Contre",
        "Retraites": "Réforme nécessaire — 64 ans minimum",
        "Nucléaire": "Très favorable",
        "Service national": "Pour",
        "TVA alimentaire": "Neutre",
        "ISF": "Contre le rétablissement",
        "Cannabis": "Contre — répression renforcée",
      },
      published: true,
      featured: true,
    },
  });

  console.log("✅ Candidates created");

  // Create polls
  const pollData = [
    // Latest round - January 2026
    { candidatId: lepen.id, date: new Date("2026-01-15"), score: 34, institut: "Ipsos", marge: 2.5 },
    { candidatId: melenchon.id, date: new Date("2026-01-15"), score: 20, institut: "Ipsos", marge: 2.5 },
    { candidatId: macron.id, date: new Date("2026-01-15"), score: 18, institut: "Ipsos", marge: 2.5 },
    { candidatId: ciotti.id, date: new Date("2026-01-15"), score: 12, institut: "Ipsos", marge: 2.5 },

    // December 2025
    { candidatId: lepen.id, date: new Date("2025-12-10"), score: 33, institut: "IFOP", marge: 2.5 },
    { candidatId: melenchon.id, date: new Date("2025-12-10"), score: 19, institut: "IFOP", marge: 2.5 },
    { candidatId: macron.id, date: new Date("2025-12-10"), score: 20, institut: "IFOP", marge: 2.5 },
    { candidatId: ciotti.id, date: new Date("2025-12-10"), score: 13, institut: "IFOP", marge: 2.5 },

    // October 2025
    { candidatId: lepen.id, date: new Date("2025-10-05"), score: 31, institut: "BVA", marge: 3 },
    { candidatId: melenchon.id, date: new Date("2025-10-05"), score: 22, institut: "BVA", marge: 3 },
    { candidatId: macron.id, date: new Date("2025-10-05"), score: 21, institut: "BVA", marge: 3 },
    { candidatId: ciotti.id, date: new Date("2025-10-05"), score: 11, institut: "BVA", marge: 3 },
  ];

  // Delete existing sondages to avoid duplicates on re-seed
  await prisma.sondage.deleteMany({});
  for (const poll of pollData) {
    await prisma.sondage.create({ data: poll });
  }
  console.log("✅ Polls created");

  // Create events
  const events = [
    {
      titre: "Grand meeting de Marine Le Pen à Lyon",
      description: "Meeting de campagne à l'Halle Tony Garnier",
      lieu: "Halle Tony Garnier",
      ville: "Lyon",
      dateDebut: new Date("2026-09-20T15:00:00"),
      type: "MEETING" as const,
    },
    {
      titre: "Débat présidentiel sur France 2",
      description: "Premier grand débat télévisé entre les candidats",
      ville: "Paris",
      dateDebut: new Date("2026-11-15T20:00:00"),
      type: "DEBAT" as const,
    },
    {
      titre: "Conférence programmatique de Jean-Luc Mélenchon",
      description: "Présentation du programme de La France Insoumise",
      lieu: "Zénith de Paris",
      ville: "Paris",
      dateDebut: new Date("2026-10-10T14:00:00"),
      type: "CONFERENCE" as const,
    },
    {
      titre: "Convention nationale Renaissance",
      description: "Convention pour définir le programme présidentiel",
      lieu: "Parc des Expositions",
      ville: "Paris",
      dateDebut: new Date("2027-01-22T09:00:00"),
      dateFin: new Date("2027-01-22T18:00:00"),
      type: "CONFERENCE" as const,
    },
    {
      titre: "Meeting Éric Ciotti à Marseille",
      description: "Grand rassemblement de la droite républicaine",
      lieu: "Palais des Congrès",
      ville: "Marseille",
      dateDebut: new Date("2027-02-14T16:00:00"),
      type: "MEETING" as const,
    },
  ];

  await prisma.evenement.deleteMany({});
  for (const event of events) {
    await prisma.evenement.create({ data: event });
  }
  console.log("✅ Events created");

  // Create news articles
  const articles = [
    {
      titre: "Marine Le Pen consolide sa position de favorite",
      slug: "marine-le-pen-favorite-presidentielle-2027",
      resume: "Les derniers sondages confirment la domination de la candidate RN avec plus de 30% d'intentions de vote au premier tour.",
      contenu: `Selon une étude Ipsos publiée ce mois-ci, Marine Le Pen maintient une avance confortable sur ses concurrents à 14 mois du premier tour prévu en avril 2027.

Avec 34% d'intentions de vote, la présidente du groupe RN à l'Assemblée nationale devance Jean-Luc Mélenchon (20%), Emmanuel Macron (18%) et Éric Ciotti (12%).

Cette dynamique favorable à Marine Le Pen s'explique par plusieurs facteurs : la crise du coût de la vie, les questions migratoires qui restent au cœur du débat public, et une opposition fragmentée qui peine à se structurer.

"Ces sondages reflètent la préoccupation des Français pour leur pouvoir d'achat et la sécurité", a commenté un politologue joint par notre rédaction. "Marine Le Pen capitalise sur ces inquiétudes depuis des années."

Du côté du camp Macron, l'entourage du président sortant tempère : "Il reste encore de nombreux mois de campagne. L'histoire montre que les sondages à 14 mois peuvent évoluer considérablement."`,
      source: "Le Monde",
      tags: ["sondages", "RN", "premier tour"],
      published: true,
      publishedAt: new Date("2026-01-16"),
      candidatId: lepen.id,
    },
    {
      titre: "Mélenchon annonce un programme de bifurcation écologique",
      slug: "melenchon-programme-bifurcation-ecologique",
      resume: "Le candidat LFI a présenté les grandes lignes de son programme présidentiel, axé sur la transition écologique et la justice sociale.",
      contenu: `Jean-Luc Mélenchon a dévoilé lors d'une conférence à Paris les contours de son programme pour la présidentielle 2027, qu'il appelle "la bifurcation".

Au cœur de ce projet : une planification écologique d'urgence, le retrait progressif du nucléaire au profit des énergies renouvelables, et une redistribution massive des richesses.

"La France doit choisir entre la planète et les profits", a déclaré le candidat devant plusieurs milliers de sympathisants. "Notre programme est le seul qui propose une véritable rupture avec le système qui nous a conduits à cette crise."

Sur le plan économique, LFI propose un SMIC à 1600€ nets, une semaine de 32 heures, et le rétablissement d'un ISF renforcé sur les grandes fortunes.

L'Union Populaire entend fédérer l'ensemble de la gauche derrière cette candidature, mais les discussions avec le Parti Socialiste et EELV s'annoncent complexes.`,
      source: "Libération",
      tags: ["LFI", "programme", "écologie"],
      published: true,
      publishedAt: new Date("2026-01-10"),
      candidatId: melenchon.id,
    },
    {
      titre: "Ciotti veut unifier la droite face au RN",
      slug: "ciotti-unifier-droite-face-rn",
      resume: "Le président des LR appelle à un rassemblement de toute la droite pour éviter une triangulaire défavorable au second tour.",
      contenu: `Éric Ciotti a lancé un appel au rassemblement lors d'un déplacement à Marseille, estimant que la droite républicaine doit s'unir pour éviter d'être éliminée au premier tour.

"La droite a besoin d'un candidat unique", a-t-il affirmé lors d'une réunion publique. "Nous avons les meilleures propositions pour redresser la France, mais si nous nous dispersons, nous offrons la victoire soit à l'extrême gauche soit à Macron."

Cette stratégie d'union implique des discussions avec différentes sensibilités de la droite, y compris des mouvements proches de Valérie Pécresse et Xavier Bertrand.

Certains membres du parti restent sceptiques quant aux rapprochements avec le RN que Ciotti a semblé envisager par le passé, craignant une dilution de l'identité républicaine des LR.`,
      source: "Le Figaro",
      tags: ["LR", "droite", "union"],
      published: true,
      publishedAt: new Date("2026-01-08"),
      candidatId: ciotti.id,
    },
    {
      titre: "Macron en tête à tête avec les élus locaux sur la décentralisation",
      slug: "macron-decentralisation-elus-locaux",
      resume: "Le président sortant cherche à construire un programme de décentralisation ambitieux pour relancer sa candidature.",
      contenu: `Emmanuel Macron a réuni plusieurs centaines d'élus locaux à l'Elysée pour travailler sur un projet de décentralisation qui pourrait devenir l'axe central de sa future campagne présidentielle.

"La France ne peut plus se gouverner uniquement depuis Paris", a déclaré le président lors de cette rencontre. "Nous devons redonner du pouvoir aux territoires."

Ce chantier de la décentralisation représente un pivot stratégique pour Macron, qui tente de se repositionner après des années de critiques sur la verticalité de son pouvoir.

Sur le terrain économique, l'Elysée a également laissé filtrer des pistes sur une réforme fiscale favorable aux classes moyennes, destinée à répondre aux préoccupations exprimées lors du mouvement des gilets jaunes.`,
      source: "Les Échos",
      tags: ["Macron", "décentralisation", "programme"],
      published: true,
      publishedAt: new Date("2026-01-05"),
      candidatId: macron.id,
    },
  ];

  for (const article of articles) {
    await prisma.actualite.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
  console.log("✅ News articles created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Admin credentials:");
  console.log("   Email: admin@presidentielle2027.fr");
  console.log(`   Password: ${process.env.ADMIN_PASSWORD ? "(set via ADMIN_PASSWORD env var)" : "admin2027! (⚠️ default — change in production!)"}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
