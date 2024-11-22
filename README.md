# PassAR 🎫  
_A decentralized event marketplace powered by [AO](https://ao.arweave.net/)._  

PassAR is a cutting-edge platform for creating, managing, and attending events in a decentralized, trustless manner. It empowers users to register for events, purchase tickets, and host events with full transparency and control.

---

## 📑 Table of Contents  

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Demo](#demo)  
- [How to Use](#how-to-use)  
  - [Prerequisites](#prerequisites)  
  - [Clone the Repository](#clone-the-repository)  
  - [Install Dependencies](#install-dependencies)  
  - [Configure Environment Variables](#configure-environment-variables)  
  - [Start the Application](#start-the-application)  
- [Usage](#usage)  
  - [Creating an Event](#creating-an-event)  
  - [Registering for an Event](#registering-for-an-event)  
- [Contributors](#contributors)  

---

## Features  

- **Decentralized Event Hosting**: Host events securely on the blockchain.  
- **Transparent Ticketing System**: Buy or register for event tickets with verifiable ownership.  
- **Wallet Integration**: Use your Arweave wallet to interact seamlessly with the platform.  
- **Dynamic Pricing**: Supports free and paid events with a trustless payment system.  

---

## Tech Stack  

- **Frontend**: Next.js, React, TypeScript  
- **Blockchain**: Arweave and AOConnect SDK  
- **Wallet Integration**: ArConnect  
- **UI**: TailwindCSS and Radix UI  

---

## 🎥 Demo  

[![PassAR Demo](https://img.youtube.com/vi/your-demo-video-id/0.jpg)](https://www.youtube.com/watch?v=your-demo-video-id)

---

## How to Use  

### Prerequisites  

- Install [Node.js](https://nodejs.org/) (version 16 or above).  
- Have an Arweave wallet installed (e.g., [ArConnect](https://arconnect.io/)).  

### Clone the Repository  

```bash  
git clone https://github.com/Victor-Okpukpan/PassAR.git 
cd passar  
```

### Install Dependencies

```bash
npm install 
```

### Configure Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```bash
NEXT_PUBLIC_AO_PROCESS=<Your AO Process ID>
NEXT_PUBLIC_FAUCET_PROCESS=<Your Faucet process ID> 
NEXT_PUBLIC_TOKEN_PROCESS=<Your Token Process ID>  
```

### Start the Application

```bash
npm run dev  
```

Visit the application at `http://localhost:3000`.

## 🛠️ Usage

### Creating an Event

1. Connect your wallet by clicking Connect Wallet.
2. Navigate to Host Event.
3. Fill in the event details, including title, date, location, and ticket price.
4. Submit the form to create your event on the blockchain.

### Registering for an Event

1. Browse events under Upcoming Events.
2. Filter or search for your preferred event.
3. If the event is free, click Register.
4. If the event is paid, purchase the ticket by completing the transaction.

## 🌍 Contributors

### Core Contributors

- [Victor_TheOracle](https://x.com/victorokpukpan_)
- [TheBoiledCorn](https://x.com/theboiledcorn)