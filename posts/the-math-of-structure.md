---
title: "The mathematics of Strucutre"
date: "2025-10-17"
description: "Abstracting structure and relationships between relationships"
---

While working on programming language design—especially in the dependently typed space—I kept bumping into references to category theory. At first the diagrams and jargon felt distant and nonsense. Then I read a paper while studying IO implementations on functional programming languages, the seminal paper that introduces the IO monad. And finally some things started to make sense, mainly because identifying the structure of things allowed the author to get proofs and properties about what he developed. Once some piece of code satisfied the categorical rules, an entire suite of facts suddenly became available "for free".

This article is my current view and studies on category theory. It keeps a programming-language lens and leans on type theory intuition. Basically my way of spotting categorical structure on things I use daily and seeing how they connect through an abstract unfiying language.

## What is Category Theory about?

At its core, category theory studies **structure** and **composition**. Comparing it with algebra, which studies operations on numbers, or logic, which studies proofs, category theory focuses on morphisms between things and the composition rules between them. It is a language that shows why so many areas (types, functions, logic, sets, proofs) share the same patterns.

A category $\mathcal{C}$ consists of:

1. **Objects** — things (types, propositions, sets, spaces, ...).
2. **Morphisms (or arrows)** — directed relationships between objects (for example, in $\mathbf{Hask}$, morphisms are functions between Haskell types).
3. A **composition rule**: if $f : A \to B$ and $g : B \to C$, there must be a composed arrow $g \circ f : A \to C$.
4. An **identity arrow** $\mathrm{id}_A : A \to A$ for each object, and two laws:
   - **Associativity:** $h \circ (g \circ f) = (h \circ g) \circ f$.
   - **Identity:** $\mathrm{id}_B \circ f = f = f \circ \mathrm{id}_A$.

And this is all that it takes to define a category.

So, making a connection with type theory, the objects are types, morphisms are functions, composition presents as function composition, and $\mathrm{id}_A$ is the identity function. This is why we can say that Haskell types and functions form a category ($\mathbf{Hask}$). In logic, objects are propositions, and morphisms are proofs.

In programming language semantics, a language's denotational semantics often lives in a category, and things like monads and products correspond to categorical constructions.

Basically, category theory tells you to forget about **what** things are, and start thinking about how they relate and compose. Proofs, types, sets — it does not matter. For this, we have to think in arrows, and not worry about elements in $A$ or $B$; we only care about the arrows between them.

Now that we know what a category is, let's go to the next step: mappings between categories.

## Functors: preserving structure

A **functor** $F : \mathcal{C} \to \mathcal{D}$ is an arrow between categories. It:

1. Assigns to each object $A$ in $\mathcal{C}$ an object $F(A)$ in $\mathcal{D}$.
2. Assigns to each morphism $f : A \to B$ a morphism $F(f) : F(A) \to F(B)$.
3. Preserves identity and composition:
   $$
   F(\mathrm{id}_A) = \mathrm{id}_{F(A)}, \qquad F(g \circ f) = F(g) \circ F(f).
   $$

In other words, functors preserve the entire compositional structure.

### Endofunctors in $\mathbf{Hask}$

Most PL-facing functors are **endofunctors**: $F : \mathbf{Hask} \to \mathbf{Hask}$. The canonical action on morphisms is the familiar `fmap`:
$$
\mathrm{fmap}_{F} : (a \to b) \longrightarrow (F\,a \to F\,b).
$$

For the `Maybe` endofunctor:
$$
\mathrm{fmap}_{\mathrm{Maybe}}(f)(\mathrm{Just}\;x) = \mathrm{Just}(f(x)), \qquad \mathrm{fmap}_{\mathrm{Maybe}}(f)(\mathrm{Nothing}) = \mathrm{Nothing}.
$$

The ability to lift a plain function $A \to B$ to $F A \to F B$ is precisely the categorical action on arrows. That viewpoint explains why so many familiar structures (`Maybe`, `[]`, `IO`, `Parser`, ...) automatically obey functor laws—they owe their existence to the categorical definition.

Endofunctors is just the fancy way to say that you're staying in the same category.

### Beyond endofunctors

Not all functors stay within the same category. A **forgetful functor** $U : \mathbf{Grp} \to \mathbf{Set}$ drops the group structure down to its underlying set. A **free functor** $F : \mathbf{Set} \to \mathbf{Grp}$ freely adds group structure. Contravariant functors $F : \mathcal{C}^{\mathrm{op}} \to \mathcal{D}$ reverse arrow direction. There are also profunctors, bifunctors, and indexed functors, all sharing the same DNA: structure-preserving maps between categories. Keeping the functorial pattern in mind makes it much easier to recognize these relationships when they show up in PL seminars or denotational semantics papers.

Two meta-constructions are worth remembering:

1. **Identity functor**: $\mathrm{Id}_{\mathcal{C}}(A) = A$, $\mathrm{Id}_{\mathcal{C}}(f) = f$. It does nothing, yet it satisfies the definition. This is the neutral element for functor composition.
2. **Functor composition**: if $F : \mathcal{C} \to \mathcal{D}$ and $G : \mathcal{D} \to \mathcal{E}$, then $G \circ F$ is again a functor. This is the categorical reason we can compose `fmap`s or stack functorial layers in code (think `newtype` wrappers).

When debugging or designing an API, asking "what is the functor here?" forces you to check whether your transformations truly respect composition and identities. If they do, you inherit a large body of theory; if they do not, category theory tells you exactly which laws you are breaking.

## Isomorphisms: sameness up to structure

This "up to something" notation was nothing a bit confusing to me, so my short explanation here since this appears everywhere, is basically that you're not insisting in equality literally, but instead saying that things are equivalent up to some point.

In this case saying they are equal up to isomorphism means that they're not necessarily the same object, but isomorphic ones. A simple example:

If we consider triangles, and if we ignore size and position and care only about their shape, then we can say that two triangles are the same up to congruence if one can be moved/rotated/reflected to overlap the other.

We can think as "up to" as meaning "after quotienting by an equivalence relation". Anyway, let's go back to isomorphisms.

Two objects $A$ and $B$ in $\mathcal{C}$ are **isomorphic** (written $A \cong B$) if there exist arrows
$$
f : A \longrightarrow B, \qquad g : B \longrightarrow A
$$
such that
$$
g \circ f = \mathrm{id}_A, \qquad f \circ g = \mathrm{id}_B.
$$

In programming terms, two types are isomorphic when we can convert back and forth without loss. The actual implementations of $f$ and $g$ do not matter—only their existence and the fact that they mutually undo each other. This is why category theory is called *structural*: objects are the same if their arrows behave the same.

The diagram for an isomorphism is the simplest commuting square imaginable:
$$
\begin{array}{ccc}
A & \xrightarrow{f} & B \\
{\scriptstyle \mathrm{id}_A}\downarrow & & \downarrow{\scriptstyle \mathrm{id}_B} \\
A & \xleftarrow{g} & B
\end{array}
$$
The interpretation here is that travelling from $A$ to $B$ along $f$ and then coming back along $g$ lands you exactly where you started, and symmetrically for $g$ followed by $f$. The two triangular loops shrink to identity paths. Whenever you can draw such a reversible loop you have shown that $A$ and $B$ encode the same information.

Concrete manifestations abound:

- In set theory, $\mathbb{N} \times \mathbb{N}$ is isomorphic to $\mathbb{N}$ (via Cantor pairing); the sets are not equal, but they carry the same cardinality structure.
- In Haskell, `newtype UserId = UserId Int` comes with `wrap :: Int -> UserId` and `unwrap :: UserId -> Int` that satisfy the isomorphism laws. The compiler can treat them interchangeably because every `UserId` is exactly one `Int`.
- In logic, two propositions are isomorphic when they can be proved from each other—`A \land B` is isomorphic to `B \land A` through exchange of witnesses.

Identifying isomorphisms lets you replace complicated objects with simpler surrogates without losing structure. It also guides API design: expose both directions of an isomorphism and you allow users to pick whichever representation is most ergonomic while staying within the same categorical class.

## Universal properties: define things by how arrows touch them

Universal properties describe objects indirectly, purely via the way arrows interact with them. They characterise objects as "the most general thing" with a given mapping behaviour. Once a construction satisfies the universal property, any implementation of it will be isomorphic to any other.

### Products

The **product** of $A$ and $B$ is an object $A \times B$ equipped with morphisms $\pi_1 : A \times B \to A$ and $\pi_2 : A \times B \to B$, such that for any $f : X \to A$ and $g : X \to B$ there exists a unique $\langle f, g \rangle : X \to A \times B$ satisfying
$$
\pi_1 \circ \langle f, g \rangle = f, \qquad \pi_2 \circ \langle f, g \rangle = g.
$$

As a commuting diagram:
$$
  \begin{array}{ccccc}
   & & X & & \\[0.4em]
   {}_{\scriptstyle f}\swarrow & & \downarrow{\scriptstyle \langle f,g\rangle} & & \searrow_{\scriptstyle g}
  \\[0.4em]
   A & \xleftarrow{\ \pi_1\ } & A \times B & \xrightarrow{\ \pi_2\ } & B
  \end{array}
  $$


In $\mathbf{Hask}$, $A \times B$ is just the pair $(A, B)$, projections are $\mathrm{fst}$ and $\mathrm{snd}$, and $\langle f, g \rangle$ is the map $x \mapsto (f\,x, g\,x)$.

Read the diagram as a commuting traffic system. Starting at $X$, you can either drive directly to $A$ via $f$, or you can first detour through the product: go down to $A \times B$ using the pairing arrow and then project via $\pi_1$. The diagram asserts that both routes deliver the same passenger to $A$. Likewise for the right-hand leg into $B$. The product is the junction that makes both detours consistent for *every* possible pair of incoming maps.

Universal properties package two claims simultaneously:

1. **Existence**: the arrow $\langle f, g \rangle$ exists.
2. **Uniqueness**: any other arrow $h : X \to A \times B$ with the same projection behaviour must equal $\langle f, g \rangle$.

That uniqueness clause is gold. It means we never need to commit to a specific implementation of pairs. Any structure with projections that satisfy the commuting triangle *is* the product. When refactoring code, it also tells us exactly how to factor a pair-building function: write down the two component arrows, take their universal pairing, and done.

### Coproducts (sum types)

The **coproduct** $A + B$ (categorical sum) comes with injections $\iota_1 : A \to A + B$ and $\iota_2 : B \to A + B$. For any $f : A \to X$ and $g : B \to X$ there exists a unique $[f, g] : A + B \to X$ with
$$
[f, g] \circ \iota_1 = f, \qquad [f, g] \circ \iota_2 = g.
$$

Diagrammatically:
$$
\begin{array}{ccc}
A & \xrightarrow{\ \iota_1\ } & A + B & \xleftarrow{\ \iota_2\ } & B \\
& \searrow{\scriptstyle f} & \downarrow{\scriptstyle [f,g]} & \swarrow{\scriptstyle g} & \\
& & X & &
\end{array}
$$

In Haskell, $A + B$ is $\mathrm{Either}\ A\ B$, injections are $\mathrm{Left}$ and $\mathrm{Right}$, and $[f, g]$ acts by $e \mapsto \mathrm{either}\ f\ g\ e$.

Here the diagram tells the dual story. To reach $X$ from $A$, you can either map directly using $f$, or inject into the coproduct via $\iota_1$ and then descend through $[f,g]$. Commutativity guarantees these journeys coincide, and likewise for the $B$ leg. The coproduct is the universal junction through which every pair of outbound arrows factors.

The logical reflection (via Curry–Howard iso) is clear: products correspond to conjunctions, coproducts to disjunctions. Category theory records this once and for all: any implementation of pairs or sum types that satisfy these equations is the product or coproduct in its category.

Once you internalise universal properties, you stop memorising APIs and start deriving them. Need `eitherToMaybe :: Either a b -> Maybe b`? Spot the arrows `Left : a -> Either a b` and `Right : b -> Either a b`, choose how each branch should land in `Maybe b`, and the universal arrow $[\mathrm{const}\ \mathrm{Nothing},\, \mathrm{Just}]$ drops out immediately. This is nice for proof assistants since now by showing that a candidate satisfies the universal property, you earn the right to treat it as *the* product, coproduct, limit, or whatever thing you defined.

## Natural transformations: polymorphism as structure

Suppose $F, G : \mathcal{C} \to \mathcal{D}$ are functors. A **natural transformation** $\eta : F \Rightarrow G$ assigns to every object $A$ a morphism $\eta_A : F(A) \to G(A)$ such that for every $f : A \to B$ the square
$$
\begin{array}{ccc}
F(A) & \xrightarrow{\ F(f)\ } & F(B) \\
{\scriptstyle \eta_A}\downarrow & & \downarrow{\scriptstyle \eta_B} \\
G(A) & \xrightarrow{\ G(f)\ } & G(B)
\end{array}
$$
commutes, i.e. $G(f) \circ \eta_A = \eta_B \circ F(f)$.

In $\mathbf{Hask}$, a natural transformation is exactly a polymorphic function of type $\forall a.\,F a \to G a$ that respects `fmap`. For example, $\mathrm{safeHead} : [a] \to \mathrm{Maybe}\,a$ satisfies
$$
\mathrm{fmap}\ f \circ \mathrm{safeHead} = \mathrm{safeHead} \circ \mathrm{fmap}\ f
$$
for every `f :: a -> b`; that is precisely the naturality condition.

The naturality square asserts that travelling across the top (apply $F(f)$ then convert) yields the same destination as travelling down first (convert) and then across the bottom (apply $G(f)$). The functor action and the transformation commute; the two routes from $F(A)$ to $G(B)$ collapse to the same arrow. Whenever you see a commuting square, imagine yourself walking it in both directions—naturality says the walk is path-independent.

Naturality is more than a technicality. It captures the promise that our polymorphic helper does not "inspect" the values of type `a`—it only re-arranges structure. For contrast, consider
$$
\mathrm{takeHeadThree} : [a] \to \mathrm{Maybe}\,a, \qquad \mathrm{takeHeadThree}\ xs = \begin{cases}
\mathrm{Nothing} & \text{if } \mathrm{length}\ xs > 3, \\
\mathrm{safeHead}\ xs & \text{otherwise.}
\end{cases}
$$
This function breaks naturality: mapping a function over the list and then calling `takeHeadThree` is not the same as calling `takeHeadThree` first and then mapping. The fact that natural transformations rule out such length-based hacks explains why they align with the "free theorems" we get from parametric polymorphism.

Once we see naturality, the polymorphic helper functions suddenly looks organised: they are the 2-morphisms (arrows between functors) in the 2-category $\mathbf{Cat}$, where objects are categories, morphisms are functors, and 2-morphisms are natural transformations.

## Monads: monoids in the category of endofunctors

A **monad** on $\mathcal{C}$ is an endofunctor $T : \mathcal{C} \to \mathcal{C}$ together with two natural transformations:
$$
\eta : \mathrm{Id}_{\mathcal{C}} \Rightarrow T \quad \text{(the unit/return)}, \qquad \mu : T^2 \Rightarrow T \quad \text{(the multiplication/join)}.
$$

They must satisfy the monoid-style equations:
$$
\begin{aligned}
\mu \circ T\eta &= \mathrm{id}_T = \mu \circ \eta T \quad &\text{(identity laws)} \\
\mu \circ T\mu &= \mu \circ \mu T \quad &\text{(associativity)}.
\end{aligned}
$$

Diagrammatically (mirroring the monoid unit and associativity):
$$
\begin{array}{ccc}
T & \xrightarrow{T\eta} & T^2 & \xrightarrow{\mu} & T \\
\Vert & & \downarrow{\scriptscriptstyle \eta T} & & \Vert \\
T & \xleftarrow{\mu} & T^2 & \xleftarrow{T\mu} & T^3
\end{array}
$$

This is why people summarise monads as "monoids in the category of endofunctors": the objects are endofunctors $T$, the morphisms are natural transformations, and $\eta, \mu$ satisfy the monoid laws inside that category.

Read the diagram as two alternative "assembly" lines for flattening three layers of structure. The top path says: first inject a pure layer with $T\eta$, then flatten once with $\mu$. The lower path says: assemble the inner layers using $\eta T$ or $T\mu$, then flatten. Associativity states that no matter which order you bundle and collapse, the resulting composite arrow from $T^3$ to $T$ is the same. Identity laws arise from the smaller triangles where inserting $\eta$ and immediately flattening cancels out to the identity.

### Haskell perspective

In $\mathbf{Hask}$, the unit is $\mathrm{return} : a \to m\,a$. The multiplication is $\mathrm{join} : m\,(m\,a) \to m\,a$. The familiar bind is derived:
$$
(\gg=) : m\,a \to (a \to m\,b) \to m\,b, \qquad ma \gg= f = \mathrm{join}(\mathrm{fmap}\ f\ ma).
$$

The monad laws in textbooks are just the component-wise expressions of the diagrammatic laws above.

Now we have an intuition:

- **Unit** $\eta$ behaves like `mempty`: it embeds plain values into the structured world (`return`, `pure`).
- **Multiplication** $\mu$ behaves like `mappend`: it flattens nested layers of structure (`join`).
- **Associativity** guarantees that the order in which we regroup nested structure does not matter, so pipelines built with `>>=` behave predictably.

With this, we can read a new monad instance and check the laws:

- `[]` (lists) form a monad where $\eta$ wraps a singleton list and $\mu$ concatenates a list of lists.
- `Maybe` uses $\eta = \mathrm{Just}$ and $\mu$ that discards `Nothing` while collapsing nested `Just`.
- `IO` has $\eta = \mathrm{return}$ and a `join` that sequences effects as you would expect.

Every time you spot an endofunctor equipped with a unit and multiplication that satisfy the diagrams, you get a monad, and with it a ready-made Kleisli category, do-notation, and a mountain of theorems about composition.

## Kleisli categories: sequencing computations

Given a monad $(T, \eta, \mu)$, the **Kleisli category** $\mathcal{C}_T$ keeps the same objects as $\mathcal{C}$, but morphisms $A \to B$ are arrows $A \to T(B)$ in the base category. Identities are $\eta_A$. Composition is:
$$
g \circ_{\mathrm{Kl}} f = \mu_C \circ T(g) \circ f,
$$
exactly the categorical form of the Kleisli fish operator `(>=>)`.

You can picture the composition as a three-step process:
1. Start at $A$ and run $f$ to produce a $T B$-shaped computation.
2. Lift $g$ so it can act on that structured value: $T(g) : T B \to T^2 C$.
3. Flatten with $\mu_C$ to return to a single layer $T C$.
Both $f$ and $g$ promise to produce effects; the Kleisli composite pipes the result of the first into the second while keeping the bookkeeping consistent.

In $\mathbf{Hask}$:
$$
(f >=> g)\ x = f\,x \gg= g,
$$
which is how we sequence effectful computations.

There is a canonical functor $J : \mathcal{C} \to \mathcal{C}_T$ that embeds pure arrows into the monadic world by wrapping outputs with $\eta$. That functorial lift is precisely what $\mathrm{return}$ (or `pure`) does operationally.

Thinking categorically clarifies a lot of things you take for granted when writing haskell:

- `do`-notation is just syntactic sugar for composing in $\mathcal{C}_T$.
- Laws about short-circuiting (`Nothing` propagates) follow from the associativity of Kleisli composition.
- The "Kleisli fish" `(>=>)` is literally just $g \circ_{\mathrm{Kl}} f$.

Moreover, the Kleisli category lets you compare effect systems. Two different monads $T$ and $S$ might induce the same Kleisli arrows for a subset of objects; if so, they agree on those computations even if their internal data representations differ.

A concrete example: let $f : \texttt{String} \to \texttt{Maybe Int}$ parse an integer, and $g : \texttt{Int} \to \texttt{Maybe Bool}$ check whether it is even. Their Kleisli composite
$$
g \circ_{\mathrm{Kl}} f : \texttt{String} \to \texttt{Maybe Bool}
$$
first parses, then validates. The associativity law guarantees that adding a third step—say, logging in $\texttt{Maybe}$—can be regrouped arbitrarily without changing behaviour. When you refactor `do`-blocks, you are literally relying on the categorical fact that $\mathcal{C}_T$ is a category.

## Adjunctions: the origin of monads

An **adjunction** between categories $\mathcal{C}$ and $\mathcal{D}$ consists of functors
$$
F : \mathcal{C} \longrightarrow \mathcal{D}, \qquad G : \mathcal{D} \longrightarrow \mathcal{C}
$$
and a family of bijections
$$
\Phi_{A,B} : \mathrm{Hom}_{\mathcal{D}}(F A, B) \cong \mathrm{Hom}_{\mathcal{C}}(A, G B),
$$
natural in $A$ and $B$. We write $F \dashv G$ and say "F is left adjoint to G".

Think of the bijection $\Phi_{A,B} : \mathrm{Hom}{\mathcal{D}}(F A, B) \cong \mathrm{Hom}{\mathcal{C}}(A,
  G B)$ as a translator between two kinds of arrows. A morphism on the left is just a map from $F A$ to $B$
  inside the category $\mathcal{D}$; a morphism on the right is a map from $A$ to $G B$ inside $\mathcal{C}$.
  The statement says that every arrow of the first kind corresponds uniquely to an arrow of the second kind, and
  vice versa, with no information lost. So giving a map out of $F A$ is exactly the same data as giving a map
  into $G B$—the Hom notation simply records which category each map lives in

Intuitively:

- $F$ freely adds structure (builds something like lists, monoids, pointed sets, products with a fixed object).
- $G$ forgets that structure (strips back down to the underlying set, type, or context).
- The bijection $\Phi$ is a perfect *translator* between morphisms out of $F A$ and morphisms into $G B$.

The translator is natural: it respects arrows in $A$ and $B$. The **triangle identities**
$$
G(\varepsilon_B) \circ \eta_{G B} = \mathrm{id}_{G B}, \qquad \varepsilon_{F A} \circ F(\eta_A) = \mathrm{id}_{F A}
$$
ensure that translating an arrow forth and back gives you the same arrow you started with. When you see these triangles in a paper, read them as "the free-and-forget operations cancel each other up to isomorphism".

### Currying as an adjunction

In $\mathbf{Set}$, define
$$
F(X) = A \times X, \qquad G(Y) = Y^A,
$$
where $Y^A$ is the set of functions $A \to Y$. Then
$$
\mathrm{Hom}_{\mathbf{Set}}(A \times X, Y) \cong \mathrm{Hom}_{\mathbf{Set}}(X, Y^A)
$$
via currying and uncurrying. The unit $\eta_X : X \to (A \times X)^A$ sends $x$ to the function $a \mapsto (a, x)$. The counit $\varepsilon_Y : A \times Y^A \to Y$ is function application $(a, f) \mapsto f(a)$.

Every time you curry or uncurry in code, you are walking across this adjunction.

### Maybe as an adjunction

Let $\mathbf{Set}_\star$ be the category of pointed sets. The functor $F : \mathbf{Set} \to \mathbf{Set}_\star$ sends $A$ to $A + 1$ (add a distinguished "failure" point). The right adjoint $G : \mathbf{Set}_\star \to \mathbf{Set}$ forgets which element is distinguished. The resulting monad $T = G \circ F$ is $A \mapsto A + 1$, i.e. the $\mathrm{Maybe}$ functor. The unit is $\mathrm{Just}$; the multiplication flattens $\mathrm{Maybe}\ (\mathrm{Maybe}\ a)$ by collapsing nested $\mathrm{Just}$s and propagating $\mathrm{Nothing}$.

### Monads from adjunctions

Every adjunction $F \dashv G$ produces a monad $T = G \circ F$ on $\mathcal{C}$, with
$$
\eta_A = \Phi_{A, F A}(\mathrm{id}_{F A}), \qquad \mu = G \varepsilon F,
$$
where $\varepsilon : F G \Rightarrow \mathrm{Id}_{\mathcal{D}}$ is the counit. Dually, the composite $W = F \circ G$ is a comonad on $\mathcal{D}$.

This is why "monads are the shadows of adjunctions": they arise inevitably whenever a free/forgetful pair exists.

Conversely, given any monad $T$, you can recover an adjunction whose composite is $T$ by looking at its Kleisli category. Adjunctions are therefore the organising principle behind monads, not an optional add-on: they explain *why* `Maybe`, `[]`, `IO`, `Parser`, and your custom effect handlers can be studied with the same vocabulary.

## Comonads: dualising the story

Everytime you hear things about "duals" our "dualising" things, what we're doing is basically inverting the arrows. 

Flip every arrow in the monad definition and you get a **comonad**. Formally, a comonad on $\mathcal{C}$ is an endofunctor $W$ with natural transformations
$$
\varepsilon : W \Rightarrow \mathrm{Id}_{\mathcal{C}}, \qquad \delta : W \Rightarrow W^2
$$
such that
$$
\begin{aligned}
\varepsilon_W \circ \delta &= \mathrm{id}_W = W \varepsilon \circ \delta \quad &\text{(counit laws)} \\
\delta_W \circ \delta &= W \delta \circ \delta \quad &\text{(coassociativity)}.
\end{aligned}
$$

Where monads model *sequencing* of effects, comonads model *observation* of contexts.

The laws are the mirror image of the monad diagram. They say: duplicate a context and immediately extract—on the left or on the right—and nothing changes; duplicating twice is independent of the order in which you expand. If you draw the corresponding diagram, the two paths from $W$ to $W^2$ (via $W\delta$ or $\delta_W$) followed by the appropriate counit collapse to the same result. Think of $\delta$ as "zooming out" to see more surroundings, and $\varepsilon$ as "reading off" the focused value. Whether you zoom out before or after peeking should not matter.

### Store comonad

Define $W(A) = \mathrm{Store}(S, A)$ with data
$$
\mathrm{Store}(S, A) = (S \to A,\, S)
$$
(a function describing the entire space plus a current focus). The structure maps are:
$$
\varepsilon(\mathrm{Store}(f, s)) = f(s), \qquad \delta(\mathrm{Store}(f, s)) = \mathrm{Store}(\lambda s'.\,\mathrm{Store}(f, s'),\, s).
$$

Intuitively, $\delta$ expands a context so that every position $s'$ gets its own focused store; $\varepsilon$ extracts the value at the present focus. The derived extension operator
$$
\mathrm{extend} : (W A \to B) \to (W A \to W B), \qquad \mathrm{extend}(k) = W(k) \circ \delta,
$$
lets us compute new data by peeking at neighbourhoods—useful for cellular automata, streaming computations, or UI updates.

In a two-dimensional grid, for instance, $\mathrm{extend}$ lets every cell apply a rule that depends on its neighbours—exactly the operation required for blurring an image, for example. Duplicate first supplies, for every coordinate $(i,j)$, a focused copy of the whole grid; mapping a rule over those copies produces the next state.

Other classic comonads mirror familiar monads:

- **Environment comonad** `Env e a = (e, a)` is dual to the Reader monad. You can extract a value, but you also have access to the entire shared environment when computing derived observations.
- **Stream comonad** `Stream a` (infinite lists) lets you observe the current head while `duplicate` gives you the tail-focused substreams—perfect for time-varying systems or signal processing.

Whenever you have a notion of "value with surrounding context" and you want to compute something that depends on that context, look for a comonad.

From a semantic angle, we capture *observations* of an evolving system. Where monadic algebras describe how to *build* effectful computations, comonadic coalgebras describe how to *respond* to contextual information. 
## Co-Kleisli categories: composing observations

Given a comonad $(W, \varepsilon, \delta)$, the **co-Kleisli category** $\mathcal{C}^W$ keeps the same objects but uses morphisms $W A \to B$. Identities are $\varepsilon_A$. Composition is
$$
g \circ_{\mathrm{coKl}} f = g \circ W(f) \circ \delta_A.
$$

Picture the dataflow: start with a context $W A$, duplicate it so that each possible focus yields its own contextual view, map $f$ across those views (obtaining a $W B$ filled with intermediate results), and finally extract a $B$ via $g$. The diagram that encodes this story mirrors the Kleisli one, with arrows reversed.

In $\mathbf{Hask}$, the co-Kleisli composition is `(<=<)` defined by
$$
(g \mathbin{\leqslant\!\!\lessdot} f) = g \circ \mathrm{extend}(f).
$$

Where the Kleisli category chains effectful functions $A \to T B$, the co-Kleisli category chains context-sensitive observers $W A \to B$. The two constructions are perfectly dual.

Operationally, a co-Kleisli arrow is the shape of a "widget renderer" or a "sensor interpreter": it takes the whole context (state, environment, neighbourhood) and returns a result. Composing two such observers first extends the context so that the downstream observer can see the enriched information, then applies the final extraction. This is a pattern where you successively refine a global state to produce outputs.

Example: suppose `makeSnapshot :: Store World Model -> ViewState` derives a UI projection, and `render :: Store World ViewState -> Html` turns that projection into DOM. Their co-Kleisli composite
$$
render \circ_{\mathrm{coKl}} makeSnapshot : \mathrm{Store}\ \texttt{World}\ \texttt{Model} \to \texttt{Html}
$$
duplicates the world so that every potential focus can build its own snapshot, maps `makeSnapshot`, and finally extracts HTML. Because co-Kleisli composition is associative, you can restructure rendering pipelines (add instrumentation, cache layers, theming) without invalidating behaviour—as long as each stage is a comonadic observer.

## Landspace

At this point, the categorical landscape lines up neatly:

- **Level 0 (objects & arrows)**: Types, sets, propositions; functions/proofs as morphisms.
- **Level 1 (functors)**: Type constructors and structure-preserving mappings.
- **Level 2 (natural transformations)**: Polymorphic conversions between functors.
- **Monads & comonads**: Algebraic structure on endofunctors; sequencing versus observation.
- **Kleisli / co-Kleisli categories**: Categories of effectful or contextual morphisms.
- **Adjunctions**: The origin of monads/comonads; free vs. forgetful structure.

Each layer reuses the same patterns—identities, composition, universal properties—but in a progressively richer setting. That is where the power (and the economy) of category theory lies: once a concept is understood abstractly, it applies everywhere you can find the same diagrams.

When you read a paper or library code, it helps to find at which layer you wre. Are we defining new objects and arrows (level 0)? Are we mapping entire worlds of objects around with functors (level 1)? Are we moving between parallel worlds with natural transformations (level 2)? and so on. 

## Practising the pattern

To internalise these ideas, some cool exercises are:

1. Curry/uncurry a function $f : (A \times X) \to Y$ into $g : X \to Y^A$ and back; verify the adjunction bijection explicitly.
2. For the `Maybe` adjunction, write down the unit $\eta_A : A \to A + 1$ and the counit $\varepsilon_{(X, x_0)} : (X + 1) \to X$; check the resulting monad laws.
3. In the Store comonad, compute $\mathrm{extend}(\text{average})$ for a finite grid to observe how duplicate propagates context.
4. Take a familiar API (e.g. `Reader r a = r -> a`) and identify the functor, unit, and multiplication. Draw the Kleisli composition explicitly; show how `ask` and `local` fit the picture.
5. Pick a pair of functors you use frequently (say `[]` and `Maybe`) and write a candidate polymorphic function between them. Test its naturality by checking the commuting square—does it truly ignore the shape of the data?

All the exercises basically sum up to chasing arrows through diagrams. The notation may feel abstract, but well.. It is abstract.

## Closing thoughts

Category theory does not replace operational reasoning; it complements it. By focusing on arrows and the way they compose, we can see that familiar constructs are manifestations of the same abstract pattern. Once you see a functor, you check for natural transformations. Once you have a free/forgetful pair, you know a monad (and comonad) is hiding there.

Most importantly, this language lets us transport intuition across domains: proofs look like programs, effect handlers look like adjunctions, stream processors look like comonads. This is not exclusive to the type / programatic view I used in this article.

From my personal experience though, category theory is mostly useful when you already know / use some "implementation" or less abstract level of it. It is very hard / not intuitive and in my opinion not very useful to study this individually. But once you have the concepts and examples in your mind, it is easy to detect the patterns in the diagrams. And certainly good if you're designing new things, fit them in a pattern and suddenly you have a bunch of proofs and properties on what you are doing.

Quoting my friend @lane: 
> There is a deep correspondence between type theory and category theory, and some people characterize it by saying that type theory gives a "calculus" to category theory.

From my experience, learning the "calculus" first was easier. Still learning a lot and discovering new things on it.

If you're still here, thanks for reading! Feel free to make suggestions or corrections if you see any mistake.

