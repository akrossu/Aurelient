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

## Inspiration

The inspiration for this project comes from the ever-growing energy costs of common-use cloud AI platforms. In a very recent paper by Saad-Falcon, et al. [1]  demostrates that recent advances in local LLM models have massively improved in performance. With new consumer hardware accelerators reaching up to 88.7% single-turn chat and reasoning queries!

This gave us the idea of implementing a solution for private, powerful, and most importantly, energy-efficient AI usage.

![Imgur](https://github.com/akrossu/Aurelient/blob/main/resources/IPW.png)
> *Saad-Falcon, et al. [1] pg. 3*

## What it does

Our hostable platform allows users to choose how much effort they want to put into a query. Things like "Write a simple math solution" should not have to use so much energy. That's why we give the option to locally host one or more AI models and access them anywhere through a web interface.
By preprocessing your prompt with a very lightweight instruct model, we can predict and refine user input. This is significant because with preprocessing, we are able to correctly allocate resources and minimize compute overhead significantly.

![Imgur](https://github.com/akrossu/Aurelient/blob/main/resources/elements.png)
> *various web ui information*

## How we built it

We started with a straightforward React application built around LM Studio's local API. From there, we designed a prompt preprocessor which uses a small instruct llama model to determine the text's complexity, confidence score, and resources that will be used for the query.
The interface provides real-time information and allows the user to simply drag an efficiency bar to define how much effort should be put into their query. Once the user submits their prompt, we determine which model, weights, and best energy-efficient way to complete the task.

### Tech Stack
- **Frontend:** React, Vite, Tailwind
- **Backend / API**: Express REST API, LM Studio Server
- **Models**: Llama 8B instruct model, various larger conversation models
- **Tools / Infrastructure**: Node.js, local GPU hardware (RTX 4070 super, Apple M4)

## Sources

[1] Saad-Falcon, Jon, et al. “Intelligence per Watt: Measuring Intelligence Efficiency of Local AI.” ArXiv.org, 2025, https://arxiv.org/abs/2511.07885.

[2] https://github.com/HazyResearch/intelligence-per-watt
