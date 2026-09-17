# Analyse Sidewinder → Simpilot Log — classements & fiche pilote

> Livrable Designer (ASSETS/Designer.md) pour remplir la checklist **dans un second temps**.  
> **D-SW1, D-SW2, D-SW3 tranchés** (17/09/2026). **Lot A (SW-A0–A10) livré 17/09/2026.** Lot B (grades) et Lot C (replay) hors-scope.  
> Date : 17 septembre 2026 · Preuves : pages live + JS + API JSON Sidewinder (mission `2026-09-17_00-37-51`, Season 18, Day 28) · code Simpilot (`/leaderboard`, `/pilots/[id]`, `scoring.ts`, `schema.prisma`, checklist G4/I1/I2)

**Sources :** Sidewinder `/stats/`, `/stats/leaderboards`, `/stats/ranks`, `/stats/records`, `/stats/pilot?id=1336` (Rameio) · NN/g H1/H4/H6/H8 · Fogg (triggers) · Zeigarnik / goal-gradient · Miller · Krug · Material tables · Apple HIG · audit Simpilot p.31+ · `docs/Checklist simpilot log.md` (G4, D-SOLO, I1, I2)

---

## 1. Diagnostic rapide

Sidewinder n’est **pas** un carnet de club. C’est le hub de stats d’un **serveur PvP live** (Iron Front: Korea). Les classements y servent à faire revenir le pilote **après chaque mission** : « où suis-je ? », « qui a été promu ? », « qui a volé le mieux aujourd’hui ? », « à combien suis-je du prochain grade ? ».

Simpilot a déjà le **socle club** : 6 classements (heures / points / 4 kills), filtres période + sim + escadrille + statut, règle de points **affichée**, top 3 fiche escadrille, fiche pilote KPI + 10 derniers vols. Il manque la **boucle de rétention** : identité « moi », fraîcheur 24 h, jalons de grade (**révocables**, D-SW1), records, calendrier.

**Règle d’adaptation (Designer) :** copier les **mécaniques comportementales**, pas la télémétrie. Replay, carte, accuracy, rivalités PvP, front de campagne = **I1 / hors scope** tant que le carnet reste déclaratif.

**Décisions produit (17/09/2026) :**
- **D-SW1** — Grades **FR Aspirant→Major**, **révocables**, avec hysteresis (éviter le yo-yo).
- **D-SW2** — Temps 1 : l’unité stats = le **Pilote** (saisi par le club, PIN, statut Actif/Hors comb.). Pas de compte user. Temps 2 (H1-impl) : un compte user agrège plusieurs pilotes. **Hors combat = grade gelé** (ni promo ni rétro).
- **D-SW3** — Outcomes actuels **conservés**. Interprétation : `SUCCESS` = atterrissage réussi. **+1 point par vol SUCCESS** (Landed), en plus de la règle kills+heures. Pas de mapping captured/death Sidewinder. Pas de 6e outcome tant que non demandé.

**Hypothèses restantes :**
- Cible = club 5–30 pilotes, pas serveur 80 joueurs.
- Données = vols saisis à la main. Pas de Tacview.
- Solo reste hors classements (D-SOLO).
- UI = tokens Korea v3 uniquement.

---

## 2. Problèmes UX identifiés

| # | Constat | Gravité | Pour Simpilot |
|---|---------|---------|---------------|
| P1 | Simpilot : classements **anonymes**. Aucune ligne « toi », aucun écart au rang N−1. | Haute | Le club ne « se voit » pas. Perte du loop Fogg (trigger + ability + motivation). |
| P2 | Simpilot : fiche pilote = **admin + totaux**. Pas de carrière, pas de « encore X pour Y ». | Haute | Zeigarnik inexploité. G4 déjà parking LATER, jamais branché UI. |
| P3 | Simpilot : pas de **fraîcheur**. Un vol loggé disparaît dans « toutes périodes ». | Haute | Rien n’incite à rouvrir le site le soir de la sortie. |
| P4 | Sidewinder : **14 onglets** de boards. Miller saturé. Eux-mêmes ont **caché** le board « score » (opérateur 03/09/2026). | Haute si copié | Ne pas empiler des boards. 1 score club + quelques niches **qualifiées**. |
| P5 | Sidewinder : accuracy Rameio affichée **110 %** (rounds_hit > rounds_fired). H1 confiance cassée. | Moyenne | Ne jamais afficher une métrique non fiable. |
| P6 | Sidewinder : MVP vide + Flight of the day = sortie **Day 23** alors que le hub dit Day 28/29. H1 fraîcheur ambiguë. | Moyenne | Spotlight = fenêtre **explicite** (« dernière soirée club » / 24 h), jamais silencieuse. |
| P7 | Sidewinder : recherche **préfixe** seulement (`startsWith`). H6. | Basse | Chez nous : contains, callsign + nom. |
| P8 | Simpilot : `outcome` existe (5 valeurs) mais n’est **pas** une dimension de classement / fiche (hors % réussite). | Moyenne | Donnée déjà là, inexploitée — quick win. |
| P9 | Simpilot : last 10 vols sur fiche, **pas** de stats par avion alors que `Aircraft` est lié. | Moyenne | Quick win. |
| P10 | Copier replay / carte / rivalités sans I1 = **promesse mensongère**. | Critique si fait | Ne pas faire. Audit : fiabiliser avant d’étendre. |

---

## 3. Cinq leviers de rétention (ce qu’il faut voler)

| Leviers | Ce que fait Sidewinder | Principe | Traduction club Simpilot |
|---------|------------------------|----------|--------------------------|
| **Me** | Search « Find yourself » + ligne You + `localStorage ifk.stats.me` | Fogg trigger · H6 | Réutiliser `spl-log-defaults.pilotId` (déjà C5). |
| **Maintenant** | As-of, countdown serveur, feed sorties, MVP, Flight of the day | H1 statut · variable rewards | As-of « dernier vol loggé » + spotlight 24 h / dernière soirée. **Pas** de countdown serveur. |
| **Une niche pour chacun** | 14 boards + HoF + ranks | Self-determination · several #1 | Garder 6 boards + **réussite qualifiée** + records. Pas 14. |
| **Ça ne redescend pas** *(Sidewinder)* / **standing live** *(choix Simpilot)* | Grades Recruit→Group Captain, **never lost** | Loss aversion inversée · endowment | **D-SW1 tranché : échelle FR révocable.** Barre « encore X » reste ; ajouter hysteresis pour éviter le yo-yo. |
| **Presque** | Gap to next · progress 0.9 · badges 20/25 | Goal-gradient · Zeigarnik | « 1 vol pour Flying Officer » (cas Rameio) = le meilleur CTA de log. |

---

## 4. Écart actuel (preuve code)

| Surface | Sidewinder (observé) | Simpilot (code) |
|---------|----------------------|-----------------|
| Hub stats | 4 cards + calendrier + promos + feed | Pas de hub. `/leaderboard` = listes nues. Dashboard = totaux club + Δ 30 j. |
| Identité | Search + You + permalink `code` | Aucun search. C5 mémorise le pilote **seulement** dans `/log`. |
| Boards | 14, saison, seuils, delta rang, chip grade | 6, période all/30d/year, sim, escadrille, statut. Tri client. |
| Grades | 8 échelons, score carrière + floor sorties, never lost | G4 checklist **non commencé**. Points club seulement. |
| Fiche | 10 tuiles, fate bar, badges, records, morts, rivaux, avions, carte, calendrier | 3 KPI + kills/points + statut + 10 `FlightCard`. |
| Share | OG titre + image sortie `card.png` | Aucun. I2 = page escadrille publique LATER. |

**Formule career score Sidewinder (affichée `/ranks`) :**  
`3 × air + ground + ½ × landings − 2 × deaths − captures`.  
**Ils ont retiré ce score des classements publics.** Leçon : un score opaque tue la confiance. **Garder** la règle Simpilot déjà lisible : `Aérien 5 · Naval 4 · Sol 3 · Building 2 · 1 h = 1`.

**Échelle grades live (API `/ranks`, 476 pilotes considérés côté HoF) :**

| Échelon | Score min | Sorties min | Effectif |
|---------|-----------|-------------|----------|
| Recruit | 0 | 0 | 317 |
| Cadet | 1 | 3 | 82 |
| Pilot Officer | 6 | 6 | 44 |
| Flying Officer | 18 | 10 | 14 |
| Flight Lieutenant | 45 | 16 | 8 |
| Squadron Leader | 100 | 24 | 3 |
| Wing Commander | 200 | 34 | 4 |
| Group Captain | 400 | 45 | 4 |

**Exemple Rameio (id 1336) :** Pilot Officer, 56.5 career score, 9 sorties, **1 sortie** pour Flying Officer (progress 0.9). Badges earned : Ground Pounder (57/50), Radar Killer (9/5). Pas de rivalités A/A. 1 perte AAA (DShK).

---

## 5. Catalogue de features

Légende **Avis** : **Adapter** · **Adapter partiel** · **Reporter** · **Ne pas copier**  
Légende **Horizon** : **A** = données déjà en base (UI/API) · **B** = schéma / G4 · **C** = télémétrie I1 ou hors produit

### 5.1 Hub `/stats/` → plutôt dashboard + tête de `/leaderboard`

| ID | Feature observée | Pourquoi (rétention) | Risque | Tâches Simpilot | Avis | H |
|----|------------------|----------------------|--------|-----------------|------|---|
| SW-H1 | Ligne **as-of** (mission + day) | H1 : « les stats sont à jour ». Incite à revenir après ingest. | Fausse fraîcheur si mal daté. | Afficher « Dernier vol : {date} · {n} vols {période} » sur `/leaderboard` et fiche. Source `Flight.date` max. | Adapter | A |
| SW-H2 | Countdown **server remaining** | Urgence live. | Simpilot n’a pas de serveur. Mentir = P10. | Ne pas faire. | Ne pas copier | C |
| SW-H3 | **Find yourself** (search nom + alias, debounce 220 ms, Enter si 1 résultat) | Réduit le temps vers *ma* fiche. Ego + H6. | Club petit : search moins critique que highlight. Préfixe trop strict. | Champ search `/leaderboard` + `/pilots` : `name`/`callsign` contains. API `GET /api/pilots?q=`. Debounce. Lien `/pilots/:id`. | Adapter | A |
| SW-H4 | Card **last mission** (front km, top pilotes, destin) | Récit de la dernière session. | Front = campagne serveur. Chez nous pas de « mission serveur ». | Card « Dernière soirée » = vols du **dernier jour calendaire avec ≥1 vol** : top 5 points, n vols, n pilotes. Lien `/flights?from=&to=`. | Adapter partiel | A |
| SW-H5 | Teaser **top 5 saison** → leaderboards | Goal-gradient : voir le sommet sans ouvrir 14 tabs. | Top 5 air/ground brut ≠ score club. | Sur `/` ou `/leaderboard` : Top 5 **points** (filtre Actifs, période 30 j par défaut). Lien « Voir tout ». D3 existe déjà **par escadrille**. | Adapter | A |
| SW-H6 | **Mission MVP** (meilleure sortie de la dernière mission, score) | Star du soir. Variable reward. | Score interne Sidewinder ≠ points Simpilot. MVP vide si 0 sorties. | « MVP du dernier jour de vols » = max `flightTotalPoints` ce jour-là. Empty state honnête. | Adapter | A |
| SW-H7 | **Flight of the day** (meilleure sortie 24 h + Watch replay) | Même levier, fenêtre 24 h. Replay = C. | Fenêtre vs « last mission » peut diverger (P6). | Une seule spotlight, libellé clair : « Meilleur vol — dernières 24 h » **ou** « dernière soirée », pas les deux. Pas de replay. CTA « Voir le vol ». | Adapter | A |
| SW-H8 | Hub cards Front / Missions / HoF / Ranks / Sorties / War | IA de l’écosystème. | War/Front = WIP même chez eux. Charge nav. | Ne pas créer 6 routes. 2 liens max depuis classements : « Records » + « Grades » quand B livré. | Adapter partiel | B |
| SW-H9 | **Calendrier heatmap** 365 j (cells : sorties, pilotes, air/ground) + streak jours | GitHub-contribution : preuve d’activité, FOMO club. | Densité mobile. Streak jours ≠ streak atterrissages. | Composant `ActivityCalendar` (données `GROUP BY date(Flight.date)`). Club sur `/` ; perso sur fiche. Clic → `/flights?from=&to=`. Streak = jours consécutifs avec ≥1 vol. Tokens Korea, pas GitHub green. | Adapter | A |
| SW-H10 | **Promoted this week** | Preuve sociale + endowment. Raison de rouvrir. | Spam si trop de Recruit→Cadet. | Après G4 : feed 7 j. sur `/` et `/leaderboard`. Lien fiche. | Reporter (G4) | B |
| SW-H11 | **Recent sorties** (côté, avion, fate, kills, time ago, icône replay) | Feed social. « Les autres volent. » | Replay icon sans replay = mensonge. Time ago en EN. | Réutiliser `FlightCard` déjà sur dashboard (5 vols). Enrichir : kills + points. FR, pas « 5 h ago » → « il y a 5 h ». Pas d’icône vidéo. | Adapter | A |
| SW-H12 | Skeletons / empty / **offline** (« check back after next mission ») | H1 + H9. | Copy serveur inadapté. | Empty déjà « Aucun vol pour ces filtres ». Ajouter skeleton listes classements (C3 pattern). Pas de message serveur. | Adapter | A |

### 5.2 Page leaderboards

| ID | Feature observée | Pourquoi | Risque | Tâches Simpilot | Avis | H |
|----|------------------|----------|--------|-----------------|------|---|
| SW-L1 | **Saison picker** (open / closed / all / test_campaign masqué) | Reset compétitif **sans** effacer la carrière. | Sans modèle Season, « saison » est du marketing vide. | V1 : garder all / 30 j / année + ajouter **7 j** et **mois calendaire**. V2 : table `Campaign` (nom, start, end, club). Query `date` between. | Adapter partiel | A puis B |
| SW-L2 | Tabs boards : air, ground, survivor, marksman, airtime, streak, radar, convoy, vehicles hit, ships sunk, missions, deaths/hour, rookies, most improved | Niches → plus de gagnants. | 14 tabs = P4. Marksman/radar/convoy/hits = télémétrie. deaths/hour = punitif en club déclaratif. | **Ne pas** porter 14. Garder 6. Ajouter **Réussite** (seuil min vols) + plus tard **Série**. Ships = déjà kills naval. | Adapter partiel | A |
| SW-L3 | Board **score composite retiré** du site | Opérateur 03/09 : « kills, survival and airtime speak for themselves ». | Recréer un 2e score (formule ranks) = confusion avec points club. | 1 seule monnaie : points `scoring.ts`. Grades B peuvent user d’une formule **documentée à part**, pas d’un 7e board. | Ne pas copier | C |
| SW-L4 | Table : `#` · **Δ rang** · nom · valeur · chip grade · flown · air · ground · deaths · landed | Comparaison (H4) + mouvement. | Δ sans snapshot. Deaths absents. | Colonnes v1 : `#`, nom, métrique, vols, heures, pts. Δ vs période préc. Chip grade après G4. Colonne **Atterris.** = count `SUCCESS` (D-SW3). Hors comb. visibles si filtre Tous, grade **figé**. | Adapter | A |
| SW-L5 | **Ligne You épinglée** | Identité + next action. | **D-SW2 :** pas de user. « Moi » n’existe pas en temps 1. Kiosque = plusieurs pilotes. | **Ne pas** copier You/auth. Search SW-H3 + row cliquable suffisent. Highlight optionnel du dernier `spl-log-defaults` = confort kiosque, **pas** une identité. Temps 2 : « mes pilotes » sur le compte user. | Adapter partiel | A / H1 |
| SW-L6 | **Gap to next** (« 2 air to next rank up ») | Goal-gradient concret. | Unités différentes selon board. | `value[rank-1] − value[me]` formaté avec la métrique active (pts, h, kills). Cacher si #1. | Adapter | A |
| SW-L7 | **Seuils de qualification** (ex. Survivor ≥ 10 flown, Marksman ≥ N rounds, Improved ≥ N vols saison + précédente) | Empêche le #1 à 1 vol chanceux. Confiance. | Seuil trop haut = roster vide (Survivor Season 18 = **2** pilotes). | Seuil **Réussite** : min 5 vols (configurable). Footnote sous le board. Empty : « Personne n’a encore 5 vols sur cette période ». | Adapter | A |
| SW-L8 | **Rookies** (1re sortie dans la saison) / **Most improved** (score/sortie vs saison préc.) | Onboarding + come-back. | Rookie board Season 18 : scores 0 / −4 / −5. Démotivant. | V1 skip. V2 campagnes : « Nouveaux ce mois » = `Pilot.createdAt` dans la période, classés aux points. Improved = pts/vol 30 j vs 30 j préc. Masquer si N&lt;3. | Reporter | B |
| SW-L9 | **Tie-breakers** écrits (fewer deaths → earlier first sortie) | H11 : règles visibles. | Deaths absents. First sortie = `min(Flight.date)`. | Documenter sous le board : ex. points égaux → plus d’heures → date 1er vol plus ancienne. Code déjà : `points then minutes`. | Adapter | A |
| SW-L10 | **Pagination** 50 + total ranked | Scale serveur 476 pilotes. | Club 20 pilotes : pagination inutile. | Si `pilots.length > 50` seulement. Sinon liste complète (scan club). | Adapter | A |
| SW-L11 | URL `?board=&season=&page=&highlight=` | Share Discord / bookmark. H7. | Highlight ID = tracking léger. | `useSearchParams` sur `/leaderboard` (aujourd’hui state React non URL). Sync board/période/game/escadrille/statut. | Adapter | A |
| SW-L12 | Highlight row CSS + localStorage `ifk.stats.me` | Continuity entre visites. | Kiosque : dernier pilote du log ≠ visiteur. | Réutiliser `spl-log-defaults`. Opt-in « Me reconnaître sur les classements » si kiosque (D-SW2). | Adapter | A |
| SW-L13 | Footnote **glossary** par board | Confiance métrique. | Sidewinder a **retiré** les footnotes des tuiles profil (« technical noise »). | 1 ligne sous le board, style `POINTS_RULES_LABEL`. Pas de glossaire 20 termes. | Adapter partiel | A |
| SW-L14 | Chip **career rank** dans la row | Statut social compact. | Sans G4 = vide. | Après G4. Composant `RankChip`. | Reporter | B |
| SW-L15 | Classement **escadrilles** à côté | Identité de groupe (déjà Simpilot). | Sidewinder n’a **pas** d’escadrille club — eux = coalitions RED/BLUE. | **Garder** la colonne Escadrilles. Avantage Simpilot. Exclure Solo (A3). | Déjà couvert | — |
| SW-L16 | Filtres sim / escadrille / statut | Persona 3. G1/G5 livrés. | 5 selects = charge. | Garder. Plus tard : chips plutôt que 5 `<Select>` (F1 mobile). | Déjà couvert | — |

### 5.3 Career ranks + Hall of Fame

| ID | Feature observée | Pourquoi | Risque | Tâches Simpilot | Avis | H |
|----|------------------|----------|--------|-----------------|------|---|
| SW-R1 | **Une échelle**, never lost chez eux | Standing social. | **D-SW1 révocable.** **D-SW2 : Hors comb. = gel.** Yo-yo si recalc à chaque vol. Loss aversion. | Table `Rank` FR Aspirant→Major. Recalc **seulement si `status=ACTIVE`**. Hysteresis montée/descente. Copy : « Le grade suit tes points ; hors combat il est gelé. » | Adapter | B |
| SW-R2 | **Double seuil** score **et** sorties (« floors stop a lucky mission ») | Anti-exploit 1 grosse sortie. | Deux unités à expliquer. | Reprendre l’idée, pas les chiffres RAF. Ex. club : Cadet 20 pts **et** 3 vols. Copy FR sous l’échelle. | Adapter | B |
| SW-R3 | Score carrière **différent** des points club (pénalité mort) | Encourage atterrir. | 2 monnaies = P4/H2. Sidewinder l’a caché des LB. | **Ne pas** créer un 2e score. Grades = **points club + floor vols**. Pénalité mort = seulement si D-SW3 l’exige. | Adapter partiel | B |
| SW-R4 | Ladder inversé + barre d’effectif par grade | Preuve que le sommet est rare (4 Group Captain). | Club 10 pilotes : histogramme ridicule. | Liste compacte + « N pilotes à ce grade ». Skip barres si N_club &lt; 15. | Adapter | B |
| SW-R5 | Table **senior ranks** | Célébrer le haut. | Élitisme. | Top du grade max, lien fiche. | Adapter | B |
| SW-R6 | Feed **promotions** (timeAgo) | Raison sociale de revenir. | Bruit Recruit. | Filtrer : n’afficher que grade ≥ 2, ou « cette semaine ». | Adapter | B |
| SW-F1 | HoF **single flight** : plus long, plus de kills, plus air, plus sol, plus haute kill, fastest kill | Célébrer le **vol**, pas seulement le cumul. | Fastest/highest = télémétrie. Plus long = durée déjà là. | V1 : plus de pts en 1 vol, plus long, plus kills air/sol/naval/building. Lien `/flights/:id`. Pas altitude/vitesse. | Adapter partiel | A |
| SW-F2 | HoF **career** : streak, sorties, heures, air, sol, accuracy, missions, kills totaux | Légendes du serveur. | Accuracy 96 % avec seuil 1000 rounds — nous n’avons pas les rounds. | V1 : heures, pts, kills par type, n vols. Streak = vols `SUCCESS` consécutifs (D-SW3). Page `/leaderboard#records` ou `/records`. | Adapter partiel | A |
| SW-F3 | Filtre saison sur HoF + « N pilots considered » | Fairness. | Saison = B. | V1 : mêmes périodes que LB. Caption « {n} pilotes avec ≥1 vol ». | Adapter | A |
| SW-F4 | Watch replay sur record vol | Preuve. | Pas de track. | Lien détail vol seulement. | Ne pas copier replay | C |

### 5.4 Fiche pilote `/stats/pilot?id=` → `/pilots/[id]`

| ID | Feature observée | Pourquoi | Risque | Tâches Simpilot | Avis | H |
|----|------------------|----------|--------|-----------------|------|---|
| SW-P1 | Header : nom, first/last seen, **seasons flown**, badge grade + barre next | Carrière en 3 secondes. Cas Rameio : « 1 sortie vers Flying Officer ». | Season picker **caché** chez eux (04/09) — all-time only. Leçon : défaut = carrière, pas 12 filtres. | first/last = min/max `Flight.date`. « Actif depuis ». Badge G4 + `encore {pts} · {vols}`. CTA `/log`. | Adapter | A+B |
| SW-P2 | Permalink court `/p/GHU5NB` **non affiché** | Shareable, mais opérateur a masqué alias + copy. | I2 public vs PIN club. | Pas de permalink tant que D-AUTH / I2. URL actuelle `/pilots/cuid` suffit en club. | Reporter | B |
| SW-P3 | OG/Twitter card | Partage Discord = acquisition. | I2. Image générée sortie = C. | Plus tard : `og:title` callsign + pts. Pas d’image Tacview. | Reporter | B |
| SW-P4 | **10 tuiles** : Flown, Landed, Deaths, Captured, Air, Ground, Friendly, Flight time, Survival, Accuracy | Portrait opérationnel. | Friendly/accuracy/landed/deaths : schéma incomplet. Accuracy 110 % (P5). | Tuiles v1 **existantes +** : vols, heures, réussite %, pts, 4 kills. Ajouter **répartition outcomes** (5 valeurs déjà en base). Pas accuracy. Pas friendly. | Adapter | A |
| SW-P5 | **Fate stacked bar** + légende | Récit des fins de vol. Meilleur que 1 % réussite. | Mapping fate≠outcome. | Barre 5 `OUTCOMES` (couleurs status DS). Légende compte. | Adapter | A |
| SW-P6 | Heatmap **perso** 365 j + streak | « J’ai volé cette semaine ? » | Vide = honte. Empty bienveillant. | Même composant H9, `?pilot=`. Empty : « Pas encore de vol — Enregistrer un vol ». | Adapter | A |
| SW-P7 | **13 badges** + progress + tooltip (Ace, Double Ace, Ground Pounder, Tank Buster, Radar Killer, Convoy Hunter, Survivor streak 10, Iron Man 2 h, Sharpshooter, Line Pilot 25, Veteran 100, Old Hand 20 h, Marathon 25 missions) | Collection. Near-miss Convoy 20/25 = dopamine. | Radar/convoy/tank/sharpshooter = types de cibles absents. 13 badges = bruit club. | 6–8 badges **sur données club** : vols (10/25/100), heures (10/25), pts, kills air 5/10, kills sol 25/50, série SUCCESS, 1 vol ≥ 2 h. Table `Badge` + `PilotBadge` ou calcul dérivé. Tooltip = règle. Locked vs earned (tokens, pas emoji). | Adapter | B |
| SW-P8 | **Personal records** (longest, most kills sortie, fastest, streak) + play | Ego distinct du HoF global. | Fastest = C. | Max durée, max pts, max chaque kill, série SUCCESS. Lien vol. | Adapter | A |
| SW-P9 | **Death analysis** (cause AAA, killers, loss rate avion, carte GPS, médiane alt/speed) | Amélioration réelle. | 100 % télémétrie. Déclaratif : on a `outcome` pas la cause. | Skip carte/alt/speed/AAA. Optionnel plus tard : table « résultats par avion » (lost ≈ PARTIAL_AIRCRAFT + TOTAL_FAILURE). | Adapter partiel | A minime / C reste |
| SW-P10 | **Rivalries** : Nemesis, Favourite target, liste you–them, page **versus** (meetings + avions) | Drame social PvP. | Impossible sans kill events joueur↔joueur. Saisie manuelle = bagarre club. | Ne pas faire en déclaratif. Après I1 éventuellement. | Ne pas copier | C |
| SW-P11 | Table **aircraft** : flown, air, ground, deaths, survival, accuracy | Spécialisation. « Je suis un IL-10 driver ». | Accuracy null/0. | `groupBy aircraftId` sur `Flight`. Colonnes : vols, heures, pts, 4 kills, % SUCCESS. Lien filtre `/flights?pilot=&aircraft=`. | Adapter | A |
| SW-P12 | Mini-map **recent routes** | Identité spatiale. | I1 + assets carte. | Ne pas faire. | Ne pas copier | C |
| SW-P13 | Recent sorties : Day, avion, **payload**, fate, kills, temps → page sortie | Récit armement. | Payload non saisi. | Enrichir `FlightCard` : kills + pts (notes restent notes). Payload = hors scope sauf champ futur. Historique : passer de `take: 10` à pagination « voir tous ». | Adapter | A |
| SW-P14 | Fallback saison vide → all-time + note | H9 erreur évitée. | Copy. | Si filtre période 0 vol : message + bascule « toutes périodes ». | Adapter | A |
| SW-P15 | Bloc **Modifier le statut** (PIN) | Ops club. Unique Simpilot. | Concurrence visuelle avec la carrière. | Garder, **sous** le fold carrière (Collapsible déjà). Ne pas copier Sidewinder ici. | Déjà couvert | — |

### 5.5 Pages satellites (contexte, pas le cœur « classement/pilote »)

| ID | Feature | Avis | Pourquoi |
|----|---------|------|----------|
| SW-X1 | Sorties search (side, aircraft, fate, name, dates, load more) | **Adapter partiel** | `/flights` a déjà filtres. Ajouter q nom si manquant. Pas de side RED/BLUE. |
| SW-X2 | Sortie receipt : timeline, ammo, hits, engagements, replay, OG image | **Ne pas copier** | Télémétrie. Garder `/flights/[id]` déclaratif. |
| SW-X3 | Mission report : map front, kill feed, objectives, top pilots | **Reporter** | Chez nous « mission » = `missionName` texte, pas une session serveur. Mini-top déjà D3. |
| SW-X4 | Front heatmap / War effort | **Ne pas copier** | Campagne persistante serveur. Même eux : War Room « coming soon ». |
| SW-X5 | Discord nav + PWA SW | **Reporter** | I2 / notifs hors PIN. |
| SW-X6 | Aliases pilote | **Reporter** | Lié P-MERGE. Pas un levier rétention v1. |

---

## 6. Ce que Sidewinder enseigne **à ne pas faire**

| Leçon (preuve) | Application Simpilot |
|----------------|----------------------|
| Ils ont **caché** le board score (03/09) | 1 monnaie = points club. Pas de 2e formule sur le LB. |
| Ils ont **caché** le season picker profil (04/09) | Fiche = carrière all-time. Filtres période = classements. |
| Ils ont **retiré** glossaire des tuiles | Règle courte, une fois, près du chiffre. |
| 14 boards dont plusieurs vides / négatifs (Rookies) | Moins de boards, seuils, empty honnête. |
| Accuracy > 100 % | Pas de métrique dont on ne maîtrise pas le dénominateur. |
| Replay promis partout | 0 icône vidéo tant que I1 n’existe pas. |
| Front/War Room disabled alors que les URLs existent | Pas de nav « bientôt » (H1). |

---

## 7. Lot checklist proposé (prêt à coller)

Ordre Designer : **fiabiliser la boucle « moi + ce soir » avant G4**.

### Lot A — Rétention sur données existantes (SOON)

Objectif : un pilote du club ouvre `/leaderboard` après la sortie, **se trouve**, voit l’écart, clique pour logger.

| ID | Item | Succès | Effort | Fichiers |
|----|------|--------|--------|----------|
| SW-A0 | **+1 pt par vol SUCCESS** (Landed) dans `flightTotalPoints` + recalc historique + copy règle | Totaux / LB / score live D2 cohérents | M | `src/lib/scoring.ts`, `POINTS_RULES_LABEL` |
| SW-A1 | URL state filtres classements | Refresh / share conserve board+période+sim+escadrille+statut | F | `leaderboard/page.tsx` |
| SW-A2 | Search pilote nom/callsign + highlight optionnel dernier log (confort kiosque, pas un compte) | 1–3 frappes → fiche ; row focus si on vient du log | F | `GET /api/pilots?q=`, `leaderboard/page.tsx` |
| SW-A3 | Gap « N pts pour le rang au-dessus » sur la row focus | Chiffre concret sans user | F | `leaderboard/page.tsx` |
| SW-A5 | Spotlight « meilleur vol 24 h / dernière soirée » (1 seul) | Card avec pilote, pts, lien vol | F | `GET /api/stats/leaderboard` ou `/api/stats/dashboard`, `page.tsx` et/ou LB |
| SW-A6 | Heatmap activité club + perso | Clic jour → liste vols | M | nouveau composant, `groupBy` date SQLite |
| SW-A7 | Fiche : barre outcomes + table avions + records perso (max 1 vol) | Fiche = carrière, plus seulement admin statut | M | `pilots/[id]/page.tsx` aggregations Prisma |
| SW-A8 | Board **Réussite** avec seuil min vols + tie-break documenté | Pas de #1 à 1 vol 100 % | F | `leaderboard/page.tsx` + footnote |
| SW-A9 | HoF compact (records 1 vol + carrière) sous les listes | 6–8 records, lien vol/fiche | M | aggregations sur `Flight` |
| SW-A10 | Δ rang vs période précédente (comme D1) | ▲▼ sur la row | M | API : 2 fenêtres, diff rank |

**Hors-scope A :** grades, badges persistés, saisons nommées, replay, rivaux, accuracy.

### Lot B — Carrière (LATER, étend **G4**)

| ID | Item | Succès | Dépend |
|----|------|--------|--------|
| SW-B1 | Échelle grades config FR + **révocable** + floors + hysteresis | Standing live lisible, pas de yo-yo #grade | **D-SW1 tranché** — figer seuils montée/descente |
| SW-B2 | Badge grade fiche + chip LB + progress next | Visible 3 s | B1 |
| SW-B3 | 6–8 badges à progress bar | Tooltip = règle ; locked/earned | B1 logique |
| SW-B4 | Feed promotions 7 j. | Sur `/` et LB | B1 |
| SW-B5 | Campagnes nommées (optionnel) | Picker « Opération X » | D-SW2 |

### Lot C — Ne pas mettre en checklist d’exécution

Replay, carte, front, war, accuracy, nemesis/versus, death GPS, countdown serveur, 14 boards, 2e score, permalink public (avant I2).

---

## 8. Mapping checklist existante

| Checklist | Lien Sidewinder | Action |
|-----------|-----------------|--------|
| G4 Grades | SW-R1–R6, SW-P1, SW-B* | **Enrichir** G4 : échelle FR, **révocable + hysteresis**, floors, UI progress, feed. Ne pas copier never-lost. |
| D3 Top 3 escadrille | SW-H5 | Déjà livré. Compléter par Top 5 club 30 j. |
| G1/G5 filtres LB | SW-L16 | Déjà livré. |
| D1 Δ KPI dashboard | SW-A10 | Même pattern sur **rangs**. |
| C5 localStorage log | SW-A2 | Réutiliser, ne pas créer une 2e identité. |
| A3 Solo hors classements | tous les boards | Filtre API obligatoire dès Lot A (même si seed Solo plus tard). |
| I1 Collecteur | SW-P10, X2, X4 | Condition **C**. |
| I2 Page publique | SW-P2/P3 | OG + permalink seulement après. |
| P-MERGE | aliases | Pas un levier rétention v1. |

---

## 9. Justification (Designer.md)

| Reco | Principe / source |
|------|-------------------|
| Me + gap avant 14 boards | Fogg · goal-gradient · Miller — preuve Sidewinder : You row + « needs N more » |
| 1 score club | H2 / Krug — preuve : board score **retiré** par l’opérateur |
| Fiche = carrière all-time | H6 — preuve : season picker profil **hidden** 04/09 |
| Seuils sur ratios | Confiance / anti-lucky — preuve : Survivor threshold 10, seulement 2 ranked S18 |
| Pas de replay icon | H1 — audit I1 LATER |
| Badges 6–8 pas 13 | Miller · Halo DS Korea |
| Never-lost grades *(Sidewinder)* | **Non repris** — D-SW1 révocable + D-SW2 gel hors combat |
| +1 pt SUCCESS / Landed | D-SW3 · H11 règles visibles · aligné `½ × landings` Sidewinder mais **+1** et **sans** pénalité mort |
| Heatmap | Preuve d’habitude (55 jours actifs Sidewinder / streak 4) traduite en « soirs club » |

**Incertain restant (mineur) :** liste exacte Aspirant→Major + chiffres seuils G4 · hysteresis (N vols de grâce vs seuils asymétriques) · rétroactivité du +1 pt SUCCESS (recalc tout vs à partir de maintenant).

---

## 10. Décisions (tranchées 17/09/2026)

| ID | Question | Statut |
|----|----------|--------|
| **D-SW1** | Échelle + never-lost ? | **FR Aspirant→Major, révocable**, hysteresis à figer en impl. |
| **D-SW2** | Qui est « moi » ? | **Temps 1 = le Pilote** (pas de user). Search, pas You-auth. **Hors comb. = grade gelé.** Temps 2 = compte user agrège plusieurs pilotes (H1-impl). |
| **D-SW3** | Survival / streak / Landed ? | Outcomes actuels **OK**. `SUCCESS` = Landed. **+1 point par SUCCESS.** Pas de pénalité death/capture. Barre 5 outcomes sur fiche. Streak = option Lot B sur SUCCESS consécutifs. |

**Rétroactivité (à confirmer au moment du Lot A) :** recalc tous les vols historiques avec +1 SUCCESS, sinon les classements « toutes périodes » restent faux. Avis Designer : **recalc tout** + une ligne Journal « règle points mise à jour ».

Voilà l'analyse IA de ton associé Design !
