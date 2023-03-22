This documentation provides information about the PandaDoc bot project that was initiated on 19th January. Full transition ocurred 22th March.

## Objective and Problem

The objective of the automated processes created with Playwright is to automate the creation of short documents needed for candidates who have chosen Placement International to obtain their visa. These documents are typically between 1-3 pages in length and include tokens that need to be filled in based on the candidate's particular information, the visa specialist helping them with the process, and other relevant details.

To achieve this objective, the process is as follows: candidates provide their data through forms or other means, and this data is collected on the HubSpot database. The candidate is then added to a list from which Playwright can scrape the necessary data and use it to create and send the document through PandaDoc.

The problem we faced is that, when Zapier is used for generating documents, PandaDoc charges additional volume-based charges. Since PandaDoc is charging extra costs for creating documents through Zapier, we aim to mimic a real human to do this process so that we don’t need access to the PandaDoc API and can avoid the extra costs.

Considering the estimated usage (5,000 docs per year) that would mean, for a 1 year contract:

- $6,588 ($6,000 or 1,020% increase over the annual pricing initially agreed upon for the same services)

This means that, with this project, we can save 6k per year.

## Scope 

10 documents that need to be automated

✅ Promissory Letter

✅ Cap resure

✅ Asse rules and regulations

✅ 6 Different Checklists (CIEE & SHRM) for Intern, 1 year Trainee and 5 year Trainee

*Pre-arrival orientation* (may not be automated in the same way, still on hold)


## Why Playwright?

We opted to use Playwright instead of Selenium primarily because of its superior reliability and stability. Playwright uses modern browser APIs and has a built-in mechanism for waiting until elements on a page are fully loaded before performing actions, which reduces the likelihood of errors occurring during the automation process. Additionally, Playwright has an automatic retry mechanism that retries failed actions up to three times, which helps to prevent flakiness and instability in the automated tests. Moreover, Playwright offered faster execution speeds than Selenium, which is largely due to its use of modern browser APIs rather than older methods that Selenium relies on.

Another factor that made Playwright a better fit for our needs was that it was easier to generate a file and avoid repeated login and authentication steps when running the processes. By having an already existing session on HubSpot, Playwright was able to avoid these additional steps, saving time and effort in the automation process.

Overall, we selected Playwright because of its superior reliability and stability, faster execution speeds, and streamlined process for generating files and avoiding repeated login and authentication steps.

## Playwright Setup
To run the automated processes, we use Playwright, a Node.js library for browser automation.

### Programming Language
The automated processes are written in JavaScript, which is the primary language used with Playwright. 

### Browser Driver
We use Chromium as the default browser driver for Playwright. Chromium is an open-source browser developed by Google and is the basis for other popular browsers such as Google Chrome and Microsoft Edge. Playwright supports other browser drivers such as Firefox and WebKit, but we have found that Chromium provides the best performance and reliability for our needs.

### Installation Process

Clone this repository

If you haven't done it yet, install Playwright Test for VSCode

![Screenshot 2023-03-22 at 13 32 33](https://user-images.githubusercontent.com/111632476/226905821-3ff5a184-caa7-4be9-90a8-38e0390e916b.png)

Your left menu should have a new icon. When you press it, it should look like this:

![Screenshot 2023-03-22 at 13 33 19](https://user-images.githubusercontent.com/111632476/226905987-bbe18fba-a62c-4ba0-9e01-8f5a1c085706.png)


Type on your terminal

```console
npx playwright install
```

Then, auth.json document must be generated (add how) or use the private one for the company - request access

Create .env file with the passwords or use the private one for the company - request access 

run tests 🙌🏼
