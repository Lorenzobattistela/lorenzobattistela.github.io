---
title: "Martin-Löf's Intuitionistic Type Theory"
date: "2025-07-20"
description: ""
---

Intuitionistic Type Theory (ITT), primarily developed by Per Martin-Löf, is a formal system that serves as a foundation for **constructive mathematics** and has profound implications for computer science. Its core idea, the **"propositions-as-types" principle** (or Curry-Howard isomorphism), establishes a direct correspondence between logical propositions and mathematical types, and between proofs of these propositions and programs (or elements) inhabiting the corresponding types. This means a proposition is true if and only if its corresponding type is inhabited by a constructive proof, which is a computational object.


## 1. Foundations of Intuitionistic Type Theory

### 1.1 The Core Idea: Propositions as Types

Intuitionistic Type Theory (ITT), primarily developed by Per Martin-Löf, is a formal system that serves as a foundation for **constructive mathematics** and has profound implications for computer science, particularly in the design of programming languages and proof assistants . The central tenet of ITT is the **"propositions-as-types" principle**, also known as the **Curry-Howard isomorphism**. This principle establishes a direct correspondence between logical propositions and mathematical types, and between proofs of these propositions and programs (or elements) inhabiting the corresponding types . In this framework, a proposition is considered true if and only if there exists a constructive proof for it, which translates to the corresponding type being inhabited by at least one element. This contrasts with classical logic, where a proposition can be true without an explicit construction of its proof, for instance, through the law of excluded middle. The "propositions-as-types" paradigm not only provides a novel way of understanding logic but also deeply integrates logical reasoning with computation, as proofs become computational objects that can be executed and verified . This integration is a hallmark of Martin-Löf's work, aiming to bridge the gap between abstract mathematics and concrete programming .

The implications of this core idea are far-reaching. It means that **proving a theorem in ITT is equivalent to writing a program** that satisfies a given specification (the type corresponding to the theorem). This constructive nature ensures that all existence proofs are backed by explicit witnesses. For example, to prove a statement like "there exists an x such that P(x)", one must actually provide a specific value for x and a proof that P(x) holds for that value. This is a direct consequence of identifying propositions with sets (or types) and proofs with their elements. The system is designed so that every step of a proof corresponds to a step in constructing an object of a certain type, making the entire process transparent and verifiable. This **computational interpretation of proofs** is a powerful feature, enabling the use of type theory as a programming language where program correctness is intrinsically linked to the type system. The original aim of Martin-Löf was to create a framework where other mathematical theories could be interpreted, inheriting desirable properties like normalization.

### 1.2 Judgments vs. Propositions

In Martin-Löf's Intuitionistic Type Theory, a clear distinction is made between *propositions* and *judgments*. This distinction is crucial for understanding the formal structure and philosophical underpinnings of the theory. A **proposition** in ITT is a potential truth, an object about which we can reason. Under the "propositions-as-types" interpretation, a proposition is identified with a type. For instance, a proposition like "A or B" (A ∨ B) is represented by the sum type `A + B`. The truth of a proposition is established by demonstrating that its corresponding type is inhabited, meaning there exists at least one element (or proof) of that type. This contrasts with classical logic where propositions might be true by virtue of non-constructive arguments.

On the other hand, a **judgment** is an act of knowing or an assertion of fact that is made within the formal system during the process of proving. It is a statement about the well-formedness of types or the membership of elements in types. Martin-Löf's system is built upon several fundamental forms of judgment. These include :
1.  `A type` (or `A set` in some formulations): This judgment asserts that `A` is a well-formed type. For example, `Nat type` (Natural numbers form a type).
2.  `a : A` (or `a ∈ A`): This judgment asserts that the term `a` is an element of the type `A`, or equivalently, that `a` is a proof of the proposition `A`. For example, `succ(zero) : Nat` (the successor of zero is a natural number).
3.  `A = B type` (or `A = B`): This judgment asserts that `A` and `B` are definitionally equal types.
4.  `a = b : A`: This judgment asserts that `a` and `b` are definitionally equal elements of the type `A`.

These judgments are not propositions themselves; rather, they are the basic assertions that the deductive machinery of the type theory operates on. Proofs in ITT are constructed by applying inference rules that transform judgments into other judgments. For instance, if we have a judgment `A type` and `B type`, an inference rule might allow us to derive the judgment `(A × B) type` (the type of pairs). Contexts, often denoted by Γ, are used to manage assumptions, which are themselves judgments (e.g., `x : A`). A context is a list of such assumptions, and a judgment made within a context, written as `Γ ⊢ J`, means that the judgment `J` holds under the assumptions in Γ . This distinction ensures that the meta-logical framework (the rules for manipulating judgments) is kept separate from the object-level logic (the propositions and their proofs).

### 1.3 Constructivism: Proofs as Constructions

Intuitionistic Type Theory is fundamentally rooted in the philosophy of **constructivism**, which posits that mathematical objects are mental constructions and that a mathematical statement is true only if there is a constructive proof of it. This contrasts sharply with classical mathematics, which often relies on non-constructive proofs, such as those based on the law of excluded middle (P ∨ ¬P) or the axiom of choice. In ITT, to prove the existence of a mathematical object with certain properties, one must explicitly construct such an object and demonstrate that it satisfies those properties. This requirement for explicit constructions means that **proofs in ITT have a strong computational content**; a proof is not merely an abstract derivation but a concrete, executable program that embodies the construction process . This is a direct consequence of the Curry-Howard isomorphism, where a proof of a proposition `P` is an element (a program) of the type corresponding to `P`.

The emphasis on constructive proofs has significant implications. For example, a statement like "there exists an x such that P(x)" cannot be proven by simply showing that assuming the non-existence of such an x leads to a contradiction (a common non-constructive argument). Instead, one must provide a specific `x₀` and a proof that `P(x₀)` holds. This constructive nature makes ITT particularly well-suited for applications in computer science, where algorithms and data structures are inherently constructive. The programs (proofs) in ITT are guaranteed to terminate, which is a desirable property for ensuring program correctness . This is because the rules for forming types and terms are designed to ensure that all computations reduce to a canonical form. The **rejection of the law of excluded middle** is a key feature of constructivism. In ITT, one cannot generally assert `P ∨ ¬P` for an arbitrary proposition `P` unless one can either construct a proof of `P` or a proof of `¬P`. This makes the logic intuitionistic rather than classical. The focus is on what can be constructed.

### 1.4 The Curry-Howard Isomorphism

The **Curry-Howard isomorphism**, also known as the **propositions-as-types principle**, is the cornerstone of Intuitionistic Type Theory. It establishes a profound correspondence between formal logic and type theory. Specifically, it states that:
*   **Propositions** in logic correspond to **types** in type theory.
*   **Proofs** of a proposition correspond to **programs** (or **elements**) of the corresponding type.
*   The process of **proving** a proposition corresponds to the process of **constructing** an element of the corresponding type.

This isomorphism means that logical connectives (like "and", "or", "implies", "for all", "there exists") can be interpreted as type constructors. For example:
*   A proof of an implication `P → Q` corresponds to a function that takes a proof of `P` as input and produces a proof of `Q` as output. The type of such functions is the function type `P → Q`.
*   A proof of a conjunction `P ∧ Q` corresponds to a pair `(p, q)` where `p` is a proof of `P` and `q` is a proof of `Q`. The type of such pairs is the product type `P × Q`.
*   A proof of a disjunction `P ∨ Q` corresponds to either a proof of `P` or a proof of `Q`, along with an indication of which one it is. This is represented by the sum type `P + Q`.
*   A proof of a universally quantified statement `∀x:A. P(x)` corresponds to a dependent function that, for any given `a:A`, produces a proof of `P(a)`. This is the dependent product type `Π(x:A). P(x)`.
*   A proof of an existentially quantified statement `∃x:A. P(x)` corresponds to a pair `(a, p)` where `a:A` is a witness and `p` is a proof of `P(a)`. This is the dependent sum type `Σ(x:A). P(x)`.

This correspondence is not just a superficial analogy but a **deep formal identity**. It allows logical reasoning to be performed by type checking and program construction. If a type (proposition) is inhabited (has an element), then the corresponding proposition is true. The element itself serves as the proof. This makes ITT a powerful system for constructive mathematics, as every proof provides an explicit witness. Furthermore, it provides a strong foundation for proof assistants and programming languages with dependent types, such as Agda and Coq, where programs can be verified for correctness by type checking.

## 2. Key Concepts and Type Constructors

### 2.1 Dependent Types

**Dependent types** are a hallmark feature of Martin-Löf's Intuitionistic Type Theory, significantly enhancing its expressive power beyond that of simpler type systems . A dependent type is a type whose definition depends on a value, rather than just other types. This means that types can vary based on the specific elements they are associated with. For example, one can define a type `Vec(A, n)` representing lists (vectors) of elements of type `A` with a specific length `n`, where `n` is a natural number. Here, the type `Vec(A, n)` is dependent on the value `n`. This allows for much more precise specifications of program behavior and data structures directly within the type system. For instance, a function that concatenates two vectors could have a type like `Π(n m : Nat). Vec(A, n) → Vec(A, m) → Vec(A, n + m)`, ensuring that the length of the resulting vector is the sum of the lengths of the input vectors.

The introduction of dependent types allows for a more direct and natural encoding of mathematical concepts and logical propositions. For example, the statement "for all natural numbers n, P(n) holds" can be represented by the dependent function type `Π(n : Nat). P(n)`, where `P(n)` is a type (proposition) that depends on `n`. Similarly, the statement "there exists a natural number n such that P(n) holds" can be represented by the dependent pair type `Σ(n : Nat). P(n)`, which consists of a pair `(k, p)` where `k` is a natural number and `p` is a proof of `P(k)`. This ability to have types depend on values is crucial for capturing many common mathematical patterns and for ensuring strong correctness properties in programming, such as array bounds checking or ensuring that a matrix multiplication function is only applied to matrices of compatible dimensions. The two primary dependent type formers in ITT are the **Pi type (Π)** for dependent functions and the **Sigma type (Σ)** for dependent pairs, which generalize universal and existential quantification, respectively.

### 2.2 Pi Types (Π): Universal Quantification and Dependent Functions

**Pi types**, denoted as `Π(x:A) B(x)`, are a fundamental concept in Intuitionistic Type Theory, serving a dual role as both **dependent function types** and a means to express **universal quantification** . A Pi type `Π(x:A) B(x)` represents the type of functions that take an element `a` of type `A` as input and return an element of type `B(a)`. The return type `B(a)` can depend on the specific input value `a`. This dependency is what makes it a *dependent* function type. If `B(x)` does not actually depend on `x` (i.e., it is constant), then `Π(x:A) B` simplifies to the non-dependent function type `A → B`. The introduction rule for Pi types is **lambda abstraction**: if, assuming `x : A`, we can construct a term `t : B(x)`, then we can form the function `λx.t : Π(x:A) B(x)`. The elimination rule is **function application**: if `f : Π(x:A) B(x)` and `a : A`, then `f a : B(a)`.

From a logical perspective, the Pi type `Π(x:A) B(x)` directly corresponds to the universal quantifier `∀(x:A). B(x)`. A proof of `∀(x:A). B(x)` in ITT is a function that, given any specific element `a` of type `A`, produces a proof of the proposition `B(a)`. This is a **constructive interpretation of universal quantification**: it's not just an assertion that `B(x)` holds for all `x`, but a mechanism (a function) that can generate evidence for `B(a)` for any given `a`. This aligns perfectly with the intuitionistic notion of truth, where a proof must provide explicit evidence. For example, if `Even(n)` is the type representing the proposition that `n` is an even number, then `Π(n:Nat). Even(n) → Even(n+2)` would be the type of functions that take a natural number `n` and a proof that `n` is even, and return a proof that `n+2` is even. An inhabitant of this type would be a constructive proof of the statement "for all n, if n is even, then n+2 is even".

### 2.3 Sigma Types (Σ): Existential Quantification and Dependent Pairs

**Sigma types**, denoted as `Σ(x:A) B(x)`, are another crucial dependent type constructor in Intuitionistic Type Theory, playing a role analogous to **existential quantification** in logic and forming **dependent pair types** . A Sigma type `Σ(x:A) B(x)` represents the type of pairs `(a, b)` where the first component `a` is of type `A`, and the second component `b` is of type `B(a)`. Importantly, the type of the second component, `B(a)`, depends on the value `a` of the first component. If `B(x)` is independent of `x`, then `Σ(x:A) B` simplifies to the non-dependent product type `A × B`. The introduction rule for Sigma types is **pairing**: if `a : A` and `b : B(a)` (where `B(a)` is the type obtained by substituting `a` for `x` in `B(x)`), then the pair `(a, b) : Σ(x:A) B(x)`. Elimination can be done via projections: if `p : Σ(x:A) B(x)`, then `fst(p) : A` and `snd(p) : B(fst(p))`.

Logically, the Sigma type `Σ(x:A) B(x)` corresponds directly to the existential quantifier `∃(x:A). B(x)`. A proof of `∃(x:A). B(x)` in ITT consists of a pair `(a, p)` where `a` is an element of type `A` (the **"witness"**) and `p` is a proof of the proposition `B(a)`. This is the **constructive interpretation of existential quantification**: to prove that something exists, one must explicitly provide an example of it (`a`) along with evidence (`p`) that this example satisfies the required property `B`. This contrasts with classical logic, where an existence proof might not yield an actual witness. For instance, if `Prime(n)` is the type representing the proposition that `n` is a prime number, then `Σ(n:Nat). Prime(n)` would be the type of pairs where the first element is a natural number and the second element is a proof that this number is prime. An inhabitant of this type would be a specific prime number along with its primality certificate. This makes Sigma types essential for expressing properties that require demonstrating the existence of an object with specific characteristics.

### 2.4 Sum Types (+): Disjoint Union for Intuitionistic Disjunction

**Sum types**, often denoted as `A + B`, are used in Intuitionistic Type Theory to represent **disjunction**, corresponding to the logical "or" . An element of the type `A + B` is either an element of type `A` or an element of type `B`, along with a tag indicating which type it came from. This is often referred to as a "tagged union" or "disjoint union". The formation rule for sum types states that if `A` is a type and `B` is a type, then `A + B` is also a type . The introduction rules for sum types are via constructors, typically called `inl` (inject left) and `inr` (inject right). If `a : A`, then `inl(a) : A + B`. Similarly, if `b : B`, then `inr(b) : A + B` . These constructors ensure that we know from which component of the sum type an element originates.

The elimination rule for sum types is typically done via **case analysis** (or a "destructor" often called `match` or `case`). To use a value `c : A + B`, one must provide two functions: one that handles the case where `c` is of the form `inl(x)` for some `x : A`, and another that handles the case where `c` is of the form `inr(y)` for some `y : B`. If the first function has type `A → C` and the second has type `B → C`, then the case analysis on `c : A + B` will produce a result of type `C`. This ensures that all possible cases are handled. Logically, this corresponds to the intuitionistic understanding of disjunction: to prove `A ∨ B`, one must either provide a proof of `A` or a proof of `B`. The sum type `A + B` is inhabited if and only if either `A` is inhabited or `B` is inhabited. This is distinct from classical logic, where `A ∨ ¬A` is always true (law of excluded middle); in ITT, `A + ¬A` is not generally inhabited unless one can explicitly construct a proof of `A` or a proof of `¬A`. The **uniqueness rule (η-rule)** for sum types states that any element `e` of `A + B` is judgmentally equal to the result of case analysis on `e` where both branches reconstruct the injected value .

### 2.5 Identity Types (Id): Propositional Equality

**Identity types**, typically written as `Id_A(x, y)` or `x =_A y`, are a central concept in Intuitionistic Type Theory, used to represent **propositional equality** between two terms `x` and `y` of the same type `A`. Unlike definitional equality (which is a judgment about the syntactic identity of terms up to computation, e.g., `a ≡ b : A`), propositional equality is a type, and its inhabitants are proofs that `x` and `y` are equal in some logical sense. The introduction rule for identity types is **reflexivity**: for any term `a : A`, there is a canonical proof `refl_a : Id_A(a, a)` (or `a =_A a`), asserting that any term is equal to itself.

The elimination rule for identity types is more complex and is often referred to as the **J-rule** or **path induction** (especially in the context of Homotopy Type Theory). The J-rule allows one to transport a property along a path of equality. It states that if:
1.  `C` is a type family dependent on two elements of `A` and a proof of their equality, i.e., `C : Π(x y : A). Id_A(x, y) → Type`,
2.  `d` is a proof that the property `C` holds for the trivial reflexive case, i.e., `d : Π(z : A). C(z, z, refl_z)`,
3.  `a, b : A` are two terms, and
4.  `p : Id_A(a, b)` is a proof that `a` and `b` are equal,
then `J(C, d, a, b, p) : C(a, b, p)`. This rule essentially says that to prove a property `C` for any equality proof `p` between `a` and `b`, it suffices to prove it for the trivial case where `a` is `b` and the proof is `refl_a`. The J-rule embodies the principle that **identicals are indiscernible**: if `a` and `b` are proven equal, then any property that holds for `a` must also hold for `b`. The computation rule for J states that `J(C, d, a, a, refl_a)` reduces to `d(a)`. Identity types are fundamental for expressing properties that depend on the equality of terms and are a key area of research, particularly with the development of Homotopy Type Theory, which interprets identity types as paths in a space.

### 2.6 Natural Numbers (ℕ): An Inductive Type

The type of **natural numbers**, `Nat` or `ℕ`, is a canonical example of an **inductive type** in Intuitionistic Type Theory , . It is defined by specifying how its elements are constructed. There are two introduction rules:

1.  `0 : ℕ` (zero is a natural number).
2.  If `n : ℕ`, then `succ(n) : ℕ` (the successor of a natural number is a natural number).

These rules generate the set of natural numbers: `0`, `succ(0)`, `succ(succ(0))`, and so on. The elimination rule for natural numbers is a principle of **recursion or induction**, which allows defining functions on `ℕ` and proving properties about its elements. To define a function `f : ℕ → C` for some type `C`, one must provide:
*   A base case: an element `c_z : C` (the value of `f(0)`).
*   A step case: a function `c_s : Π(m : ℕ). C → C` that, given a natural number `m` and the value of `f(m)`, produces the value of `f(succ(m))`.
The induction principle then defines a function `rec(C, c_z, c_s, n) : C` for any `n : ℕ`. The computation rules ensure that `rec(C, c_z, c_s, 0)` reduces to `c_z` and `rec(C, c_z, c_s, succ(n))` reduces to `c_s n (rec(C, c_z, c_s, n))`. This principle captures the idea that the natural numbers are the "smallest" type closed under zero and successor. Proofs by induction in ITT must be constructive, requiring explicit provision of base and step cases. The natural numbers are a fundamental data type and serve as a basis for defining more complex structures and functions.

### 2.7 W-Types (Well-Founded Trees)

**W-types**, or **Well-founded Trees**, are a general form of inductive type in Intuitionistic Type Theory that can represent a wide variety of data structures, including lists, binary trees, and even the natural numbers themselves . The 'W' stands for "Well-founded", reflecting their foundational property. A W-type is parameterized by two types: a type `A` of "labels" or "constructors" for the nodes, and a type family `B : A → Type` which, for each label `a : A`, specifies the type `B(a)` of "child indices" for a node labeled `a`. An element of the W-type `W(x:A) B(x)` (or `W_{a:A} B(a)`) can be thought of as a well-founded tree where each node is labeled by an element `a : A` and has a subtree for each element of `B(a)`.

The introduction rule for W-types is typically called `sup` (for supremum). A term `sup(a, f)` is a tree where:
*   `a : A` is the label for the root node.
*   `f : B(a) → W(x:A) B(x)` is a function that, for each child index `y : B(a)`, returns the corresponding subtree `f(y)`.

This allows for the construction of trees of arbitrary (but well-founded) branching structure. The elimination rule for W-types is a powerful recursion principle, generalizing the induction seen for natural numbers. To define a function `h : Π(w:W(x:A) B(x)). C(w)` (where `C` is a type family depending on the W-type), one provides a "step" function `g` that explains how to compute the result for any tree `sup(a, f)`, given the results of recursive calls on all its subtrees. Specifically, `g` would have a type like `Π(a:A). Π(f:B(a)→W(x:A)B(x)). (Π(y:B(a)). C(f(y))) → C(sup(a,f))`. The computation rule then defines `h(sup(a,f))` in terms of `g` applied to `a`, `f`, and the recursively computed values `h(f(y))` for `y:B(a)`. W-types are very expressive; for example, the natural numbers can be defined as a W-type where `A` has two elements (e.g., `zero_tag` and `succ_tag`), `B(zero_tag)` is the empty type (no children for zero), and `B(succ_tag)` is the unit type (one child for successor.

### 2.8 Empty Type (⊥): Representing Falsehood

The **empty type**, often denoted as `⊥` or `0`, is a type in Intuitionistic Type Theory that has **no inhabitants** . It represents **falsehood** or absurdity in the logical interpretation of types. Its formation rule is straightforward: in any valid context `Γ`, `⊥` is a type . Because there are no elements of type `⊥`, there is no introduction rule for it. If a proposition `P` is identified with the empty type, it means `P` is false, as there are no proofs of it. A common example is the interpretation of negation: `¬A` (not A) can be defined as `A → ⊥`. This means that a proof of `¬A` is a function that would take a proof of `A` and produce a proof of `⊥`. Since there are no proofs of `⊥`, such a function can only exist if there are no proofs of `A` either.

The elimination rule for the empty type is known as **"ex falso quodlibet"** (from falsehood, anything follows) or "⊥-elimination". It states that if one somehow manages to have a term `e : ⊥` (which should be impossible under normal circumstances, as `⊥` has no constructors), then for any type `C` (which may depend on `e`), one can construct a term `⊥elim(C, e) : C` . This rule is paradoxical in the sense that it allows deriving anything from a contradiction. While it might seem strange, it is a standard and important part of the logical framework, ensuring that the system behaves correctly in the presence of absurdity. It reflects the principle that if a contradiction has been derived, the current line of reasoning can lead to any conclusion. In programming terms, if a branch of code is reachable only if an impossible condition (a value of type `⊥`) is met, then that branch can have any type, as it will never actually be executed. Computation and uniqueness rules for `⊥` are typically omitted or trivial, as there are no canonical elements of `⊥`.

### 2.9 Unit Type (⊤): Representing Truth

The **unit type**, often denoted as `⊤` or `1` or sometimes `𝟙`, is a type in Intuitionistic Type Theory that has **exactly one inhabitant** . It represents **truth** or the trivially true proposition in the logical interpretation of types. Its formation rule states that in any valid context `Γ`, `⊤` is a type . This single inhabitant is typically denoted by a symbol like `*` or `()` . Because there is only one canonical element, the introduction rule for the unit type is simple: `() : ⊤` (or `* : ⊤`). This means that the unit type is always inhabited, corresponding to a proposition that is always true.

The elimination rule for the unit type is straightforward. Since there is only one possible value of type `⊤`, pattern matching on a term `u : ⊤` provides no new information; it must be `*`. If we have a type family `C : ⊤ → Type` and a term `c : C(())` (i.e., a proof of `C` for the canonical element `()`), then for any `u : ⊤`, we can construct a term `⊤elim(C, c, u) : C(u)` . The computation rule states that `⊤elim(C, c, ())` reduces to `c : C(())` . Essentially, if a property `C` holds for the unique element `()`, then it holds for any element of type `⊤`. The **uniqueness rule (η-rule)** for the unit type often states that any element `p : ⊤` is judgmentally equal to the canonical element `*`, i.e., `p = * : ⊤` . The unit type is often used as a placeholder or a trivial base case in more complex type constructions. For example, in a dependent pair type `Σ(x:A) B(x)`, if `B(x)` is `⊤` for all `x`, then the pair simply carries the information of `x:A` with no additional data, effectively behaving like the non-dependent type `A`.

## 3. Formalizing the Theory: Judgments and Rules

### 3.1 Contexts and Basic Judgments

The formal system of Intuitionistic Type Theory is built upon a foundation of judgments and inference rules. A **context**, often denoted by Γ (Gamma), is a list of assumptions, where each assumption is a variable declaration along with its type, e.g., `x₁:A₁, x₂:A₂, ..., xₙ:Aₙ`. These assumptions represent the current set of known objects and their types. A context is well-formed if each type `Aᵢ` in it is a well-formed type under the preceding assumptions `x₁:A₁, ..., xᵢ₋₁:Aᵢ₋₁`. The empty context, often denoted by `·` or simply omitted, is also considered well-formed. The judgment `Γ ctx` asserts that the context Γ is well-formed .

The basic judgments in Martin-Löf's type theory are typically presented in one of two styles: with a separate type judgment or without. 

1.  `A type` (or `A set`): This judgment asserts that `A` is a well-formed type. For example, `Nat type`.
2.  `a : A` (or `a ∈ A`): This judgment asserts that the term `a` is an element of the type `A`. For example, `0 : Nat`.
3.  `A = B type` (or `A = B`): This judgment asserts that `A` and `B` are definitionally equal types.
4.  `a = b : A`: This judgment asserts that `a` and `b` are definitionally equal elements of the type `A`.

These judgments are often made relative to a context Γ, written as `Γ ⊢ A type`, `Γ ⊢ a : A`, `Γ ⊢ A = B type`, and `Γ ⊢ a = b : A`. The judgment `Γ ⊢ J` means that the judgment `J` is derivable under the assumptions in Γ. The rules of the type theory govern how these judgments can be derived from one another. For example, the assumption rule states that if a variable `x` is declared with type `A` in the context, then within that context, `x` is indeed of type `A`. The structure of contexts and these basic judgments form the scaffolding upon which the entire type theory is constructed, ensuring that all terms and types are well-formed and that their properties are derived according to the formal rules.

### 3.2 General Inference Rules
Intuitionistic Type Theory is formalized through a set of inference rules that dictate how judgments can be derived. These rules are typically presented in a natural deduction style. These include:

*   **Assumption Rule**:
    ```
      Γ ⊢ A type
    --------------
    Γ, x:A ⊢ x : A
    ```
    This rule states that if `A` is a well-formed type in context Γ, then we can extend the context by assuming a new variable `x` of type `A`, and in this extended context, `x` is indeed of type `A`. This is the fundamental way hypotheses are introduced.

*   **Substitution Rule (for terms)**:
    ```
    Γ ⊢ a : A  Γ, x:A ⊢ b : B
    --------------------------
      Γ ⊢ b[a/x] : B[a/x]
    ```
    This rule allows substituting a term `a` of type `A` for a variable `x` in a term `b` (and its type `B`), provided `b` and `B` are well-formed in the context extended with `x:A`. The notation `b[a/x]` means "`b` with `a` substituted for `x`".

*   **Equality Rules**:
    *   **Reflexivity**:
        ```
          Γ ⊢ a : A
        --------------
        Γ ⊢ a = a : A
        ```
        Any term `a` of type `A` is definitionally equal to itself.
    *   **Symmetry**:
        ```
        Γ ⊢ a = b : A
        --------------
        Γ ⊢ b = a : A
        ```
        If `a` is definitionally equal to `b`, then `b` is definitionally equal to `a`.
    *   **Transitivity**:
        ```
        Γ ⊢ a = b : A  Γ ⊢ b = c : A
        -----------------------------
          Γ ⊢ a = c : A
        ```
        If `a` is definitionally equal to `b` and `b` is definitionally equal to `c`, then `a` is definitionally equal to `c`.
    *   **Type Equality Congruence**:
        ```
        Γ ⊢ a : A   Γ ⊢ A = B type
        --------------------------
            Γ ⊢ a : B
        ```
        If a term `a` has type `A`, and type `A` is definitionally equal to type `B`, then `a` also has type `B`. This ensures that typing respects definitional equality of types.

These general rules, along with specific rules for each type constructor (like Π, Σ, ℕ, etc.), form the deductive system of ITT. Every rule of inference, from introducing logical connectives to applying functions, is expressed as a relationship between judgments, making the entire structure of reasoning explicit and formal. The nLab page on Martin-Löf dependent type theory also lists structural rules such as variable conversion and rules for definitional equality and definitions, which are crucial for the meta-theory.

### 3.3 Universe Hierarchy (U_i)
To avoid paradoxes like Russell's paradox (which arises from allowing a "type of all types" that contains itself), Intuitionistic Type Theory organizes types into a **hierarchy of universes**. Each universe `U_i` (or `Type_i`) is a type that contains other types. The subscript `i` is typically a natural number, indicating the level of the universe. The key rules for universes are:

*   **Universe Formation**:
    ```
    --------------- (i ≥ 0)
    Γ ⊢ U_i type
    ```
    This rule states that for any natural number `i`, `U_i` itself is a well-formed type. Note that `U_i : U_{i+1}`.

*   **Universe Cumulativity**:
    ```
      Γ ⊢ A : U_i
    ----------------- (i ≤ j)
    Γ ⊢ A : U_j
    ```
    This rule states that if a type `A` is in universe `U_i`, it is also in any higher universe `U_j`. This means the universes are cumulative: `U_0 ⊆ U_1 ⊆ U_2 ⊆ ...`. This is often preferred over a "typical ambiguity" approach where universe levels are left implicit and checked for consistency.

*   **Typing of Universes**:
    ```
    Γ ⊢ U_i : U_{i+1}
    ```
    Each universe `U_i` is itself an element of the next universe `U_{i+1}`. This stratified hierarchy prevents a universe from containing itself, thereby avoiding impredicativity and maintaining consistency. Small types, like `Nat` or `Bool`, typically reside in `U_0` (or `Set` in some formulations). The formation rules for other types ensure that they live in appropriate universes. For example, if `A : U_i` and `B(x) : U_i` for `x:A`, then `Π(x:A). B(x) : U_i`. If `B(x)` is in a higher universe, say `U_{i+1}`, then the resulting Pi type would also be in `U_{i+1}` or a higher universe, depending on the specific rules of the theory (e.g., if it takes the maximum of the component universes). This hierarchical structure is essential for the consistency of the theory while still allowing for a rich type system.

### 3.4 Rules for Pi Types (Π)
Pi types, `Π(x:A) B(x)`, represent dependent functions and are central to expressing universal quantification. The rules governing them are:

*   **Pi Type Formation**:
    ```
    Γ ⊢ A : U_i   Γ, x:A ⊢ B(x) : U_i
    -----------------------------------
        Γ ⊢ Π(x:A) B(x) : U_i
    ```
    This rule states that if `A` is a type in universe `U_i` and `B(x)` is a type in `U_i` for any `x` of type `A` (under the extended context), then the Pi type `Π(x:A) B(x)` is also a type in `U_i`. If `B(x)` is in a different universe, say `U_j`, the resulting Pi type would typically live in `U_k` where `k = max(i,j)` or `U_{max(i,j)+1}`, depending on the specific formulation of the theory to ensure predicativity.

*   **Pi Type Introduction (Lambda Abstraction)**:
    ```
      Γ, x:A ⊢ b : B(x)
    -----------------------
    Γ ⊢ λx.b : Π(x:A) B(x)
    ```
    If, assuming a variable `x` of type `A`, a term `b` of type `B(x)` can be constructed, then the lambda abstraction `λx.b` is an element of the Pi type `Π(x:A) B(x)`. This constructs a function.

*   **Pi Type Elimination (Function Application)**:
    ```
    Γ ⊢ f : Π(x:A) B(x)   Γ ⊢ a : A
    --------------------------------
        Γ ⊢ f a : B(a)
    ```
    If `f` is a function of type `Π(x:A) B(x)` and `a` is an element of type `A`, then applying `f` to `a` results in an element of type `B(a)` (where `B(a)` is `B(x)` with `a` substituted for `x`).

*   **Pi Type Computation (β-reduction)**:
    ```
      Γ, x:A ⊢ b : B(x)   Γ ⊢ a : A
    ---------------------------------
    Γ ⊢ (λx.b) a = b[a/x] : B(a)
    ```
    This rule defines the computational behavior of function application. Applying a lambda abstraction `λx.b` to an argument `a` reduces to the body `b` with `a` substituted for `x`.

*   **Pi Type Equality (η-conversion, optional but common)**:
    ```
        Γ ⊢ f : Π(x:A) B(x)
    --------------------------
    Γ ⊢ λx.(f x) = f : Π(x:A) B(x)
    ```
    This rule states that any function `f` is definitionally equal to its eta-expansion `λx.(f x)`, provided `x` is not free in `f`. This captures a notion of function extensionality at the definitional level.

These rules ensure that Pi types correctly model dependent functions and universal quantification in a constructive manner.

### 3.5 Rules for Sigma Types (Σ)
Sigma types, `Σ(x:A) B(x)`, represent dependent pairs and are used to express existential quantification. Their rules are:

*   **Sigma Type Formation**:
    ```
    Γ ⊢ A : U_i   Γ, x:A ⊢ B(x) : U_i
    -----------------------------------
        Γ ⊢ Σ(x:A) B(x) : U_i
    ```
    If `A` is a type in universe `U_i` and `B(x)` is a type in `U_i` for any `x:A`, then the Sigma type `Σ(x:A) B(x)` is also a type in `U_i`. Similar to Pi types, if `B(x)` lives in a different universe, the resulting Sigma type's universe level is determined accordingly.

*   **Sigma Type Introduction (Pairing)**:
    ```
    Γ ⊢ a : A   Γ ⊢ b : B(a)
    -------------------------
    Γ ⊢ (a, b) : Σ(x:A) B(x)
    ```
    If `a` is an element of type `A` and `b` is an element of type `B(a)` (where `B(a)` is `B(x)` with `a` substituted for `x`), then the pair `(a, b)` is an element of the Sigma type `Σ(x:A) B(x)`.

*   **Sigma Type Elimination (Projections)**:
    *   **First Projection (fst)**:
        ```
        Γ ⊢ p : Σ(x:A) B(x)
        ----------------------
          Γ ⊢ fst(p) : A
        ```
        If `p` is a pair of type `Σ(x:A) B(x)`, then `fst(p)` extracts the first component, which has type `A`.
    *   **Second Projection (snd)**:
        ```
          Γ ⊢ p : Σ(x:A) B(x)
        ----------------------------
        Γ ⊢ snd(p) : B(fst(p))
        ```
        If `p` is a pair of type `Σ(x:A) B(x)`, then `snd(p)` extracts the second component, which has type `B(fst(p))`. The type of the second component depends on the value of the first component.

*   **Sigma Type Computation**:
    *   **Computation for fst**:
        ```
        Γ ⊢ a : A   Γ ⊢ b : B(a)
        -------------------------
        Γ ⊢ fst((a, b)) = a : A
        ```
        The first projection of a pair `(a, b)` reduces to `a`.
    *   **Computation for snd**:
        ```
        Γ ⊢ a : A   Γ ⊢ b : B(a)
        -------------------------
        Γ ⊢ snd((a, b)) = b : B(a)
        ```
        The second projection of a pair `(a, b)` reduces to `b`.

*   **Sigma Type Equality (η-conversion / Surjectivity of Pairing, optional but common)**:
    ```
          Γ ⊢ p : Σ(x:A) B(x)
    --------------------------------
    Γ ⊢ (fst(p), snd(p)) = p : Σ(x:A) B(x)
    ```
    Any pair `p` is definitionally equal to the pair formed from its projections. This expresses that every element of a Sigma type is essentially a pair.

These rules ensure that Sigma types correctly model dependent pairs and existential quantification, requiring explicit witnesses and proofs.

### 3.6 Rules for Sum Types (+)
The formalization of sum types (`A + B`) in Intuitionistic Type Theory involves precise rules for their formation, introduction, elimination, computation, and uniqueness. These rules are typically presented in a natural deduction style, as seen in resources like the nLab entry on Martin-Löf dependent type theory.

**Formation Rule:**
The formation rule dictates under what conditions a sum type can be constructed. It states that if `A` is a type and `B` is a type within a context `Γ`, then their sum `A + B` is also a type in that context. The rule is formally written as:
```
Γ ⊢ A type   Γ ⊢ B type
------------------------ (Sum-Form)
  Γ ⊢ A + B type
```
This rule ensures that sum types are only formed from well-defined constituent types. `A` and `B` must belong to the same universe `U_i` for `A + B` to be in `U_i` .

**Introduction Rules:**
There are two introduction rules for sum types, corresponding to the two ways an element of `A + B` can be formed: by injecting an element from `A` or an element from `B`.
1.  **Left Injection (`inl`):** If `a` is an element of type `A`, then `inl(a)` is an element of type `A + B`.
    ```
        Γ ⊢ a : A
    ------------------ (Sum-Intro-Left)
    Γ ⊢ inl(a) : A + B
    ```
2.  **Right Injection (`inr`):** If `b` is an element of type `B`, then `inr(b)` is an element of type `A + B`.
    ```
        Γ ⊢ b : B
    ------------------ (Sum-Intro-Right)
    Γ ⊢ inr(b) : A + B
    ```
These rules ensure that every element of `A + B` is explicitly tagged with its origin, preserving the disjointness of the union.

**Elimination Rule (Recursor/Induction):**
The elimination rule, often called `+elim` or `ind_A+B`, allows for case analysis on an element of `A + B`. To define a function or prove a property `C(z)` for all `z : A + B`, one must provide proofs for the cases where `z` is `inl(x)` and where `z` is `inr(y)`.
The rule is formally presented in the nLab as :
```
Γ, z : A + B ⊢ C(z) type   Γ, x : A ⊢ c_inl(x) : C(inl(x))   Γ, y : B ⊢ c_inr(y) : C(inr(y))   Γ ⊢ e : A + B
------------------------------------------------------------------------------------------------------------- (Sum-Elim)
                     Γ ⊢ ind_A+B^C(c_inl, c_inr, e) : C(e)
```

Or the equivalent
```
Γ ⊢ c : A + B   Γ, x : A ⊢ d : D(inl(x))   Γ, y : B ⊢ e : D(inr(y))
------------------------------------------------------------------- (Sum-Elim)
          Γ ⊢ +elim(D, d, e, c) : D(c)
```
Here, `D` is the type family (motive) dependent on `z : A + B`. The `ind_A+B^C` notation makes the dependency on the type family `C` explicit.

**Computation Rules:**
These rules specify how the eliminator computes when applied to a constructor. They ensure that the behavior of functions defined by case analysis is well-defined.
1.  **Computation for `inl`:** If the element being analyzed is `inl(a)`, the result is the application of the left branch to `a`.
    ```
    Γ, z : A + B ⊢ C(z) type   Γ, x : A ⊢ c_inl(x) : C(inl(x))   Γ, y : B ⊢ c_inr(y) : C(inr(y))   Γ ⊢ a : A
    --------------------------------------------------------------------------------------------------------- (Sum-Comp-inl)
    Γ ⊢ ind_A+B^C(c_inl, c_inr, inl(a)) ≡ c_inl(a) : C(inl(a))
    ```
    
Or: `Γ ⊢ +elim(D, d, e, inl(a)) = d[a/x] : D(inl(a))`.

2.  **Computation for `inr`:** If the element being analyzed is `inr(b)`, the result is the application of the right branch to `b`.
    ```
    Γ, z : A + B ⊢ C(z) type   Γ, x : A ⊢ c_inl(x) : C(inl(x))   Γ, y : B ⊢ c_inr(y) : C(inr(y))   Γ ⊢ b : B
    --------------------------------------------------------------------------------------------------------- (Sum-Comp-inr)
    Γ ⊢ ind_A+B^C(c_inl, c_inr, inr(b)) ≡ c_inr(b) : C(inr(b))
    ```
    Or the equivalent: `Γ ⊢ +elim(D, d, e, inr(b)) = e[b/y] : D(inr(b))`.

**Uniqueness Rule (η-rule/Surjectivity of constructors):**

This rule expresses that every element of `A + B` must be constructible using `inl` or `inr`. It often states that any function `u(z)` defined for all `z : A + B` is judgmentally equal to the function defined by case analysis using `u(inl(x))` and `u(inr(y))`.

```
Γ, z : A + B ⊢ C(z) type   Γ, x : A ⊢ c_inl(x) : C(inl(x))   Γ, y : B ⊢ c_inr(y) : C(inr(y))   Γ ⊢ e : A + B
Γ, z : A + B ⊢ u(z) : C(z)   Γ, x : A ⊢ u(inl(x)) ≡ c_inl(x) : C(inl(x))   Γ, y : B ⊢ u(inr(y)) ≡ c_inr(y) : C(inr(y))
---------------------------------------------------------------------------------------------------------------------- (Sum-Uniq)
                     Γ ⊢ u(e) ≡ ind_A+B^C(c_inl, c_inr, e) : C(e)
```
This rule ensures that the eliminator captures all possible behaviors for elements of the sum type.

These rules collectively define the behavior and properties of sum types, making them a powerful tool for constructive reasoning and data abstraction. The strong elimination rule, mentioned in "Programming in Martin-Löf's Type Theory" , allows for more direct reasoning by incorporating equality information, which can be derived from these basic rules if identity types are available.

### 3.7 Rules for Natural Numbers (ℕ)

The natural numbers `ℕ` are a fundamental inductive type. Their rules are:

*   **Natural Numbers Formation**:
    ```
    ------------
    Γ ⊢ ℕ : U_0
    ```
    The type of natural numbers `ℕ` is a type, typically residing in the lowest universe `U_0` (or `Set`).

*   **Natural Numbers Introduction**:
    *   **Zero**:
        ```
        ----------
        Γ ⊢ 0 : ℕ
        ```
        Zero is a natural number.
    *   **Successor**:
        ```
          Γ ⊢ n : ℕ
        ----------------
        Γ ⊢ succ(n) : ℕ
        ```
        If `n` is a natural number, then its successor `succ(n)` is also a natural number.

*   **Natural Numbers Elimination (Recursor / Induction)**:
    ```
    Γ ⊢ n : ℕ   Γ, k:ℕ ⊢ C(k) : U_i   Γ ⊢ c_z : C(0)   Γ, m:ℕ, p:C(m) ⊢ c_s(m,p) : C(succ(m))
    ------------------------------------------------------------------------------------------
          Γ ⊢ rec(n, C, c_z, λm.λp.c_s(m,p)) : C(n)
    ```
    To define a function or prove a property `C(n)` for an arbitrary natural number `n`, one must provide:
    *   A base case `c_z` of type `C(0)` (the value/proof for zero).
    *   A step case `λm.λp.c_s(m,p)` of type `Π(m:ℕ). C(m) → C(succ(m))`. This function takes a natural number `m` and a proof/value `p` of `C(m)` and produces a proof/value for `C(succ(m))`.
    Or this slightly different notation `rec(C, c_z, c_s, n)` where `c_s` is `Π(p : C[m/k]) C[succ(m) / k]`.

*   **Natural Numbers Computation**:
    *   **Computation for Zero**:
        ```
        Γ, k:ℕ ⊢ C(k) : U_i   Γ ⊢ c_z : C(0)   Γ, m:ℕ, p:C(m) ⊢ c_s(m,p) : C(succ(m))
        ------------------------------------------------------------------------------
        Γ ⊢ rec(0, C, c_z, λm.λp.c_s(m,p)) = c_z : C(0)
        ```
        The recursor applied to zero reduces to the base case.
    *   **Computation for Successor**:
        ```
        Γ ⊢ n : ℕ   Γ, k:ℕ ⊢ C(k) : U_i   Γ ⊢ c_z : C(0)   Γ, m:ℕ, p:C(m) ⊢ c_s(m,p) : C(succ(m))
        ------------------------------------------------------------------------------------------
        Γ ⊢ rec(succ(n), C, c_z, λm.λp.c_s(m,p)) = c_s(n, rec(n, C, c_z, λm.λp.c_s(m,p))) : C(succ(n))
        ```
        The recursor applied to a successor `succ(n)` reduces to the step case `c_s` applied to `n` and the result of the recursive call on `n`.

These rules define the natural numbers as an inductive type and provide a mechanism for defining functions and proving properties by induction.

### 3.8 Rules for the Empty Type (⊥)

The empty type, `⊥` (also denoted `0`), is a fundamental type constructor in Intuitionistic Type Theory, representing falsehood. Its formal rules are designed to reflect its uninhabited nature and the logical principle of ex falso quodlibet.

**Formation Rule:**
The formation rule for the empty type is simple: in any valid context `Γ`, `⊥` is a well-formed type. This is often written as:

```
Γ ctx
--------- (⊥-Form)
Γ ⊢ ⊥ type
```

**Introduction Rules:**

Crucially, the empty type has *no* introduction rules. This is a defining characteristic. The absence of any rule to construct an element `e : ⊥` is what makes `⊥` represent falsehood. If there were a way to construct such an element, it would mean a contradiction has been derived within the theory.

**Elimination Rule (Ex Falso Quodlibet):**

The elimination rule for `⊥`, often called `⊥-elim` or `exfalso`, states that from a proof of falsehood, any proposition can be derived. If we have managed to construct an element `e` of type `⊥`, then for any type `C` (which could be a type family `C(z)` where `z : ⊥`, though typically `C` is just a fixed type), we can construct an element of `C`.

```
Γ, x : ⊥ ⊢ C(x) type   Γ ⊢ p : ⊥   Γ ⊢ c_* : C(*)
------------------------------------------------- (⊥-Elim)
        Γ ⊢ ind_⊥^C(p, c_*) : C(p)
```

Here, `c_* : C(*)` is a bit unusual as `*` is typically the canonical element of the unit type, not `⊥`. A more common presentation is:
```
Γ ⊢ e : ⊥   Γ, x : ⊥ ⊢ C type
----------------------------- (⊥-Elim)
     Γ ⊢ ⊥elim(C, e) : C
```
This rule effectively says that if the context contains a contradiction (`e : ⊥`), then any type `C` is inhabited. The term `⊥elim(C, e)` is the witness for `C` derived from the contradiction.

**Computation Rules:**

Since there are no introduction rules for `⊥`, there are no canonical forms for an element `e : ⊥` to compute with. Therefore, computation rules for `⊥-elim` are typically not specified or are considered trivial/vacuous. The expression `⊥elim(C, e)` is a "stuck" term unless `e` itself reduces, but `e : ⊥` is already a sign of inconsistency.

**Uniqueness Rules:**

Similar to computation rules, uniqueness rules for elements of `⊥` are not typically emphasized because there are no elements to compare for uniqueness. The focus is on the fact that `⊥` is uninhabited.

The rules for `⊥` are essential for defining negation (`¬A` as `A → ⊥`) and for proof by contradiction. If assuming `A` leads to a proof of `⊥` (i.e., `A → ⊥`), then `¬A` holds. The empty type ensures that the logic remains consistent; if `⊥` were inhabited, the theory would be trivial as every proposition would be provable.

### 3.9 Rules for the Unit Type (⊤)

The unit type, `⊤` (also denoted `1` or `𝟙`), represents truth in Intuitionistic Type Theory. It is a type with exactly one canonical inhabitant, reflecting the idea that a true proposition has a trivial proof.

**Formation Rule:**

The formation rule states that the unit type is a well-formed type in any valid context `Γ`:

```
Γ ctx
--------- (⊤-Form)
Γ ⊢ ⊤ type
```

**Introduction Rule:**

There is exactly one introduction rule for `⊤`, which introduces its single canonical element, often written as `*` or `()`:

```
Γ ctx
--------- (⊤-Intro)
Γ ⊢ * : ⊤
```

`() : ⊤` is also a valid notation. The nLab uses `* : 𝟙` . This element represents the trivial proof of truth.

**Elimination Rule:**

The elimination rule for `⊤` allows one to define a function from `⊤` to a type family `C(z)` (where `z : ⊤`) by specifying its value only for the canonical element `*`.

```
Γ, x : 𝟙 ⊢ C(x) type   Γ ⊢ c_* : C(* / x)   Γ ⊢ p : 𝟙
----------------------------------------------------- (⊤-Elim)
          Γ ⊢ ind_𝟙^C(p, c_*) : C(p / x)
```

Or the slightly different (and more readable IMO):

```
Γ ⊢ u : ⊤   Γ, x : ⊤ ⊢ C type   Γ ⊢ c : C[()/x]
----------------------------------------------- (⊤-Elim)
        Γ ⊢ ⊤elim(C, c, u) : C[u/x]
```

Here, `c` is the proof of `C` for the canonical element `()` (i.e., `c : C[()/x]`), and `u` is any element of `⊤`. The result is a proof of `C[u/x]`. Since `u` can only be `*` (up to judgmental equality), this effectively transports the proof `c`.

**Computation Rule:**
The computation rule specifies that applying the eliminator to the canonical element `*` yields the provided proof for `*`.

```
Γ, x : 𝟙 ⊢ C(x) type   Γ ⊢ c_* : C(* / x)
----------------------------------------- (⊤-Comp)
Γ ⊢ ind_𝟙^C(*, c_*) ≡ c_* : C(* / x)
```

Or the equivalent: `Γ ⊢ ⊤elim(C, c, ()) = c : C[()/x]`. This ensures that functions defined using `⊤-elim` behave as expected on the canonical input.

**Uniqueness Rule (η-rule):**

The uniqueness rule states that any element `p` of `⊤` is judgmentally equal to the canonical element `*`. This reflects the fact that `⊤` has only one distinct inhabitant.

```
Γ, x : 𝟙 ⊢ C(x) type   Γ ⊢ c_* : C(* / x)   Γ ⊢ p : 𝟙   Γ, x : 𝟙 ⊢ u(x) : C(x)   Γ ⊢ u(* / x) ≡ c_* : C(* / x)
------------------------------------------------------------------------------------------------------------- (⊤-Uniq)
                     Γ ⊢ u(p / x) ≡ ind_𝟙^C(p, c_*) : C(p / x)
```

A simpler formulation often seen is just `p ≡ * : ⊤` for any `p : ⊤`. This rule ensures that `⊤` is indeed a "unit" with respect to Cartesian product types (up to isomorphism).

The unit type is crucial for defining types with trivial structure, for completing the correspondence between logical connectives and type constructors (e.g., `⊤` corresponds to "true"), and for technical reasons in the metatheory of type systems.

### 3.10 Rules for Identity Types (Id)

Identity types, `Id_A(a, b)` or `a =_A b`, represent propositional equality.

*   **Identity Type Formation**:
    ```
    Γ ⊢ A : U_i   Γ ⊢ a : A   Γ ⊢ b : A
    -----------------------------------
        Γ ⊢ Id_A(a, b) : U_i
    ```
    If `A` is a type and `a` and `b` are elements of `A`, then `Id_A(a, b)` is a type (the type of proofs that `a` equals `b`).

*   **Identity Type Introduction (Reflexivity)**:
    ```
      Γ ⊢ a : A
    -----------------
    Γ ⊢ refl_a : Id_A(a, a)
    ```
    For any element `a : A`, there is a canonical proof `refl_a` that `a` is equal to itself.

*   **Identity Type Elimination (J-rule / Path Induction)**:
    ```
    Γ, x:A, y:A, p:Id_A(x,y) ⊢ C(x,y,p) : U_j
    Γ, z:A ⊢ d(z) : C(z,z,refl_z)
    Γ ⊢ a : A   Γ ⊢ b : A   Γ ⊢ q : Id_A(a,b)
    ---------------------------------------------------------
        Γ ⊢ J(C, λz.d(z), a, b, q) : C(a,b,q)
    ```
    This is a complex rule. It states that to prove a property `C(a,b,q)` for any `a, b : A` and `q : Id_A(a,b)`, it suffices to prove it for the reflexive case `C(z,z,refl_z)` for an arbitrary `z:A`. `C` is a type family dependent on two elements and a proof of their equality. `d` is the proof for the reflexive case. The `J` eliminator then constructs a proof for the general case.

*   **Identity Type Computation (J-rule for refl)**:
    ```
    Γ, x:A, y:A, p:Id_A(x,y) ⊢ C(x,y,p) : U_j
    Γ, z:A ⊢ d(z) : C(z,z,refl_z)
    Γ ⊢ a : A
    ---------------------------------------------------------
    Γ ⊢ J(C, λz.d(z), a, a, refl_a) = d(a) : C(a,a,refl_a)
    ```
    If the equality proof `q` is `refl_a`, then the `J` eliminator reduces to the proof `d(a)` provided for the reflexive case.

These rules define propositional equality. The J-rule is powerful and embodies the idea that equality is the "least reflexive relation". The properties of identity types are a rich area of study, especially in Homotopy Type Theory.

### 3.11 Rules for W-Types

W-types, `W(x:A) B(x)`, represent well-founded trees.

*   **W-Type Formation**:
    ```
    Γ ⊢ A : U_i   Γ, x:A ⊢ B(x) : U_i
    ---------------------------------
      Γ ⊢ W(x:A) B(x) : U_i
    ```
    If `A` is a type of labels and `B(x)` is a type of child indices for each label `x:A`, then `W(x:A) B(x)` is the type of well-founded trees with nodes labeled by `A` and branching determined by `B`.

*   **W-Type Introduction (sup / node)**:
    ```
    Γ ⊢ a : A   Γ ⊢ f : B(a) → W(x:A) B(x)
    ----------------------------------------
        Γ ⊢ sup(a, f) : W(x:A) B(x)
    ```
    A tree `sup(a, f)` has a root node labeled by `a : A` and subtrees `f(y)` for each child index `y : B(a)`.

*   **W-Type Elimination (Dependent Recursor)**:
    ```
    Γ ⊢ w : W(x:A) B(x)
    Γ, z:W(x:A)B(x) ⊢ C(z) : U_j
    Γ, a':A, f':(B(a') → W(x:A)B(x)), g:(Π(y:B(a')).C(f'(y))) ⊢ step(a',f',g) : C(sup(a',f'))
    -----------------------------------------------------------------------------------------
                Γ ⊢ W-rec(w, λa'λf'λg.step(a',f',g)) : C(w)
    ```

    To define a function or prove a property `C(w)` for an arbitrary tree `w : W(x:A) B(x)`, one provides a `step` function. This `step` function takes a label `a'`, a function `f'` for subtrees, and a function `g` that gives results for all subtrees `f'(y)`, and produces a result for `C(sup(a',f'))`. 

*   **W-Type Computation**:
    ```
    Γ ⊢ a : A   Γ ⊢ f : B(a) → W(x:A) B(x)
    Γ, z:W(x:A)B(x) ⊢ C(z) : U_j
    Γ, a':A, f':(B(a') → W(x:A)B(x)), g:(Π(y:B(a')).C(f'(y))) ⊢ step(a',f',g) : C(sup(a',f'))
    -----------------------------------------------------------------------------------------
    Γ ⊢ W-rec(sup(a,f), λa'λf'λg.step(a',f',g)) = step(a, f, λy.W-rec(f(y), λa'λf'λg.step(a',f',g))) : C(sup(a,f))
    ```

    The recursor applied to a tree `sup(a,f)` reduces to the `step` function applied to `a`, `f`, and the recursively computed results for all subtrees `f(y)`.

These rules define a very general form of inductive type, capable of representing many common data structures. The natural numbers can be encoded as a W-type where `A` has two elements (zero, successor) and `B(zero)` is empty, `B(succ)` is unit.

## 4. Key Characteristics and Philosophical Underpinnings
### 4.1 Constructivism in Practice

Intuitionistic Type Theory (ITT) is inherently constructive. This means that mathematical statements, particularly existence claims, must be proven by providing **explicit constructions or witnesses** . For example, to prove a statement of the form `∃x:A. P(x)` (there exists an `x` in `A` such that `P(x)` holds), one must actually construct a specific term `a : A` and provide a proof `p : P(a)`. This is embodied by the Sigma type `Σ(x:A). P(x)`, where an inhabitant is a pair `(a, p)`. This contrasts sharply with classical mathematics, where one might prove existence by contradiction (e.g., assuming non-existence leads to a contradiction) without ever finding an actual example. In ITT, proofs are not just abstract derivations; they are **computational objects, programs that can be executed** to produce the witness and verify its properties . This computational aspect is a direct consequence of the Curry-Howard isomorphism, which identifies proofs with programs and propositions with types.

The constructive nature of ITT has profound implications for its logical principles. The **law of excluded middle (LEM)**, `P ∨ ¬P`, is not generally valid in ITT. One cannot simply assert that either `P` is true or `¬P` is true without having a constructive proof for one of them. Similarly, the axiom of choice, in its full classical strength, is not automatically part of ITT. While certain forms of the axiom of choice can be proven within ITT (often as a theorem due to the constructive meaning of quantifiers), these are typically constructive versions that align with the principles of providing explicit choices . For instance, a common form states that if for every `x:A` there exists a `y:B(x)` such that `C(x,y)` holds, then there exists a choice function `f : Π(x:A).B(x)` such that for all `x:A`, `C(x, f(x))` holds. This is provable because a proof of the premise in ITT already provides such a function. The emphasis is always on what can be explicitly constructed, making ITT a powerful framework for developing mathematics that is computationally meaningful and for verifying programs whose correctness relies on constructive proofs.

### 4.2 Normalization and Canonicity

Two crucial meta-theoretic properties of Intuitionistic Type Theory are **normalization** and **canonicity**. These properties are essential for the consistency of the theory and for its computational interpretation.

**Normalization** refers to the property that every well-typed term in ITT will, after a finite number of computation steps (such as β-reduction for function application, or reduction rules for other type constructors), reach a unique normal form. This normal form is a term that cannot be reduced further. For example, the term `(λx.x+1) 5` would normalize to `6`. **Strong normalization** means that *all* reduction sequences starting from a well-typed term will eventually terminate in a normal form. This is a desirable property because it ensures that computations do not "get stuck" or loop infinitely (for well-typed terms), which is important for proof assistants and programming languages based on ITT. The proof of normalization for ITT is typically complex and involves techniques like Tait's computability method or Girard's reducibility candidates.

**Canonicity** is a property related to normalization. It states that every closed (i.e., containing no free variables) well-typed term of an inductive type (like `Nat`, `Bool`, lists, etc.) will normalize to a *canonical form*. Canonical forms are the terms directly introduced by the introduction rules of the type. For example, any closed term of type `Nat` will normalize to either `0` or `succ(succ(...(succ(0))...))` (a numeral). Similarly, a closed term of type `Bool` will normalize to either `true` or `false`. Canonicity is a strong property that ensures that the inhabitants of these types are exactly what we expect them to be: they are built up from their basic constructors. This is crucial for the meaning explanation of type theory, where the meaning of a type is given by its canonical elements. If a type like `Nat` had non-canonical inhabitants that didn't reduce to numerals, it would undermine our understanding of what a natural number is in this system. Together, normalization and canonicity provide a solid foundation for the computational and logical aspects of ITT.

### 4.3 Decidability of Type Checking

A significant practical advantage of core Intuitionistic Type Theory is that **type checking is decidable** . This means that there exists an algorithm which, given a context Γ, a term `t`, and a type `A`, can determine in a finite amount of time whether `Γ ⊢ t : A` is a derivable judgment according to the rules of the type theory. Decidability of type checking is crucial for the usability of ITT as a foundation for proof assistants like Coq and Agda . In these systems, users construct proofs (which are programs/terms), and the system must be able to verify that these proofs are correct, i.e., that they have the claimed type (proposition). If type checking were undecidable, this verification process might not terminate, making the proof assistant unreliable.

The decidability of type checking in ITT relies on several factors. Firstly, the inference rules are typically syntax-directed, meaning that the form of the term `t` largely determines which rule must be applied to derive its type. Secondly, the property of strong normalization (or weak normalization plus confluence) ensures that terms can be reduced to a normal form, and this normal form is unique (up to renaming of bound variables). This allows for effective comparison of types for definitional equality. When checking if a term `t` has type `A`, the system might need to check if the inferred type of `t` is definitionally equal to `A`. This involves normalizing both types and comparing their normal forms. While definitional equality can be complex, especially in the presence of dependent types, it is generally decidable for the core versions of ITT. However, it's important to note that adding certain extensions to ITT, such as certain forms of extensionality or very powerful axioms, can potentially lead to undecidable type checking. The **intensional version of ITT**, which is more common in proof assistants, generally maintains decidability.

### 4.4 Intensional vs. Extensional Equality

A key distinction in Intuitionistic Type Theory, particularly in Martin-Löf's formulations, is between **intensional** and **extensional** equality.

**Definitional Equality** (or judgmental equality), denoted `a ≡ b : A` or `Γ ⊢ a = b : A`, is a meta-theoretic notion. It asserts that two terms `a` and `b` are syntactically identical (perhaps up to computation, like β-reduction or δ-reduction for definitions). Definitional equality is used in the typing rules, for example, in the congruence rule: if `a : A` and `A ≡ B`, then `a : B`. Type checking requires deciding definitional equality.

**Propositional Equality** is represented by the identity type `Id_A(a, b)` or `a =_A b`. An inhabitant of this type is a proof that `x` and `y` are equal in some logical sense. The introduction rule is reflexivity: `refl_a : a =_A a`.

Now, the distinction between intensional and extensional type theory often revolves around how these equalities relate:

*   **Intensional Type Theory (ITT)**: This is the more common formulation, especially in proof assistants like Agda and Coq. In intensional ITT, propositional equality (`a =_A b`) is distinct from definitional equality (`a ≡ b : A`). Just because two terms are propositionally equal (i.e., `p : a =_A b` is inhabited) does *not* mean they are definitionally equal. For example, two functions `f` and `g` might be extensionally equal (i.e., `Π(x:A). f(x) =_B g(x)` is inhabited, meaning they produce equal outputs for all inputs), but they might not be definitionally equal if their internal definitions (algorithms) are different. The J-rule for identity types allows transporting properties along propositional equality proofs, but it doesn't make propositionally equal terms definitionally equal. A consequence is that **type checking remains decidable in intensional ITT**.

*   **Extensional Type Theory (ETT)**: In extensional ITT, there is an additional rule, often called the "equality reflection rule":
    ```
    Γ ⊢ p : a =_A b
    ---------------
    Γ ⊢ a ≡ b : A
    ```
    This rule states that if two terms are propositionally equal, then they are also definitionally equal. This makes the type theory more powerful in some respects, as more equalities hold by definition. For example, function extensionality (if `∀x. f(x) = g(x)` then `f = g`) becomes a trivial consequence. However, a major downside is that **definitional equality, and therefore type checking, generally becomes undecidable**. This is because proving `a =_A b` can be arbitrarily complex. Martin-Löf's earlier formulations (e.g., in "Constructive Mathematics and Computer Programming" (1979) and "Intuitionistic Type Theory" (1984)) were extensional, but later work and most modern proof assistants favor the intensional version for its decidability.

The choice between intensional and extensional equality has significant implications for the meta-theory and practical use of the type system. Homotopy Type Theory (HoTT) builds upon intensional ITT but enriches the understanding of identity types by interpreting them as paths in a topological space, leading to a rich structure without needing to collapse propositional and definitional equality.

### 4.5 Philosophical Foundations: Brouwer's Intuitionism

Intuitionistic Type Theory is deeply rooted in the philosophical tradition of **intuitionism**, primarily associated with the mathematician L.E.J. Brouwer . Intuitionism views mathematics as a creation of the human mind, rather than the discovery of pre-existing Platonic truths. Mathematical objects are considered to be mental constructions, and mathematical statements are true only if they can be constructively verified. This philosophical stance has direct consequences for the principles of logic and mathematics that are accepted. For instance, the **law of excluded middle (P ∨ ¬P) is rejected by intuitionists** because there is no general method to decide, for an arbitrary proposition P, whether P is true or ¬P is true. A proof of P ∨ ¬P would require a construction that either proves P or proves ¬P.

Martin-Löf's type theory provides a rigorous formal framework for Brouwer's intuitionistic mathematics . The **"propositions-as-types" interpretation**, where a proposition is true if its corresponding type is inhabited by a proof-object, directly reflects the intuitionistic idea that truth requires a construction. The emphasis on explicit constructions for existence proofs, the rejection of non-constructive principles like the full law of excluded middle, and the computational nature of proofs all align with intuitionistic philosophy. Martin-Löf himself developed a sophisticated theory of meaning (semantics) for his type theory, which is based on understanding the meanings of judgments in terms of computations and canonical forms. This meaning explanation is intended to justify the axioms and rules of the theory from an intuitionistic perspective, rather than relying on classical set-theoretic models. The idea is that the meaning of a mathematical statement is tied to what counts as a proof of it, and these proofs are mental constructions that can be communicated and verified. This contrasts with classical foundations where mathematical objects are often conceived as existing independently of our ability to construct or know them.

### 4.6 Limitations and Extensions

While Intuitionistic Type Theory is a powerful and expressive system, it has certain limitations and has been extended in various ways.

One key characteristic of Martin-Löf's original (predicative) type theories is the avoidance of impredicativity. An impredicative definition is one where a type is defined by quantifying over a collection that includes the type being defined itself. For example, in classical set theory, the definition of an intersection of a family of sets `⋂_{i∈I} Si`, is impredicative if one of the Si could be the intersection itself. While common in classical mathematics, impredicativity was viewed with suspicion by constructivists like Poincaré and Russell (who proposed his theory of types to avoid it) as it can lead to paradoxes. Martin-Löf's universe hierarchy (U₀ : U₁ : U₂ ...) is a predicative solution: the definition of a type constructor like Π is given at a certain universe level, and it produces a type at that same level (or higher), but it cannot quantify over the entire universe it belongs to. This predicativity ensures consistency but can make it difficult to directly formalize some parts of classical mathematics.

Other aspects of intensional ITT can be seen as limitations from a certain point of view, even though they are deliberate design choices for computational reasons:

Function Extensionality: In intensional ITT, proving that two functions f and g are equal (i.e., inhabiting Id(f, g)) is difficult. One can often prove they are pointwise equal (i.e., inhabiting Π(x:A). Id(f(x), g(x))), but there is no general principle to deduce Id(f, g) from this. This makes reasoning about equality of functions less direct than in classical mathematics.

Quotient Types: Constructing quotient types (e.g., defining integers as equivalence classes of pairs of naturals) can be cumbersome. The standard approach involves using "setoids"—a type paired with an equivalence relation—and ensuring all functions respect this relation, which adds significant notational and proof overhead.

These perceived limitations have motivated several important extensions to ITT:

Impredicative Universes: Systems like the Calculus of Constructions (CoC), which forms the basis of the Coq proof assistant, add an impredicative universe called Prop (or Type in some versions). Types in Prop correspond to logical propositions. Prop is impredicative because one can form new propositions by quantifying over all propositions (e.g., Π(P:Prop). P → P). This makes the logical fragment of the theory more powerful and closer to classical higher-order logic, though it deviates from Martin-Löf's strictly predicative and constructive philosophy.

Homotopy Type Theory (HoTT): This is a major modern reinterpretation and extension of ITT. HoTT interprets types as topological spaces (or ∞-groupoids), elements as points, and identity types Id_A(x, y) as paths between points x and y. This "proofs-as-paths" paradigm gives a rich geometric intuition to equality. A key principle in HoTT is the Univalence Axiom, which states that for any two types A and B, the type of equivalences between them, A ≃ B, is equivalent to the type of equalities between them, Id_{U_i}(A, B). This axiom has profound consequences: it implies function extensionality and provides a native way to handle quotient types and other structures through Higher Inductive Types (HITs). HITs generalize inductive types by allowing constructors not only for points but also for paths and higher-dimensional paths.

Cubical Type Theory: This is an extension of ITT that provides a direct computational model for Homotopy Type Theory. It models types as cubes and provides a constructive justification for principles like the Univalence Axiom, making it possible to implement HoTT in a practical proof assistant with decidable type checking.



Thanks for reading!
- Lorenzo
