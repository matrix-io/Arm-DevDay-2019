# Workshop Guide
This section will cover everything in our Arm DevDay workshop. Before moving on, make sure that you have everything ready from the [Pre-Workshop Setup](PreWorkshop.md).

## 1. Test MATRIX Core
**In your Raspberry Pi's terminal**, Enter the commands below to verify that Node.js and MATRIX Core are properly working.

**Install Node.js modules for MATRIX Core**
```bash
cd ~/js-matrix-core-app
npm install
```
**Run Hello World**
```bash
node helloWorld.js
```
Your MATRIX Creator should match the image below.

> For your sanity, the brightness has been lowered.

![](images/matrix-hello-world.gif)

## 2. Snips Assistant Setup
By this step, you should have a [snips.ai account](https://console.snips.ai/login) and the [Sam CLI Tool](https://snips.gitbook.io/getting-started/installation) installed.

### Create a New Assistant 
From your computer's terminal, sign in through the Sam CLI Tool.
```bash
sam login
```