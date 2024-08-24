# Using this Textbook

This textbook will contain **Python** code snippets. Familiarity with Python would be helpful ([this Coursera Python specialization](https://www.coursera.org/specializations/python-3-programming) has more than enough background). Some will be read-only:

```python
print("This code snippet is meant to be read")
```

Some code samples will be executable in your browser, with a "Run" button. Try "Run" below:

```{editor} python
print("Hello!")
```

Some of these snippets might also have interactive widgets that you can experiment with:

```{editor} python
:run_on_load: true
# val =   0 #<-SLIDE(0 to 100 by 1)
val =  0.2  # Time constant for neuron <-SLIDER(0.008 to 0.5 by 0.001)

print(f"{val=}")
```

And sometimes the output may be graphical
```{editor} python
:packages: matplotlib,numpy
:run_on_load: true
import matplotlib.pyplot as plt
import numpy as np

v = 10
tau = 0.1  #<-SLIDE(0.01 to 1 by 0.001)
t_step = 0.01
duration = 5

t = np.arange(0, duration, t_step)
v_values = []

for _ in t:
    v = v * (1 - t_step / tau)
    v_values.append(v)

plt.figure()
plt.plot(t, v_values, label='Voltage $v(t)$')
plt.xlabel('Time (s)')
plt.ylabel('Voltage (v)')
plt.show()