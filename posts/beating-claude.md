---
title: Beating Claude at the Kernel Optimization Challenge
description: 'How to beat claude at the Anthropic Kernel optimization challenge'
date: '2026-01-27'
---

Today I'm going to walkthrough the code and optimizations implemented that allowed me to beat Claude 4.5 on the Anthropic's performance take-home challenge. The leaderboard for it lives [here](https://www.kerneloptimization.fun/), at the moment I write this, I'm on place 32 with 1,158 cycles. Let's take a look at the problem and how to optimize it!

# Challenge Primer

The challenge was not to optimize a python runtime, but to optimize the generated program for a simulated machine. In this challenge, we're acting like a compiler optimizer. We're not measuring the time it takes Python to build the instruction list, but the number of **cycles** the simulator counts while running our generated program.

The test harness that lives in `tests/submission_tests.py` will:

- Build the program
- Run the simulator
- Checks final memory

## The machine model: VLIW + SIMD

VLIW stands for Very Long Instruction Word, and means that the compiler (we) decides what runs in parallel, not the hardware, and instead of the CPU dynamically figuring out which instructions can run together, each instruction explicitly contains multiple operations that execute at the same time.

For example, a single "instruction" looks like:
```
cycle N:
  alu:  2 ops
  valu: 1 op
  load: 2 op
  ...
```

And all of those happen in the same cycle.

SIMD stands for Single Instruction, Multiple Data and means that one instruction operates on many data elements in parallel.

Instead of doing:

```
a0 = a0 + b0
a1 = a1 + b1
a2 = a2 + b2
...
```

You do:

```
[a0..aN] = [a0..aN] + [b0..bN]
```

One instruction, `N` lanes of data.
In the machine we're working with, as defined in `problem.py`, `VLEN` is 8, which means a "vector register" is 8 consecutive scratch slots.

This means that with VLIW SIMD we can have two layers of parallelism, because each cycle can execute many different operations in parallel (VLIW) and some of those operations act on vectors of data lanes (SIMD).

Each instruction is really a bundle of slots across different engines, executed in one cycle, subject to per-engine slot limits. An important semantic rule is that all writes happen at the end of the cycle, so if slot `A` writes scratch `x` and slot `B` reads `x`, they cannot be in the same cycle (unless you want `B` to see the old value). That's why we need to be careful about scheduling and dependency modeling.

As engines, we have `alu`, `valu`, `load`, `store` and `flow` (and a debug one).

We also have slot limits for each engine, that delimit that per cycle, each engine can execute only so many slots (for example, 12 ALU operations, 2 loads, 1 flow op and so on).

In addition to that, we have scratch and memory. Scratch is basically registers of size `SCRATCH_SIZE`, and memory is just a flat list of 32-bit words.

### Instruction Format

Each instruction is a dictionary keyed by engine name. For example:

`{"alu": [("+", dst, a1, a2), ...], "load": [("load", dst, addr)]}`

- Every number is a scratch address, except for constant loads and jumps
- A single instruction is a *bundle* of slots. All slots in all engines execute in the same cycle.

### Execution semantics

Reads will happen from scratch and memory at the start of the cycle. Writes are staged into `scratch_write` and `mem_write` and are applied after all slots run. 

This means that we have no read-after-write within the same cycle, we must schedule dependent ops in later bundles.

### ALU and Vector operations

`alu` is basically integer operations with 32-bit wraparound (modulo 2^32). It includes a bunch of operations.

`valu` is SIMD operations on vectors of length 8, as said above. It supports `vbroadcast`, `multiply_add` and vectorized `alu` operations.

`load / store` are scalar and vector memory operations

`flow` is control operations.

The `Machine.cycle` is incremented only if an instruction has at least one non-debug engine slot.

## The problem the kernel solves

Basically we have a Tree, Input and a hash.
The `Tree` is a perfect binary tree stored as a flat list of node values. The `Input` is a batch of indices and values, where indices start at `0`.

Then we have a hash function with a 6-stage mixing sequence, where `myhash(a)` applies the stages and wraps at 32 bits.

### Reference kernel

We have the reference kernel that is the memory-based specification. It will read headers and pointers from mem, and for each round and batch element, it performs:

```
idx      = mem[inp_indices_p + i]
val      = mem[inp_values_p + i]
node_val = mem[forest_values_p + idx]
val      = myhash(val ^ node_val)
idx      = 2 * idx + (1 if val % 2 == 0 else 2)
idx      = 0 if idx >= n_nodes else idx
```

And then writes back `val` and `idx`.

For the memory layout, we basically have:
```
mem[0] = rounds
mem[1] = n_nodes
mem[2] = batch_size
mem[3] = forest_height
mem[4] = forest_values_p
mem[5] = inp_indices_p
mem[6] = inp_values_p
mem[7] = extra_room
```

Now, looking at the `Kernel Builder` and the baseline program at `perf_takehome.py`:

The Kernel Builder manages scratch allocation, builds instructions and constant caching. 

`alloc_scratch(name, length)` will assign a scratch address 

`scratch_const(val)` loads a constant into scratch once.

For instruction bundling, the original version emits one slot per instruction (which is inefficient, since it wastes VLIW parallelism).

Then, we have the hash emission, where `build_hash` expands the hash stages into scalar ALU ops, emitting three ALU slots per stage.

We also have some debug tools, like the trace viewer on `watch_trace.py` and `watch_trace.html`.

## Why is this slow?

Running the baseline, we get the following result:

```
forest_height=10, rounds=16, batch_size=256
CYCLES:  147734
```

This is a lot of cycles. When first looking at the code, there are some obvious wins that we should optimize. For example:

There is no bundling, so one slot per instruction is roughly one operation per cycle. We're working with scalar only, which ignores `valu`, `vload`, `vstore` and `vselect`. We have no Instruction-Level Parallelism, all of it is serial. We also have a huge instruction stream, with no jumps or loops.

So, I started optimizing with the following goals:

- Exploit VLIW: packing multiple ALU / load / store slots into a single instruction bundle

- Exploit SIMD: use vload / vstore and valu to process 8 elements at once

- Reduce memory traffic: keep constants and frequently used values in scratch

- Schedule around write-back semantics: no use of results from same-cycle slots.

Let's walkthrough how to implement some of those.

### Turn on VLIW bundling

Here, we're going to stop wasting empty slots. The baseline kernel emits one slot per instruction:

```py
def build(self, slots, vliw=False):
    instrs = []
    for engine, slot in slots:
        instrs.append({engine: [slot]})
    return instrs
```

This is basically running VLIW in single issue mode. The simplest first upgrade is to pack as many slots as we can into the same cycle as long as we don't exceed per-engine slot limits, don't violate dependencies and don't write the same scratch twice in the same cycle.

A greedy packer looks something close to:
```

def build(self, slots, vliw=True):
    instrs = []
    cur = {}
    cur_writes = set()

    def flush():
        nonlocal cur, cur_writes
        if cur:
            instrs.append(cur)
            cur = {}
            cur_writes = set()

    for engine, slot in slots:
        reads, writes = self._slot_rw(engine, slot)

        # can't exceed slot limits
        if len(cur.get(engine, [])) >= SLOT_LIMITS[engine]:
            flush()

        # can't read something we wrote earlier in same cycle
        if reads & cur_writes:
            flush()

        # can't write same location twice in same cycle
        if writes & cur_writes:
            flush()

        cur.setdefault(engine, []).append(slot)
        cur_writes |= writes

    flush()
    return instrs
```

This alone will give a good speedup, because instead of:
```
cycle N: load 1 op
cycle N+1: alu 1 op
cycle N+2: alu 1 op
...
```

We now have:

```
cycle N:
  load: 2 ops
  alu:  8 ops
  valu: 3 ops
  flow: 1 op
```

### Vectorizing the batch

The baseline code does:

```
for i in range(batch_size):
    idx = mem[inp_indices_p + i]
    val = mem[inp_values_p + i]
    ...
```

Since we have `VLEN = 8`, naturally we want to process 8 elements at once.

For example, for `batch_size = 16`, the scalar loop does 16 index loads + 16 value loads. With SIMD, that becomes 2 `vload` ops for indices and 2 for values.

Let's look at this snippet from my optimized version:

```

blocks_per_round = batch_size // VLEN  # 256/8 = 32 blocks

for block in range(blocks_per_round):
    body.append(("alu", ("+", tmp_addr, self.scratch["inp_indices_p"], offset)))
    body.append(("load", ("vload", idx_base + block * VLEN, tmp_addr)))

    body.append(("alu", ("+", tmp_addr, self.scratch["inp_values_p"], offset)))
    body.append(("load", ("vload", val_base + block * VLEN, tmp_addr)))

    body.append(("alu", ("+", offset, offset, vlen_const)))
```

This turns 256 scalar loads into 32 vector loads. Same will happen for stores. Another easy win!

### Keeping state in scratch

The baseline writes back `idx` and `val` every iteration. That's bad, because the machine has only 2 store slots per cycle, and we're doing it inside the hottest loop (hottest == runs the most).

The fix to this is scratch-resident indices / values. In my final kernel, I `vload` all indices / values into scratch once, then I run all rounds entirely in scratch and only do `vstore` at the end.

Example: in the benchmark (256 elements, 16 rounds), the baseline does 2 * 256 * 16 = 8192 scalar stores just for inputs. The optimized version does 32 blocks × 2 `vstore` = 64 vector stores total.

We can look at the "store at the end" logic here:

```
if is_last_round:
    if block == 0:
        body.append(("load", ("const", tmp_addr, inp_values_p)))
        body.append(("load", ("const", tmp_addr2, inp_indices_p)))

    body.append(("store", ("vstore", tmp_addr, val_vec)))
    body.append(("store", ("vstore", tmp_addr2, idx_vec)))

    if block < blocks_per_round - 1:
        body.append(("alu", ("+", tmp_addr, tmp_addr, vlen_const)))
        body.append(("alu", ("+", tmp_addr2, tmp_addr2, vlen_const)))
```

This way we get fewer memory ops, and the memory ops are batched into contiguous vector operations.

### Constant folding and pointer arithmetic

The baseline reads these:
`rounds, n_nodes, batch_size, forest_height, forest_values_p, inp_indices_p, inp_values_p` from the memory header every run. We also know the memory layout is fixed.

The optimized version just bakes those in. If something is known at compile time, don't compute it at runtime.

The layout is fixed as:
```
forest_values_p = 7
inp_indices_p   = 7 + n_nodes
inp_values_p    = 7 + n_nodes + batch_size
```
so we can `const`-load these once and never touch the header again.

### Bit tricks

The baseline index update does:

```
tmp = val % 2
tmp = (tmp == 0)
child = select(tmp, 1, 2)
idx = 2*idx + child
idx = select(idx < n_nodes, idx, 0)
```

We have two problems here: `%` and `==` and `select` use `FLOW`, and create dependencies. Bound checks use `FLOW` again.

Instead, the optimized version does parity as:

```
alu("&", tmp1_lane, val_lane, one_const)   # tmp1 = val & 1

alu("+", node_lane, tmp1_lane, one_const) # node = (val & 1) + 1  (=> 1 or 2)
```

Example: if `val = 13`, then `val & 1 = 1` and `node = 2`, so the update becomes `idx = 2*idx + 2` via a single `multiply_add`.

And then, `idx = 2 * idx + node` becomes a single fused vector operation:

`valu("multiply_add", idx_vec, idx_vec, two_vec, ctx["node"])`

We can also replace bound checking with a deterministic rule. This is good!

Since our tree is a perfect binary tree stored like a heap, we know that the `root = 0`, and children of `i` are at `2*i + 1` and `2*i + 2`. 

Starting at index 0 and applying that update repeatedly, then after exactly `forest_height + 1` steps, you've gone "past the leaves" and you always wrap.

So, instead of doing:

`idx = 0 if idx >= n_nodes else idx` every round, we now do:

```
wrap_period = forest_height + 1
level = rnd % wrap_period

if level == forest_height:
    idx = 0
else:
    idx = 2*idx + (1 or 2)
```

Example: with `forest_height = 2`, levels go 0 -> 1 -> 2, and on level 2 we deterministically reset `idx = 0` without any `idx >= n_nodes` compare.

This is an algorithmic identity that removes a conditional from the hot loop, which makes it faster!

## What next?

Those were my initial ideas and things I thought about implementing when first reading the problem. Those "easy wins" (and some other ones, but I think I outlined the most important ones) got me to ~1800 cycles. Good compared to `147734` we had at the first place, but still not better than claude.

So, I noted a bottleneck, on tree loads and gathers. In the loop, we need to do:

`node_val = mem[forest_values_p + idx]`

In SIMD form, each lane has a different `idx`, so the addresses are not contiguous, which means we can't use `vload` for tree nodes. This forced us to compute 8 addresses (ALU), issue 8 scalar loads and then XOR into the vector. 

But the load engine has only 2 load slots per cycle, so even if we ignore everything else, the best possible throughput for this would be 4 cycles minimum plus the address math and XOR for **every** round. 

So, the only way forward is to avoid those gathers.

## Breaking the wall

The remaining wins come from three big themes:

1. Avoiding gathers as much as possible (caching tree levels)

2. Shortening the dependency chains (hash fusion + deferred XOR)

3. Schedule aggressively

Let's go through each one.

### Caching the top of the tree

The idea is that in a heap-indexed perfect binary tree, in the first 3 levels we have 15 nodes. If we load these once into scratch, we can handle the first few rounds/levels without any gather loads at all.

The code preloads node values and broadcast to vectors:

```
num_preload_nodes = min(15, n_nodes)
node_vecs = []
node_vecs_xor = []

for node_idx in range(num_preload_nodes):
    node_scalar = self.alloc_scratch(f"node_{node_idx}")
    node_vec = self.alloc_scratch(f"v_node_{node_idx}", length=VLEN)

    node_offset = const(node_idx)
    addr_reg = tmp_addr if node_idx % 2 == 0 else tmp_addr2

    body.append(("alu", ("+", addr_reg, self.scratch["forest_values_p"], node_offset)))
    body.append(("load", ("load", node_scalar, addr_reg)))
    body.append(("valu", ("vbroadcast", node_vec, node_scalar)))
    node_vecs.append(node_vec)

    node_vec_x = self.alloc_scratch(f"v_node_x_{node_idx}", length=VLEN)
    body.append(("valu", ("^", node_vec_x, node_vec, v_last_const)))
    node_vecs_xor.append(node_vec_x)
```

We also have some subtle wins there, such as two address registers so the scheduler can overlap address-gen and loads, a single node value becomes a full vector register and the precompute of `node ^ v_last_const`, which is part of the "xor table" i'm disclosing later.

### Picking the right cached node

Once nodes are cached, we now have the question:

Given a vector of indices, how do we pick the right cached node per lane?

We can't do `node = node_vecs[idx]` directly. Instead, we have to do conditional selection using `flow.vselect`. It is basically a vectorized ternary.

Example (level 1): indices are only 1 or 2. If `idx & 1` is 1, select node 1; otherwise select node 2. For a vector like `[1,2,1,2,2,1,1,2]`, a single `vselect` picks the right cached node per lane.

On the first level (nodes 1-2), we use `idx & 1`. Valid `idx` in this level are 1 or 2:

```

body.append(("valu", ("&", ctx["tmp1"], idx_vec, one_vec)))
body.append(("flow", ("vselect", ctx["node"], ctx["tmp1"], nodes[1], nodes[2])))
```

Then we XOR into the value:
```
body.append(("valu", ("&", ctx["tmp1"], idx_vec, one_vec)))
body.append(("flow", ("vselect", ctx["node"], ctx["tmp1"], nodes[1], nodes[2])))
```

This is "scalar per lane XOR" rather than `valu("^", ...)`. This is intentional, because ALU has 12 slots per cycle and is often underused (we can see that in the traces and debugging), whereas VALU has 6 slots per cycle and is used on hash math. So using ALU here can actually schedule better.

Example (level 2): if a lane has `idx = 6 (0b110)`, then `(idx & 2) != 0` and `(idx & 1) == 0`, and the `vselect` tree picks cached node 6 without any loads.

For level 2 (nodes 3-6), use `idx & 1` and `idx & 2`. The index at this level is `idx ∈ {3,4,5,6}`, that's 4 nodes, which means 2 bits. 

So we build a small vselect tree, that selects between pairs first and then select between those results.

At level 3 (nodes 7-14), we subtract 7 and use 3 bits. At that part, `idx ∈ {7,8,...,14}` (8 nodes), that's 3 bits. So we normalize the `idx` to local `0..7`, then extract the three bits with masks and do a selection tree.

This part is long, but the thing here is that cached lookup replaces 8 scalar loads with a handful of vselects. This is a *tradeoff*, we're shifting the pressure from `LOAD` to `FLOW`.

`FLOW` is 1 slot per cycle, so we must overlap those `vselect` cycles with other `ALU/VALU` work (and this is where scheduling and multi context will matter most).

For deeper levels, cached lookup is not available, so we do the gather. This is load-limited.

### Hash specialization

The initial `build_hash` expands each stage into 3 scalar operations. This is bad for SIMD. In the optimized kernel, all the hash constants are pre-broadcast into vector registers once, and some stages are converted into fused `multiply_add` ops.

Example: `x + (x << 3)` equals `x * 9`. So `valu("multiply_add", val, val, v9, vC)` replaces a shift + add with one vector op.

Interesting part here is that LLM's are pretty useful identifying this kind of optimization, hard to see them by eye, so I got some help here as well.

For example, we convert `x + (x << s)` into a multiply per the identity:

`x + (x << s) = x * (1 + 2^s)`

And the stage can become: 
`valu("multiply_add", val_vec, val_vec, mul_vec, const_vec)`

Which is one instruction instead of multiple. We do this for every operation we can.

### Fusing hash stages with algebra

This is a nice compiler move. We identify two consecutive stages that compose cleanly. The optimized code does:

```
if hi == 2:
    body.append(("valu", ("multiply_add", ctx["tmp1"], val_vec, v_mul2_shift, v_c2_shift)))
    body.append(("valu", ("multiply_add", val_vec, val_vec, v_mul2, v_c12)))
    body.append(("valu", ("^", val_vec, val_vec, ctx["tmp1"])))
elif hi == 3:
    continue
```

So stage 3 disappears entirely. Conceptually, if stage 2 is:

```
y = (x + c2) + (x << s2)
  = x*(1 + 2^s2) + c2
  = x*mul2 + c2
```

and stage 3 is:

```
z = (y + c3) ^ (y << s3)
```

Then, substituting for `y`, we have:

```
z = (x*mul2 + c2 + c3) ^ ((x*mul2 + c2) << s3)
  = (x*mul2 + (c2+c3)) ^ (x*(mul2<<s3) + (c2<<s3))
```

Which is exactly what the fused code computes.

`val = x * mul2 + (c2+c3)` via `multiply_add`,
`tmp = x * (mul2 << s3) + (c2 << s3)` via `multiply_add` and `val ^= tmp`.

This way we get our DAG shorter, which makes it easier to schedule, providing higher instruction level parallelism which results in fewer cycles.

### Deferred XOR constant

If at the end of a round `r`, the hash has a final `XOR` with a constant `C`, and at the start of round `r + 1` you do:

`val = val ^ node`

Then:

`(val ^ C) ^ node == val ^ (node ^ C)`

Therefore, instead of XORing `C` into `val`, we can XOR `C` into the node you fetch next round.

This is only possible when the "node fetch" is from the cached node table (because we can precompute `node ^ C`). This is not possible cheaply for gather loads because nodes are data dependent.

First, we decide if we can defer, checking if the next level is cached.

Then, in the final stage of the hashing, when deferring:

```
elif defer_const and hi == last_stage:
    body.append(("valu", (op3, ctx["tmp2"], val_vec, hash_vec_consts3[hi])))
    body.append(("valu", ("^", val_vec, val_vec, ctx["tmp2"])))
```

This will skip the XOR with the constant, because it will be applied via nodes next round.

Then, in the next round, the tree lookup uses:

```
use_xor_nodes = (rnd > 0) and depth_cached
nodes = node_vecs_xor if use_xor_nodes else node_vecs
```

where `node_vecs_xor[k] = node_vecs[k] ^ v_last_const` was precomputed during preload. This is why we have two node tables on preload.

But there's still something here. The next index depends on `val % 2`, so if we skip XORing `C` into val in this round, the parity might change. If `C` has its least significant bit set (i.e `C` is odd), then XORing with `C` flips parity.

Therefore, when we defer the constant, we invert the parity-based child selection.

This just moves where the XOR happens.

### ILP across blocks

There is a non-trivial constraint in VLIW scheduling. Even if we have two operations that are logically independent, the scheduler cannot pack them if they fight over the same scratch temporaries.

So, our optimized kernel allocates a separate set of temporary vector registers per in-flight block.

Example: block 0 can be doing `vselect` on cached nodes while block 1 is running hash math, because their temps (`ctx0_*` vs `ctx1_*`) never alias. The scheduler can place those in the same cycle.

```
contexts = []
for ctx_i in range(group_size):
    contexts.append({
        "node": alloc_scratch(..., length=VLEN),
        "tmp1": alloc_scratch(..., length=VLEN),
        "tmp2": alloc_scratch(..., length=VLEN),
        "tmp3": alloc_scratch(..., length=VLEN),
    })
```

This is why we have `group_size` and `mini_batch`.
Even when processing one block at a time in code order, the global scheduler sees:

- block 0 temporaries are disjoint from block 1 temporaries

Therefore, it can overlap and interleave operations from different blocks in the same cycles.

This is basically "register renaming" as a performance feature.

### A better scheduler

At this point, we're very optimized already. But a greedy bundler still leaves performance on the table, because it preserves the original order.

Instead, what we do to optimize is:

1. compute read/write sets for every slot
2. build a dependency graph
3. prioritize critical-path ops
4. pack cycles respecting per-engine slot limits

We can see that in the snippet:

Example: if two loads are independent but the hash chain is long, list scheduling can pull those loads as early as their addresses are ready, so their latency overlaps the hash critical path instead of stalling later.

```
# ready_set = all ops with indegree 0
# ready_time[i] = earliest cycle it can run (because of RAW +1 edges)

while scheduled_count < n_slots:
    # push ready ops into per-engine heaps with a priority
    score = i - alpha * height[i]
    heapq.heappush(heaps[engine], (score, i))

    # each cycle: pick best ops for each engine, up to slot limits
    for eng in engine_order:
        if engine_usage[eng] >= SLOT_LIMITS[eng]:
            continue
        idx = heapq.heappop(heaps[eng])
        schedule idx in this cycle
```

### Relaxing memory dependencies

In the first implementation, the scheduler was conservative and treated "memory" like a single global token, preventing reordering between loads and stores.

However, in the optimized version, the per-slot dependency model for load/store is lighter:

```
elif engine == "load":
    reads.add(addr)
    writes.add(dest)

elif engine == "store":
    reads.add(addr)
    reads.update(vec_addrs(src))
```

There's no global "memory token" that every load/store touches. This gives the scheduler more freedom to reorder memory ops relative to each other.

Example: tree loads always read `forest_values_p..`, and final input stores write to `inp_values_p..`. Since those ranges never overlap, a store can move earlier/later without changing any read result.

This is safe here because the kernel's memory accesses are structured.

Tree loads read from the forest range, final stores write into input ranges and those regions are disjoint in this memory layout, so we can exploit that.

## The final kernel

Here's the mental model we have of the final optimized program:

1. Setup constants:
Scalar constants go to scratches (`1`, `2`, `VLEN`, etc).
Vector constants go via `vbroadcast`.

2. Precompute hash constants:
We broadcast every per-stage constant to vectors once, and then precompute the fused constants for stage 2 and 3 fusion.

3. Preload cached tree nodes
We load the first 15 nodes once, broadcast each one of them to a vector register and build a second `xor` table for deferred XOR.

4. Load inputs into scratch
`vload` all index and val vectors (32 blocks)

5. Run rounds

For each round we:
Compute the current level, and do a tree lookup. We either use the cached `vselect` lookup for cached levels, or gather loads for deeper levels.

Then, we hash, using `multiply_add` wherever possible, fusing stage 2 and 3 and doing the defer of `XOR` when next round is cached.

Finally, we update the index, doing a deterministic wrap at leaf level or `multiply_add` update, and inverting parity if the last XOR was deferred.

6. Store results
`vstore` values (and indices) just once at the end.

7. Schedule the entire slot stream
List scheduling to maximize packing across `ALU/VALU/LOAD/FLOW/STORE` each cycle.

That was it for today, the optimized version achieves 1158 cycles.
