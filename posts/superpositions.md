---
title: Symbolic Regression with Superposition on HVM3
description: Understanding HVM superpositions
date: '2024-12-06'
---
I have been working on a symbolic regression algorithm implementation on HVM. Let's start out with a motivation. Why try to reimplement symbolic regression, and what is this to begin with?

## Symbolic Regression

As the name states it is a regression analysis, and in this particular case we want to find the best fit for a dataset. For example, consider the following data:
`x = [1, 2, 3, 4, 5] y = [2, 4, 6, 8, 10]`

It is reasonable to say that the equation that "commands" this dataset is `y = 2x`. But how did you conclude this? You found a pattern between the y set and the x set. There are many ways of doing this in math, and symbolic regression is one of them.

What is different in this approach is that we are searching the space of mathematical expressions to find the model that best fits our data, both in terms of accuracy and simplicity. 

To search things, we have to define a "grammar", a set of symbols that define our equations. For example, suppose in our universe, we only have the opeartion of addition and we also have only the constants 1 and 2. How many equations can we enumerate?

Well, there are 6 of them:
- `y = 1`
- `y = 2` 
- `y = 1 + 1`
- `y = 1 + 2`
- `y = 2 + 1`
- `y = 2 + 2`

As you may imagine, if in a set with one operator and two constants we have 6 equations, and considering that the set of real numbers is infinite, the set of possible equations is also infinite right? So how to tackle this? Well, a good idea is to shrink this problem and solve a smaller instance first. So let's try the naive approach using a small set of symbols and constants.

Consider only the operators addition (+) and product (\*), and the constants 1, 2, 3 and 4. And for now, we're using Haskell instead of HVM.

When doing this, my first thought was: how to model the equation? The most obvious answer (for me) was that the equation is a like an AST (abstract syntax tree). So let's model it like this:
- A tree is formed by either a leaf (that holds a constant), or a leaf that is a variable, or a node which contains the operator (we're using a string for now) and two other children nodes (considering that our operators are binary for now).

In haskell:

```hs
data Tree = Leaf Int | Var | Node String Tree Tree deriving (Show, Eq)
```

And my second thought was on how to enumerate every possibility of a tree given a depth. Turns out that the code is very simple, we simply map the 0 level as being the constants + a variable and the other levels being a combination of every operator with its down level. It looks like this:

```
enumerateTrees :: Int -> [Tree]
enumerateTrees maxDepth = concatMap generateTrees [0..maxDepth]
  where
    generateTrees :: Int -> [Tree]
    generateTrees 0 = map Leaf constants ++ [Var]
    generateTrees depth =
        [Node op left right |
         op <- operators,
         left <- generateTrees (depth - 1),
         right <- generateTrees (depth - 1)]
```

We also need a way to evaluate a certain tree, otherwise we can't check either our equation is correct or not. We also need a way to measure how far (or close) are we from the correct equation. 

To do the evaluation, we simply need to translate our op strings to real operations and recursively eval the tree (where we receive a value for x, the variable).

```
evaluateTree :: Tree -> Int -> Int
evaluateTree (Leaf n) _ = n
evaluateTree Var x = x
evaluateTree (Node op left right) x =
    case op of
        "+" -> leftVal + rightVal
        "*" -> leftVal * rightVal
        _ -> 0
    where
        leftVal = evaluateTree left x
        rightVal = evaluateTree right x
```

For the fitness part, we will be using Mean Squared Error, which is basically the distance from our prediction to the correct prediction, but squared (to avoid negative values).

```
fitness :: Tree -> Data -> Float
fitness tree data' =
    let mse = sum [(fromIntegral (evaluateTree tree x) - fromIntegral y) ^ 2 | (x, y) <- data']
    in mse / fromIntegral (length data')
```

Note that the `Data` type is simply a list of tuples `(x, y)`. So now, we want to minimize the MSE to find the best fit to the equation given by the dataset. The correct equation would have `MSE = 0`, since the distance from the predicted points and the actual points is zero.

Now, we need to actually run the symbolic regression, by finding the lowest fit. We basically loop through all enumerated trees up to a given depth and get the best one:

```hs
symbolicRegression :: Data -> Int -> Int -> Tree
symbolicRegression data' maxDepth maxTrees =
    let trees = take maxTrees $ enumerateTrees maxDepth
        bestTree = minimumBy (comparing (\t -> fitness t data')) trees
    in bestTree
```

And that's it, we now have a working symbolic regression algorithm that will search the mathematical space to find the equation that best models the dataset. It is easy to extend this with more operators, constants and so on.

But this is not quite performant right? Indeed, if you try to add a lot of constants or model a very complex equation that demands a tree with a high depth, it will take a lot of time (and maybe it won't find the exact fit nor a good one).

There are a lot of improvements and research in this kind of algorithm, as recombining equations using genetic programming, utilizing Bayesian methods and neural networks and so on. But before complicating this, let's discuss what's the role of HVM in this context.

## HVM

HVM is a parallel runtime, a compiler and evaluator for high-level languages that implements optimal reduction through the concurrent computation model of Interaction Combinators.

Diving deep into theory, you'll reach some topics such as optimal reduction of lambda calculus, how to share computations, orders of evaluation and so on. But this is a little bit more complex than it looks, so I'll discuss it in another article. The point is that HVM achieves optimal evaluation.

In addition to this, in HVM there is the concept of *superposition*, that is the main reason of why we're going to write symbolic regression on HVM. Let's understand it through a simple example.

Suppose you want to factorize prime numbers in the most obvious way possible. We are just going to loop and test each factor untill we find a combination that results in the number we want. And let's do this in binary. (The code from this example was written by @VictorTaelin and its reference is in the end of the article).

First of all, we define the type of a bitstring:

`data Bin { #O{pred} #I{pred} #E }`

Which is a very common recursive data type. For example, `#O{#I{#E}}` is a valid bitstring that represents `O1`. Now, if `P` is the number we want to factorize we can define this factorization as: there are two numbers `x` and `y` that when multiplied result in `P`, where `x` and `y` are the factors. Therefore, `x * y = P`. So, we need to define multiplication, equality and other helper functions that are needed (increment, add, concat).

I will skip these implementations because they are not different from other functional languages. We will focus on the superposition concept and enumerating binary strings. So assume now we have all the operations we need. Now, the next step in other languages would be to loop through the numbers and check if their multiplication match. But here we will follow a different path.

We want to enumerate all possible bitstrings up to a given length. So for example, if we choose length 2, we have:
- `01`
- `00`
- `11`
- `10`
(ignoring the #end constructor)

We always have `2^n` possibilities where `n` is the length given. The code to do this looks like:

```
// Enums all Bins of given size (label 1)
@all1(s) = ~s{
  0: #E
  p: !&1{p0 p1}=p &1{ #O{@all1(p0)} #I{@all1(p1)} }
}
```

You may not be familliar with the syntax, but it's nothing too fancy. `@` defines a function called all1 that receives an argument `s` (the size of the bitstring. `~s` is a `match` on the size, which is a native number.

If `s` is zero, we reached the end of the bitstring, so simply return the end constructor. Otherwise, we:
- Duplicate p
- Create a superposition where one side branches to `#O` and the other branches to `#I`.

We have to duplicate `p` because HVM is linear, which mean we can only use a variable once. `!&label{}` is just the syntax for duplicating. The label is important, but we're going to discuss it more later.

Now we create the superposition of all bitstrings. Let's take a look at the output of calling `@all1(2)` when running the file with `hvml run enum_primes.hvml`:

`&1{#0{&1{#0{#2{}} #1{#2{}}}} #1{&1{#0{#2{}} #1{#2{}}}}}`

This is not very readable, but everytime you see a `&` we are branching into a superposition. `#0 #1 and #2` are just the format HVM uses to the constructors, so `#O` is `#0`, `#I` is `#1` and so on. 

Fortunately, we have a way to *collapse* the superpositions and see the all the bitstrings generated individually. The collapse algorithm is also very interesting, and a topic to another article.

```
#0{#0{#2{}}}
#0{#1{#2{}}}
#1{#0{#2{}}}
#1{#1{#2{}}}
```

If you look closer, you'll see these 4 bitstrings are the ones i enumerated earlier. Cool right? So, basically what we are doing when opening an `&{}` block is opening a superposition of two values (that can be composite as you can see), which means we are branching in two values. One universe goes to the `I` branch, and the other one goes to the `O` branch. But why is this so useful? Well, it is useful because this superposed values *share computation*. So for example, if we have this operation:
`(+ (* 2 3) &{2 3})`

The result when running with collapse mode is both 8 and 9, and they shared the `(* 2 3)` computation.

Another interesting property in the case of our binary data structure is the lazy abortion of useless universes. What does this mean? Well, I'm going to use a similar example from [this article](https://gist.github.com/VictorTaelin/93c327e5b4e752b744d7798687977f8a), also from Victor Taelin.

Suppose we want to solve the following equation:

`x + 1 == 3` or in binary, `x + 0b001 == 0b101`

Typically, we will decrement 1 from both sides of the equation and find the predecessor of 0b101. With superpositions, we do it like (simplified syntax):

```
x = {E {(O X) (I X)}}
y = (I ( O ( I E)))

// solving x + 1 == y
main = 
  let goal = (equal (add x (I E)) Y)
  (Collapse (if goal { X } else { * }))
```

This will kind of "fork" the HVM runtime into infinite universes, one for each value of `x`, and return the first one that satifies that equation. Then, in that "universe", we print the value of `x`. In any other runtime, doing this would be exponential on the length `n` of the bitstring, as there are `2^n` bitstrings to consider, as stated before. However, this works and it is quadratic, because of the lazy abortion. An immense amount of shared work across all of those universes, and optimal lazy evaluation quickly aborts any universe where the equation isnt satisfied.

Reference: https://gist.github.com/VictorTaelin/9061306220929f04e7e6980f23ade615

Now that we understand the concept of superposition, let's continue with the symbolic regression example. Let's model the same tree data type.

```
data Tree {
  #Leaf{val}
  #Var{}
  #Node{op lft rgt}
}
```

Pretty much the same as the haskell implementation. I'll let some other constructors we will use below:

```
data Pair {
  #Pair{fst snd}
}

data List {
  #Nil
  #Cons{head tail}
}

data Operators {
  #Plus
  #Mul
  #Min
  #Max
  #Mod
}
```

Since the enumeration part is the funniest part, i'll let it to the end. Let's define evaluation of a tree and fit first:

```
@eval_tree(tree x) = ~tree !x {
  #Leaf{val}: val
  #Var: x
  #Node{op lft rgt}: 
    !&0{x0 x1}=x
    !lftval = @eval_tree(lft x0)
    !rgtval = @eval_tree(rgt x1)
    ~op !lftval !rgtval {
      #Plus: (+ lftval rgtval) 
      #Mul: (* lftval rgtval)
      #Min: @min(lftval rgtval)
      #Max: @max(lftval rgtval)
      #Mod: (% lftval rgtval)
    } 
}
```

The syntax may look scary, but it is not that complicated. We are simply matching the tree constructors (and the !x syntax allows us to use x in every branch). If it is a leaf, the evaluation is simply the leaf value. If a var, the var value. If it is a node, we apply the node operation with the recursed evaluated left and right sides of the node.

```
@mse(tree data acc acclen) = ~data !acc !tree !acclen {
  #Nil: #Pair{acc acclen}
  #Cons{h t}: 
    ~h {
      #Pair{x y}: 
        !&4{t1 t2}=tree
        !pred_y  = @eval_tree(t1  x)
        !mse_val = (- pred_y y)
        !&5{msev0 msev1}=mse_val
        !mse_sqrd = (* msev0 msev1)
        @mse(t2 t (+ acc mse_sqrd) (+ acclen 1)) 
    }
}

// where data is a list of pairs x, y that is the generated dataset
@fit(tree data) =
  !mselen = @mse(tree data 0 0)
  ~mselen {
    #Pair{mse len}: (/ mse len)
  }
```

For the fit implementation, we need the mse calculation. We're basically predicting y, calculating the metric and returning a pair with the mse and the length of the tree. The `!&{}` syntax is explicit duplication, as used before.

And that's it for our measures and evaluation. Now we need to enumerate all the trees and finally run symbolic regression.

First of all, let's enumerate all operators possible:

`@all_oper(&L) = @SUP(&L #Plus @SUP(&L #Mul @SUP(&L #Min @SUP(&L #Max #Mod))))`

Wait, but why are we using this different syntax for superpositions now? Well, if you take a closer look, we are receiving an argument. This argument is a label. This `@SUP` native function receives a label and the two things we want to superpose. It is the same as using the `&{}` syntax, but now we can pass a label that we receive as an argument (and cloning it without having to manually do it for every call). The reason we need the same label is because we need the right and left branches of our tree to have different labels, otherwise we will not enumerate as many trees as we want.

An explanation to that comes from the [Higher Order Co discord](https://discord.com/channels/912426566838013994/915345481675186197/1311434500911403109). Therefore, we need to use dynamic sups and fork the labels (doing some label arithmetic). We will see this in work in the tree enumerator.

Let's also enumerate some constants possibilities:

```
@consts = [#Var #Leaf{4} #Leaf{5}]

@all_consts(&L c_list) = ~c_list {
  #Nil: *
  #Cons{h t}: @SUP(&L h @all_consts(&L t))
}
```
Here we are doing basically the same thing as in the operators superposition.

Now we have all set to enumerate the tree:

```
@all(s l) = ~s !l {
  0:
    @all_consts(l @consts)
  p:
    !&0{p p0}=p
    !&0{p p1}=p
    !&0{p p2}=p
    !&0{p p3}=p

    !&0{l l0}=l
    !&0{l l1}=l
    !&0{l l2}=l
    !&0{l l3}=l
    !&0{l l4}=l
    !&0{l l5}=l
    !&0{l l6}=l

    ! lL = (+ (* l0 2) 0)
    ! lR = (+ (* l1 2) 1)
    
    !all_oper = @all_oper(l6)

    @SUP(l2 #Node{all_oper @all(p1 (+ (* l3 2) 0)) @all(p2 (+ (* l4 2) 1))} @all_consts(l5 @consts))
}
```

We are enumerating all trees up to a given depth. When depth is zero, we are in the "leaf level". So, we basically can have all constants in that level. Then, in the recursive level, we clone p a bunch of times (because we need to use it to the recursive calls). Then we clone `l`, which is the label for the current branch (because we use it to calculate the next labels and to label the current level's and branch constants and operators. Then, `lL` and `lR` are the new left and right branches for the next level. Then, we create a big superposition with all the possible operators, recursively call tree enumeration with the new left label, same for the right side, and also all the constants since the right and left side of a node can be a var or constants.

And now we have all the possible trees! Let's run a simple example with `depth=1` and collapse:

```
"#Var{}"
"#Leaf{4}"
"#Node{#Plus #Var{} #Var{}}"
"#Leaf{5}"
"#Node{#Plus #Var{} #Leaf{4}}"
"#Node{#Plus #Leaf{4} #Var{}}"
"#Node{#Mul #Var{} #Var{}}"
"#Node{#Plus #Var{} #Leaf{5}}"
"#Node{#Plus #Leaf{4} #Leaf{4}}"
"#Node{#Plus #Leaf{5} #Var{}}"
"#Node{#Mul #Var{} #Leaf{4}}"
"#Node{#Mul #Leaf{4} #Var{}}"
"#Node{#Min #Var{} #Var{}}"
"#Node{#Plus #Leaf{4} #Leaf{5}}"
"#Node{#Plus #Leaf{5} #Leaf{4}}"
"#Node{#Mul #Var{} #Leaf{5}}"
"#Node{#Mul #Leaf{4} #Leaf{4}}"
"#Node{#Mul #Leaf{5} #Var{}}"
"#Node{#Min #Var{} #Leaf{4}}"
"#Node{#Min #Leaf{4} #Var{}}"
"#Node{#Max #Var{} #Var{}}"
"#Node{#Mod #Var{} #Var{}}"
"#Node{#Plus #Leaf{5} #Leaf{5}}"
"#Node{#Mul #Leaf{4} #Leaf{5}}"
"#Node{#Mul #Leaf{5} #Leaf{4}}"
"#Node{#Min #Var{} #Leaf{5}}"
"#Node{#Min #Leaf{4} #Leaf{4}}"
"#Node{#Min #Leaf{5} #Var{}}"
"#Node{#Max #Var{} #Leaf{4}}"
"#Node{#Max #Leaf{4} #Var{}}"
"#Node{#Mod #Var{} #Leaf{4}}"
"#Node{#Mod #Leaf{4} #Var{}}"
"#Node{#Mul #Leaf{5} #Leaf{5}}"
"#Node{#Min #Leaf{4} #Leaf{5}}"
"#Node{#Min #Leaf{5} #Leaf{4}}"
"#Node{#Max #Var{} #Leaf{5}}"
"#Node{#Max #Leaf{4} #Leaf{4}}"
"#Node{#Max #Leaf{5} #Var{}}"
"#Node{#Mod #Var{} #Leaf{5}}"
"#Node{#Mod #Leaf{4} #Leaf{4}}"
"#Node{#Mod #Leaf{5} #Var{}}"
"#Node{#Min #Leaf{5} #Leaf{5}}"
"#Node{#Max #Leaf{4} #Leaf{5}}"
"#Node{#Max #Leaf{5} #Leaf{4}}"
"#Node{#Mod #Leaf{4} #Leaf{5}}"
"#Node{#Mod #Leaf{5} #Leaf{4}}"
"#Node{#Max #Leaf{5} #Leaf{5}}"
"#Node{#Mod #Leaf{5} #Leaf{5}}"
```
I double checked that we have all the possibilities. The tree with depth 2 is very big, but if you wanna see it, give it a try. The gist with the complete code will be in the end of this article.

Now, we just need to tell hvm to collapse and print the result if the measure of fit is equal 0 (we are looking for exact matches). And this is simpler than it is in haskell:

```
@X = @all(1 1)

@main =   
  !data = @data(10 #Nil 1)
  @if( (== @fit(@X data) 0) @do_show_tree(@X) *)
```

Simple, huh? We simply defined X as all the trees of depth 1 and said that for a given data, show us the result where the fit is 0. And this works! And it saves a lot of computation work by sharing.

Assume that @data simulates the equation `y = x * x`. Running our enumerator, we get:

`"#Node{#Mul #Var{} #Var{}}"`

Which is right!

That's it for today, we understood how superposition works and event wrote a very simple (but cool) example on symbolic regression. I'll leave some links and references below:

- [Symbolic Regression](https://en.wikipedia.org/wiki/Symbolic_regression)
- [HVM3](https://github.com/HigherOrderCO/HVM3)
- [Higher Order CO](https://higherorderco.com/)
- [Victor Taelin](https://x.com/VictorTaelin)
- [SAT solver via superpositions](https://gist.github.com/VictorTaelin/9061306220929f04e7e6980f23ade615)
