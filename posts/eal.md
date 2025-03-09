---
title: Elementary Affine Logic
description: Understanding EAL and typechecking it
date: '2025-02-22'
---
Elementary Affine Logic (EAL) is a type system designed to guarantee that programs terminate in elementary time—a complexity class bounded by finite towers of exponentials, such as 
`2^(2^n)`
. This makes EAL a powerful framework for reasoning about computational efficiency in a rigorous way. For this article, we'll focus on propositional EAL without quantification, keeping our exploration accessible while diving into its core concepts and implementation. It is important to note that the implementation is not focusing on performance and not performing type inference, only basic type checking.

EAL is built upon affine logic, a substructural logic that modifies traditional proof theory by rejecting the contraction rule, which prevents assumptions from being reused multiple times, while embracing weakening, allowing unused variables to remain in the context. This contrasts with linear logic, where variables must be used exactly once; affine logic relaxes this to "at most once," providing flexibility to ignore resources if they are not needed. In the context of programming, particularly within lambda calculus, this translates to a system where function arguments are used at most once, with some potentially left unused. EAL extends this foundation to target terms that align with the computational power of elementary bounded Turing machines. It also connects to Lamping's optimal reduction algorithm, which minimizes the number of beta-reduction steps, ensuring efficient normalization of terms.

### Core Characteristics of EAL

EAL is specifically crafted to type terms that can be reduced in elementary time, leveraging affine logic's resource-sensitive nature. Variables cannot be reused unless explicitly marked with the bang modality (!A), which allows controlled reuse, while unused assumptions are permitted, aligning with the weakening rule. The bang modality (!A) is central to EAL, selectively relaxing the "at most once" rule to balance efficiency and flexibility. However, this imposes restrictions, preventing constructs like extensive variable sharing or polymorphism from being typed within the system—a necessary trade-off for EAL's performance guarantees.


### Implementing EAL

Now let's gets get to work and write a simple implementation of EAL in Haskell.
This implementation focuses on the concept and the simple typing rules, not in
performance neither the type inference (that is more complex).

The first step is to define the types and terms that constitute the EAL system:

```haskell
-- Type definitions
data Type
  = TVar String          -- Type variable, e.g., "a"
  | Bang Type            -- !A, for reusable terms
  | Type :-> Type        -- Function type, A -> B
  deriving (Show, Eq)

-- Term definitions
data Term
  = Var String           -- Variable, e.g., "x"
  | App Term Term        -- Application, M N
  | Lam String Type Term -- Lambda abstraction, \x:A.M
  | Box Term             -- Boxing for !A
  deriving (Show, Eq)
```

These definitions capture the essence of EAL. For types, `TVar String` represents type variables. Bang Type introduces the `!A` modality, marking a type as reusable, which is crucial for EAL's promotion rule. `Type :-> Type` defines function types (e.g., `A -> B`), mirroring the arrow type in lambda calculus. For terms, `Var String` represents variables (e.g., "x") associated with types in the context. `App Term` Term corresponds to applying one term to another (e.g., `M N`). `Lam String Type Term` represents lambda abstraction (e.g., `λx:A.M`), binding a variable to its type for function definitions. Finally, `Box Term` wraps a term to assign it the type `!A`, enabling controlled reuse through the bang modality.

Now, we need to define the context and how do we interact with it.
We need to track down variable usages. Note that this could be done only via typing, i.e we could enforce the affine property in the type of the context instead of naively implementing it in the functions. The way is done here, if a context is already broken on creation, an error will not pop. But since this is a toy implementation, im ok with that.

```haskell
type Ann = (String, Type)  -- Annotated variable, e.g., ("x", TVar "a")
type Ctx = [Ann]           -- Context as a list of annotations
type UsedVars = [String]   -- List of variables used so far

-- Extend context with a new variable
extend :: Ctx -> Ann -> Either String Ctx
extend ctx ann@(var, typ) =
  case lookup var ctx of
    Just _  -> Left ("Variable " ++ var ++ " used more than once.")
    Nothing -> Right (ann : ctx)

-- Filter out used variables, keeping banged ones
filterUsed :: Ctx -> [String] -> Ctx
filterUsed ctx used = filter (\(s, t) -> s `notElem` used || case t of Bang _ -> True; _ -> False) ctx

-- Check if all variables are banged
allBanged :: Ctx -> Bool
allBanged ctx = all (\(_, t) -> case t of Bang _ -> True; _ -> False) ctx
```

Here, `Ann` and `Ctx` define the structure of the typing context, pairing variables with their types. `UsedVars` tracks consumed variables, ensuring non-banged variables are not reused. The extend function adds a new variable to the context but fails if the variable is already present, reflecting EAL's no-contraction rule. `filterUsed` updates the context after a variable is used: non-banged variables are removed once consumed, while banged variables (!A) remain available, aligning with the dereliction and contraction rules. `allBanged` checks if every variable in the context has a banged type, a prerequisite for the promotion rule used in the Box construct. These mechanisms ensure the context accurately reflects variable availability, respecting affine constraints and the exceptions granted by the bang modality.

Now let's do some type checking!

The core of the implementation lies in the typeCheck function, which enforces EAL's typing rules across four patterns: variables, application, lambda abstraction, and boxing:

```haskell
typeCheck :: Ctx -> Term -> Either String (Type, UsedVars)
-- Variable case
typeCheck ctx (Var x) =
  case lookup x ctx of
    Just (Bang t) -> Right (t, [])       -- Banged variable, reusable
    Just t        -> Right (t, [x])      -- Non-banged, used once
    Nothing       -> Left $ "Variable " ++ x ++ " not found in context"

-- Application case
typeCheck ctx (App m n) = do
  (typM, varsM) <- typeCheck ctx m
  case typM of
    a :-> b -> do
      let newCtx = filterUsed ctx varsM
      (typN, varsN) <- typeCheck newCtx n
      if typN == a
        then Right (b, varsM ++ varsN)
        else Left ("Type Mismatch. Expected: " ++ show typN ++ " to be of type " ++ show a)
    _ -> Left "Application requires a function type"

-- Lambda case
typeCheck ctx (Lam bound typ bod) = do
  newCtx <- extend ctx (bound, typ)
  (typBod, varsBod) <- typeCheck newCtx bod
  let lamTyp = typ :-> typBod
  let freeVars = filter (/= bound) varsBod
  Right (lamTyp, freeVars)

-- Box case
typeCheck ctx (Box t) = do
  if allBanged ctx
    then do
      (typT, varsT) <- typeCheck ctx t
      Right (Bang typT, varsT)
    else Left "Promotion requires a context of only banged types"
```

Each case corresponds to a specific typing rule in EAL, which we'll now examine using standard type theory notation.

Variable (Var x)

```
 x : A ∈ Γ 
------------ (if A is not banged)
 Γ ⊢ x : A


 x : !A ∈ Γ
------------ (dereliction for banged variables)
 Γ ⊢ x : A

```

For a variable x, the type checker looks it up in the context. If x has a banged type (!A), it can be used as A without being consumed, thanks to the dereliction rule, so it's not added to the list of used variables. If x has a non-banged type (A), it's used once and marked as consumed. This enforces EAL's no-contraction rule while allowing banged variables to persist.

Application (App m n)

```
 Γ ⊢ M : A → B   Δ ⊢ N : A
--------------------------
  Γ,Δ ⊢ M N : B

```

To type M N, the type checker first types M in the current context to obtain its type, which must be a function A -> B. It then filters the context to remove any non-banged variables used in M, ensuring they aren't reused illicitly. Next, it types N in this updated context to check if its type matches A. If so, the application is typed as B, and the used variables from both M and N are combined.

Lambda (Lam bound typ bod)

```
   Γ, x : A ⊢ M : B
-----------------------
  Γ ⊢ λx : A.M : A → B
```


Typing Rule:

For a lambda abstraction \x:A.M, the type checker extends the context with x : A, ensuring x is fresh per the no-contraction rule. It then types the body M in this extended context to determine its type B. The overall type of the lambda is A -> B, and any variables used in the body (except x) are tracked for future checks.

Box (Box t) - Promotion

```
  Γ ⊢ M : A where Γ = x1 : !A1, ..., xn : !An
-----------------------------------------------
                  Γ ⊢ !M : !A
```

The Box construct implements the promotion rule, allowing a term M to be "boxed" into !A if it can be typed in a context where all variables are banged, checked using allBanged. If the condition holds, the type checker types M in the current context and wraps its type in Bang, enabling reuse. If the context contains non-banged variables, the promotion fails, enforcing EAL's strict conditions for reuse.

EAL's power lies in guaranteeing that any term it types will normalize in elementary time, often achieved through reduction strategies like Lamping's algorithm, which optimizes the reduction process by minimizing redundant steps. The combination of strict variable usage and controlled reuse via the bang modality ensures that reduction complexity is bounded predictably. However, this comes at the cost of some expressiveness.

## References and Further Reading

[Baillot, P., Terui, K. (2005). A Feasible Algorithm for Typing in Elementary Affine Logic. In: Urzyczyn, P. (eds) Typed Lambda Calculi and Applications. TLCA 2005. Lecture Notes in Computer Science, vol 3461. Springer, Berlin, Heidelberg.](https://doi.org/10.1007/11417170_6)


[Coppola, P., Dal Lago, U., Della Rocca, S.R. (2005). Elementary Affine Logic and the Call-by-Value Lambda Calculus. In: Urzyczyn, P. (eds) Typed Lambda Calculi and Applications. TLCA 2005. Lecture Notes in Computer Science, vol 3461. Springer, Berlin, Heidelberg.](https://doi.org/10.1007/11417170_11)


[Coppola, Paolo. “Principal Typing for Lambda Calculus in Elementary Affine Logic.” Fundamenta Informaticae (2005): n. pag. Print.](https://www.academia.edu/73045075/Principal_Typing_for_Lambda_Calculus_in_Elementary_Affine_Logic)


[Affine logic for constructive mathematics](https://arxiv.org/abs/1805.07518)
