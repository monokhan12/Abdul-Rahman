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
      where('postId', '==', postId),
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
