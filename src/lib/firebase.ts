import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App uniquely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test connection on boot according to guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'posts', 'test-connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration if you are offline.");
    }
  }
}
testConnection();

// Timeout utility to prevent Firestore requests from hanging in sandboxed environments
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => {
      console.warn(`Firestore operation timed out after ${timeoutMs}ms. Using fallback.`);
      resolve(fallbackValue);
    }, timeoutMs))
  ]);
};

// Types representing Blog Data
export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  date: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  createdAt: any;
  updatedAt?: any;
}

export interface BlogComment {
  id?: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

// Error Handling following Eight Pillars of Hardened Rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Pre-seeded high-quality blog posts to show immediately when database is empty
export const defaultBlogPosts: BlogPost[] = [
  {
    id: "pakistan-mineral-treasure-map",
    title: "Part 2: Pakistan's Mineral Treasure Map — Province-Wise Resources, Scientific Formation, and Economic Potential",
    slug: "pakistan-mineral-treasure-map",
    date: "July 15, 2026",
    summary: "A province-by-province geological inventory of Pakistan's rich metallic, industrial, and energy deposits, explaining the hydrothermal science of copper-gold formations and the strategic rise of critical minerals.",
    category: "Physical Metallurgy",
    author: "Abdul Rahman",
    createdAt: new Date("2026-07-15T10:00:00Z"),
    content: `
# Part 2: Pakistan's Mineral Treasure Map — Province-Wise Resources, Scientific Formation, and Economic Potential

## Pakistan's Mineral Wealth at a Glance

Before exploring each province, it's important to understand the sheer scale and diversity of Pakistan's mineral resources. 

Unlike many countries that specialize in only one or two valuable commodities, Pakistan possesses metallic minerals, industrial minerals, gemstones, energy minerals, and emerging critical minerals. This geological diversity gives Pakistan a unique strategic advantage in the global mining industry.

The table below summarizes some of the country's most significant mineral resources:

| Mineral | Estimated Reserve | Major Province(s) | Primary Uses | Global Importance |
| :--- | :--- | :--- | :--- | :--- |
| **Copper** | 13.18 million tonnes (Reko Diq) | Balochistan | Electrical wiring, EVs, renewable energy | Extremely High |
| **Gold** | 17.9 million ounces (Reko Diq) | Balochistan | Investment, electronics, aerospace | Very High |
| **Coal** | 175 billion tonnes | Sindh | Electricity generation | High |
| **Rock Salt** | 25–30 billion tonnes | Punjab | Food, chemicals, pharmaceuticals | High |
| **Limestone** | ~1,205 billion tonnes | Punjab, KP, Sindh | Cement and construction | High |
| **Marble & Granite** | ~297 billion tonnes | KP, Balochistan | Construction, architecture | Medium |
| **Chromite** | ~2.5 million tonnes | Balochistan, KP | Stainless steel, aerospace | High |
| **Iron Ore** | ~500 million tonnes | Punjab, Balochistan | Steel manufacturing | High |
| **Lead & Zinc** | ~28 million tonnes | Balochistan | Batteries, galvanization | High |
| **Rare Earth Elements** | Under exploration | Balochistan | EVs, wind turbines, electronics | Strategic |

---

## Balochistan: Pakistan's Mineral Powerhouse

If Pakistan's geology were compared to a treasure chest, **Balochistan would be its largest compartment**.

Although the province occupies around **44% of Pakistan's land area**, it contains **more than half of the country's known mineral wealth**. Its rugged mountains and volcanic terrains were shaped by millions of years of tectonic activity, creating ideal conditions for the formation of valuable metallic ores.

### Major Mineral Resources
* **Copper & Gold** (World-class reserves)
* **Chromite** (High metallurgical grade)
* **Iron ore** (Dilband & Nok Kundi deposits)
* **Barite, Fluorite, Lead & Zinc**
* **Decorative Stones** (High-quality Onyx, Marble, and Granite)
* **Antimony**

The province is home to internationally significant mining projects such as **Reko Diq** and **Saindak**, which are expected to become major contributors to Pakistan's export economy.

### 🔬 Scientific Insight: Hydrothermal Mineralization

Most metallic minerals in Balochistan formed through a geological process known as **hydrothermal mineralization**.

In simple terms, superheated water (ranging from 200°C to over 600°C) rich in dissolved metals circulated through deep structural fractures beneath ancient volcanoes. As these fluids migrated upward and cooled, the solubility of metals dropped rapidly. Copper, gold, silver, and other elements crystallized out of the solution, depositing into concentrated veins and micro-fractures in the host rock.

These geological systems are known as **porphyry copper-gold deposits**, which represent some of the largest and most valuable mineral accumulations on Earth.

### Reko Diq: One of the World's Largest Untapped Copper-Gold Deposits

Among Pakistan's mineral assets, **Reko Diq** stands out as the absolute crown jewel. Located in the remote Chagai District of Balochistan, this massive porphyry system contains approximately:
* **13.18 million tonnes of copper**
* **17.9 million ounces of gold**

The estimated in-ground value of this deposit exceeds **$180 billion**, making it one of the single most valuable undeveloped mineral assets in the world. 

#### Why Copper Is So Valuable
Copper is often called **the metal of electrification**. Its outstanding electrical and thermal conductivity makes it absolutely indispensable for:
* **Electric Vehicles (EVs):** EVs use up to 4x more copper than internal combustion engine vehicles.
* **Power Transmission:** Essential for connecting renewable energy sources (wind and solar) to the grid.
* **Data Centers & AI Infrastructure:** High-performance processors require immense power delivery networks made of copper.
* **Robotics & Telecommunications:** The nervous system of modern automated industries.

As the world transitions toward cleaner energy, global copper demand is projected to double by 2035, positioning Balochistan as a key strategic supplier.

### Saindak: Pakistan's First Modern Copper-Gold Mine
Before Reko Diq captured global headlines, **Saindak** demonstrated that Pakistan could successfully operate a large-scale metallurgical mining enterprise. Located near the Iranian border, the project has been operating commercially since 2002, producing copper-gold blister for export and generating hundreds of millions of dollars in revenue. It serves as an essential training ground for the nation's mining engineering workforce.

---

## Sindh: Pakistan's Energy Province

While Balochistan dominates metallic minerals, **Sindh is the country's energy heartland**.

Its most famous geological resource is the **Thar Coalfield**, one of the largest continuous lignite coal deposits on Earth.

* **Estimated Reserve:** **175 billion tonnes**
* **Theoretical Energy Potential:** Capacity to generate electricity for centuries, reducing the country's dependence on expensive imported oil and LNG.

### How Coal Forms: The Process of Coalification
Lignite coal originates from ancient subtropical forests that thrived in swampy, low-lying coastal basins tens of millions of years ago. 

Over geological time, massive volumes of dense vegetation died and accumulated under water, forming peat. This peat was buried beneath hundreds of meters of heavy sand, clay, and river silt. Subjected to rising temperatures and intense lithostatic pressure, the organic matter underwent **coalification**—progressively driving out moisture, carbon dioxide, and volatile gases, leaving behind a highly concentrated carbon fuel.

The Thar deposits primarily consist of **lignite**, which is a lower-rank, high-moisture coal compared to bituminous coal. While it has lower energy density, its massive volume makes it a highly viable domestic energy resource when utilized near the mine site.

### 🌿 Environmental Perspective
While coal mining provides critical energy security, it presents acute environmental challenges:
* **Carbon dioxide (CO2) emissions** causing greenhouse warming.
* **Air quality issues** from ash, sulfur dioxide, and particulate emissions.
* **Groundwater contamination** and drawdown affecting fragile desert aquifers.
* **Land subsidence** and ecosystem disruption in the delicate desert environment.

Modern operations in Thar are increasingly adopting strict environmental safeguards, mine-mouth power generation, water recycling, and long-term land rehabilitation frameworks to balance energy security with environmental stewardship.

---

## Punjab: Pakistan's Industrial Mineral Hub

Punjab's mineral wealth differs significantly from the volcanic metallic belts of Balochistan. Instead of copper and gold, Punjab is exceptionally rich in **industrial minerals** that underpin the construction, chemical, and agricultural sectors.

### Major Industrial Resources
* **Rock Salt** (Enormous high-purity deposits)
* **Limestone** (Feeding massive cement plants in the Salt Range)
* **Gypsum & Silica Sand**
* **Coal** (Sub-bituminous reserves)
* **Iron Ore** (Chiniot-Rajoa deposits under active exploration)
* **Rock Phosphate** (Essential for fertilizer production)

These raw materials serve as the structural backbone of Pakistan's heavy manufacturing, chemical synthesis, and pharmaceutical industries.

### Khewra Salt Mine: A Geological Wonder
The famous **Khewra Salt Mine** is far more than a popular tourist destination; it is an extraordinary natural archive. 

Formed approximately **600 million years ago** during the late Neoproterozoic era, these deposits are the remnant of an ancient inland sea (the Proto-Tethys) that underwent massive evaporation. Tectonic uplift during the collision of the Indian and Eurasian plates pushed these ancient salt layers to the surface, creating the majestic Salt Range.

Today, Khewra holds an estimated **25 to 30 billion tonnes** of high-purity halite (rock salt) and is celebrated globally for producing premium, nutrient-rich **Himalayan Pink Salt**.

#### Scientific Fact: The Origin of Pink
The distinctive pink and red hues of Himalayan salt are completely natural. They result from trace amounts of mineral impurities incorporated into the sodium chloride crystal lattice during the ancient sea's evaporation, including **iron oxide**, **potassium**, **magnesium**, and **calcium**.

---

## Khyber Pakhtunkhwa (KP): Pakistan's Gemstone Kingdom

Khyber Pakhtunkhwa (KP) is globally renowned for its spectacular ornamental stones and rare gemstones. Its rugged, metamorphosed mountain belts produce highly prized minerals:
* **Emeralds** (The famous vibrant green Swat emeralds)
* **Pink Topaz** (Unique to the Katlang region)
* **Tourmaline, Aquamarine & Garnet**
* **High-grade Industrial Marble & Granite** (Enormous reserves)

### Why KP Produces Gemstones
Gemstones form under extreme, rare geological conditions. The high-energy collision of the Indian continental plate into the Eurasian block squeezed and folded local rocks, exposing them to:
1. **Intense metamorphic pressures & temperatures** deep in the crust.
2. **Mineral-rich magmatic fluids** flowing through crustal fractures.
3. **Extremely slow cooling rates**, allowing atoms to align into perfectly ordered, highly symmetric crystal lattices.

This slow, pristine crystal growth is what gives KP's gemstones their exceptional transparency, high refractive index, and vivid brilliance. The emeralds of the Swat Valley are often compared to Colombia's finest specimens due to their stunning chromium-induced green hue.

---

## Gilgit-Baltistan: The Hidden Gem Capital

Nestled in the collision zone of three mighty mountain ranges—the Himalayas, the Karakoram, and the Hindu Kush—**Gilgit-Baltistan remains one of the world's most promising, yet least explored gemstone regions**.

GB hosts outstanding deposits of:
* **Ruby & Sapphire**
* **Aquamarine** (Stunning deep blue crystal specimens)
* **Tourmaline & Topaz**
* **Quartz crystals and high-purity feldspar**

Due to extreme topography and lack of modern infrastructure, mining in GB remains largely artisanal. Geologists believe that massive, world-class deposits remain undiscovered deep beneath the high alpine glaciers. Promoting responsible mining here can catalyze local economic uplift while preserving the delicate mountain ecosystems.

---

## Why Critical Minerals Will Shape Pakistan's Future

For much of the twentieth century, global geopolitics was dominated by the race for oil. **In the twenty-first century, the arena has shifted to critical minerals.**

Critical minerals are elements that are essential for high-tech manufacturing, clean energy transitions, and national defense, but are subject to high supply risk.

| Critical Mineral | Role in Clean Tech & Advanced Engineering |
| :--- | :--- |
| **Rare Earth Elements (REEs)** | Powerful neodymium magnets for EV motors and wind turbines. |
| **Copper** | Indispensable electrical conductor for grids, motors, and batteries. |
| **Graphite** | The primary anode material in lithium-ion batteries. |
| **Nickel & Cobalt** | High-energy cathode materials for long-range electric vehicles. |
| **Lithium** | The fundamental carrier ion for modern rechargeable battery chemistry. |
| **Antimony** | Flame retardants, military semiconductors, and solar glass. |

### 🧠 Expert Insight: The Value-Addition Imperative
> "Mining raw ore alone does not create sustained national wealth. Selling unprocessed mineral concentrate is equivalent to exporting cheap soil. True economic prosperity is generated by establishing domestic chemical processing, metallurgical refining, and advanced manufacturing. Converting copper ore into high-purity copper cathodes, and then into electric vehicle wiring or power components, multiplies the economic value-add by a factor of 10x to 100x."

By building domestic materials research, academic collaborations, and high-purity processing facilities, Pakistan can successfully transition from a simple raw exporter to a high-value technology-enabler on the global stage.

---

## What's Next?
In **Part 3** of this series, we will transition from geology to macroeconomic policy, exploring:
1. Why Pakistan's mining sector contributes a meager **2-3% of GDP** despite its immense $6 trillion potential.
2. The concept of the **"Resource Curse"** and how other developing nations have navigated it.
3. A comparative economic analysis of Pakistan's mineral policies versus mining giants like Australia, Chile, and Canada.
4. Strategic recommendations for policy reform, international investment, and high-purity local refining.

Stay tuned for our final chapter in this comprehensive materials analysis series.
`
  },
  {
    id: "pakistan-6-trillion-mineral-wealth",
    title: "Pakistan's $6 Trillion Mineral Wealth: The Untapped Scientific Treasure That Could Transform the Nation",
    slug: "pakistan-6-trillion-mineral-wealth",
    date: "July 7, 2026",
    summary: "Pakistan possesses an estimated $6 trillion in mineral wealth, including copper, gold, rare earth elements, coal, iron ore, gemstones, and industrial minerals. Discover the science behind these resources.",
    category: "Physical Metallurgy",
    author: "Abdul Rahman",
    createdAt: new Date("2026-07-07T10:00:00Z"),
    content: `
![The Mineral Map of Pakistan](/src/assets/images/pakistan_mineral_map_1783445793899.jpg)

# Pakistan Is Sitting on a $6 Trillion Treasure—Why Is It Still Struggling?

Imagine owning one of the world's richest underground treasure chests but never finding the key to unlock it.

This is the story of Pakistan.

Beneath its mountains, deserts, river plains, and ancient volcanic rocks lies an extraordinary collection of natural resources. Massive deposits of copper, gold, coal, chromite, iron ore, gemstones, industrial minerals, and emerging critical minerals could place Pakistan among the world's leading mineral-producing nations.

Economists estimate that the country's underground mineral resources may exceed **$6 trillion** in value. Yet, despite this enormous wealth, mining contributes only **2–3% of Pakistan's Gross Domestic Product (GDP)**.

This contradiction raises an important question:

> **How can a country so rich in minerals remain economically constrained?**

The answer lies far beyond geology.

It involves science, governance, economics, engineering, environmental sustainability, technological innovation, and long-term national planning.

Today, the global economy is entering an era defined by **electric vehicles**, **renewable energy**, **artificial intelligence**, and **advanced manufacturing**. Every one of these industries depends heavily on critical minerals such as copper, lithium, nickel, cobalt, graphite, and rare earth elements.

Countries are now competing to secure stable mineral supplies.

Pakistan has the geological potential to become an important contributor to this global transition—but only if it can transform underground wealth into sustainable economic development.

---

## Key Takeaways

✔ Pakistan possesses approximately **92 identified minerals**, with more than **52 currently being mined commercially**.

✔ The estimated value of Pakistan's natural resources exceeds **$6 trillion**.

✔ The country hosts one of the world's largest undeveloped copper-gold deposits at **Reko Diq**.

✔ The **Thar Coalfield** contains around **175 billion tonnes of lignite**, ranking among the world's largest coal reserves.

✔ Pakistan's mining industry contributes only **2–3% of GDP**, far below its actual potential.

✔ More than **90% of mineral exports leave the country with minimal processing**, resulting in substantial economic losses.

✔ Strong institutions, modern technology, environmental stewardship, and value-added industries are essential for converting mineral wealth into national prosperity.

---

# Why Minerals Matter More Than Ever

Minerals are no longer simply materials extracted from the ground.

They have become the foundation of the modern technological world.

Every smartphone contains over **60 different chemical elements**.

Every electric vehicle requires approximately four times more mineral resources than conventional automobiles.

Modern wind turbines consume enormous quantities of copper, rare earth magnets, and specialty alloys.

Solar panels rely on silicon, silver, aluminum, and various specialty metals.

Even artificial intelligence data centers depend upon vast quantities of copper wiring and advanced materials.

The global shift toward clean energy has triggered what experts describe as the **Critical Minerals Race**.

According to international energy forecasts, demand for several strategic minerals is expected to increase multiple times during the coming decades.

Countries that possess these resources—and develop them responsibly—could become major beneficiaries of the global green economy.

Pakistan is one of those countries.

---

# The Geological Story Behind Pakistan's Mineral Wealth

Many people assume mineral deposits occur randomly.

In reality, mineral formation is the result of geological processes occurring over hundreds of millions of years.

Pakistan occupies one of Earth's most geologically fascinating regions.

The country lies where the **Indian Plate** continues to collide with the **Eurasian Plate**.

This ongoing collision created the majestic Himalayas while simultaneously generating intense geological activity beneath the surface.

These tectonic forces produced:

* volcanic arcs
* mountain-building events
* hydrothermal systems
* sedimentary basins
* metamorphic rocks

Each geological environment generated different mineral deposits.

---

## Why Pakistan Is Naturally Rich in Minerals

Pakistan contains several distinct geological provinces.

Each possesses unique mineral resources.

### 1. Chagai Magmatic Arc (Balochistan)

This ancient volcanic belt hosts world-class deposits of:

* Copper
* Gold
* Molybdenum
* Silver
* Porphyry mineral systems

The internationally renowned **Reko Diq** and **Saindak** deposits formed within this geological setting.

---

### 2. Salt Range (Punjab)

Millions of years ago, an ancient inland sea evaporated repeatedly.

These evaporation cycles deposited enormous quantities of salt and gypsum.

Today, this region contains:

* Rock salt
* Gypsum
* Limestone
* Coal

The famous **Khewra Salt Mine** is one of the largest salt mines in the world.

---

### 3. Thar Desert Basin (Sindh)

Unlike metallic mineral deposits, the Thar Basin formed from ancient forests buried beneath sediments over tens of millions of years.

Pressure and heat gradually transformed plant material into lignite coal.

The result is one of the world's largest coalfields.

---

### 4. Northern Mountain Belts

The collision of continental plates generated ideal conditions for gemstones.

Pakistan's northern mountains produce internationally recognized:

* Emeralds
* Rubies
* Aquamarine
* Tourmaline
* Topaz

Many gemologists regard these among the finest gemstones available globally.

![Valuable Mineral Specimen Samples of Pakistan](/src/assets/images/mineral_samples_1783445814400.jpg)

# Pakistan's Most Valuable Mineral Resources

Pakistan possesses a remarkable diversity of mineral resources, ranging from precious metals to industrial minerals that support infrastructure, manufacturing, agriculture, and renewable energy.

These resources can broadly be divided into five major categories.

---

## 1. Precious Metals

Precious metals have historically symbolized wealth and continue to play a critical role in investment, electronics, aerospace, and advanced manufacturing.

Pakistan's most valuable precious metals include:

* Gold
* Silver

Most gold occurs alongside copper deposits within porphyry systems such as Reko Diq and Saindak.

---

## 2. Base Metals

Base metals form the backbone of modern civilization.

Copper carries electricity.

Iron builds cities.

Lead and zinc protect infrastructure from corrosion.

Pakistan possesses economically significant deposits of:

* Copper
* Iron ore
* Lead
* Zinc
* Chromite
* Antimony

These minerals are essential for electric vehicles, renewable energy systems, electronics, and construction.

---

## 3. Industrial Minerals

Industrial minerals may receive less public attention than gold, but they contribute far more to everyday life.

Pakistan possesses extensive reserves of:

* Limestone
* Gypsum
* Marble
* Granite
* Barite
* Silica sand
* China clay
* Rock phosphate

These materials are indispensable for producing:

* Cement
* Glass
* Fertilizers
* Ceramics
* Paint
* Pharmaceuticals
* Construction materials

---

## 4. Energy Minerals

Energy security remains one of Pakistan's greatest economic challenges.

Fortunately, the country contains substantial energy resources including:

* Coal
* Natural gas
* Petroleum
* Uranium

Among these, the Thar Coalfield represents the largest known energy reserve.

---

## 5. Critical Minerals

Perhaps the most exciting opportunity lies in critical minerals.

These materials power the global transition toward clean energy.

Critical minerals include:

* Rare earth elements
* Antimony
* Copper
* Graphite
* Nickel
* Lithium (under exploration)

These resources are rapidly becoming strategic assets as nations compete to build batteries, wind turbines, electric vehicles, robotics, semiconductors, and advanced defense technologies.

---

# Why the World Is Suddenly Interested in Pakistan

For decades, Pakistan's mining sector attracted relatively modest international attention.

Today, the situation has changed dramatically.

The rapid expansion of electric vehicles, renewable energy infrastructure, artificial intelligence, and modern defense systems has created an unprecedented demand for critical minerals.

Governments and multinational companies are actively searching for reliable sources of copper, rare earth elements, gold, and other strategic materials.

Pakistan's geological potential has therefore become increasingly significant—not only for its own economic development but also for global supply chains seeking to diversify beyond traditional mineral-producing regions.

---

## Coming Up in Part 2

In the next section, we'll examine:

* Pakistan's richest mineral deposits province by province
* The science behind copper, gold, coal, chromite, gemstones, and rare earth elements
* A comprehensive comparison table of major mineral reserves
* The economic value of each resource
* Why Balochistan is considered Pakistan's mineral powerhouse
* Exclusive infographics and geological maps

The next part will continue seamlessly from here, maintaining the same publication-quality style.
`
  },
  {
    id: "alloy-optimization-ml",
    title: "Accelerating Alloy Discovery with Bayesian Optimization",
    slug: "alloy-optimization-ml",
    date: "June 15, 2026",
    summary: "How we combine physical metallurgy constraints with active learning to discover high-performance structural steels and Zn-based alloys in minimal experimental iterations.",
    category: "Computational Materials Science",
    author: "Abdul Rahman",
    createdAt: new Date("2026-06-15T12:00:00Z"),
    content: `
### The Challenge of Modern Alloy Design

Traditional metallurgical exploration relies heavily on Edisonian trail-and-error loops—fabricating dozens of alloy samples, heat-treating them under varied schedules, and performing tedious mechanical characterization. This physical limit restricts materials scientists to a fraction of the vast multi-element compositional space.

In physical metallurgy, finding the optimal balance of tensile strength, elongation, and environmental degradation resistance is inherently a multi-objective optimization problem. 

### Enter Bayesian Optimization

To accelerate this bottleneck, we integrated **Bayesian Optimization** coupled with gaussian process regressors to intelligently guide our physical experiments. 

Rather than randomly exploring compositions, our active learning loop works as follows:
1. **Prior Knowledge Initialization:** We seed our model with historical data from literature and thermodynamic databases (CALPHAD).
2. **Surrogate Modeling:** A Gaussian Process model predicts performance across thousands of prospective candidate configurations, providing both a predicted mean (expected strength) and uncertainty (variance).
3. **Acquisition Function:** Using Expected Improvement (EI), the system selects the next specific composition to physically formulate at our PCSIR facility. This balances **exploration** (high uncertainty regions) with **exploitation** (high predicted performance).

\`\`\`python
# Example of Bayesian Active Learning Step
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern

# Multi-objective compositional optimization
kernel = Matern(nu=2.5)
gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-5, n_restarts_optimizer=10)
gp.fit(X_train, y_train)  # X: Alloy composition %, y: Yield Strength
\`\`\`

### Impact & Results

Using this informatics-driven approach on Zn-based alloy systems, we reduced the number of experimental castings required to achieve a targeted tensile threshold by **over 60%**. Furthermore, physical metallurgy constraints (such as preserving phase balance like ferrite/austenite ratios in weld cladding) were incorporated directly as penalty constraints in the acquisition function.

The convergence of computational Materials Informatics and classical laboratory expertise is no longer a future concept—it is the modern standard for accelerating industrial discovery.
    `
  },
  {
    id: "direct-cathode-recycling",
    title: "Direct Regeneration of Lithium-Ion Battery NMC Cathodes",
    slug: "direct-cathode-recycling",
    date: "May 22, 2026",
    summary: "Deep dive into sustainable regeneration strategies for nickel-rich NMC cathodes, restoring electrochemical performance without complete hydro-metallurgical extraction.",
    category: "Sustainable Materials",
    author: "Abdul Rahman",
    createdAt: new Date("2026-05-22T12:00:00Z"),
    content: `
### The Circular Economy for Battery Materials

With the exponential surge in Electric Vehicle (EV) usage, managing spent lithium-ion batteries is transitioning from an environmental challenge to an economic and strategic necessity. Current commercial recycling processes rely heavily on pyrometallurgical or hydrometallurgical routes. While effective, they dissolve the cathode completely into salts, requiring massive energy, acid consumption, and resynthesis loops.

My MS research focuses on **Direct Recycling and Regeneration**, a solid-state restorative approach that preserves the highly engineered cathode microparticles, directly healing lithium vacancies and lattice defects.

### Degradation Mechanisms of Nickel-Rich Cathodes

During extensive cycling, nickel-rich cathodes (such as NMC 811) suffer from:
1. **Lithium Depletion:** Loss of active lithium ions trapped in irreversible solid-electrolyte interphase (SEI) layers.
2. **Phase Transition:** Evolution of the active layered structure (R-3m) into an inactive rock-salt phase (Fm-3m) at the particle surface, driven by oxygen loss.
3. **Microcracking:** Anisotropic lattice expansion and contraction causing intergranular cracking, exposing fresh surfaces to degradation.

### Restorative Hydrothermal Relithiation

Our direct recycling workflow targets these defects by combining short-duration chemical cleaning, low-temperature hydrothermal relithiation, and short-duration thermal annealing:

* **Step 1: Chemical Reconditioning:** Extracting binder and carbon black residues while preserving the transition metal oxide core.
* **Step 2: Hydrothermal Relithiation:** Immersing the degraded cathode particles in a concentrated lithium-rich solution (LiOH / LiNO3) at 180°C to forcefully drive lithium back into the vacant octahedral sites.
* **Step 3: Short Annealing:** Heating the particles to 750-800°C to crystallize the restored layered phase and eliminate structural defects.

### Experimental Characterization Results

We verified the structural restoration using Rietveld refinement on our X-ray Diffraction (XRD) data:
* **Pre-treatment:** High cation mixing (Ni2+ on Li+ sites) and low crystallinity.
* **Post-treatment:** Clear splitting of the (006)/(012) and (108)/(110) doublets, confirming the successful recovery of the pristine hexagonal layered structure.

This direct recycling pathway holds the potential to reduce battery manufacturing greenhouse gas emissions by **more than 40%** compared to pyrometallurgical counterparts, offering a truly circular ecosystem for critical energy storage elements.
    `
  },
  {
    id: "ai-agentic-rag-scientific",
    title: "LARA-HPC: Custom Agentic RAG for Thermodynamic Extractive Metallurgy",
    slug: "ai-agentic-rag-scientific",
    date: "April 10, 2026",
    summary: "Building an intelligent Retrieval-Augmented Generation assistant to process and synthesize complex phase diagrams, CALPHAD datasets, and scientific literature.",
    category: "Agentic AI",
    author: "Abdul Rahman",
    createdAt: new Date("2026-04-10T12:00:00Z"),
    content: `
### The Data Bottleneck in Materials Engineering

When designing extractive metallurgy processes, engineers must cross-reference historical charts, thermodynamic values, and phase diagrams spread across centuries of literature. Finding specific binary or ternary phase boundaries, eutectic temperatures, or Gibbs free energy formulations can consume days of tedious document hunting.

To automate this workflow, I developed **LARA-HPC**, a custom Retrieval-Augmented Generation (RAG) assistant designed specifically for materials scientists.

### Architectural Blueprint of LARA-HPC

LARA-HPC relies on a specialized agentic pipeline tailored for scientific text parsing:

1. **Intelligent Chunking with Table/Equation Preservation:** General purpose text-chunking breaks scientific tables or mathematical equations, making them unreadable. LARA-HPC utilizes markdown-focused parsing to keep thermodynamic tables intact.
2. **Domain-Specific Embeddings:** Standard embeddings struggle with words like *martensite*, *solidus*, or *eutectoid*. We augmented our vector search database with a custom metadata dictionary to prioritize metallurgy terminology.
3. **Thermodynamic Verification Tools (Agent Tool-Use):** To ensure accuracy, the AI LLM does not merely guess. It is equipped with custom Python computational tools (such as PyCalphad) to execute active equilibrium calculations on-the-fly when requested.

\`\`\`python
# conceptual RAG query enrichment
def search_thermo_db(query):
    # Searches specifically for phase boundary compositions
    enriched_query = "phase boundary temperature liquidus solidus " + query
    return vector_store.similarity_search(enriched_query, k=3)
\`\`\`

### Enhancing Industry Workflows

For example, when optimizing the upgrading of low-grade iron ore at PCSIR (upgrading 36% Fe to 65% Fe), LARA-HPC synthesized 20 separate papers on indigenous mineralogy, delivering a structured breakdown of roasting temperatures and reduction parameters in under two minutes.

By shielding researchers from tedious searching and presenting synthesized, citation-backed physical data, LARA-HPC showcases the transformative power of Agentic AI inside the research laboratory.
    `
  }
];

// Seed default posts to Firestore if none exist or any are missing (for seamless startup and updates)
export const seedDefaultPostsIfEmpty = async () => {
  try {
    const postsRef = collection(db, 'posts');
    const postsSnapshotPromise = getDocs(postsRef);
    const postsSnapshot = await withTimeout(postsSnapshotPromise, 1500, null);
    
    if (!postsSnapshot) {
      console.warn("Skipping seeding because Firestore query timed out.");
      return;
    }
    const existingSlugs = new Set(postsSnapshot.docs.map(doc => doc.id));
    
    let seededCount = 0;
    for (const post of defaultBlogPosts) {
      const docId = post.id || post.slug;
      // Overwrite default posts to ensure they have the latest rich images and text!
      const { id, ...postData } = post;
      const postDocRef = doc(db, 'posts', docId);
      await setDoc(postDocRef, {
        ...postData,
        createdAt: Timestamp.fromDate(new Date(post.createdAt))
      });
      seededCount++;
    }
    if (seededCount > 0) {
      console.log(`Synced ${seededCount} default blog posts to Firestore successfully.`);
    }
  } catch (error) {
    console.error('Failed to seed default posts:', error);
  }
};

// Fetch all posts ordered by date/createdAt
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const postsPath = 'posts';
  try {
    const q = query(collection(db, postsPath), orderBy('createdAt', 'desc'));
    const fetchPromise = getDocs(q).then((snapshot) => {
      if (snapshot.empty) {
        // Return default blog posts if Firestore is completely empty
        return defaultBlogPosts;
      }

      const mapped = snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data || !data.title || !data.slug) {
          console.warn(`Ignoring invalid document in posts collection with ID: ${doc.id}`);
          return null;
        }
        return {
          id: doc.id,
          title: data.title || '',
          slug: data.slug || '',
          date: data.date || '',
          summary: data.summary || '',
          content: data.content || '',
          category: data.category || 'General',
          author: data.author || 'Abdul Rahman',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
        } as BlogPost;
      }).filter((p): p is BlogPost => p !== null);

      if (mapped.length === 0) {
        return defaultBlogPosts;
      }
      return mapped;
    });

    return await withTimeout(fetchPromise, 2000, defaultBlogPosts);
  } catch (error) {
    // If we hit permission issues or unconfigured Firestore errors, gracefully fallback to default seeded data!
    console.warn('Firestore fetch failed, falling back to static default posts:', error);
    return defaultBlogPosts;
  }
};

// Fetch a single post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const postsPath = 'posts';
  try {
    const q = query(collection(db, postsPath), where('slug', '==', slug));
    const fetchPromise = getDocs(q).then((snapshot) => {
      if (snapshot.empty) {
        // Search in default static blog posts
        const staticPost = defaultBlogPosts.find(p => p.slug === slug);
        return staticPost || null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      if (!data || !data.title || !data.slug) {
        const staticPost = defaultBlogPosts.find(p => p.slug === slug);
        return staticPost || null;
      }
      return {
        id: docSnap.id,
        title: data.title || '',
        slug: data.slug || '',
        date: data.date || '',
        summary: data.summary || '',
        content: data.content || '',
        category: data.category || 'General',
        author: data.author || 'Abdul Rahman',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined)
      } as BlogPost;
    });

    return await withTimeout(fetchPromise, 2000, defaultBlogPosts.find(p => p.slug === slug) || null);
  } catch (error) {
    console.warn(`Firestore slug fetch failed, checking static: ${slug}`, error);
    const staticPost = defaultBlogPosts.find(p => p.slug === slug);
    return staticPost || null;
  }
};

// Add a blog post (Admin only)
export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> => {
  const postsPath = 'posts';
  try {
    const docId = post.slug;
    const postData = {
      ...post,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, postsPath, docId), postData);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${postsPath}/${post.slug}`);
    throw error;
  }
};

// Update an existing blog post (Admin only)
export const updateBlogPost = async (slug: string, post: Partial<BlogPost>): Promise<void> => {
  const postsPath = 'posts';
  try {
    const postData = {
      ...post,
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, postsPath, slug), postData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${postsPath}/${slug}`);
    throw error;
  }
};

// Delete a blog post (Admin only)
export const deleteBlogPost = async (slug: string): Promise<void> => {
  const postsPath = 'posts';
  try {
    await deleteDoc(doc(db, postsPath, slug));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${postsPath}/${slug}`);
    throw error;
  }
};

// Delete a comment (Admin only)
export const deleteComment = async (commentId: string): Promise<void> => {
  const commentsPath = 'comments';
  try {
    await deleteDoc(doc(db, commentsPath, commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${commentsPath}/${commentId}`);
    throw error;
  }
};

// Fetch comments for a specific post
export const getComments = async (postId: string): Promise<BlogComment[]> => {
  const commentsPath = 'comments';
  try {
    const q = query(
      collection(db, commentsPath), 
      where('postId', '==', postId)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BlogComment;
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Comments query failed, returning empty list:', error);
    return [];
  }
};

// Fetch ALL comments for administrative moderation
export const getAllComments = async (): Promise<BlogComment[]> => {
  const commentsPath = 'comments';
  try {
    const q = query(
      collection(db, commentsPath),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
      } as BlogComment;
    });
  } catch (error) {
    console.warn('All comments query failed, returning empty list:', error);
    return [];
  }
};

// Add a comment to a specific post
export const createComment = async (comment: Omit<BlogComment, 'id' | 'createdAt'>): Promise<string> => {
  const commentsPath = 'comments';
  try {
    const commentData = {
      ...comment,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, commentsPath), commentData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, commentsPath);
    throw error;
  }
};
