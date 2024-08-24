# Building Spiking Neural Networks (SNNs) from Scratch

At the outset of the creation of the field of Artificial Intelligence (AI), a common goal was to create an artificial mind capable of performing tasks that were considered to be uniquely human---working with natural language, handling ambiguity, learning, and exhibiting creativity {cite}`mccarthy2006proposal`. Although AI systems have rivaled or outperformed humans at many aspects of these tasks, their design has diverged significantly from the biological brains that inspired them. This divergence is not necessarily bad; biomimicry---using nature-inspired solutions to design new systems---is not the most productive approach for every problem. For example, early aviation techniques attempted to mimic bird flight but modern aviation necessarily differs from anything found in nature.

Nearly every computer today is based on Von Neumann architecture, where processing and memory are separate functions. **Neuromorphic computing (NMC)** is an alternative architecture that is more analogous to the behavior of the brain---it is based on neurons, which communicate via spikes through synapses. As is the case with the brain, these components are responsible for processing *and* memory. These networks of artificial neurons and synapses are called **Spiking Neural Networks (SNNs)**, as opposed to the *Artificial* Neural Networks (ANNs) that most modern deep learning relies on. Whereas ANNs are based on continuous values (numbers to represent how "active" a part of the network is), SNNs are based on discrete events (spikes and their timing). This difference in architecture has significant implications for how SNNs can be trained and used.

## Why Spiking Neural Networks?

Artificial Neural Networks (ANNs) have been proven to be capable of performing a wide variety of tasks at or beyond human-level. [AlphaGo](https://www.deepmind.com/research/highlighted-research/alphago), a program that plays the board game Go, [defeated Go champion Lee Sedol in 2017](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol). ChatGPT {cite}`achiam2023gpt` has achieved human-level performance in a variety of natural language processing tasks. However, the hardware on which modern ANNs run require orders of magnitude more power than the humans against whom they compete. For example, ChatGPT's daily power usage [has been estimated to be equal to 180000 U.S. households](https://www.forbes.com/sites/cindygordon/2024/03/12/chatgpt-and-generative-ai-innovations-are-creating-sustainability-havoc/). The power, hardware, and training requirements of these large networks limit the contexts in which they can be deployed.

New hardware, such as [Intel's Loihi](https://www.intel.com/content/www/us/en/research/neuromorphic-computing.html) and [BrainChip's Akida](https://brainchip.com/) can execute SNNs significantly more efficiently than traditional von Neumann hardware, with respect to power consumption. With future hardware advances and further research, NMC might be able to address some of the challenges of existing AI systems. There are several key questions about NMC that have yet to be answered---including the scope of applicability and how closely NMC hardware should mimic biological neurons. However, NMC has several areas in which it is being actively applied:

- **Improving algorithmic efficiency.** Researchers have proposed that NMC models might be more efficient at performing some traditional graph algorithms and random walk computations.
- **Modeling and Understanding the brain.** Neuroscience researchers have used SNN models to simulate aspects of biological brains in order to answer questions about how they might function
- **AI at the edge.** Developers can use SNNs and NMC hardware to create AI agents that run efficiently and quickly with minimal power consumption. This enables these agents to run in a variety of settings and devices that require low power consumption without uploading data to a centralized server. These agents might be particularly effective at recognizing patterns in data with a temporal component.

## This Book

These notebooks are meant to serve as an introduction to the basics of SNNs and NMC. In these tutorials, I will not focus on biological realism but instead on *hardware viability*---what can be efficiently implemented in hardware, even if it does not match how the brain functions. For this reason, we will 

A list of topics covered:
```{tableofcontents}
```

## Other Resources

There are several great overviews of SNNs:
- [Jason Eshraghian's talk "Training Spiking Neural Networks Using Lessons From Deep Learning"](https://www.youtube.com/watch?v=zldal7b7sJ4)
    - [Jason Eshraghian's accompanying paper](https://arxiv.org/pdf/2109.12894.pdf) is also a very clear introduction
- [Priya Panda's talk "Spiking Neural Networks: Algorithms"](https://www.youtube.com/watch?v=7TybETlCslM&list=PLMohsHZ1UrxtCY69Lo61jrRRdY0BZIv9t&index=7)
- [Chris Eliasmith's "Spiking Neural Networks for More Efficient AI Algorithms"](https://www.youtube.com/watch?v=PeW-TN3P1hk)

## References
```{bibliography}
:filter: docname in docnames
```