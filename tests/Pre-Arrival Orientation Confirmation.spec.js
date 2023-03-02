require('dotenv').config()

const { test } = require('@playwright/test');
test("hubspot login", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "./auth.json"
  })

  //opens HubSpot
  const page = await context.newPage();
  await page.goto("https://www.hubspot.com/");
  await page.waitForTimeout(3000);
  await page.getByRole('link', { name: 'Go to my account' }).click();
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21338/filters');

  //close warning notification
  await page.getByRole('button', { name: 'Close' }).click();
  
  //scrap data
  const candidateName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[2]/div/a/span/span').textContent();
  const candidateEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[3]/a').textContent();

  console.log(
    `CANDIDATE INFO:
              Candidate Name: ${candidateName}\n 
              Candidate Email: ${candidateEmail}\n 
              `
  )
  
  //makes sure email is in lowercase and that the visa Specialist is active
  const sanitizedCandidateMail = candidateEmail?.toLowerCase();

  //open PandaDoc to login
  await page.getByRole('link', {name:`${candidateName}`}).click();
  const page1 = await context.newPage();
  await page1.goto('https://www.pandadoc.com/');
  await page1.getByRole('link', { name: 'Log in' }).click();
  await page1.locator('#email').click();
  await page1.locator('#email').fill('visa@placement-int.com');
  await page1.locator('#password').click();
  await page1.locator('#password').fill('');
  await page1.locator('#password').fill(`${process.env.PANDADOC_PASSWORD}`);
  await page1.getByRole('button', { name: 'Log in' }).click();
  console.log("Succesfully log into PandaDoc 🥳")
  await page1.waitForTimeout(5000);
  await page1.close();
  
  //Go back to HubSpot to create the new document
  await page.getByRole('button', { name: 'Create Document' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Accept All Cookies' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('dialog').locator('div').filter({ hasText: 'New Document' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Search').fill('Pre-Arrival Orientation');
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').locator('a').filter({ hasText: 'Pre-Arrival Orientation Confirmation' }).click();
  await page.waitForTimeout(5000);
  
  //adding data to create the doc
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${sanitizedCandidateMail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`${sanitizedCandidateMail}`, { exact: true }).click();
  await page.waitForTimeout(3000);
  const page1Promise = page.waitForEvent('popup');
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Start editing' }).click();
  const page2 = await page1Promise;
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByText('Send via email').click();
  await page.waitForTimeout(5000);

  //writing email
  await page2.frameLocator('#kolas-editor-iframe').getByTestId('documentNameInput').fill(`Pre-Arrival Orientation Confirmation for ${candidateName}`);
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Save and continue' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').fill(`
  Hello!\n\nHope this email finds you well!\n\nKindly find the Pre-arrival Orientation Confirmation form bellow.  
  Please fill out the form and click Finish to submit it. Pre-arrival Orientation Confirmation form needs to be signed as soon as possible in order to be in compliance with your Visa. 
  Failing to complete this step step might affect your good standing.\n\nAfter signing the document, you will receive an email containing the summary of the Pre-arrival Orientation call and important links for your next steps.\n\n
  This is an automatic email!\n 
  Please contact your visa specialist in case you have any questions.\n\nBest regards!`);
  await page2.waitForTimeout(3000);
  //await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send document' }).click();
  console.log("Document succesfully sent! ")
  await page2.waitForTimeout(3000);
  await page2.close();
  
  //update candidate on CRM
  await page.getByRole('link', { name: 'View all properties' }).click();
  await page.getByPlaceholder('Search properties').click();
  await page.getByPlaceholder('Search properties').fill('Pre-Arrival Orientation Confirmation');
  await page.getByText('test Pre-Arrival Orientation Confirmation').click();
  await page.getByLabel('test Pre-Arrival Orientation Confirmation').fill('Yes');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(3000);
  console.log("Candidate succesfully removed from the list!")
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/21338/filters');
  console.log("Process Completed ✨")
});