---
title: "Observational Type Theory"
date: "2025-08-02"
description: ""
---

## Introduction and Historical Context

Type theory sits at the intersection of logic, mathematics, and computer science, providing foundational frameworks for reasoning about computation and mathematical structures. Among the various approaches to dependent type theory, **Observational Type Theory (OTT)** represents a significant development that addresses fundamental limitations in Martin-Löf Type Theory (MLTT) while maintaining computational tractability.

The story of observational equality begins with a fundamental tension in type theory: the coexistence of two distinct notions of equality in MLTT. On one hand, we have *definitional equality*, which records equations automated by the system and supports decidable type checking. On the other hand, we have *propositional equality* (the identity type), which is internal to the system and enables equational reasoning but lacks sufficient extensionality principles.

This tension becomes apparent when we consider function extensionality: two functions that behave identically on all inputs should be considered equal, yet MLTT's propositional equality cannot prove this without additional axioms. Similarly, propositional extensionality—the principle that logically equivalent propositions are equal—and the uniqueness of identity proofs (UIP) are not derivable in pure MLTT.

## The Setoidal Interpretation

The theoretical foundation of TTobs lies in the **setoidal interpretation** of dependent type theory. This approach provides a sophisticated mechanism for separating the intensional structure of types from their extensional behavior.

### Formal Definition of Setoids

A setoid is a mathematical structure consisting of a type equipped with an equivalence relation. Formally, a setoid `A` is a pair `A = (|A|, =_A)` where:

- `|A|` is a type, referred to as the *carrier* of the setoid
- `=_A` is a binary relation on `|A|`, i.e., a function `|A| → |A| → Type`, called the *setoid equality*
- This relation `=_A` is accompanied by proofs that it is an equivalence relation (reflexive, symmetric, and transitive)

The central insight is the deliberate distinction between two notions of equality:

1. **Intensional equality**: the definitional equality (`≡`) of the underlying carrier type `|A|`, pertaining to the raw data or representation
2. **Extensional equality**: the user-defined equivalence relation `=_A`, capturing the abstract notion of "sameness" for the modeled structure

Consider rational numbers as an example: the carrier `|Q|` would be pairs of integers `(a, b)` where `b ≠ 0`. Intensional equality requires `(a, b) ≡ (c, d)` only if `a ≡ c` and `b ≡ d`. The extensional equality `=_Q` is defined as `(a, b) =_Q (c, d)` if and only if `ad = bc`. The setoid approach maintains these distinctions while using the latter for mathematical reasoning.

### Comparison with Groupoid Models

The setoidal interpretation stands in contrast to the **groupoid model**, which takes a fundamentally different philosophical approach. While the setoid model eliminates proof-relevant structure of identity types to better model classical mathematics, the groupoid model embraces this structure, leading to Homotopy Type Theory (HoTT).

In the groupoid interpretation, each type A is viewed as a groupoid where:
- Objects are terms of type A
- Morphisms from x to y are proofs inhabiting the identity type Id_A(x, y)
- The structure extends infinitely, creating ∞-groupoids that connect type theory with algebraic topology

This philosophical divergence represents a fundamental fork in type theory development: setoids pursue classical extensionality with proof irrelevance, while groupoids explore the rich higher-dimensional structure of identity.

## Technical Introduction to TTobs

**TTobs** (Type Theory with Observational Equality) represents the culmination of research into setoidal interpretations, providing the first extension of MLTT with observational equality that achieves several key properties simultaneously:

- Function extensionality (funext)
- Propositional extensionality (propext)  
- Uniqueness of identity proofs (UIP)
- Decidable type checking
- Normalization and canonicity
- Support for quotient types and countably many universes

### Key Innovations

TTobs introduces two fundamental innovations over MLTT:

1. **Dual Universe Hierarchy**: TTobs features two cumulative hierarchies of universes:
   - `U_i`: The usual universe hierarchy of MLTT for proof-relevant types
   - `Ω_i`: Definitionally proof-irrelevant types where any two inhabitants are convertible

2. **Observational Equality as Type Eliminator**: Unlike MLTT's identity type (an inductive type with J-eliminator), observational equality `t ~_A u` functions as a type eliminator that reduces the type A to weak head normal form and pattern matches on its structure.

### Syntax of TTobs

```
s                   ::= U | Ω                    // relevances
i, j                ∈ ℕ                          // universe levels
Γ, Δ                ::= • | Γ, x :^{s,i} A       // contexts
t, u, m, n, e, A, B ::= x | s_i                  // variables and universes

                      | λ(x : A).t               // lambda abstraction
                      | t u                      // application
                      | Π_{s,i}^j (x : A). B     // dependent products

                      | 0                        // zero
                      | S t                      // successor
                      | ℕ-elim(P, t, u, n)       // nat eliminator
                      | ℕ                        // natural numbers

                      | <t, u>                   // pair
                      | fst(t)                   // first projection
                      | snd(t)                   // second projection
                      | ∃^j_i (x : A). B         // existential types

                      | ⊥-elim(A, t)             // empty elimination
                      | ⊥                        // empty type

                      | *                        // unit value
                      | ⊤                        // unit type

                      | t ~ A u                  // observational equality
                      | refl(t)                  // reflexivity
                      | transp(t, B, u, t', e)   // transport

                      | cast(A, B, e, t)         // type cast
                      | castrefl(A, t)           // cast reflexivity
```

### Typing Rules of TTobs

#### Context Rules

**Context Formation (Empty)**
```
Ctx-Nil
-------
 ⊢ •
```

**Context Extension**
```
⊢ Γ     Γ ⊢ A : s_i
---------------------
    ⊢ Γ, x : A
```

#### Variable Rules

**Variable Introduction**
```
⊢ Γ     x : A ∈ Γ
------------------
  Γ ⊢ x : A
```

#### Type Conversion

```
Γ ⊢ t : A  Γ ⊢ A ≡ B : s_i
-----------------------------
        Γ ⊢ t : B
```

#### Universes

```
  ⊢ Γ 
------------ i < j
Γ ⊢ s_i : U_j
```

#### Dependent Products (Π-types)

**Π-Formation**
```
Γ ⊢ A : s_i   Γ, x : A ⊢ B : s'_j
------------------------------------ i≤k, j≤k
  Γ ⊢ Π^j_{s,i} (x : A). B : s'_k
```

**Function Introduction (λ-abstraction)**
```
Γ ⊢ A : s_i     Γ, x : A ⊢ t : B
----------------------------------
Γ ⊢ λ(x : A).t : Π(x : A).B
```

**Function Elimination (Application)**
```
Γ ⊢ t : Π(x : A). B     Γ ⊢ u : A
----------------------------------- 
  Γ ⊢ t u : B[x:=u]
```

#### Existential Types (Σ-types)

**∃-Formation**
```
Γ ⊢ A : Ω_i     Γ, x : A ⊢ B : Ω_i
------------------------------------
  Γ ⊢ ∃(x : A).B : Ω_i
```

**Pair Introduction**
```
Γ  ⊢ t : A    Γ ⊢ u : B[x:=t]
-------------------------------
  Γ ⊢ <t, u> : ∃(x : A). B
```

**First Projection**
```
Γ ⊢ t : ∃(x: A). B
-------------------
  Γ ⊢ fst(t) : A
```

**Second Projection**
```
Γ ⊢ t : ∃(x: A). B
-------------------
  Γ ⊢ snd(t) : B[x := fst(t)]
```

#### Natural Numbers

**ℕ-Formation**
```
  ⊢ Γ
------------
Γ ⊢ ℕ : U_0
```

**Zero Constructor**
```
  ⊢ Γ
----------
Γ ⊢ 0 : ℕ
```

**Successor Constructor**
```
Γ ⊢ n : ℕ
------------
Γ ⊢ S n : ℕ
```

**Natural Number Elimination**
```
Γ ⊢ A : ℕ → s_i     Γ ⊢ t0 : A 0    Γ ⊢ tS : Π(n : ℕ). A n → A (S n)    Γ ⊢ n : ℕ
-----------------------------------------------------------------------------------
                  Γ ⊢ ℕ-elim(A, t0, ts, n) : A n
```

#### Empty and Unit Types

**⊥-Formation**
```
  ⊢ Γ
------------
Γ ⊢ ⊥ : Ω_i
```

**⊥-Elimination**
```
Γ ⊢ A : s_i     Γ ⊢ t : ⊥
---------------------------
 Γ ⊢ ⊥-elim(A, t) : A
```

**⊤-Formation**
```
  ⊢ Γ
-----------
Γ ⊢ ⊤ : Ω_i
```

**⊤-Introduction**
```
  ⊢ Γ
---------
Γ ⊢ * : ⊤
```

#### Observational Equality

**Equality Formation**
```
Γ ⊢ A : U_i     Γ ⊢ t : A       Γ ⊢ u : A
-------------------------------------------
          Γ ⊢ t ~A u : Ω_i
```

**Reflexivity**
```
Γ ⊢ A : U_i     Γ ⊢ t : A
---------------------------
  Γ ⊢ refl(t) : t ~A t
```

**Transport in Ω**
```
Γ ⊢ A : U_i    Γ ⊢ t : A     Γ ⊢ B : Π(x : A).t ~A x --> Ω_j    Γ ⊢ u : B t refl(t)     Γ ⊢ t' : A      Γ ⊢ e : t ~A t'
-------------------------------------------------------------------------------------------------------------------------
                        Γ ⊢ transp(t, B, u, t', e) : B t' e
```

**Type Casting**
```
Γ ⊢ A : s_i     Γ ⊢ B : s_i     Γ ⊢ e : A ~s B  Γ ⊢ t : A
------------------------------------------------------------
        Γ ⊢ cast(A, B, e, t) : B
```

**Cast Reflexivity**
```
Γ ⊢ A : s_i     Γ ⊢ t : A       Γ ⊢ e : A ~s A 
-------------------------------------------------
  Γ ⊢ castrefl(A, t) : t ~A cast(A, A, e, t)
```

### Conversion and Reduction Rules

#### Conversion Rules

**Reflexivity**
```
  Γ ⊢ t : A
----------------
Γ ⊢ t ≡ t : A
```

**Symmetry**
```
Γ ⊢ t ≡ u : A
--------------
Γ ⊢ u ≡ t : A
```

**Transitivity**
```
Γ ⊢ t ≡ t' : A      Γ ⊢ t' ≡ u : A
------------------------------------
        Γ ⊢ t ≡ u : A
```

**Reduction to Conversion**
```
Γ ⊢ t => u : A
---------------
Γ ⊢ t ≡ u : A
```

**Function Extensionality (η-equality)**
```
Γ ⊢ t, u : Π(x : A).B       Γ, x : A ⊢ t x ≡ u x : B
-----------------------------------------------------
        Γ ⊢ t ≡ u : Π(x : A).B
```

**Proof Irrelevance**
```
Γ ⊢ A : Ω_i        Γ ⊢ t : A      Γ ⊢ u : A
----------------------------------------------
          Γ ⊢ t ≡ u : A
```

#### Key Reduction Rules

**β-Reduction**
```
    Γ, x : A ⊢ t : B        Γ ⊢ u : A
------------------------------------------
Γ ⊢ (λ(x : A). t) u => t[x:=u] : B[x:=u]
```

**Natural Number Elimination (Zero)**
```
Γ ⊢ A : ℕ -> U_i    Γ ⊢ t0 : A 0    Γ ⊢ tS : Π(n : ℕ). A n -> A(S n)
-----------------------------------------------------------------------
                    Γ ⊢ ℕ-elim(A, t0, tS, 0) => t0 : A 0
```

**Natural Number Elimination (Successor)**
```
Γ ⊢ A : ℕ -> U_i    Γ ⊢ t0 : A0     Γ ⊢ tS : Π(n : ℕ).A n -> A(S n)     Γ ⊢ n : ℕ
-------------------------------------------------------------------------------------
            Γ ⊢ ℕ-elim(A, t0, tS, S n) => tS ℕ-elim(A, t0, tS, n) : A(S n)
```

**Observational Equality for Functions**
```
Γ ⊢ f : Π(x : A).B    Γ ⊢ g : Π(x : A).B
-------------------------------------------
Γ ⊢ f ~ΠAB g => Π(x : A). f x ~B g x : Ω_i
```

**Observational Equality in Ω**
```
      Γ ⊢ A : Ω_i       Γ ⊢ B : Ω_i
----------------------------------------- i < j
Γ ⊢ A ~Ω_i B => (A -> B) ^ (B -> A) : Ωj
```

**Universe Equality (Same Type)**
```
⊢ Γ     A ∈ {ℕ, s_i}
-----------------------
Γ ⊢ A ~U_j A => ⊤ : Ω_k
```

**Universe Equality (Different Types)**
```
⊢ Γ   A, B ∈ {N, ΠA.B, s_i}       hd A != hd B
----------------------------------------------- i < j < k
      Γ ⊢ A ~U_k B => ⊥ : Ω_k
```

**Dependent Product Equality**
```
Γ ⊢ A, A' : s_i     Γ, x : A ⊢ B : s'j    Γ, x : A' ⊢ B' : s'j    a := cast(A', A, e^-1, a')
-------------------------------------------------------------------------------------------------- i <= k, j <= k
Γ ⊢ Π(x : A).B ~U_k Π(x : A').B' => ∃(e : A ~U_i A').Π(a' : A'). B[x:=a] ~U_j B'[x := a'] : Ω_i
```

**Natural Number Equality**
```
    ⊢ Γ
---------------------
Γ ⊢ 0 ~ℕ 0 => ⊤ : Ω_i
```

```
      Γ ⊢ n : ℕ
-----------------------
Γ ⊢ 0 ~ℕ S n => ⊥ : Ω_i
```

```
      Γ ⊢ n : ℕ
-----------------------
Γ ⊢ S n ~ℕ 0 => ⊥ : Ω_i
```

```
  Γ ⊢ n : ℕ     Γ ⊢ m : ℕ
--------------------------------
Γ ⊢ S m ~ℕ S n => m ~ℕ n : Ω_i
```

**Type Casting Rules**
```
    Γ ⊢ e : ℕ ~U ℕ
--------------------------
Γ ⊢ cast(ℕ,ℕ,e,0) => 0 : ℕ
```

```
Γ ⊢ e : Π(x : A).B ~U Π(x : A').B'      Γ ⊢ f : Π(x : A). B     a := cast(A', A, fst(e)^-1, a')
---------------------------------------------------------------------------------------------------------------
Γ ⊢ cast(Π(x : A).B, Π(x : A').B', e, f) => λ(a' : A').cast(B[x=a], B'[x:=a'], snd(e) a', f a) : Π(x : A'). B'
```

### Weak Head Normal Forms

TTobs distinguishes between weak head normal forms (whnf) and neutral terms:

```
whnf w ::= ne
             | Π(x : A). B               | s_i
             | ∃(x : A).B
             | ℕ
             | ⊥
             | ⊤
             | λ(x : A). t
             | 0
             | S n

neutral ne ::= x
             | ne t
             | ⊥-elim(A, e)
             | ℕ-elim(P, t, u, ne)
             | t ~ne u
             | ne ~ℕ m
             | 0 ~ℕ ne
             | S m ~ℕ ne
             | ne ~U_i B 
             | ℕ ~U_i ne
             | Π(x : A).B ~U_i ne
             | cast(ℕ,ℕ,e,ne)
             | cast(ne,B,e,t)
             | cast(ℕ,ne,e,t)
             | cast(Π(x: A).B,ne,e,t)
             | cast(w,w',e,t) where (w, w' ∈ {ℕ,ΠA.B,s_i} hd w != hd w')
```

Weak head normal forms are either constructor-headed terms or neutral terms (stuck computations). Crucially, inhabitants of proof-irrelevant types are never considered whnf, as there is no notion of reduction for proof-irrelevant terms.

## Metatheoretical Properties

TTobs enjoys several crucial metatheoretical properties that establish its foundational soundness:

### Consistency

TTobs is consistent, meaning it's impossible to derive a contradiction. The consistency proof relies on the careful separation between proof-relevant and proof-irrelevant universes, ensuring that the additional extensionality principles don't introduce logical inconsistencies.

### Normalization

The reduction system of TTobs is strongly normalizing—every term eventually reaches a normal form that cannot be reduced further. This property is established through logical relations defined using induction-recursion, extending previous work by Abel et al. and Gilbert et al. to handle the cumulative hierarchy with dual universes.

### Canonicity

TTobs satisfies canonicity for natural numbers: every closed term of type ℕ normalizes to a canonical numeral (built from 0 and S). Unlike pure normalization proofs, establishing canonicity in TTobs requires a separate consistency argument due to the proof-irrelevant structure.

### Decidable Type Checking

TTobs admits an algorithm for deciding type membership. Given a context Γ and terms t and A, we can algorithmically determine whether Γ ⊢ t : A. This decidability is crucial for practical implementation in proof assistants.

## Practical Examples and Code

To illustrate TTobs's capabilities, let's examine how key extensionality principles manifest in practice:

### Function Extensionality

In MLTT, proving that two pointwise equal functions are equal requires an axiom. In TTobs, this follows directly from the reduction rules:

```
-- Two functions that agree pointwise
f g : ℕ → ℕ
assumption : (n : ℕ) → f n ~ℕ g n

-- In TTobs, this automatically gives us:
proof : f ~(ℕ→ℕ) g
proof = refl(f)  -- Due to function extensionality in reduction
```

The observational equality `f ~(ℕ→ℕ) g` reduces to `Π(x : ℕ). f x ~ℕ g x`, which is exactly our assumption.

### Propositional Extensionality

Two propositions that are logically equivalent are equal in TTobs:

```
-- Two logically equivalent propositions in Ω
P Q : Ω_0
forward : P → Q
backward : Q → P

-- These combine to prove equality:
prop_ext : P ~Ω_0 Q
prop_ext = <forward, backward>  -- Reduction rule for Ω equality
```

### Type Casting with Computation

The cast operation provides a computational interpretation of transport:

```
-- Equal types via observational equality
A B : U_0
eq_proof : A ~U_0 B

-- Values can be cast between equal types
a : A
b : B
b = cast(A, B, eq_proof, a)

-- Casting preserves computational behavior
-- cast(ℕ, ℕ, refl(ℕ), S(S(0))) => S(S(0))
```

### Quotient Types

TTobs can be extended with quotient types that respect observational equality:

```
-- Quotient by an equivalence relation
A : U_0
R : A → A → Ω_0
-- Assume R is an equivalence relation

QuotA : U_0  -- The quotient type
quot : A → QuotA  -- Quotient map

-- Observational equality on quotients
quot_eq : (a b : A) → R a b → quot a ~QuotA quot b
```

## Comparison with Martin-Löf Type Theory

The relationship between TTobs and MLTT highlights the evolution of type-theoretic foundations:

### Similarities

Both theories share:
- Dependent types and the propositions-as-types principle
- Computational interpretation through reduction
- Constructive logical principles
- Inductive types (natural numbers, etc.)

### Key Differences

| Aspect | MLTT | TTobs |
|--------|------|-------|
| **Equality** | Single identity type Id_A(x,y) | Observational equality t ~_A u |
| **Universes** | Single hierarchy U_i | Dual hierarchy U_i, Ω_i |
| **Function Extensionality** | Requires axiom | Built-in via reduction |
| **Propositional Extensionality** | Requires axiom | Built-in via Ω reduction |
| **UIP** | Not provable | Automatic via proof irrelevance |
| **Proof Relevance** | All proofs are relevant | Ω types are proof-irrelevant |
| **Canonicity** | Direct from normalization | Requires separate consistency proof |

### Computational Behavior

The most significant difference lies in how equality behaves computationally:

**MLTT Identity Type:**
```
-- Identity type as inductive family
data Id (A : Type) (x : A) : A → Type where
  refl : Id A x x

-- J-eliminator for pattern matching
J : {A : Type} {x : A} (P : (y : A) → Id A x y → Type)
  → P x refl
  → {y : A} (p : Id A x y) → P y p
```

**TTobs Observational Equality:**
```
-- Observational equality as type eliminator
(~_) : {A : U_i} → A → A → Ω_i

-- Reduces by case analysis on type structure
f ~(A→B) g  ⟹  Π(x : A). f x ~B g x
P ~Ω Q      ⟹  (P → Q) ∧ (Q → P)
0 ~ℕ 0      ⟹  ⊤
0 ~ℕ (S n)  ⟹  ⊥
```

### Extensionality Principles

TTobs resolves MLTT's extensionality limitations:

**Problem in MLTT:**
```
-- These are not provable without axioms:
funext : {A B : Type} {f g : A → B} 
       → ((x : A) → Id B (f x) (g x)) 
       → Id (A → B) f g

propext : {P Q : Prop} 
        → (P → Q) → (Q → P) 
        → Id Prop P Q
```

**Solution in TTobs:**
```
-- These follow from reduction rules:
funext_ttobs : {A : U_i} {B : A → U_j} {f g : Π(x : A). B x}
             → ((x : A) → f x ~(B x) g x)
             → f ~Π(x:A).B(x) g
funext_ttobs pointwise_eq = refl(f)  -- By reduction

propext_ttobs : {P Q : Ω_i}
              → (P → Q) → (Q → P)
              → P ~Ω_i Q  
propext_ttobs forward backward = <forward, backward>  -- By reduction
```

## Advanced Topics and Extensions

### Quotient Types

TTobs naturally supports quotient types through its observational equality framework. Given a type A and an equivalence relation R, we can construct:

```
Quotient : (A : U_i) → (R : A → A → Ω_j) → U_k
[_] : {A : U_i} {R : A → A → Ω_j} → A → Quotient A R

-- Quotient equality
quot_eq : {A : U_i} {R : A → A → Ω_j} (a b : A) 
        → R a b → [a] ~(Quotient A R) [b]
```

### Higher Inductive Types

While TTobs focuses on setoid-like structures, it can be extended with setoidal versions of higher inductive types that respect observational equality:

```
-- Setoidal circle (as an example)
S¹ : U_0
base : S¹
loop_eq : base ~S¹ base  -- The loop as observational equality
```

### Cumulative Hierarchies

The cumulative nature of TTobs universes enables flexible type constructions:

```
-- Cumulativity allows lifting between universe levels
lift : {A : U_i} → A → U_{i+1}
lift_eq : {A : U_i} (a b : A) → a ~A b → lift a ~U_{i+1} lift b
```

### Compatibility with Classical Logic

The proof-irrelevant hierarchy Ω enables classical reasoning patterns:

```
-- Law of excluded middle for propositions
LEM : (P : Ω_i) → P ∨ (P → ⊥)
LEM P = -- Can be proven due to proof irrelevance
```

## Future Directions and Related Work

TTobs represents a significant milestone in observational type theory, but several avenues remain for future development:

### Higher Observational Type Theory

Research continues into extending observational principles to higher dimensions, potentially achieving univalence computationally without the syntactic complexity of cubical type theories.

### Implementation and Tooling

While TTobs has been formalized in Agda, practical implementation in proof assistants remains an active area of development. The challenge lies in efficiently implementing the type-directed equality checking and cast operations.

### Integration with Homotopy Type Theory

Exploring connections between observational and cubical approaches could yield hybrid systems that combine the best aspects of both paradigms.

## Conclusion

Observational Type Theory, culminating in TTobs, represents a mature approach to resolving the extensionality challenges that have long plagued dependent type theory. By carefully separating proof-relevant and proof-irrelevant content, TTobs achieves the seemingly impossible: a type theory with function extensionality, propositional extensionality, and UIP, while maintaining decidable type checking and strong normalization.

The setoidal interpretation underlying TTobs offers a clean mathematical foundation that stays true to classical mathematical intuitions about equality while preserving the computational character essential for type theory. As research continues into both theoretical extensions and practical implementations, TTobs stands as a testament to the power of principled design in type-theoretic foundations.

The journey from MLTT's basic identity types to TTobs's sophisticated observational equality illustrates the evolution of our understanding of equality in dependent type theory. Whether TTobs will become the foundation for next-generation proof assistants remains to be seen, but its theoretical contributions have already advanced our understanding of what is possible in the landscape of type-theoretic foundations.

For practitioners and theorists alike, TTobs offers both a solution to classical problems and a platform for future innovation in the intersection of logic, computation, and mathematics that defines modern type theory.

## References

### Primary Sources on Observational Type Theory

Altenkirch, T., McBride, C., & Swierstra, W. (2007). Observational Equality, Now! PLPV '07: Proceedings of the 2007 workshop on Programming languages meets program verification, 57-68. DOI: 10.1145/1292597.1292608
Pujet, L., & Tabareau, N. (2022). Observational equality: now for good. Proceedings of the ACM on Programming Languages, 6(POPL), 1-27. DOI: 10.1145/3498693
Altenkirch, T. (2006). Towards Observational Type Theory. Draft manuscript available at ResearchGate.

Setoid Model and Foundations

Hofmann, M. (1995). Extensional concepts in intensional type theory. PhD thesis, University of Edinburgh.
Altenkirch, T. (1999). Extensional equality in intensional type theory. In 14th Symposium on Logic in Computer Science (LICS), 412-420.
Palmgren, E. (2012). From intuitionistic to point-free topology: On the foundation of homotopy theory. Logica Universalis, 6(1-2), 227-253.
Coquand, T., & Huet, G. (1988). The calculus of constructions. Information and computation, 76(2-3), 95-120.
Martin-Löf, P. (1984). Intuitionistic type theory. Studies in Proof Theory, Bibliopolis.

Setoid Type Theory and Related Work

Sozeau, M. (2019). Setoid Type Theory—A Syntactic Translation. In International Conference on Interactive Theorem Proving, 155-175. Springer. DOI: 10.1007/978-3-030-33636-3_7
Gilbert, G., Cockx, J., & Sozeau, M. (2021). Constructing a universe for the setoid model. In 12th International Conference on Interactive Theorem Proving (ITP 2021). DOI: 10.1007/978-3-030-71995-1_1
Danielsson, N. A. (2019). From type theory to setoids and back. arXiv preprint arXiv:1909.01414.
Barras, B. (2014). Constructing categories and setoids of setoids in type theory. arXiv preprint arXiv:1408.1364.

Cubical Type Theory and Alternatives

Cohen, C., Coquand, T., Huber, S., & Mörtberg, A. (2016). Cubical type theory: a constructive interpretation of the univalence axiom. In 21st International Conference on Types for Proofs and Programs (TYPES 2015). DOI: 10.4230/LIPIcs.TYPES.2015.5
Angiuli, C., Harper, R., & Wilson, T. (2017). Computational higher-dimensional type theory. In Proceedings of the 44th ACM SIGPLAN Symposium on Principles of Programming Languages, 680-693.
Orton, I., & Pitts, A. M. (2016). Axioms for modelling cubical type theory in a topos. In 25th EACSL Annual Conference on Computer Science Logic (CSL 2016).
Vezzosi, A., Mörtberg, A., & Abel, A. (2019). Cubical Agda: a dependently typed programming language with univalence and higher inductive types. Proceedings of the ACM on Programming Languages, 3(ICFP), 1-29.

Homotopy Type Theory and Groupoid Models

The Univalent Foundations Program. (2013). Homotopy Type Theory: Univalent Foundations of Mathematics. Institute for Advanced Study.
Hofmann, M., & Streicher, T. (1998). The groupoid interpretation of type theory. In Twenty-five years of constructive type theory, 83-111.
