![banner](https://github.com/akrossu/Aurelient/blob/main/resources/banner.png)

<p align=center>Energy-aware AI platform that lets users control model effort to reduce compute waste. </p>

<br>

> **Built for the [PatriotHacks 2025 Hackathon](https://patriothacks2025.devpost.com/)** | **[Devpost Submission](https://devpost.com/software/aurelient)**

## Installation

### Requirements
- Node.js 18+
- LM Studio installed
  - Meta-Llama-3.1-8B-Instruct LLM installed
- Local hardware capable of running the selected models

### Instructions

#### 1. Clone the repository
```bash
git clone https://github.com/akrossu/Aurelient.git
cd aurelient
```

#### 2. Install all node modules
```
npm run install:all
```

#### 3. Verify .env variables
```
# (optional) The backend/.env file is avaliable publically
NODE_ENV=deploy
LMSTUDIO_MODEL=lmstudio-community/Meta-Llama-3.1-8B-Instruct
LMSTUDIO_PORT=1234
APP_PORT=4000
```

#### 4. Start web servers
```
npm run start:backend
npm run start:frontend
```

#### 5. Start LM Studio Server
- Access the Developer console
- Select Meta-Llama-3.1-8B-Instruct Model to load
- Start LM Studio Server

## Problem

We’ve all been there: you ask an LLM a simple question, and its response is far deeper than you need it to be. Or you ask something nuanced, and it barely scratches the surface. You end up spending more time coaching the model on how to answer than actually getting the answer.

Right now, LLMs decide how much reasoning and computation to spend purely from your prompt phrasing. That guess is often wrong, and expensive. Overthinking a response wastes compute, underthinking one wastes your time.

## Inspiration

Seeing how often people have to coach LLMs into giving the right amount of detail made us realize that *wasted user effort and wasted compute are usually the same problem*. Cloud AI platforms burn a lot of energy answering prompts more deeply than needed, and users lose time trying to control them.

At the same time, new work like Saad-Falcon, et al [1] shows that modern local models are far more efficient than expected, with consumer hardware reaching up to 88.7% single-turn reasoning performance. We saw this as an opportunity for something better.

That’s when Aurelient was born: a platform built around giving users control and using only the compute that a response actually needs.

![Imgur](https://i.imgur.com/zu4ibPS.png)

## What it does

Our hostable platform allows users to choose how much effort they want to put into a query. Prompts like "Write a simple math solution" should not have to use so much energy. That's why we give the option to locally host one or more AI models and access them anywhere through a web interface.
By preprocessing your prompt with a very lightweight tool-use model, we can predict and refine how larger models respond to prompts. This is significant because through preprocessing, we are able to correctly allocate resources and minimize compute overhead, while giving the user more control over how the model responds.

![Imgur](https://i.imgur.com/ZWkNkhp.png)

## How we built it

We started with a straightforward React application built around LM Studio's local API. From there, we designed a prompt preprocessor which uses a small Llama instruct model to estimate the prompt's semantic complexity and assign it a complexity and confidence score. We then use this score to give a tailored inference depth recommendation to the user.

The interface provides real-time information and allows the user to easily adjust how much processing power the model uses when responding to the prompt. Once the user submits their prompt, we use the inference depth to fine-tune the responding model's behavior to optimize for energy efficiency without compromising on quality of response.

### Tech Stack

- **Frontend:** React, Vite, Tailwind
- **Backend / API**: Express REST API, LM Studio Server
- **Models**: Llama 8B instruct model, various larger conversation models
- **Tools / Infrastructure**: Node.js, local GPU hardware (RTX 4070 super, Apple M3)

## Challenges we ran into

This is far more than just a wrapper. Handling model selection, resources, and the mathematical precision needed for large model operations introduced substantial complexity. Building a strong foundation from recent research and public findings took a lot of time.

## Accomplishments that we're proud of

Three days of project time pushed all of us to our limits. We are proud to have produced a strong, functional prototype of our platform. Because of this, we have developed a clear vision for where this platform can go.

## What we learned

We are a team of computer science student, but no one on the team knows anything about AI. Through reading papers, research, reading documentation, and being able to mess with parameters of our own local models, we gained so much insight and understanding of what goes into how LLMs actually operate.

## What's next for Aurelient

Aurelient has enormous room to grow. This project time pushed us to implement what was necessary. There are still opportunities, such as dynamic model loading, smarter query routing, and more granular tuning controls for both basic and advanced users. Our team is excited to share this project with other passionate builders and AI enthusiasts everywhere.

## Team Members

- **Zachary Merritt**: Full Stack Developer, AI Researcher,  Build & Release Engineer, UI/UX Designer, Technical Writer
- **Ethan Pierce**: Full Stack Developer, API Engineer, Prompt Engineer, Technical Program Manager, Engineering Lead
- **Ashley Chi**: Frontend developer
- **Priya Kallat**: Backend developer

## Sources

[1] Saad-Falcon, Jon, et al. “Intelligence per Watt: Measuring Intelligence Efficiency of Local AI.” [ArXiv.org](http://arxiv.org/), 2025, https://arxiv.org/abs/2511.07885.

[2] https://github.com/HazyResearch/intelligence-per-watt
