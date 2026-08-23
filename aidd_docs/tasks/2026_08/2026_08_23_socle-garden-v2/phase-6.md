---
status: pending
---

# Instruction: Génération de /llms.txt côté app

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
~/dev/github/devnotes-garden-app/
└── scripts/
    ├── build-content-index.mjs        ✏️ exporte generateLlmsTxt et l'ecrit dans public/llms.txt
    └── build-content-index.spec.mjs   ✏️ couvre le format llms.txt, le groupement par theme et l'echappement
```

## User Journey

```mermaid
flowchart TD
  A[Push sur main du repo content] --> B[repository_dispatch vers le repo app]
  B --> C[Build: build-content-index.mjs]
  C --> D[content-index.json + rss.xml + llms.txt]
  D --> E[Deploiement Azure Static Web Apps]
  E --> F[Un agent recupere https://garden.leplomb.work/llms.txt]
  F --> G[Il y lit les notes par theme et suit une URL de note]
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Copier le contenu migre dans content-source/notes/ du repo app => 12 notes prêtes a indexer: 5: cli
  section Happy path
    Lancer node scripts/build-content-index.mjs => public/llms.txt est ecrit et la sortie l'annonce: 5: cli
    Lire public/llms.txt => un H1, un blockquote de resume, puis une section H2 par theme: 5: cli
    Lire public/llms.txt => chaque note apparait une fois avec son titre, son URL absolue et son resume: 5: cli
    Lancer npm run test:scripts => la suite vitest passe, nouveaux cas inclus: 5: cli
  section Edge case - note en draft
    Une note porte draft true => relancer le build => elle est absente de llms.txt comme de content-index.json: 1: cli
  section Edge case - caractere special
    Un resume contient une esperluette et des chevrons => relancer le build => llms.txt reste lisible et rss.xml reste un XML valide: 1: cli
  section Edge case - corpus vide
    content-source/notes est absent => relancer le build => llms.txt est genere avec ses entetes et aucune section: 1: cli
  section Teardown
    Restaurer content-source/notes/ et public/ => repo app revenu a son etat initial: 5: cli
```

## Tasks to do

### `1)` Écrire `generateLlmsTxt`

> Même forme que `generateRssFeed` : fonction pure exportée, testable sans I/O.

1. Signature `generateLlmsTxt(notes, siteUrl = SITE_URL)`, exportée comme l'est `generateRssFeed`.
2. En-tête : `# devnotes·garden`, puis un blockquote décrivant le garden et ses deux piliers.
3. Un paragraphe indiquant où trouver le markdown brut et l'index JSON.
4. Une section `## <theme>` par thème, dans l'ordre alphabétique des thèmes.
5. Un item par note : `- [<title>](<siteUrl>/notes/<slug>) : <summary>`.
6. Aucun échappement XML ici : c'est du markdown, pas du XML ; les caractères spéciaux passent tels quels.

### `2)` Brancher l'écriture dans `main`

> À côté de l'index et du RSS, jamais à leur place.

1. Déclarer `LLMS_OUTPUT = join(ROOT, 'public', 'llms.txt')` près des autres constantes de sortie.
2. Écrire le fichier juste après `generateRssFeed`, à partir du même tableau `index` déjà dédupliqué et trié.
3. Logger `[ok] llms.txt généré → public/llms.txt`, dans le style des logs existants.
4. Gérer la branche « contenu absent » : produire un `llms.txt` avec ses en-têtes et zéro section, comme l'index vide.

### `3)` Couvrir par des tests

> La suite `test:scripts` est le seul filet de ce script.

1. Cas nominal : 2 notes de 2 thèmes différents produisent 2 sections H2 dans l'ordre alphabétique.
2. Les URL sont absolues et construites sur `/notes/<slug>`.
3. Un `siteUrl` passé en paramètre remplace bien la valeur par défaut.
4. Un corpus vide produit les en-têtes sans aucune section.
5. Un résumé contenant `&` et `<` reste intact dans `llms.txt`, alors que `generateRssFeed` continue de l'échapper.

### `4)` Vérifier de bout en bout

> Ce qui n'est pas exécuté n'est pas livré.

1. Exécuter le build sur le contenu migré et lire le `public/llms.txt` produit.
2. Confirmer que les 12 notes y figurent, groupées sous 6 thèmes.
3. Confirmer qu'aucune note `draft: true` n'y apparaît.
4. Exécuter `npm run test:scripts` puis `npm run lint`, et restaurer `content-source/notes/` et `public/`.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                       |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1    | `generateLlmsTxt` est exportée, pure, et rend un H1, un blockquote et une section H2 par thème triée alphabétiquement        |
| 2    | Le build écrit `public/llms.txt` en plus de l'index et du RSS, et le log le confirme, y compris sur un corpus absent          |
| 3    | Les 5 cas de test passent, dont celui qui distingue l'absence d'échappement markdown de l'échappement XML du RSS              |
| 4    | Le `llms.txt` réel liste les 12 notes sous 6 thèmes, aucun draft, et `test:scripts` comme `lint` passent                      |
