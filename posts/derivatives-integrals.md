---
title: The Fundamental Theorem of Calculus
description: >-
  From Derivatives to Integrals: A Journey Through the Fundamental Theorem of
  Calculus
date: '2024-05-21'
---
Today we are walking through a subject that many people have fear of. I’m talking about calculus. Although hearing about derivatives and integrals may be a bit shocking at first, the reality is that it is simply amazing when you understand it. If you are not familiar with calculus or math, don’t worry, we will explain it all in a conceptual way.

Let’s start thinking about a circle. We learned that the area of a circle is calculated using the formula _2 * PI * r_ , where _r_ is the radius of the circle. But where does this come from? Let’s divide our circle in many rings, like this:

![Ring divided circle](/images/derivatives-integrals/1.webp)

For this purpose, we will call the thickness of the ring _dr_ . We can think of a ring as a coiled line. If we uncoil it, we will see that the figure is similar to a rectangle, so we approximate this ring to a rectangle. That said, our thickness would be the rectangle height, and _2 * PI * r_ (the formula to the cirfumfere) is the rectangle width. So the area of our rectangle approximation is _2 * PI * r * dr_. But as _dr_ becomes smaller (which means as we slice our circle in smaller and smaller rings), the approximation will become less and less wrong.

Note that we divided our circle in many rings, so it’s logical to conclude that the area of our circle is the sum of the area of all rings. A way to visualize this is to plot a graph from 0 to r, with columns that represent our rings.

If we choose smaller and smaller values for _dr_, the area of our rectangles keeps getting closer of the precise area under the graph. The portion under the graph is a triangle, whose base is 1, and height is _2 * PI_ * 1 _._ So the area, which is _(base * height)_ / 2  comes out to be PI *1² . Or, if the radius of our original circle had been other value R, _area = 1/2 * R * 2 * PI * R = PI * R²_

---

## Integrals

Imagine we have the following graph for the function f(t) = t³:

![Graph of f(t) = t³e](/images/derivatives-integrals/2.webp)

Now, we set the left endpoint at the origin (0), but let’s think that the right endpoint (that we will call x) varies. How can we describe the area under the graph of f(t) when we consider the variation of our endpoint x?

![Endpoint](/images/derivatives-integrals/3.webp)

We do it the following way:

![integrating](/images/derivatives-integrals/4.webp)

In mathematics, integral is a concept used to calculate the area under a curve or the total accumulated value of a function over an interval. Consider a linear function such as _f(x) = 2_. This function is represented graphically like this:

![f(x) = 2](/images/derivatives-integrals/5.webp)

To calculate the area under our function, we simply calculate the area of the rectangle formed by the height of the function over that interval and the width of the interval itself.

However, we may deal with more complex functions, like polynomials. Imagine a function like the one below:

![Graph for polynomial function](/images/derivatives-integrals/6.webp)

In that case, it is impossible to calculate the area using simple geometry, like we did before. Instead, we use integration to approximate the area under the curve. Integration involves dividing the area under the curve into an infinite number of small rectangels, with an infinitelly small width and then summing up the area of all rectangles. The result is approximately the total area under the curve, like we represented using our circle rings. This is the foundation of the theory of integration.

---

## Derivatives

Derivatives are usually defined as “instantaneous rate of change”, but think about this definition for a second. Things only change if we measure different points in time. Think about a moving car: what if I told you that our car is moving 60km per hour, and asked what is the velocity of our car at the instant _i?_

You cannot measure how fast the car was at a single instant, because there is no room for change since we don’t have separate points in time. Velocity itself is the distance traveld over a given amount of time, so this is a paradox. But we have speedometers right? When you are driving, the car shows your speed at a given moment… or this is what it appears to happen. In reality, the car system is computing speed during **very** small amounts of time.

This means that if we choose a small amount of time _dt,_ we can compute the rise over the run:

![derivative](/images/derivatives-integrals/7.webp)

The idea presented here is almost what a derivative is. Although a car will choose a small amount like 0.001 seconds to compute speed, in math, the derivative is not this ratio for a specific choice of _dt_. It’s whatever value this ratio _approaches_ as the choice for _dt_ approaches 0.

Another way to think about _ds/dt_ is the slope of the line passing through two points on the graph. The derivative is equal to the slope of a line _tangent_ to the graph at a single point.

![Tangent line on the point A](/images/derivatives-integrals/9.webp)

For example, let’s think about a linear function, such as _f(x) = 2x + 2 ._ Knowing the concept of derivatives, we can compute the derivative of our function easily. The graph for this function looks like this:

![graph of f(x) = 2x + 2](/images/derivatives-integrals/10.webp)

It doesn’t matter the value of _x,_ the slope of the line will always be 2 (because in linear equations of form _f(x) = ax + b_, a represents the linear coefficient that dictates the slope of the line. In our case, it its one). Derivatives of constant values, such as our _b_ are 0, because there is no change in constant values. That said, the derivative of a linear function is it’s linear coefficient _a._ In our case, note that every time we increase X by 1 unit, the value of the function increases by 2 units, so the rate of change is always the same.

There are a lot of techniques to computing derivatives for other types of functions, such as power, exponential, logarithmic and so on. I will not cover those in this article since it is mostly conceptual.

> The formal definition of a derivative is that the derivative of _y_ with respect to _x_ is defined as the change in _y_ over the change in _x_ as the distance between _x0_ and _x1_ becomes smaller and smaller. [[source]](https://simple.wikipedia.org/wiki/Derivative_(mathematics))

![](/images/derivatives-integrals/11.webp)

This is the math definition of a derivative, which is the slope of the tangent line to the graph of f(x) in that point, it measures how quickly the value of f(x) changes with small changes in x.

---

## Fundamental Theorem of Calculus

After all we’ve been through in this article, this is the time to stitch it all together and understand the relation between the slope of a curve and the area below it, the Fundamental Theorem of Calculus. It states that integration (integrals) and differentiation (derivatives) are inverse operations of each other.

It states that for a function _f_ , an _antiderivative_ may be obtained as the integral of _f_ over an interval with a variable upper bound.

> Quick definition: antiderivatives (also known as indefinite integrals) of a function _f_ is a differentiable function _F_ whose derivative is equal to the original function _f_. (_F’ = f)._

Basically, if function _f(x)_ is continuous over an interval _I_, and if _F(x)_ is any antiderivative of _f(x)_ over that interval _I_, then the indefinite integral of _f(x)_ is _F(x)_ + integration constant. In other words, integration undoes differentiation and restores the original function up to an arbitrary constant. This is what states that they are inverse operations of each other.

The theorem also states that the integral of _f_ over a fixed interval is equal to the change of any antiderivative _F_ between the ends of the interval. It simplifies the calculation of a definite integral.

Simply amazing.

Thanks for reading, see you next week!

Lorenzo

---

## References

[https://www.geogebra.org/](https://www.geogebra.org/)

Howard A, Irl C. B Bivens, Sephen L. Davis; et al. Cálculo.v1, 10th ed. Bookman, 2014.

[3Blue1Brown](https://www.3blue1brown.com/?source=post_page-----a67302832407--------------------------------)

[Fundamental theorem of calculus - Wikipedia](https://en.wikipedia.org/wiki/Fundamental_theorem_of_calculus?source=post_page-----a67302832407--------------------------------)

[Antiderivative - Wikipedia](https://en.wikipedia.org/wiki/Antiderivative?source=post_page-----a67302832407--------------------------------)

[https://en.wikipedia.org/wiki/Derivative](https://en.wikipedia.org/wiki/Derivative)
