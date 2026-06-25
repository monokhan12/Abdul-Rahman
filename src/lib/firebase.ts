import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
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

// Seed default posts to Firestore if none exist (for seamless startup)
export const seedDefaultPostsIfEmpty = async () => {
  try {
    const postsRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsRef);
    if (postsSnapshot.empty) {
      console.log('Seeding default blog posts...');
      for (const post of defaultBlogPosts) {
        const { id, ...postData } = post;
        const postDocRef = doc(db, 'posts', id || post.slug);
        await setDoc(postDocRef, {
          ...postData,
          createdAt: Timestamp.fromDate(new Date(post.createdAt))
        });
      }
      console.log('Default blog posts seeded successfully.');
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
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Return default blog posts if Firestore is completely empty
      return defaultBlogPosts;
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        date: data.date,
        summary: data.summary,
        content: data.content,
        category: data.category,
        author: data.author,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as BlogPost;
    });
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
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Search in default static blog posts
      const staticPost = defaultBlogPosts.find(p => p.slug === slug);
      return staticPost || null;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      slug: data.slug,
      date: data.date,
      summary: data.summary,
      content: data.content,
      category: data.category,
      author: data.author,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
    } as BlogPost;
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
