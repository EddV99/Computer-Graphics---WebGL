/* Curves 
Type of Representation
    y = f(x)

Implicit Representation
f(x, y) = 0  

Implicit for line
ax + by + c = 0

For circle
(x - c_x)^2 + (y - c_y)^2 - r^2 = 0 (c_x,c_y is origin of circle)

Implicit Representation isn't helpul to draw, so we use

Parametric Representaion
x_ = f(t) , x_ = [x y]

Example
x - 2y + 2 = 0    : Implicit

x = 2t, y = t + 1 : Parametric
into one function
x_ = [2 1]t + [0 1]

we can use points on the line to find it
p_0 = [0 1] p_1 = [2 2]
x_ = p_0 + t(p_1 - p_0)

f(t) = (p_1 - p_0)t + p_0

more generally
f(t) = at + b

or

linear interperlation
f(t) = (1 - t)p_0 + tp_1

higher degree

f(t) = at^2 + bt + c

f(t) = (p_0 - 2p_1 + p_2)t^2 + 2(p_1 - p_0)t + p_0  : p_0 and p_2 are endpoint p_1 is 
                                                      where tangent of endpoint cross
Bezier Curves
f(t) = (1 - t)^2p_0 + 2(1-t)tp_1 + t^2p_2

more 
f(t) = (1 - t)^3p_0 + 3(1 - t)^2tp_1 + 3(1 - t)t^2p_2 + t^3p_3
*/